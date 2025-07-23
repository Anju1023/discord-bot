// commands/tts-leave.mjs
import { SlashCommandBuilder } from 'discord.js';
import { ttsHandler } from '../utils/ttsHandler.mjs';

export const data = new SlashCommandBuilder()
	.setName('tts-leave')
	.setDescription('音声チャンネルから退出するよ〜');

export async function execute(interaction) {
	try {
		ttsHandler.disconnect(interaction.guildId);

		await interaction.reply(
			'音声チャンネルから退出したよ〜！またね〜( ˶ˆᗜˆ˶)👋'
		);
	} catch (error) {
		console.error('音声チャンネル退出エラー:', error);
		await interaction.reply({
			content: '退出に失敗しちゃった〜💦',
			ephemeral: true,
		});
	}
}
