import { SlashCommandBuilder, InteractionResponseFlags } from 'discord.js';
import { clearConversationHistory } from '../utils/aiHandler.mjs';

export const data = new SlashCommandBuilder()
	.setName('reset-chat')
	.setDescription('あんじゅちゃんとの会話履歴をリセットするよ〜');

export async function execute(interaction) {
	const userId = interaction.user.id;

	try {
		// 会話履歴をクリア
		clearConversationHistory(userId);

		await interaction.reply({
			content: '会話履歴をリセットしたよ〜！また最初から話そうね〜( ˶>ᴗ<˶)✨',
			flags: InteractionResponseFlags.Ephemeral, // ← ここを変更！
		});

		console.log(`💭 ${interaction.user.tag} の会話履歴をリセットしました`);
	} catch (error) {
		console.error('会話履歴リセットエラー:', error);
		await interaction.reply({
			content: 'あれ〜、リセットに失敗しちゃった〜(´･ω･`)💦',
			flags: InteractionResponseFlags.Ephemeral, // ← ここも変更！
		});
	}
}
