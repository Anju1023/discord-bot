/* global process */

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';

config();

const commands = [];
const commandFiles = fs
	.readdirSync('./commands')
	.filter((file) => file.endsWith('.mjs'));

console.log('📦 コマンドを読み込み中...');

for (const file of commandFiles) {
	try {
		const command = await import(`./commands/${file}`);
		commands.push(command.data.toJSON());
		console.log(`✅ ${file} を読み込みました`);
	} catch (error) {
		console.error(`❌ ${file} の読み込みに失敗:`, error);
	}
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// AIの新機能を説明するコマンドも追加
const aiHelpCommand = {
	name: 'ai-help',
	description: 'あんじゅちゃんのAI機能について説明するよ〜！',
	type: 1, // CHAT_INPUT
};

commands.push(aiHelpCommand);

try {
	console.log('🔃 Discord APIにコマンド登録中...');
	console.log(`📝 登録するコマンド数: ${commands.length}`);

	const data = await rest.put(
		Routes.applicationCommands(process.env.CLIENT_ID),
		{
			body: commands,
		}
	);

	console.log('✅ コマンド登録完了！');
	console.log(`🎉 ${data.length}個のコマンドが登録されました`);

	// 登録されたコマンドリストを表示
	console.log('\n📋 登録されたコマンド:');
	commands.forEach((cmd, index) => {
		console.log(`${index + 1}. /${cmd.name} - ${cmd.description}`);
	});
} catch (error) {
	console.error('❌ コマンド登録エラー:', error);

	if (error.code === 50001) {
		console.error('💡 権限不足です。Bot TokenとClient IDを確認してください。');
	} else if (error.code === 50035) {
		console.error('💡 コマンドの形式が間違っています。');
	}
}
