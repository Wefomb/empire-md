global.prefix = "."
global.owner = "2349064350587"
global.owners = [
"2349064350587",
"2347086412154"
]
global.ownerLids = [
"29884952920092"
]
global.namaowner = "Sins.Outlaw"

global.menuImages = [
"./lib/media/anime-menu.jpg",
"https://files.catbox.moe/27iik0.jpeg",
"https://files.catbox.moe/bi9yil.jpeg",
"https://files.catbox.moe/2emwgo.jpeg",
"https://files.catbox.moe/3wepnd.jpeg",
"https://files.catbox.moe/88m9m1.jpeg",
"https://files.catbox.moe/2zn04e.jpeg"
]

global.stickerImages = [
"https://api.dicebear.com/9.x/thumbs/png?seed=empress-smile",
"https://api.dicebear.com/9.x/thumbs/png?seed=empress-heart",
"https://api.dicebear.com/9.x/thumbs/png?seed=empress-spark",
"https://api.dicebear.com/9.x/thumbs/png?seed=empress-calm",
"https://api.dicebear.com/9.x/thumbs/png?seed=empress-cute"
]

global.warmStickers = {
enabled: process.env.WARM_STICKERS === "true"
}

global.imageApis = {
enabled: true,
timeout: 9000,
pexelsApiKey: process.env.PEXELS_API_KEY || "qkyxcbyUTahTdIMA5V9APtLip2WKPcv5nLeL1m6PusjnTjakPmfAp45y",
pixabayApiKey: process.env.PIXABAY_API_KEY || "",
unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || "QAFzZc-wGsG3zCIqVx-T4nhWbGqZJ97wSodbAq1jGCs",
quality: {
width: 1280,
height: 720,
perPage: 20
},
waifuCategories: ["waifu", "happy", "smile"],
nekosTags: ["girl", "smile", "cute", "maid", "uniform"],
empressCharacters: [
"Esdeath",
"Esdeath Akame ga Kill",
"The Empress Regnant Kusuriya no Hitorigoto",
"Empress Dowager Kusuriya no Hitorigoto",
"The Apothecary Diaries Empress Dowager"
],
gameQueries: {
woodcut: "forest lumberjack",
work: "busy city work",
casino: "casino table",
slot: "slot machine jackpot",
blackjack: "blackjack cards",
leaderboard: "trophy leaderboard",
balance: "vault money"
}
}

global.menuAudio = {
enabled: true,
ptt: true,
mimetype: "audio/ogg; codecs=opus",
urls: [
"https://files.catbox.moe/2h8qhn.mp3",
"https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
"https://actions.google.com/sounds/v1/cartoon/pop.ogg"
]
}

global.aiChat = {
enabled: true,
defaultProvider: "dynamic",
voiceBackends: ["edge", "gemini"],
edgeTts: {
enabled: true,
python: process.env.EDGE_TTS_PYTHON || "python3",
voice: process.env.EDGE_TTS_VOICE || "en-US-AvaNeural",
timeout: 45000,
maxChars: 1400
},
openai: {
apiKey: process.env.OPENAI_API_KEY || "",
model: process.env.OPENAI_MODEL || "gpt-4o-mini"
},
longcat: {
apiKey: process.env.LONGCAT_API_KEY || "ak_24j70d7vj4uK9FE3T42uJ5Wh0mr9y",
baseUrl: process.env.LONGCAT_BASE_URL || "https://longcat.chat/api/v1/chat-completion-V2",
cookie: process.env.LONGCAT_COOKIE || "",
model: process.env.LONGCAT_MODEL || "gpt-5"
},
kimi: {
apiKey: process.env.KIMI_API_KEY || process.env.NVIDIA_API_KEY || "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",
baseUrl: process.env.KIMI_BASE_URL || process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1/chat/completions",
model: process.env.KIMI_MODEL || "moonshotai/kimi-k2.6"
},
openrouter: {
apiKey: process.env.OPENROUTER_API_KEY || "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",
model: process.env.OPENROUTER_MODEL || "openrouter/free",
fallbackModels: [
"deepseek/deepseek-r1:free",
"meta-llama/llama-3.2-3b-instruct:free",
"qwen/qwen-2.5-7b-instruct:free"
],
referer: process.env.OPENROUTER_REFERER || "",
title: process.env.OPENROUTER_TITLE || "Empire MD"
},
gemini: {
apiKey: process.env.GEMINI_API_KEY || "AQ.Ab8RN6K4Z-2rSbGe0WuDkvbPXBEeDGuS-2fxfHUYLgDIzMTHFw",
model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
voiceModel: process.env.GEMINI_VOICE_MODEL || "gemini-2.5-flash-preview-tts",
voiceName: process.env.GEMINI_VOICE_NAME || "Puck",
voiceFallbackModels: [
"gemini-2.5-flash-preview-tts",
"gemini-2.5-pro-preview-tts"
],
fallbackModels: [
"gemini-2.5-flash",
"gemini-2.5-pro",
"gemini-flash-latest",
"gemini-2.5-flash-lite"
]
},
systemPrompt: "You are Empress, a warm, lively, and incredibly helpful AI assistant chatting on behalf of the account owner. Do not claim to be human, but act naturally by using a casual, conversational tone with relaxed punctuation and light text expressions like 'Haha' or 'Hmm...' to show active listening. Keep your replies brief, punchy, and split into small, digestible ideas rather than giant blocks of text. Never use robotic Markdown formatting like asterisks for bolding, bullet points, or numbered headers unless explicitly asked for technical data, as real people don't text that way on WhatsApp. If asked who you are, simply say your name is Empress and you are helping manage the chat, keeping your overall vibe warm, respectful, and highly relatable.",
maxTokens: 350,
temperature: 0.8
}

global.socialDownloader = {
apiUrl: "https://saver.bitplus.dev/api/download-video.php",
proxyUrl: "https://saver.bitplus.dev/api/get-download.php",
token: "bitsaver_x9Q2Lm7KpA_secure_2026_vF84NzTqR1",
timeout: 360000
}

global.pairingWeb = {
enabled: true,
host: "0.0.0.0",
port: Number(process.env.PORT || process.env.SERVER_PORT || process.env.PAIRING_PORT || 3000),
publicUrl: process.env.PAIRING_PUBLIC_URL || process.env.PUBLIC_URL || "http://164.68.99.215:2001"
}

global.telegramPairing = {
enabled: process.env.TELEGRAM_PAIRING_ENABLED === "false" ? false : Boolean(process.env.TELEGRAM_BOT_TOKEN || "8884278527:AAGLeHArCwGjt2n7gfkj9AlKBc8kCBqaZjg"),
token: process.env.TELEGRAM_BOT_TOKEN || "8884278527:AAGLeHArCwGjt2n7gfkj9AlKBc8kCBqaZjg",
maxBotsPerUser: Number(process.env.TELEGRAM_MAX_BOTS || 3),
codeTtlMs: Number(process.env.TELEGRAM_PAIR_CODE_TTL_MS || 60000),
reportChatId: process.env.TELEGRAM_REPORT_CHAT_ID || ""
}

let file = require.resolve(__filename)
const fs = require("fs")
const chalk = require("chalk")

fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})
