/* global process */

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
config();

const commands = [];
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.mjs'));
for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
	console.log('🔃 コマンド登録中...');
	await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
		body: commands,
	});
	console.log('✅ 登録完了！');
} catch (error) {
	console.error('登録エラー:', error);
}
