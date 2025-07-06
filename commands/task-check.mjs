/* global process */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Client as NotionClient } from '@notionhq/client';

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
						status: {
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

// 繰り返しタスクを取得（デバッグ版）
async function getRecurringTasks() {
	try {
		// まずデータベースのスキーマを確認
		const schema = await notion.databases.retrieve({
			database_id: config.notion.databases.recurring,
		});

		console.log('繰り返しタスクDB プロパティ一覧:');
		console.log(Object.keys(schema.properties));

		// 各プロパティの詳細を表示
		Object.entries(schema.properties).forEach(([key, prop]) => {
			console.log(`- ${key}: ${prop.type}`);
		});

		// データを取得（チェックボックス名を動的に見つける）
		const checkboxProp = Object.entries(schema.properties).find(
			([_, prop]) => prop.type === 'checkbox' // keyをアンダースコアに変更
		);

		if (!checkboxProp) {
			console.error('チェックボックスプロパティが見つかりません');
			return [];
		}

		const checkboxName = checkboxProp[0];
		console.log(`実際のチェックボックス名: "${checkboxName}"`);

		const response = await notion.databases.query({
			database_id: config.notion.databases.recurring,
			filter: {
				property: checkboxName,
				checkbox: {
					equals: false,
				},
			},
			page_size: 10, // 最大10件に制限
		});

		console.log(`未完了の繰り返しタスク: ${response.results.length}件`);

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
		embed.setDescription(
			'今日は未完了のタスクがないよ〜！お疲れさま！お疲れさま〜'
		);
		embed.setColor(0x4ecdc4);
	}

	return embed;
}

export const data = new SlashCommandBuilder()
	.setName('task-check')
	.setDescription('今日のタスクをチェックするよ〜！');

export async function execute(interaction) {
	await interaction.reply('タスクをチェック中...⏳');

	try {
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

		await interaction.followUp({ embeds: [embed] });
		console.log('✅ タスク通知を送信しました！');
	} catch (error) {
		console.error('❌ タスクチェックエラー:', error);
		await interaction.followUp('エラーが出ちゃった〜');
	}
}
