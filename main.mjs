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

async function main() {
	config();

	console.log(
		'Loaded env:',
		Object.fromEntries(
			Object.entries(process.env).filter(
				([k]) =>
					k.startsWith('TOKEN') ||
					k.startsWith('CLIENT_ID') ||
					k.startsWith('NOTION') ||
					k.startsWith('AI_') ||
					k.startsWith('DISCORD') ||
					k === 'PORT' ||
					k === 'TZ'
			)
		)
	);

	const app = express();
	const PORT = process.env.PORT || 3000;

	app.get('/', (req, res) => {
		res.send('Botは起きてるよ〜ん');
	});

	app.listen(PORT, () => {
		console.log(`🌐 Webサーバー起動！ポート: ${PORT}`);
	});

	console.log('Discordクライアント初期化前');
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildVoiceStates,
		],
	});
	console.log('Discordクライアント初期化完了');

	// handlers
	console.log('handlers読み込み前');
	const handlersPath = './handlers';
	const handlerFiles = fs
		.readdirSync(handlersPath)
		.filter((file) => file.endsWith('.mjs'));
	console.log('handlersファイル:', handlerFiles);

	for (const file of handlerFiles) {
		const eventName = file.replace('.mjs', '');
		const filePath = pathToFileURL(`${handlersPath}/${file}`).href;
		console.log(`import handler: ${filePath}`);
		const eventModule = await import(filePath);

		if (eventName === 'aiMessageCreate') {
			client.on('messageCreate', eventModule.default);
		} else {
			client.on(eventName, eventModule.default);
		}
	}
	console.log('handlers読み込み完了');

	// commands
	console.log('commands読み込み前');
	client.commands = new Collection();
	const commandFiles = fs
		.readdirSync('./commands')
		.filter((file) => file.endsWith('.mjs'));
	console.log('commandsファイル:', commandFiles);

	for (const file of commandFiles) {
		const command = await import(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}
	console.log('commands読み込み完了');

	// イベント登録
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
				flags: 64,
			});
		}
	});

	client.on('error', (error) => {
		console.error('エラーが発生しました:', error);
	});
	client.on('warn', (info) => {
		console.warn('警告:', info);
	});
	client.on('shardError', (error) => {
		console.error('Shardエラー:', error);
	});
	client.on('guildCreate', (guild) => {
		console.log(
			`新しいサーバーに参加しました: ${guild.name} (ID: ${guild.id})`
		);
	});

	client.once('ready', async () => {
		await client.user.setActivity('🍞', {
			type: ActivityType.Custom,
			state: '🍞をもぐもぐ中...',
		});
		console.log(`🟢 ログイン完了！${client.user.tag}`);
		startTaskScheduler(client);
	});

	// 環境変数チェック
	console.log('環境変数チェック前');
	const requiredEnvVars = [
		'TOKEN',
		'CLIENT_ID',
		'AI_API_KEY',
		'AI_PROVIDER',
		'NOTION_API_TOKEN',
		'NOTION_TASKS_DB_ID',
		'NOTION_RECURRING_DB_ID',
		'DISCORD_CHANNEL_ID',
		'NODE_ENV',
		'PORT',
		'TZ',
	];
	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			console.error(`環境変数 ${envVar} が設定されていません。`);
			process.exit(1);
		}
	}
	console.log('環境変数チェック完了');

	console.log('client.login前: TOKEN=', process.env.TOKEN);

	client
		.login(process.env.TOKEN)
		.then(() => console.log('Discord login: success'))
		.catch((e) => console.error('Discord login error:', e));

	console.log('client.login呼び出し直後');
}

main();
