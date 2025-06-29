import express from 'express';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
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

client.login(process.env.TOKEN);
