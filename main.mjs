/* global process */

import fs from 'fs';
import {
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
} from 'discord.js';
import path from 'path';
import { config } from 'dotenv';
import express from 'express';
import messageCreate from './handlers/messageCreate.mjs';
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
	intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.mjs'));

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`🟢 ログイン完了！${client.user.tag}`);
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

client.on('messageCreate', messageCreate);
client.on('error', (error) => {
	console.error('エラーが発生しました:', error);
});
client.on('warn', (info) => {
	console.warn('警告:', info);
});
client.on('shardError', (error) => {
	console.error('Shardエラー:', error);
});
client.on('shardDisconnect', (event, shardId) => {
	console.warn(`Shard ${shardId} が切断されました:`, event);
});
client.on('shardReconnecting', (shardId) => {
	console.log(`Shard ${shardId} が再接続中...`);
});
client.on('shardReady', (shardId) => {
	console.log(`Shard ${shardId} が準備完了！`);
});
client.on('shardResume', (shardId, replayedEvents) => {
	console.log(
		`Shard ${shardId} が再開されました。再生されたイベント数: ${replayedEvents}`
	);
});
client.on('guildCreate', (guild) => {
	console.log(`新しいサーバーに参加しました: ${guild.name} (ID: ${guild.id})`);
});
client.on('guildDelete', (guild) => {
	console.log(`サーバーから退出しました: ${guild.name} (ID: ${guild.id})`);
});
client.on('guildMemberAdd', (member) => {
	console.log(
		`新しいメンバーが参加しました: ${member.user.tag} (ID: ${member.id})`
	);
});
client.on('guildMemberRemove', (member) => {
	console.log(
		`メンバーがサーバーから退出しました: ${member.user.tag} (ID: ${member.id})`
	);
});
client.on('messageDelete', (message) => {
	console.log(
		`メッセージが削除されました: ${message.content} (ID: ${message.id})`
	);
});
client.on('messageUpdate', (oldMessage, newMessage) => {
	console.log(
		`メッセージが更新されました: ${oldMessage.content} -> ${newMessage.content} (ID: ${newMessage.id})`
	);
});
client.on('ready', async () => {
	await client.user.setActivity({
		name: '起きてるよ( ơ ᴗ ơ )',
		type: ActivityType.Custom,
		state: '🍞をもぐもぐ中...',
	});
	console.log(`Botは${client.user.tag}としてログインしました`);
});
if (!process.env.TOKEN) {
	console.error('環境変数 TOKEN が設定されていません。');
	process.exit(1);
}
if (!process.env.CLIENT_ID) {
	console.error('環境変数 CLIENT_ID が設定されていません。');
	process.exit(1);
}
client.login(process.env.TOKEN);
