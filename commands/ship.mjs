import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ship') // "ship"　って名前のコマンド
	.setDescription('2人の相性を診断しちゃうよおお(✱°⌂°✱)') // 説明文
	.addUserOption((option) =>
		option
			.setName('user1')
			.setDescription('1人目(あなたでもOK！)')
			.setRequired(true)
	)
	.addUserOption((option) =>
		option
			.setName('user2')
			.setDescription('2人目(運命の相手、、、！？💗)')
			.setRequired(true)
	);

export async function execute(interaction) {
	const user1 = interaction.options.getMember('user1');
	const user2 = interaction.options.getMember('user2');

	if (user1.id === user2.id) {
		await interaction.reply(
			'え、、自分と自分占うの、、？？それは100%なのでは、、、？( ꒪⌓꒪)'
		);
		return;
	}

	const compatibility = Math.floor(Math.random() * 101); // 0~100%

	let comment = '';
	if (compatibility === 100) {
		comment = '🤩 流石に運命じゃん！？早く結婚した方がいいよお！！💗💗💗';
	} else if (compatibility >= 80) {
		comment = '😘 めっちゃお似合いですや〜〜〜ん！';
	} else if (compatibility >= 50) {
		comment = '👶🏻 まあまあそこそこいい感じかも〜〜( ơ ᴗ ơ )';
	} else if (compatibility >= 30) {
		comment = '🤯 あれ、今日が初めましてだったっけ( ఠ_ఠ )';
	} else {
		comment = '🤬 何したらそんなに相性悪くできるんだ、、Σ(°■°)';
	}

	await interaction.reply(
		`💘 **${user1.displayName}** と **${user2.displayName}** の相性は、、、\n\n# ${compatibility} だよ！！💗\n\n\n${comment}`
	);
}
