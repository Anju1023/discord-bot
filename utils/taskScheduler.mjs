/* global process */

import cron from 'node-cron';
import { Client as NotionClient } from '@notionhq/client';
import { EmbedBuilder } from 'discord.js';

const notion = new NotionClient({
	auth: process.env.NOTION_API_TOKEN,
});

const config = {
	notion: {
		databases: {
			tasks: process.env.NOTION_TASKS_DB_ID,
			recurring: process.env.NOTION_RECURRING_DB_ID,
		},
	},
	discord: {
		channelId: process.env.DISCORD_CHANNEL_ID,
	},
};

// 今日が締切のタスクを「本日中対応」に変更
async function updateTodayTasks() {
	try {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式

		// 今日が締切で、ステータスが「本日中対応」以外のタスクを検索
		const response = await notion.databases.query({
			database_id: config.notion.databases.tasks,
			filter: {
				and: [
					{
						property: '日付',
						date: {
							equals: today,
						},
					},
					{
						property: '状態',
						status: {
							does_not_equal: '本日中対応',
						},
					},
					{
						property: 'チェック',
						checkbox: {
							equals: false, // 未完了のみ
						},
					},
				],
			},
		});

		const updatedTasks = [];

		// 各タスクのステータスを「本日中対応」に更新
		for (const page of response.results) {
			try {
				await notion.pages.update({
					page_id: page.id,
					properties: {
						状態: {
							status: {
								name: '本日中対応',
							},
						},
					},
				});

				const taskTitle =
					page.properties['タスク名']?.title?.[0]?.plain_text || 'タイトルなし';
				updatedTasks.push(taskTitle);
				console.log(`✅ タスク更新: ${taskTitle}`);
			} catch (updateError) {
				console.error('タスク更新エラー:', updateError);
			}
		}

		return updatedTasks;
	} catch (error) {
		console.error('今日のタスク更新エラー:', error);
		return [];
	}
}

// 本日中対応タスクを取得
async function getTodayUrgentTasks() {
	try {
		const response = await notion.databases.query({
			database_id: config.notion.databases.tasks,
			filter: {
				and: [
					{
						property: '状態',
						status: {
							// ← selectからstatusに修正！
							equals: '本日中対応',
						},
					},
					{
						property: 'チェック',
						checkbox: {
							equals: false,
						},
					},
				],
			},
		});

		return response.results.map((page) => ({
			title:
				page.properties['タスク名']?.title?.[0]?.plain_text || 'タイトルなし',
			category: page.properties['カテゴリ']?.select?.name || '',
			time: page.properties['時間']?.select?.name || '',
		}));
	} catch (error) {
		console.error('本日中対応タスク取得エラー:', error);
		return [];
	}
}

// 繰り返しタスクを取得
async function getRecurringTasks() {
	try {
		const response = await notion.databases.query({
			database_id: config.notion.databases.recurring,
			filter: {
				property: 'チェック',
				checkbox: {
					equals: false,
				},
			},
		});

		return response.results.map((page) => ({
			title:
				page.properties['お知らせ']?.title?.[0]?.plain_text || 'タイトルなし',
			date: page.properties['受信日']?.date?.start || '',
		}));
	} catch (error) {
		console.error('繰り返しタスク取得エラー:', error);
		return [];
	}
}

// 通知Embedを作成
function createTaskEmbed(urgentTasks, recurringTasks, updatedTasks = []) {
	const embed = new EmbedBuilder()
		.setTitle('📋 今日のタスク通知')
		.setColor(0xff6b6b)
		.setTimestamp()
		.setFooter({ text: '頑張って〜！✨' });

	// 自動更新されたタスク
	if (updatedTasks.length > 0) {
		const updatedText = updatedTasks.map((task) => `• ${task}`).join('\n');

		embed.addFields({
			name: '🔄 本日中対応に変更されたタスク',
			value: updatedText,
			inline: false,
		});
	}

	// 本日中対応タスク
	if (urgentTasks.length > 0) {
		const urgentText = urgentTasks
			.map((task) => {
				let text = `• ${task.title}`;
				if (task.category) text += ` [${task.category}]`;
				if (task.time) text += ` (${task.time})`;
				return text;
			})
			.join('\n');

		embed.addFields({
			name: '⚡ 本日中対応タスク',
			value: urgentText,
			inline: false,
		});
	}

	// 繰り返しタスク
	if (recurringTasks.length > 0) {
		const recurringText = recurringTasks
			.map((task) => `• ${task.title}`)
			.join('\n');

		embed.addFields({
			name: '🔄 繰り返しタスク',
			value: recurringText,
			inline: false,
		});
	}

	// タスクがない場合
	if (
		urgentTasks.length === 0 &&
		recurringTasks.length === 0 &&
		updatedTasks.length === 0
	) {
		embed.setDescription('今日は未完了のタスクがないよ〜！お疲れさま〜');
		embed.setColor(0x4ecdc4);
	}

	return embed;
}

// 通知を送信
export async function sendTaskNotification(client) {
	try {
		console.log('タスク通知を準備中...');

		// まず今日が締切のタスクを「本日中対応」に更新
		const updatedTasks = await updateTodayTasks();

		// 両方のタスクを並行取得
		const [urgentTasks, recurringTasks] = await Promise.all([
			getTodayUrgentTasks(),
			getRecurringTasks(),
		]);

		console.log(
			`自動更新: ${updatedTasks.length}件, 本日中対応: ${urgentTasks.length}件, 繰り返し: ${recurringTasks.length}件`
		);

		// Embedを作成（更新されたタスクも含める）
		const embed = createTaskEmbed(urgentTasks, recurringTasks, updatedTasks);

		// 指定チャンネルに送信
		const channel = await client.channels.fetch(config.discord.channelId);
		await channel.send({ embeds: [embed] });

		console.log('✅ タスク通知を送信しました！');
	} catch (error) {
		console.error('❌ 通知送信エラー:', error);
	}
}

// スケジューラーを開始
export function startTaskScheduler(client) {
	console.log('🕒 タスクスケジューラー開始！');

	// 朝8時半
	cron.schedule(
		'30 8 * * *',
		() => {
			console.log('⏰ 朝8時半の通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// お昼12時
	cron.schedule(
		'0 12 * * *',
		() => {
			console.log('⏰ お昼12時の通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// 午後2時半
	cron.schedule(
		'30 14 * * *',
		() => {
			console.log('⏰ 午後2時半の通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// 夕方5時半
	cron.schedule(
		'30 17 * * *',
		() => {
			console.log('⏰ 夕方5時半の通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// 夜8時
	cron.schedule(
		'0 20 * * *',
		() => {
			console.log('⏰ 夜8時の通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// 起動時にテスト通知（5秒後）
	setTimeout(() => {
		console.log('🧪 起動時テスト通知...');
		sendTaskNotification(client);
	}, 5000);
}
