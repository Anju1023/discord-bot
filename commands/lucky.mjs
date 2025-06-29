import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('lucky')
	.setDescription('今日のラッキーアイテムやメッセージを届けるよ〜〜ん');

export async function execute(interaction) {
	const username = interaction.member?.displayName ?? interaction.user.username;
	const items = [
		'🧸 テディベア',
		'🔮 ちいさな水晶玉',
		'🦋 幸運のブローチ',
		'📖 おまじないの本',
		'💍 あんじゅちゃんとお揃いの指輪',
		'🔑 ハートの鍵',
		'🕯️ フレグランスキャンドル',
		'🎀 シルクのリボン',
		'🪞 小さな手鏡',
		'👑 キラキラティアラ',
		'🧦 ラメ入りソックス',
		'👜 お気に入りのバッグ',
		'🍬 可愛いお菓子',
		'🎧 イヤーカフ',
		'📷 インスタントカメラ',
		'⏰ うさぎの目覚まし',
		'🪄 星型の魔法スティック',
		'🎈 ハート型バルーン',
		'🖊️ ビリビリペン⚡️',
		'💌 あんじゅちゃんからのラブレター',
	];

	const colors = [
		'❤️ 赤',
		'💙 青',
		'💚 緑',
		'💜 紫',
		'💛 黄',
		'🖤 黒',
		'🤍 白',
		'🧡 オレンジ',
		'🌸 ピンク',
		'🩵 パステルブルー',
		'🍀 ミントグリーン',
		'🌈 レインボー',
	];

	const numbers = Math.floor(Math.random() * 99) + 1;

	const foods = [
		'🍓 いちごタルト',
		'🍡 みたらし団子',
		'🍫 ハートのチョコ',
		'🥞 メープルパンケーキ',
		'🧋 タピオカミルクティー',
		'🍰 モンブラン',
		'🍙 うめぼしおにぎり',
		'🍧 いちごミルクかき氷',
		'🍛 お星さまカレー',
		'🍭 虹色キャンディ',
		'🍛 あんじゅちゃんお手製カレー',
		'🧀 いぶりがっこチーズ',
		'🌶️ プルダックポックンミョン',
	];

	const actions = [
		'📸 自撮りしてあんじゅちゃんに送ってみる',
		'📖 好きな本を開いてみる',
		'💌 あんじゅちゃんにありがとうを伝える(✱°⌂°✱)',
		'🌿 散歩して深呼吸する',
		'🎧 お気に入りの曲を聴く',
		'🧼 お気に入りの香りで手を洗う',
		'🎨 ちょっとだけお絵描き',
		'🪄「なんくるないさ〜」と心の中で唱える',
	];

	const messages = [
		'「小さな幸せ、拾っていこう💫」',
		'「今日は自分にやさしくしてね🌸」',
		'「ラッキーは笑顔の中にあるよ😊」',
		'「心に虹をかけて、行ってらっしゃい🌈」',
		'「“好き”のアンテナを立ててみて🔮」',
		`「${username}の輝き、今日は特にまぶしいぬぇ〜💎」`,
	];

	// ランダムで選んでいく
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

	const embed = new EmbedBuilder()
		.setTitle(`🌟 今日の${username}のラッキー占い 🌟`)
		.addFields(
			{ name: '🍀 ラッキーアイテム', value: pick(items), inline: false },
			{ name: '🎨 ラッキーカラー', value: pick(colors), inline: true },
			{
				name: '🔢 ラッキーナンバー',
				value: numbers.toString(),
				inline: true,
			},
			{ name: '🍰 ラッキーフード', value: pick(foods), inline: false },
			{ name: '💃 ラッキーアクション', value: pick(actions), inline: false },
			{ name: '🤩 今日のひとこと', value: pick(messages), inline: false }
		)
		.setColor('Random')
		.setThumbnail(
			'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzR3eHRyZXNhd2ZyMm9vZXF6Z2sydzhxenJ4Z2s0eXVmMXA3b2o3dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jtgsfUIJJJwmcS9FQi/giphy.gif'
		)
		.setFooter({
			text: `今日が${username}にとっていい日になりますように〜〜( ơ ᴗ ơ )`,
		});

	await interaction.reply({ embeds: [embed] });
}
