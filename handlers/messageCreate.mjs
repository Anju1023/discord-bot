export default async function messageCreate(message) {
	if (message.author.bot || !message.guild) return;

	const content = message.content.toLowerCase();

	const reactMaps = [
		{ pattern: /こんにちは|やっほ|hello|hi|hey/i, emoji: '👋' },
		{ pattern: /thanks|thank you/i, emoji: '🙏' },
		{ pattern: /goodbye|bye/i, emoji: '👋' },
		{ pattern: /help|support/i, emoji: '❓' },
		{ pattern: /congratulations|congrats/i, emoji: '🎉' },
		{ pattern: /welcome/i, emoji: '🎉' },
		{ pattern: /sorry|apology/i, emoji: '🙏' },
		{ pattern: /yes|sure/i, emoji: '👍' },
		{ pattern: /no|not sure/i, emoji: '👎' },
		{ pattern: /maybe|perhaps/i, emoji: '🤔' },
		{ pattern: /にゃー|ねこ|にゃん/i, emoji: '🐱' },
		{ pattern: /しゅき|すき|好き/i, emoji: '💖' },
		{ pattern: /おやすみ|ねむい/i, emoji: '🌙' },
		{ pattern: /ぱん|パン|\bpan\b|\bbread\b/i, emoji: '🍞' },
		{ pattern: /ぴえん|かなしい|うるうる/i, emoji: '🥺' },
		{ pattern: /ぎゅ|ぎゅー|抱きしめ/i, emoji: '🤗' },
		{ pattern: /おはよう|朝だ/i, emoji: '☀️' },
		{ pattern: /わくわく|ドキドキ/i, emoji: '💓' },
		{ pattern: /おいしい|うまっ|もぐもぐ/i, emoji: '🍰' },
		{ pattern: /\btako\b|たこやき|タコ/i, emoji: '🐙' },
	];

	for (const { pattern, emoji } of reactMaps) {
		if (pattern.test(content)) {
			try {
				await message.react(emoji);
			} catch (error) {
				console.error(`リアクションに失敗しました ${emoji}:`, error);
			}
			break; // Stop after the first match
		}
	}
}
