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

	// 特別なハンドラー名の処理
	if (eventName === 'aiMessageCreate') {
		client.on('messageCreate', eventModule.default);
	} else {
		client.on(eventName, eventModule.default);
	}
}

client.commands = new Collection();
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.mjs'));

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// messageCreateイベントは handlers で処理されるので削除

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
