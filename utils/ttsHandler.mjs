/* global process */
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

export class TTSHandler {
	constructor() {
		this.voicevoxHost = process.env.VOICEVOX_HOST || 'http://localhost:50021';
		this.connections = new Map(); // ギルドごとの音声接続管理
		this.players = new Map(); // オーディオプレイヤー管理
	}

	/**
	 * テキストを音声に変換（VOICEVOX API使用）
	 * @param {string} text - 読み上げテキスト
	 * @param {number} speaker - 話者ID（あんじゅちゃんは四国めたんの2番とか？）
	 * @returns {Promise<Buffer>} 音声データ
	 */
	async textToSpeech(text, speaker = 2) {
		try {
			// 1. 音声クエリ作成
			const queryResponse = await fetch(
				`${this.voicevoxHost}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`,
				{ method: 'POST' }
			);

			if (!queryResponse.ok) {
				throw new Error(`VOICEVOX Query Error: ${queryResponse.status}`);
			}

			const audioQuery = await queryResponse.json();

			// 2. 音声合成
			const synthesisResponse = await fetch(
				`${this.voicevoxHost}/synthesis?speaker=${speaker}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(audioQuery),
				}
			);

			if (!synthesisResponse.ok) {
				throw new Error(
					`VOICEVOX Synthesis Error: ${synthesisResponse.status}`
				);
			}

			return Buffer.from(await synthesisResponse.arrayBuffer());
		} catch (error) {
			console.error('TTS変換エラー:', error);
			throw error;
		}
	}

	/**
	 * Discordボイスチャンネルに接続
	 * @param {Object} voiceChannel - 音声チャンネル
	 * @param {string} guildId - ギルドID
	 * @returns {Promise<VoiceConnection>}
	 */
	async connectToVoiceChannel(voiceChannel, guildId) {
		try {
			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: guildId,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			});

			// 接続状態の監視
			connection.on(VoiceConnectionStatus.Ready, () => {
				console.log(`✅ ${voiceChannel.name} に接続したよ〜！`);
			});

			connection.on(VoiceConnectionStatus.Disconnected, () => {
				console.log('音声チャンネルから切断されちゃった〜');
				this.connections.delete(guildId);
			});

			this.connections.set(guildId, connection);
			return connection;
		} catch (error) {
			console.error('音声チャンネル接続エラー:', error);
			throw error;
		}
	}

	/**
	 * 音声を再生
	 * @param {string} text - 読み上げテキスト
	 * @param {Object} interaction - Discord interaction
	 * @param {number} speaker - 話者ID
	 * @returns {Promise<void>}
	 */
	async playTTS(text, interaction, speaker = 2) {
		try {
			const member = interaction.member;
			const voiceChannel = member?.voice?.channel;

			if (!voiceChannel) {
				await interaction.reply(
					'音声チャンネルに参加してから使ってね〜( ˶ｰ̀֊ｰ́˶)'
				);
				return;
			}

			await interaction.deferReply();

			// 1. 音声データ生成
			console.log('音声データ生成中...');
			const audioBuffer = await this.textToSpeech(text, speaker);

			// 2. 一時ファイル保存
			const tempDir = './temp';
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true });
			}

			const fileName = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
			const filePath = path.join(tempDir, fileName);
			fs.writeFileSync(filePath, audioBuffer);

			// 3. 音声チャンネル接続
			let connection = this.connections.get(interaction.guildId);
			if (
				!connection ||
				connection.state.status === VoiceConnectionStatus.Destroyed
			) {
				connection = await this.connectToVoiceChannel(
					voiceChannel,
					interaction.guildId
				);
			}

			// 4. 音声再生
			const resource = createAudioResource(filePath);
			const player = createAudioPlayer();

			player.play(resource);
			connection.subscribe(player);

			// プレイヤーイベント監視
			player.on(AudioPlayerStatus.Playing, () => {
				console.log('音声再生開始〜♪');
			});

			player.on(AudioPlayerStatus.Idle, () => {
				console.log('再生終了〜');
				// 一時ファイル削除
				setTimeout(() => {
					try {
						fs.unlinkSync(filePath);
						console.log('一時ファイル削除完了');
					} catch (err) {
						console.error('ファイル削除エラー:', err);
					}
				}, 1000);
			});

			player.on('error', (error) => {
				console.error('音声再生エラー:', error);
				// エラー時もファイル削除
				try {
					fs.unlinkSync(filePath);
				} catch (err) {
					console.error('エラー時ファイル削除失敗:', err);
				}
			});

			this.players.set(interaction.guildId, player);

			await interaction.editReply(`読み上げるよ〜！ 「${text}」✨`);
		} catch (error) {
			console.error('TTS再生エラー:', error);
			await interaction.editReply('音声の再生に失敗しちゃった〜(´･ω･`)💦');
		}
	}

	/**
	 * 音声チャンネルから切断
	 * @param {string} guildId - ギルドID
	 */
	disconnect(guildId) {
		const connection = this.connections.get(guildId);
		const player = this.players.get(guildId);

		if (player) {
			player.stop();
			this.players.delete(guildId);
		}

		if (connection) {
			connection.destroy();
			this.connections.delete(guildId);
		}
	}

	/**
	 * VOICEVOX話者一覧取得
	 * @returns {Promise<Array>} 話者一覧
	 */
	async getSpeakers() {
		try {
			const response = await fetch(`${this.voicevoxHost}/speakers`);
			if (!response.ok) {
				throw new Error(`Speakers API Error: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('話者一覧取得エラー:', error);
			return [];
		}
	}
}

// シングルトンインスタンス
export const ttsHandler = new TTSHandler();
