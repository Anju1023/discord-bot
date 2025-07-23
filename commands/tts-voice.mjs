// commands/tts-voice.mjs
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ttsHandler } from '../utils/ttsHandler.mjs';

export const data = new SlashCommandBuilder()
	.setName('tts-voice')
	.setDescription('使える声の一覧を表示するよ〜！');

export async function execute(interaction) {
	try {
		await interaction.deferReply();

		const speakers = await ttsHandler.getSpeakers();

		if (speakers.length === 0) {
			await interaction.editReply(
				'VOICEVOXサーバーに接続できないみたい〜(´･ω･`)'
			);
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle('🎤 使える声の一覧')
			.setDescription('`/tts` コマンドで使える声だよ〜！')
			.setColor(0xff69b4)
			.setThumbnail('https://i.imgur.com/qibO9dC.png')
			.setFooter({ text: 'あんじゅちゃんBot TTS機能' });

		// 話者情報を整理
		const voiceList = speakers
			.slice(0, 10)
			.map((speaker, index) => {
				const style = speaker.styles?.[0];
				return `**${index}. ${speaker.name}** ${style ? `(${style.name})` : ''}`;
			})
			.join('\n');

		embed.addFields({
			name: '利用可能な声',
			value: voiceList || 'データが取得できませんでした',
			inline: false,
		});

		embed.addFields({
			name: '使い方',
			value: '`/tts text:読み上げたいテキスト voice:声の番号`',
			inline: false,
		});

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error('話者一覧取得エラー:', error);
		await interaction.editReply('話者一覧の取得に失敗しちゃった〜💦');
	}
}
