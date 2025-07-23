# 🎉 AnjuBot - AI搭載Discord Bot

あんじゅちゃんが作った、可愛くて賢いDiscord Bot！💖  
OpenAI APIを使ったAI機能で、自然な会話ができちゃうよ〜✨

![Bot Status](https://img.shields.io/badge/status-online-brightgreen)
![Node.js](https://img.shields.io/badge/node.js-v18+-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blurple)

---

## 🌟 主な機能

### 🤖 AI機能

- **OpenAI API連携**: GPT-3.5-turboを使った自然な会話
- **会話履歴**: 過去の会話を覚えて文脈を理解
- **あんじゅちゃん風**: 20代前半の女の子らしい可愛い話し方
- **タイムアウト対策**: 安定した応答システム

### 💬 使い方

```
@あんじゅちゃん 今日どう？
あんじゅちゃん、映画のおすすめある？
@あんじゅちゃん 元気？
```

### 🎲 楽しいコマンド

- `/lucky` - 今日のラッキー占い
- `/ship @user1 @user2` - 二人の相性診断
- `/punch @target` - 誰かをパンチ
- `/loveadvice` - 恋愛アドバイス
- `/ai-help` - AI機能のヘルプ
- `/reset-chat` - 会話履歴をリセット

### 🔗 外部連携

- **Notion API**: タスク管理データベースと連携
- **自動通知**: 指定時間にタスクを通知
- **絵文字リアクション**: メッセージに自動でリアクション

---

## 🚀 セットアップ

### 必要なもの

- Node.js v18以上
- Discord Bot Token
- OpenAI API Key
- Notion API Token（タスク機能を使う場合）

### インストール

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/AnjuDev/AnjuBot.git
   cd AnjuBot
   ```

2. **依存関係をインストール**

   ```bash
   npm install
   ```

3. **環境変数を設定**

   ```bash
   # .env ファイルを作成
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id

   # AI機能
   AI_PROVIDER=openai
   AI_API_KEY=your_openai_api_key

   # Notion連携（オプション）
   NOTION_API_TOKEN=your_notion_token
   NOTION_TASKS_DB_ID=your_tasks_database_id
   NOTION_RECURRING_DB_ID=your_recurring_database_id
   DISCORD_CHANNEL_ID=your_notification_channel_id
   ```

4. **コマンドを登録**

   ```bash
   node deploy-commands.mjs
   ```

5. **Botを起動**
   ```bash
   node main.mjs
   ```

---

## 🔧 設定方法

### Discord Bot作成

1. [Discord Developer Portal](https://discord.com/developers/applications)でBotを作成
2. Bot TokenとClient IDを取得
3. 必要な権限（メッセージ送信、スラッシュコマンド等）を設定

### OpenAI API設定

1. [OpenAI Platform](https://platform.openai.com/)でアカウント作成
2. API Keyを取得
3. 課金設定を行う（無料枠あり）

### Notion連携（オプション）

1. [Notion Developers](https://developers.notion.com/)でIntegrationを作成
2. タスク管理用のデータベースを作成
3. API TokenとDatabase IDを取得

---

## 📁 プロジェクト構成

```
AnjuBot/
├── commands/          # スラッシュコマンド
│   ├── ai-help.mjs    # AI機能ヘルプ
│   ├── lucky.mjs      # 占い機能
│   ├── ship.mjs       # 相性診断
│   ├── reset-chat.mjs # 会話リセット
│   └── ...
├── handlers/          # イベントハンドラー
│   └── messageCreate.mjs # メッセージ処理とAI返答
├── utils/             # ユーティリティ
│   ├── aiHandler.mjs      # AI API処理
│   └── taskScheduler.mjs  # Notionタスク連携
├── main.mjs           # メインプログラム
├── deploy-commands.mjs # コマンド登録
└── package.json
```

---

## 🎨 カスタマイズ

### AI人格の変更

`utils/aiHandler.mjs`の`createSystemPrompt`関数でBotの性格を設定できます。

### 新しいコマンドの追加

1. `commands/`フォルダに新しい`.mjs`ファイルを作成
2. `deploy-commands.mjs`を実行してコマンドを登録

### リアクション追加

`handlers/messageCreate.mjs`の`reactMaps`配列にパターンを追加できます。

---

## 🔄 デプロイ

### Render（推奨）

1. GitHubリポジトリと連携
2. 環境変数を設定
3. 自動デプロイ設定

### その他のプラットフォーム

- Heroku
- Railway
- VPS

---

## 📊 使用技術

- **Node.js** - ランタイム環境
- **Discord.js v14** - Discord API ライブラリ
- **OpenAI API** - AI機能
- **Notion API** - タスク管理連携
- **Express** - Webサーバー
- **node-cron** - 定期実行

---

## 🤝 コントリビューション

Pull requests大歓迎！バグ報告や機能提案もお待ちしています🛠️

### 開発ガイドライン

1. フォークしてブランチを作成
2. 変更を加えてテスト
3. Pull Requestを作成

---

## 📜 ライセンス

This project is licensed under the [MIT License](./LICENSE).

---

## 📬 お問い合わせ

**Created by Anju (@AnjuDev)**  
Twitter: [@Kumasuro_panju](https://twitter.com/Kumasuro_panju)

ご感想や質問など、気軽にDMください！💌

---

## 🎪 スクリーンショット

### AI会話機能

```
あんじゅ: @あんじゅちゃん 今日映画見たよ〜
Bot: わ〜映画見たんだ！何の映画だった〜？✨
あんじゅ: アクション映画！
Bot: アクション映画いいね〜！さっきの映画、どんなところが面白かった〜？
```

### 占い機能

- ラッキーアイテム、カラー、ナンバー
- おすすめ食べ物とアクション
- 今日のひとこと

### タスク通知

- Notionと連携した自動タスク通知
- 本日中対応タスクの自動更新
- 定期実行による通知システム

---

**A little credit goes a long way 💖**

あんじゅちゃんBot、今日もお疲れさま〜( ˶>ᴗ<˶)✨
