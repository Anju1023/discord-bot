import { SlashCommandBuilder } from 'discord.js';
import { sendTaskNotification } from '../utils/taskScheduler.mjs';

export const data = new SlashCommandBuilder()
	.setName('task-check')
	.setDescription('今日のタスクをチェックするよ〜！');

export async function execute(interaction) {
	await interaction.reply('タスクをチェック中...⏳');

	try {
		// utils/taskScheduler.mjsの関数を直接使用
		await sendTaskNotification(interaction.client);

		await interaction.followUp(
			'タスク通知をチャンネルに送信したよ〜！( ˶>ᴗ<˶)'
		);
		console.log('✅ タスク通知を送信しました！');
	} catch (error) {
		console.error('❌ タスクチェックエラー:', error);
		await interaction.followUp('エラーが出ちゃった〜');
	}
}
