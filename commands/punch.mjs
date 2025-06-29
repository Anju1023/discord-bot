// Discordのスラッシュコマンドを作るための設計図を読み込む！
import { SlashCommandBuilder } from 'discord.js';

// 誰をパンチするか選ばせる！
export const data = new SlashCommandBuilder()
	.setName('punch') // コマンド名を "punch" にする
	.setDescription('誰かをパンチしちゃうよ〜〜ん👊💥') // コマンドの説明文
	.addUserOption(
		(option) =>
			option
				.setName('target') //　引数の名前：/punch, target：@誰か
				.setDescription('パンチしたい相手') // 引数の説明文
				.setRequired(true) // 必須入力(誰かを指定しないとだめ)
	);

// 実際に "/punch" が実行された時の中身
export async function execute(interaction) {
	const user = interaction.user; // コマンドを送ったユーザー
	const target = interaction.options.getUser('target'); // さっき選んだ人を取得

	if (target.id === user.id) {
		// もし自分を選んでいたら、メッセージを送ってコマンド終了
		await interaction.reply('自分を殴るの、、、？落ち着いて、、(´._.｀)');
		return;
	}

	// いろんなメッセージたち
	const punches = [
		`👊 ${user}が${target}を思いっきりパンチした‼️`,
		`💥 ${user}のパンチが${target}に炸裂した！！`,
		`🥹 ${target}は${user}の右ストレートを喰らった！`,
		`🤩 ${target}は${user}からのパンチを華麗に避けた！`,
		`🥺 ${user}は${target}を殴った！なんてことなのー(> <。)`,
	];

	// Math.random():0~1のランダムな数字
	// Math.floor():小数点切り捨て
	const result = punches[Math.floor(Math.random() * punches.length)];
	await interaction.reply(result);
}
