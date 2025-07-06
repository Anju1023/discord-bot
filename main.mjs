/* global process */

import fs from 'fs';
import {
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
} from 'discord.js';
import { config } from 'dotenv';
import express from 'express';
import { pathToFileURL } from 'url';
import { startTaskScheduler } from './utils/taskScheduler.mjs';
import { callAI } from './utils/aiHandler.mjs';

config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('Botは起きてるよ〜ん');
});

app.listen(PORT, () => {
	console.log(`🌐 Webサーバー起動！ポート: ${PORT}`);
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const handlersPath = './handlers';
const handlerFiles = fs
	.readdirSync(handlersPath)
	.filter((file) => file.endsWith('.mjs'));

for (const file of handlerFiles) {
	const eventName = file.replace('.mjs', '');
	const filePath = pathToFileURL(`${handlersPath}/${file}`).href;
	const eventModule = await import(filePath);

	client.on(eventName, eventModule.default);
}

client.commands = new Collection();
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.mjs'));

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// AI返答機能を追加！
client.on('messageCreate', async (message) => {
	// Bot自身のメッセージは無視
	if (message.author.bot || !message.guild) return;

	// @あんじゅちゃん または @botmention で呼ばれた時だけAI返答
	const botMentioned = message.mentions.has(client.user);
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

			// タイピング表示
			await message.channel.sendTyping();

			// AI API呼び出し
			const aiResponse = await callAI(cleanMessage, {
				username: message.author.displayName || message.author.username,
				guildName: message.guild.name,
			});

			// 2000文字制限対応
			if (aiResponse.length > 2000) {
				const chunks = aiResponse.match(/.{1,1900}/g) || [];
				for (const chunk of chunks) {
					await message.reply(chunk);
				}
			} else {
				await message.reply(aiResponse);
			}
		} catch (error) {
			console.error('AI返答エラー:', error);
			await message.reply('ごめん〜、今ちょっと考えがまとまらないの〜(´･ω･`)');
		}
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'エラーが出ちゃったあああ(; - ;)',
			ephemeral: true,
		});
	}
});

// エラーハンドリング
client.on('error', (error) => {
	console.error('エラーが発生しました:', error);
});
client.on('warn', (info) => {
	console.warn('警告:', info);
});

// その他のイベントハンドラー（省略可能）
client.on('shardError', (error) => {
	console.error('Shardエラー:', error);
});
client.on('guildCreate', (guild) => {
	console.log(`新しいサーバーに参加しました: ${guild.name} (ID: ${guild.id})`);
});

client.once('ready', async () => {
	await client.user.setActivity('🍞', {
		type: ActivityType.Custom,
		state: '🍞をもぐもぐ中...',
	});
	console.log(`🟢 ログイン完了！${client.user.tag}`);

	// タスクスケジューラー開始
	startTaskScheduler(client);
});

// 環境変数チェック
const requiredEnvVars = [
	'TOKEN',
	'CLIENT_ID',
	'AI_API_KEY', // 新規追加
	'AI_PROVIDER', // 'claude' or 'openai'
	'NOTION_API_TOKEN',
	'NOTION_TASKS_DB_ID',
	'NOTION_RECURRING_DB_ID',
	'DISCORD_CHANNEL_ID',
];

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		console.error(`環境変数 ${envVar} が設定されていません。`);
		process.exit(1);
	}
}

client.login(process.env.TOKEN);
