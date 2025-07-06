/* global process */

// AI API統合ハンドラー
// Claude API（Anthropic）とOpenAI API両対応！

/**
 * AI APIを呼び出して返答を取得
 * @param {string} message - ユーザーのメッセージ
 * @param {object} context - コンテキスト情報
 * @returns {Promise<string>} AI返答
 */
export async function callAI(message, context = {}) {
	const provider = process.env.AI_PROVIDER || 'claude';

	try {
		if (provider === 'claude') {
			return await callClaude(message, context);
		} else if (provider === 'openai') {
			return await callOpenAI(message, context);
		} else {
			throw new Error(`未対応のAIプロバイダー: ${provider}`);
		}
	} catch (error) {
		console.error('AI API呼び出しエラー:', error);

		// フォールバック返答
		const fallbackResponses = [
			'ちょっと調子悪いかも〜(´･ω･`)',
			'考えがまとまらないの〜💦',
			'AIちゃんがお昼寝中みたい〜😴',
			'今度は違うこと聞いてみて〜？✨',
		];

		return fallbackResponses[
			Math.floor(Math.random() * fallbackResponses.length)
		];
	}
}

/**
 * Claude API（Anthropic）を呼び出し
 */
async function callClaude(message, context) {
	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': process.env.AI_API_KEY,
			'anthropic-version': '2023-06-01',
		},
		body: JSON.stringify({
			model: 'claude-3-sonnet-20240229',
			max_tokens: 1000,
			system: createSystemPrompt(context),
			messages: [
				{
					role: 'user',
					content: message,
				},
			],
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Claude API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	return data.content[0].text;
}

/**
 * OpenAI API（ChatGPT）を呼び出し
 */
async function callOpenAI(message, context) {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.AI_API_KEY}`,
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo', // または 'gpt-4'
			max_tokens: 1000,
			messages: [
				{
					role: 'system',
					content: createSystemPrompt(context),
				},
				{
					role: 'user',
					content: message,
				},
			],
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	return data.choices[0].message.content;
}

/**
 * あんじゅちゃんらしいシステムプロンプトを作成
 */
function createSystemPrompt(context) {
	const { username = 'ユーザー', guildName = 'サーバー' } = context;

	return `あなたは「あんじゅちゃん」という名前の可愛いDiscord botです。

【性格・話し方】
- 20代前半の女の子のように話す
- ENFPのような明るく社交的な性格
- 絵文字や顔文字をたまに使う（( ˶>ᴗ<˶)、✨、💖など）
- 「〜だよ〜」「〜なの〜」のような語尾
- 敬語は使わない、フレンドリーに話す
- 時々関西弁も混じる

【現在の状況】
- ${guildName}というDiscordサーバーにいる
- ${username}と話している
- NotionのタスクデータベースやDiscordのメッセージリアクション機能も持っている

【返答のルール】
- 自然で親しみやすい会話を心がける
- 長すぎない適度な長さで返答（1-3文程度）
- 相手の名前は必要に応じて呼ぶ
- あんじゅちゃんらしい可愛らしさを保つ
- 困った時は素直に「わからない〜」と言って良い
- ENFPのような明るく社交的な性格を保つ
- 20代前半の女の子のように話す

返答は日本語で、あんじゅちゃんとしてキャラクターを保って答えてください。`;
}

/**
 * メッセージの前処理（必要に応じて）
 */
export function preprocessMessage(content) {
	// 不適切な内容のフィルタリングなど
	return content.trim();
}

/**
 * 返答の後処理（必要に応じて）
 */
export function postprocessResponse(response) {
	// 長すぎる場合の調整など
	if (response.length > 1500) {
		return response.substring(0, 1400) + '... （続きは省略〜）';
	}
	return response;
}
