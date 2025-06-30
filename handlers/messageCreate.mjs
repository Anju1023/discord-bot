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
		{ pattern: /にゃー|ねこ|ネコ|にゃん|cat/i, emoji: '🐱' },
		{ pattern: /わんわん|いぬ|イヌ|犬|ワン|dog|wan/i, emoji: '🐶' },
		{ pattern: /うさぎ|うさぎさん|うさちゃん/i, emoji: '🐰' },
		{ pattern: /くま|クマ/i, emoji: '🐻' },
		{ pattern: /りす|リス/i, emoji: '🐿️' },
		{ pattern: /かえる|カエル/i, emoji: '🐸' },
		{ pattern: /とり|鳥/i, emoji: '🐦' },
		{ pattern: /さかな|魚/i, emoji: '🐟' },
		{ pattern: /うま|馬/i, emoji: '🐴' },
		{ pattern: /ぞう|象/i, emoji: '🐘' },
		{ pattern: /きりん|キリン/i, emoji: '🦒' },
		{ pattern: /さる|猿/i, emoji: '🐒'},
		{ pattern: /しゅき|すき|好き/i, emoji: '💖' },
		{ pattern: /おやすみ|ねむい/i, emoji: '🌙' },
		{ pattern: /ぱん|パン|\bpan\b|\bbread\b/i, emoji: '🍞' },
		{ pattern: /ぴえん|かなしい|うるうる/i, emoji: '🥺' },
		{ pattern: /ぎゅ|ぎゅー|抱きしめ/i, emoji: '🤗' },
		{ pattern: /おはよう|朝だ/i, emoji: '☀️' },
		{ pattern: /わくわく|ドキドキ/i, emoji: '💓' },
		{ pattern: /おいしい|うまっ|もぐもぐ/i, emoji: '🍰' },
		{ pattern: /\btako\b|たこやき|タコ/i, emoji: '🐙' },
		{ pattern: /たこ|タコ/i, emoji: '🐙' },
		{ pattern: /おはよう|朝だ/i, emoji: '☀️' },
		{ pattern: /おやすみ|ねむい/i, emoji: '🌙' },
		{ pattern: /ありがとう|感謝/i, emoji: '🙏' },
		{ pattern: /うれしい|嬉しい/i, emoji: '😊' },
		{ pattern: /悲しい|かなしい/i, emoji: '😢' },
		{ pattern: /楽しい|たのしい/i, emoji: '😄' },
		{ pattern: /怒ってる|怒り/i, emoji: '😡' },
		{ pattern: /びっくり|驚き/i, emoji: '😲' },
		{ pattern: /眠い|ねむい/i, emoji: '😴' },
		{ pattern: /かわいい|可愛い/i, emoji: '😍' },
		{ pattern: /かっこいい|格好いい/i, emoji: '😎' },
		{ pattern: /すごい|凄い/i, emoji: '🤩' },
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
