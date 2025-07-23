import { callAI } from '../utils/aiHandler.mjs';

export default async function messageCreate(message) {
	if (message.author.bot || !message.guild) return;

	const content = message.content.toLowerCase();

	// AI返答処理
	const botMentioned = message.mentions.has(message.client.user);
	const anjuMentioned =
		message.content.includes('@あんじゅちゃん') ||
		message.content.includes('あんじゅちゃん');

	if (botMentioned || anjuMentioned) {
		try {
			// メッセージから@部分を除去
			const cleanMessage = message.content
				.replace(/<@!?\d+>/g, '') // メンションを削除
				.replace(/@あんじゅちゃん/g, '') // テキストメンションも削除
				.replace(/あんじゅちゃん/g, '')
				.trim();

			if (!cleanMessage) {
				await message.reply('なあに〜？(｡•ᴗ•｡)♡');
				return;
			}

			// すぐに「考え中」メッセージを送信
			const thinkingMessage = await message.reply('考え中だよ〜 ⏳');

			try {
				// タイピング表示
				await message.channel.sendTyping();

				// AI API呼び出し（タイムアウト設定付き）
				const aiResponse = await Promise.race([
					callAI(cleanMessage, {
						userId: message.author.id,
						username: message.author.displayName || message.author.username,
						guildName: message.guild.name,
					}),
					new Promise((_, reject) => {
						setTimeout(() => reject(new Error('タイムアウト')), 25000);
					}),
				]);

				// 「考え中」メッセージを削除して返答
				await thinkingMessage.delete();

				// 2000文字制限対応
				if (aiResponse.length > 2000) {
					const chunks = aiResponse.match(/.{1,1900}/g) || [];
					for (const chunk of chunks) {
						await message.reply(chunk);
					}
				} else {
					await message.reply(aiResponse);
				}
			} catch (apiError) {
				console.error('AI API エラー:', apiError);

				// 「考え中」メッセージを編集
				await thinkingMessage.edit(
					'ごめん〜、今ちょっと調子悪いみたい〜(´･ω･`)💦'
				);
			}
		} catch (error) {
			console.error('メッセージ処理エラー:', error);
			try {
				await message.reply('エラーが出ちゃった〜(; - ;)');
			} catch (replyError) {
				console.error('返信エラー:', replyError);
			}
		}

		return; // AI処理が終わったらリアクション処理はスキップ
	}

	// リアクション処理（AI処理がなかった場合のみ）
	const reactMaps = [
		{ pattern: /こんにちは|やっほ|hello|hi|hey/i, emoji: '👋' },
		{ pattern: /thanks|thank you|ありがとう|感謝/i, emoji: '🙏' },
		{ pattern: /goodbye|bye|バイバイ|またね/i, emoji: '👋' },
		{ pattern: /help|support|助けて/i, emoji: '❓' },
		{ pattern: /congratulations|congrats|おめでとう/i, emoji: '🎉' },
		{ pattern: /welcome|ようこそ/i, emoji: '🎉' },
		{ pattern: /sorry|apology|ごめん|すみません/i, emoji: '🙏' },
		{ pattern: /yes|sure|はい|うん/i, emoji: '👍' },
		{ pattern: /no|not sure|いいえ|ちがう/i, emoji: '👎' },
		{ pattern: /maybe|perhaps|たぶん|かも/i, emoji: '🤔' },

		// 動物系
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
		{ pattern: /さる|猿/i, emoji: '🐒' },
		{ pattern: /\btako\b|たこやき|タコ/i, emoji: '🐙' },

		// 感情系
		{ pattern: /しゅき|すき|好き|love/i, emoji: '💖' },
		{ pattern: /おやすみ|ねむい|眠い/i, emoji: '🌙' },
		{ pattern: /ぴえん|かなしい|うるうる|悲しい/i, emoji: '🥺' },
		{ pattern: /ぎゅ|ぎゅー|抱きしめ|hug/i, emoji: '🤗' },
		{ pattern: /おはよう|朝だ|good morning/i, emoji: '☀️' },
		{ pattern: /わくわく|ドキドキ|excited/i, emoji: '💓' },
		{ pattern: /おいしい|うまっ|もぐもぐ|delicious/i, emoji: '🍰' },
		{ pattern: /うれしい|嬉しい|happy/i, emoji: '😊' },
		{ pattern: /楽しい|たのしい|fun/i, emoji: '😄' },
		{ pattern: /怒ってる|怒り|angry/i, emoji: '😡' },
		{ pattern: /びっくり|驚き|surprise/i, emoji: '😲' },
		{ pattern: /かわいい|可愛い|cute/i, emoji: '😍' },
		{ pattern: /かっこいい|格好いい|cool/i, emoji: '😎' },
		{ pattern: /すごい|凄い|amazing/i, emoji: '🤩' },

		// 食べ物系
		{ pattern: /ぱん|パン|\bpan\b|\bbread\b/i, emoji: '🍞' },
		{ pattern: /ケーキ|cake/i, emoji: '🍰' },
		{ pattern: /ピザ|pizza/i, emoji: '🍕' },
		{ pattern: /お寿司|寿司|sushi/i, emoji: '🍣' },
		{ pattern: /ラーメン|ramen/i, emoji: '🍜' },

		// あんじゅちゃん特別反応
		{ pattern: /あんじゅ|anju/i, emoji: '💖' },
		{ pattern: /かわいい.*bot|bot.*かわいい/i, emoji: '🥰' },
		{ pattern: /頑張って|がんばって|ファイト/i, emoji: '💪' },
	];

	// リアクション処理（最初にマッチしたもののみ）
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
