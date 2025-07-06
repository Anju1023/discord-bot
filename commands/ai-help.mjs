import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ai-help')
	.setDescription('あんじゅちゃんのAI機能について説明するよ〜！');

export async function execute(interaction) {
	const embed = new EmbedBuilder()
		.setTitle('🤖 あんじゅちゃんのAI機能')
		.setDescription('OpenAI APIを使って、あんじゅちゃんらしい返答をするよ〜✨')
		.setColor(0xff69b4) // ピンク色
		.addFields(
			{
				name: '💬 使い方',
				value:
					'`@あんじゅちゃん メッセージ` または `あんじゅちゃん、メッセージ` って送ってね〜',
				inline: false,
			},
			{
				name: '✨ 特徴',
				value:
					'• 20代前半の女の子みたいに話すよ〜\n• ENFPっぽい明るい性格\n• 会話の流れを覚えてる\n• 絵文字や顔文字も使うよ( ˶>ᴗ<˶)',
				inline: false,
			},
			{
				name: '🔄 便利なコマンド',
				value:
					'• `/reset-chat` - 会話履歴をリセット\n• `/ai-help` - このヘルプを表示',
				inline: false,
			},
			{
				name: '⚠️ 注意',
				value:
					'• AI返答には少し時間がかかるよ〜\n• たまに調子悪い時もあるかも💦\n• 会話履歴は最大10回分まで覚えてる',
				inline: false,
			},
			{
				name: '💡 使用例',
				value:
					'`@あんじゅちゃん 今日どう？`\n`あんじゅちゃん、おすすめの映画教えて〜`\n`@あんじゅちゃん 元気？`',
				inline: false,
			}
		)
		.setThumbnail('https://i.imgur.com/qibO9dC.png') // あんじゅちゃんの画像
		.setFooter({
			text: 'あんじゅちゃん AI機能 powered by OpenAI',
			iconURL: 'https://i.imgur.com/SVpspIG.png',
		})
		.setTimestamp();

	await interaction.reply({ embeds: [embed] });
}
