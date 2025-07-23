// commands/tts.mjs
import { SlashCommandBuilder } from 'discord.js';
import { ttsHandler } from '../utils/ttsHandler.mjs';

export const data = new SlashCommandBuilder()
	.setName('tts')
	.setDescription('テキストを音声で読み上げるよ〜！')
	.addStringOption(
		(option) =>
			option
				.setName('text')
				.setDescription('読み上げたいテキスト')
				.setRequired(true)
				.setMaxLength(100) // 長すぎる文章は制限
	)
	.addIntegerOption((option) =>
		option
			.setName('voice')
			.setDescription('声の種類（話者ID）')
			.setRequired(false)
			.addChoices(
				{ name: 'あんじゅちゃん風（四国めたん）', value: 2 },
				{ name: 'かわいい系（ずんだもん）', value: 3 },
				{ name: 'お姉さん系（春日部つむぎ）', value: 8 },
				{ name: 'ボーイッシュ（雨晴はう）', value: 10 },
				{ name: 'おっとり（波音リツ）', value: 9 }
			)
	);

export async function execute(interaction) {
	try {
		const text = interaction.options.getString('text');
		const speaker = interaction.options.getInteger('voice') || 2; // デフォルトは四国めたん

		// テキストの前処理
		const processedText = preprocessText(text);

		await ttsHandler.playTTS(processedText, interaction, speaker);
	} catch (error) {
		console.error('TTSコマンドエラー:', error);
		await interaction.reply({
			content:
				'エラーが出ちゃった〜！VOICEVOXが起動してるか確認してね(´･ω･`)💦',
			ephemeral: true,
		});
	}
}

/**
 * テキストの前処理（読み上げしやすくする）
 * @param {string} text - 元のテキスト
 * @returns {string} 処理済みテキスト
 */
function preprocessText(text) {
	return text
		.replace(/https?:\/\/[^\s]+/g, 'URL省略') // URL除去
		.replace(/<@!?(\d+)>/g, 'メンション') // メンション変換
		.replace(/<#(\d+)>/g, 'チャンネル') // チャンネル変換
		.replace(/:\w+:/g, '') // 絵文字除去
		.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '') // 特殊文字除去
		.trim();
}
