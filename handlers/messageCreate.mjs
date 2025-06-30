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
		{ pattern: /yes|sure/, emoji: '👍' },
		{ pattern: /no|not sure/, emoji: '👎' },
		{ pattern: /maybe|perhaps/, emoji: '🤔' },
		{ pattern: /にゃー|ねこ|にゃん/, emoji: '🐱' },
		{ pattern: /しゅき|すき|好き/, emoji: '💖' },
		{ pattern: /おやすみ|ねむい/, emoji: '🌙' },
		{ pattern: /ぱん|パン|\bpan\b|\bbread\b/i, emoji: '🍞' },
		{ pattern: /ぴえん|かなしい|うるうる/, emoji: '🥺' },
		{ pattern: /ぎゅ|ぎゅー|抱きしめ/, emoji: '🤗' },
		{ pattern: /おはよう|朝だ/, emoji: '☀️' },
		{ pattern: /わくわく|ドキドキ/, emoji: '💓' },
		{ pattern: /おいしい|うまっ|もぐもぐ/, emoji: '🍰' },
		{ pattern: /\btako\b|たこやき|タコ/, emoji: '🐙' },
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
