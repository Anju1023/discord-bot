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
				// 人気上位＆安全なデフォルト
				{ name: 'ずんだもん（ノーマル）', value: 3 },
				{ name: 'ずんだもん（あまあま）', value: 1 },
				{ name: '四国めたん（ノーマル）', value: 2 },
				{ name: '四国めたん（あまあま）', value: 0 },
				{ name: '春日部つむぎ', value: 8 },
				{ name: '波音リツ', value: 9 },
				{ name: '雨晴はう', value: 10 },
				{ name: '九州そら（ノーマル）', value: 16 },
				{ name: '冥鳴ひまり', value: 14 },
				{ name: 'WhiteCUL（びえーん）', value: 26 }
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
