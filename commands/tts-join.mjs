// commands/tts-join.mjs
import { SlashCommandBuilder } from 'discord.js';
import { ttsHandler } from '../utils/ttsHandler.mjs';

export const data = new SlashCommandBuilder()
	.setName('tts-join')
	.setDescription('音声チャンネルに参加するよ〜！');

export async function execute(interaction) {
	try {
		const member = interaction.member;
		const voiceChannel = member?.voice?.channel;

		if (!voiceChannel) {
			await interaction.reply({
				content: '先に音声チャンネルに参加してから呼んでね〜( ˶ｰ̀֊ｰ́˶)',
				ephemeral: true,
			});
			return;
		}

		await interaction.deferReply();

		await ttsHandler.connectToVoiceChannel(voiceChannel, interaction.guildId);

		await interaction.editReply(
			`${voiceChannel.name} に参加したよ〜！( ˶>ᴗ<˶)✨`
		);
	} catch (error) {
		console.error('音声チャンネル参加エラー:', error);
		await interaction.editReply('参加に失敗しちゃった〜💦');
	}
}
