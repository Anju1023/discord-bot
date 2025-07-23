# 🎉 AnjuBot - AI-Powered Discord Bot

A cute and smart Discord Bot created by Anju! 💖  
Powered by OpenAI API for natural conversations ✨

![Bot Status](https://img.shields.io/badge/status-online-brightgreen)
![Node.js](https://img.shields.io/badge/node.js-v18+-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blurple)

---

## 🌟 Main Features

### 🤖 AI Features

- **OpenAI API Integration**: Natural conversations using GPT-3.5-turbo
- **Conversation History**: Remembers past conversations for context understanding
- **Anju-chan Style**: Cute personality like a girl in her early 20s
- **Timeout Protection**: Stable response system

### 💬 How to Use

```
@Anju-chan How are you today?
Anju-chan, do you have any movie recommendations?
@Anju-chan Are you feeling well?
```

### 🎲 Fun Commands

- `/lucky` - Today's lucky fortune
- `/ship @user1 @user2` - Compatibility check between two users
- `/punch @target` - Punch someone
- `/loveadvice` - Love advice
- `/ai-help` - AI feature help
- `/reset-chat` - Reset conversation history

### 🔗 External Integrations

- **Notion API**: Integration with task management database
- **Auto Notifications**: Task notifications at specified times
- **Emoji Reactions**: Automatic reactions to messages

---

## 🚀 Setup

### Requirements

- Node.js v18 or higher
- Discord Bot Token
- OpenAI API Key
- Notion API Token (if using task features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AnjuDev/AnjuBot.git
   cd AnjuBot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set environment variables**

   ```bash
   # Create .env file
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id

   # AI features
   AI_PROVIDER=openai
   AI_API_KEY=your_openai_api_key

   # Notion integration (optional)
   NOTION_API_TOKEN=your_notion_token
   NOTION_TASKS_DB_ID=your_tasks_database_id
   NOTION_RECURRING_DB_ID=your_recurring_database_id
   DISCORD_CHANNEL_ID=your_notification_channel_id
   ```

4. **Register commands**

   ```bash
   node deploy-commands.mjs
   ```

5. **Start the bot**
   ```bash
   node main.mjs
   ```

---

## 🔧 Configuration

### Discord Bot Setup

1. Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Get Bot Token and Client ID
3. Set required permissions (send messages, slash commands, etc.)

### OpenAI API Setup

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Get API Key
3. Set up billing (free tier available)

### Notion Integration (Optional)

1. Create an Integration at [Notion Developers](https://developers.notion.com/)
2. Create a task management database
3. Get API Token and Database ID

---

## 📁 Project Structure

```
AnjuBot/
├── commands/          # Slash commands
│   ├── ai-help.mjs    # AI feature help
│   ├── lucky.mjs      # Fortune telling
│   ├── ship.mjs       # Compatibility check
│   ├── reset-chat.mjs # Conversation reset
│   └── ...
├── handlers/          # Event handlers
│   └── messageCreate.mjs # Message processing and AI responses
├── utils/             # Utilities
│   ├── aiHandler.mjs      # AI API processing
│   └── taskScheduler.mjs  # Notion task integration
├── main.mjs           # Main program
├── deploy-commands.mjs # Command registration
└── package.json
```

---

## 🎨 Customization

### Changing AI Personality

You can set the bot's personality in the `createSystemPrompt` function in `utils/aiHandler.mjs`.

### Adding New Commands

1. Create a new `.mjs` file in the `commands/` folder
2. Run `deploy-commands.mjs` to register the command

### Adding Reactions

You can add patterns to the `reactMaps` array in `handlers/messageCreate.mjs`.

---

## 🔄 Deployment

### Render (Recommended)

1. Connect with GitHub repository
2. Set environment variables
3. Configure auto-deployment

### Other Platforms

- Heroku
- Railway
- VPS

---

## 📊 Technologies Used

- **Node.js** - Runtime environment
- **Discord.js v14** - Discord API library
- **OpenAI API** - AI features
- **Notion API** - Task management integration
- **Express** - Web server
- **node-cron** - Scheduled execution

---

## 🤝 Contributing

Pull requests are welcome! Bug reports and feature suggestions are also appreciated 🛠️

### Development Guidelines

1. Fork and create a branch
2. Make changes and test
3. Create a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---

## 📬 Contact

**Created by Anju (@AnjuDev)**  
Twitter: [@Kumasuro_panju](https://twitter.com/Kumasuro_panju)

Feel free to DM me for feedback or questions! 💌

---

## 🎪 Screenshots

### AI Conversation Feature

```
Anju: @Anju-chan I watched a movie today~
Bot: Wow, you watched a movie! What movie was it? ✨
Anju: An action movie!
Bot: Action movies are great! What was interesting about the movie you just watched?
```

### Fortune Telling Feature

- Lucky items, colors, numbers
- Recommended food and actions
- Today's message

### Task Notifications

- Automatic task notifications integrated with Notion
- Auto-update of tasks due today
- Notification system with scheduled execution

---

**A little credit goes a long way 💖**

Anju-chan Bot, good work today~ ( ˶>ᴗ<˶)✨
