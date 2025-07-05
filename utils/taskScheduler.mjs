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

// 本日中対応タスクを取得
async function getTodayUrgentTasks() {
	try {
		const response = await notion.databases.query({
			database_id: config.notion.databases.tasks,
			filter: {
				and: [
					{
						property: '状態',
						select: {
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
function createTaskEmbed(urgentTasks, recurringTasks) {
	const embed = new EmbedBuilder()
		.setTitle('📋 今日のタスク通知')
		.setColor(0xff6b6b)
		.setTimestamp()
		.setFooter({ text: '頑張って〜！✨' });

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
	if (urgentTasks.length === 0 && recurringTasks.length === 0) {
		embed.setDescription('今日は未完了のタスクがないよ〜！お疲れさま〜');
		embed.setColor(0x4ecdc4);
	}

	return embed;
}

// 通知を送信
async function sendTaskNotification(client) {
	try {
		console.log('タスク通知を準備中...');

		// 両方のタスクを並行取得
		const [urgentTasks, recurringTasks] = await Promise.all([
			getTodayUrgentTasks(),
			getRecurringTasks(),
		]);

		console.log(
			`本日中対応: ${urgentTasks.length}件, 繰り返し: ${recurringTasks.length}件`
		);

		// Embedを作成
		const embed = createTaskEmbed(urgentTasks, recurringTasks);

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

	// 毎日朝9時に通知
	cron.schedule(
		'0 9 * * *',
		() => {
			console.log('⏰ 朝の定期通知実行中...');
			sendTaskNotification(client);
		},
		{
			scheduled: true,
			timezone: 'Asia/Tokyo',
		}
	);

	// 夕方6時にも通知
	cron.schedule(
		'0 18 * * *',
		() => {
			console.log('⏰ 夕方の定期通知実行中...');
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
