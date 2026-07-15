require("./settings.js")
require("./lib/webp.js")
require("./lib/database.js")

const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const fetch = require("node-fetch");
const https = require("https");
const os = require('os');
const nou = require('node-os-utils');
const speed = require('performance-now');
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");
const youtubeDl = require("youtube-dl-exec");
const ffmpegPath = process.env.FFMPEG_PATH || require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

let sharpInstance = null;
let sharpLoadFailed = false;
const getSharp = () => {
if (sharpInstance || sharpLoadFailed) return sharpInstance;
try {
sharpInstance = require("sharp");
} catch (err) {
sharpLoadFailed = true;
console.error("Sharp is unavailable; image conversion will use original media:", err.message);
}
return sharpInstance;
}

const toJpegBuffer = async (media, quality = 90) => {
const sharp = getSharp();
if (!sharp) return media;
return sharp(media).jpeg({ quality }).toBuffer();
}

const {
default: makeWASocket,
jidDecode,
prepareWAMessageMedia,
generateWAMessage,
generateWAMessageFromContent,
proto,
downloadContentFromMessage
} = require("@whiskeysockets/baileys")

const { 
exec, 
execFile,
spawn, 
execSync 
} = require('child_process');
const execFileAsync = util.promisify(execFile);

const { 
imageToWebp, 
videoToWebp,
writeExifImg,
writeExifVid,
addExif
} = require('./lib/exif')

const antilink = JSON.parse(fs.readFileSync("./lib/database/antilink.json"))
const gconly = JSON.parse(fs.readFileSync("./lib/database/gconly.json"))
const welcome = JSON.parse(fs.readFileSync("./lib/database/welcome.json"))
const aiStatePath = "./lib/database/ai.json"
const sudoPath = "./lib/database/sudo.json"
const ownerPath = "./lib/database/owner.json"
const premiumPath = "./lib/database/premium.json"
const rentSessionsPath = "./lib/database/rentsessions.json"
const configPath = "./config.js"
const sessionsRoot = path.resolve("./sessions")
const rentSessionsRoot = path.join(sessionsRoot, "rent")
const Case = require("./lib/system");
const { cekbanAsync, unbanAsync } = require("./lib/whatsappAccountTools");
const {
getDynamicImage,
fetchImageBuffer
} = require("./lib/dynamicImages");
const botCommands = new Set([
"menu", "menj", "help", "allmenu", "index", "downloadmenu", "groupmenu", "gamemenu", "ownermenu",
"status", "ping2", "speed", "speedtest", "runtime", "infobot", "info", "tqto", "thx",
"myinfo", "mypremium", "buypremium", "addpremium", "delpremium", "listpremium", "clearchat", "weather", "calculate", "calc", "translate", "tr", "tts", "qr", "wiki", "convert", "device", "checkdevice", "getdevice", "tools", "seotools", "cekban", "checkban", "checkwa", "unban",
"transcribe", "stt", "tth", "handwriting", "speech", "ahmtts", "tempmail", "mailtemp", "unovel", "novel", "pixelster", "imagine", "imggen", "webzip", "sitezip", "medster", "findtube", "aitools", "longcat",
"confess", "confes", "menfes", "menfess", "balasmenfess", "tolakmenfess", "stopmenfess",
"ai", "aichat", "empress", "vn", "voice", "voicenote", "speak", "say",
"woodcut", "work", "balance", "leaderboard", "casino", "slot", "blackjack", "support", "donate", "pay", "payment",
"tiktok", "tt", "instagram", "igdl", "ig", "facebook", "fb", "twitter", "x",
"pinterest", "pin", "reddit", "capcut", "capcutdl", "cc", "ttsearch", "snapchat", "soundcloud", "snackvideo", "douyin", "alldl", "anydl", "video", "ytmp4", "ytvideo", "social", "dl", "download", "play", "ytmp3", "ytaudio", "ytmusic", "sticker", "stiker", "s", "brat", "bratimg", "bratimage", "bratgambar", "bratvid", "bratvideo", "furbrat", "tourl", "catbox", "catboxurl", "url", "kaorinews", "animenews", "footballnews", "soccernews",
"swm", "steal", "stickerwm", "take", "toimg", "jpeg", "pp", "getpp", "setpp", "delpp", "bio", "setbio", "setname",
"welcome", "welkam", "antilink", "antilinkgc", "gconly", "grouponly", "kick", "kik", "add", "promote", "demote", "open", "close", "mute", "mutegc", "unmute", "unmutegc", "lockgc", "unlockgc",
"kickall", "hidetag", "h", "ht", "totag", "tagall", "everyone", "tag", "tagadmins", "listmembers", "groupinfo", "listgc", "link", "invite", "revoke", "setgname", "setdesc", "setgdesc", "setgpp", "getgpp", "delgpp", "join", "joingroup", "left", "leavegroup", "cekidch", "idch",
"vv", "rvo", "readviewonce", "self", "private", "public", "prefix", "setprefix", "resetprefix", "rentbot", "pair", "bot", "delrent", "delrentbot", "listrent", "rentlist", "rentstatus", "addowner", "addowenr", "delowner", "listowner", "owners", "addsudo", "delsudo", "listsudo", "getcase", "addcase", "delcase", "listcase",
"developerbot", "owner", "own", "dev", "ping", "uptime", "ttt", "ttc", "tictactoe", "delttt", "delttc",
"crashempire", "crashempire2", "crashempire3", "crashempire4", "crashempire5", "crashempire6",
"backupsc", "bck", "backup"
])

const buildCommandIndex = (prefix = ".") => {
const commands = [...botCommands].sort()
const rows = []
for (let i = 0; i < commands.length; i += 4) {
rows.push(commands.slice(i, i + 4).map(cmd => `${prefix}${cmd}`).join("  "))
}
return rows.join("\n")
}

const pickRandom = (items = []) => items[Math.floor(Math.random() * items.length)]

const shuffleItems = (items = []) => {
const next = [...items]
for (let i = next.length - 1; i > 0; i--) {
const j = randomInt(0, i)
const temp = next[i]
next[i] = next[j]
next[j] = temp
}
return next
}

const getRandomMenuAudio = () => {
const audios = Array.isArray(global.menuAudio?.urls) && global.menuAudio.urls.length ? global.menuAudio.urls : []
return audios[Math.floor(Math.random() * audios.length)]
}

const jidUser = (jid = "") => String(jid || "").split("@")[0].split(":")[0]

const ownerToJid = (value = "") => {
const input = String(value || "").trim()
if (!input) return ""
if (input.includes("@")) return input
const number = input.replace(/[^0-9]/g, "")
return number ? `${number}@s.whatsapp.net` : ""
}

const lidToJid = (value = "") => {
const input = String(value || "").trim()
if (!input) return ""
if (input.includes("@")) return input
const number = input.replace(/[^0-9]/g, "")
return number ? `${number}@lid` : ""
}

const getConfiguredOwnerJids = () => {
const configOwners = Array.isArray(global.owners) ? global.owners : []
const configOwnerLids = Array.isArray(global.ownerLids) ? global.ownerLids : []
const databaseOwners = readOwnerUsers()
return [...new Set([
...([global.owner, ...configOwners, ...databaseOwners].map(ownerToJid)),
...(configOwnerLids.map(lidToJid))
].filter(Boolean))]
}

const normalizeJidForCompare = (sock, jid = "") => {
if (!jid) return ""
try {
if (typeof sock?.decodeJid === "function") return sock.decodeJid(jid)
} catch {}
return String(jid)
}

const getSenderCompareJids = (sock, m = {}) => {
const candidates = [
m.sender,
m.senderPn,
m.senderLid,
m.participant,
m.key?.participantPn,
m.key?.senderPn,
m.key?.participant,
m.key?.participantLid,
m.key?.senderLid,
m.key?.participantAlt,
m.key?.remoteJidAlt
].filter(Boolean)
return [...new Set(candidates.map(jid => normalizeJidForCompare(sock, jid)).filter(Boolean))]
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const formatMoney = (amount = 0) => Number(amount || 0).toLocaleString("en-US")

const formatDuration = (ms = 0) => {
const safeMs = Math.max(0, ms)
const h = Math.floor(safeMs / 3600000)
const m = Math.floor(safeMs / 60000) % 60
const s = Math.floor(safeMs / 1000) % 60
return [h, m, s].map(v => String(v).padStart(2, "0")).join(":")
}

const starRanks = {
satu: "⭐",
dua: "⭐⭐",
tiga: "⭐⭐⭐",
empat: "⭐⭐⭐⭐",
lima: "⭐⭐⭐⭐⭐",
enam: "⭐⭐⭐⭐⭐⭐"
}

const gamePixelArt = `▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒
▒█▀█▀█▒█▀█▒▒█▀█▒
░█▀█▀█░█▀██░█▀█░
░█▀█▀█░█▀████▀█░
████████▀███████`

const gameStars = (score = 1) => {
const tiers = [starRanks.satu, starRanks.dua, starRanks.tiga, starRanks.empat, starRanks.lima, starRanks.enam]
return tiers[Math.max(0, Math.min(tiers.length - 1, score - 1))]
}

const gameFrame = (title = "GAME", body = "", footer = "") => {
return `${gamePixelArt}

╭━━〔 ${title} 〕━━╮
${body}
${footer ? `\n${footer}` : ""}
╰━━━━━━━━━━━━━━╯`
}

const getGameUser = (jid = "") => {
global.db = global.db || {}
global.db.users = global.db.users || {}
if (!global.db.users[jid] || typeof global.db.users[jid] !== "object") global.db.users[jid] = {}
const defaults = {
money: 2500,
bank: 0,
fullatm: 50000,
atm: 1,
exp: 0,
wood: 0,
chip: 0,
lastparming: 0,
lastwork: 0,
lastcasino: 0,
lastslot: 0,
registered: false
}
for (const [key, value] of Object.entries(defaults)) {
if (typeof global.db.users[jid][key] === "undefined") global.db.users[jid][key] = value
}
return global.db.users[jid]
}

const saveGameDb = () => {
try {
if (typeof global.saveDb === "function") global.saveDb()
} catch (err) {
console.error("Failed to save game database:", err.message)
}
}

const cardValue = (card) => card.rank === "A" ? 11 : ["K", "Q", "J"].includes(card.rank) ? 10 : Number(card.rank)

const scoreCards = (cards = []) => {
let total = cards.reduce((sum, card) => sum + cardValue(card), 0)
let aces = cards.filter(card => card.rank === "A").length
while (total > 21 && aces > 0) {
total -= 10
aces -= 1
}
return total
}

const createDeck = () => {
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const suits = ["spades", "hearts", "diamonds", "clubs"]
const symbols = { spades: "♠️", hearts: "♥️", diamonds: "♦️", clubs: "♣️" }
const deck = []
for (const suit of suits) {
for (const rank of ranks) deck.push({ rank, suit, text: `${rank}${symbols[suit]}` })
}
for (let i = deck.length - 1; i > 0; i--) {
const j = randomInt(0, i)
const temp = deck[i]
deck[i] = deck[j]
deck[j] = temp
}
return deck
}

const drawCard = (session) => session.deck.pop()

const finishBlackjack = (session) => {
let playerTotal = scoreCards(session.player)
let dealerTotal = scoreCards(session.dealer)
while (dealerTotal < 17 && playerTotal <= 21) {
session.dealer.push(drawCard(session))
dealerTotal = scoreCards(session.dealer)
}
let result = "draw"
let payout = session.bet
if (playerTotal > 21) {
result = "loss"
payout = 0
} else if (dealerTotal > 21 || playerTotal > dealerTotal) {
result = playerTotal === 21 && session.player.length === 2 ? "blackjack" : "win"
payout = result === "blackjack" ? Math.floor(session.bet * 2.5) : session.bet * 2
} else if (dealerTotal > playerTotal) {
result = "loss"
payout = 0
}
session.done = true
session.result = result
session.payout = payout
return session
}

const renderBlackjack = (session, prefix = ".") => {
const playerTotal = scoreCards(session.player)
const dealerTotal = scoreCards(session.dealer)
const playerCards = session.player.map(card => card.text).join("  ")
const dealerCards = session.done ? session.dealer.map(card => card.text).join("  ") : `${session.dealer[0].text}  ??`
const status = session.done
? session.result === "blackjack" ? "🃏 BLACKJACK. Clean table, loud pockets."
: session.result === "win" ? "🏆 You beat the dealer."
: session.result === "loss" ? "💀 Dealer takes this round."
: "🤝 Push. Your bet comes back."
: "🎯 Your move: hit, stand, double, or end."
const stars = session.done
? session.result === "blackjack" ? gameStars(6)
: session.result === "win" ? gameStars(5)
: session.result === "draw" ? gameStars(3)
: gameStars(1)
: gameStars(2)
return gameFrame("🃏 BLACKJACK TABLE 🃏", `│ 🧑 Player: ${playerCards} (${playerTotal})
│ 🎩 Dealer: ${dealerCards}${session.done ? ` (${dealerTotal})` : ""}
│ 💰 Bet: ${formatMoney(session.bet)}
${session.done ? `│ 💵 Payout: ${formatMoney(session.payout)}\n` : ""}│ ${stars}
│ ${status}`, session.done ? `🎲 Start another: ${prefix}blackjack start ${session.bet}` : `🎮 Commands:
${prefix}blackjack hit
${prefix}blackjack stand
${prefix}blackjack double
${prefix}blackjack end`)
}

const getSocialPlatform = (url = "") => {
const lowerUrl = url.toLowerCase()
if (/youtu\.be|youtube\.com/.test(lowerUrl)) return "youtube"
if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/.test(lowerUrl)) return "tiktok"
if (/instagram\.com/.test(lowerUrl)) return "instagram"
if (/(^|\/\/)(x\.com|twitter\.com)/.test(lowerUrl)) return "x"
if (/facebook\.com|fb\.watch|fb\.com/.test(lowerUrl)) return "facebook"
if (/pinterest\.com|pin\.it/.test(lowerUrl)) return "pinterest"
if (/reddit\.com|redd\.it/.test(lowerUrl)) return "reddit"
if (/capcut\.com/.test(lowerUrl)) return "capcut"
if (/snapchat\.com/.test(lowerUrl)) return "snapchat"
if (/soundcloud\.com/.test(lowerUrl)) return "soundcloud"
if (/snackvideo\.com/.test(lowerUrl)) return "snackvideo"
if (/douyin\.com/.test(lowerUrl)) return "douyin"
return "social"
}

const isSupportedUniversalUrl = (url = "") => /https?:\/\/\S*(youtube\.com|youtu\.be|tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|instagram\.com|facebook\.com|fb\.watch|fb\.com|x\.com|twitter\.com|reddit\.com|redd\.it|capcut\.com|snapchat\.com|soundcloud\.com|snackvideo\.com|douyin\.com)/i.test(url)

const buildBitSaverProxyUrl = (downloadUrl, filename = "video.mp4") => {
const config = global.socialDownloader || {}
const proxyUrl = config.proxyUrl || "https://saver.bitplus.dev/api/get-download.php"
const token = config.token || ""
return `${proxyUrl}?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(filename)}&token=${encodeURIComponent(token)}`
}

const downloadWithBitSaver = async (url) => {
const config = global.socialDownloader || {}
const apiUrl = config.apiUrl || "https://saver.bitplus.dev/api/download-video.php"
const token = config.token || ""
const timeout = config.timeout || 360000
const response = await axios.post(apiUrl, { url, token }, {
headers: { "Content-Type": "application/json" },
timeout
})

const data = response.data || {}
if (!data.success || !data.download_url) {
throw new Error(data.message || "BitSaver could not extract a video from that link.")
}

const filename = data.filename || `${getSocialPlatform(url)}.mp4`
return {
filename,
downloadUrl: data.download_url,
proxyUrl: buildBitSaverProxyUrl(data.download_url, filename),
platform: data.platform || getSocialPlatform(url)
}
}

const normalizeAhm7Quality = (quality = {}) => ({
quality: quality.quality || quality.label || quality.name || "default",
url: quality.url || quality.videoUrl || quality.downloadUrl || quality.link
})

const downloadWithAhm7 = async (url) => {
if (!isSupportedUniversalUrl(url)) throw new Error("Please send a supported public video or audio link.")
const response = await axios.get("https://ahm7xmakki.com/api/alldl", {
params: { url },
timeout: 120000,
headers: { "User-Agent": "Empire-MD/2.0.0" }
})

const data = response.data || {}
const mediaInfo = data.mediaInfo || data.result || data.data || {}
const qualities = Array.isArray(mediaInfo.qualities) ? mediaInfo.qualities.map(normalizeAhm7Quality).filter(item => item.url) : []
const videoUrl = mediaInfo.videoUrl || mediaInfo.video || mediaInfo.url || mediaInfo.downloadUrl || qualities[0]?.url
const audioUrl = mediaInfo.audioUrl || mediaInfo.audio || mediaInfo.mp3
if (!data.success || (!videoUrl && !audioUrl)) {
throw new Error(data.message || mediaInfo.message || "AHM7xMakki could not extract media from that link.")
}

const platform = mediaInfo.platform || getSocialPlatform(url)
const title = String(mediaInfo.title || `${platform}-download`).replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "empire-download"
return {
title,
platform,
thumbnail: mediaInfo.thumbnail || mediaInfo.cover || mediaInfo.image,
videoUrl,
audioUrl,
qualities
	}
	}

const AHM7_BASE_URL = "https://ahm7xmakki.com"

const ahm7ToolRequest = async (tool, payload = {}) => {
const cleanTool = String(tool || "").replace(/^\/+|\/+$/g, "")
const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""))
const attempts = [
{ method: "GET", url: `${AHM7_BASE_URL}/api/${cleanTool}`, params: body },
{ method: "POST", url: `${AHM7_BASE_URL}/api/${cleanTool}`, data: body },
{ method: "GET", url: `${AHM7_BASE_URL}/${cleanTool}`, params: body },
{ method: "POST", url: `${AHM7_BASE_URL}/${cleanTool}`, data: body }
]
let lastError
for (const attempt of attempts) {
try {
const response = await axios({
...attempt,
timeout: Number(global.externalTools?.timeout || 120000),
headers: {
"User-Agent": "Empire-MD/2.0.0",
"Accept": "application/json,text/plain,*/*",
...(attempt.method === "POST" ? { "Content-Type": "application/json" } : {})
},
maxRedirects: 5
})
const data = response.data
if (typeof data === "string" && /<!doctype html|<html/i.test(data) && !/https?:\/\//i.test(data)) {
throw new Error(`${cleanTool} returned the website page instead of an API response.`)
}
return data
} catch (err) {
lastError = err
const status = err?.response?.status
if (status && ![404, 405, 415].includes(status)) break
}
}
throw lastError || new Error(`AHM7 ${cleanTool} did not respond.`)
}

const flattenToolValues = (value, depth = 0) => {
if (depth > 4 || value === undefined || value === null) return []
if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)]
if (Array.isArray(value)) return value.flatMap(item => flattenToolValues(item, depth + 1))
if (typeof value === "object") return Object.values(value).flatMap(item => flattenToolValues(item, depth + 1))
return []
}

const extractFirstUrl = (data, matcher = /^https?:\/\//i) => {
const values = flattenToolValues(data)
return values.find(value => matcher.test(value)) || ""
}

const extractToolText = (data) => {
if (typeof data === "string") return data.trim()
const preferred = data?.text || data?.result || data?.message || data?.transcript || data?.content || data?.data?.text || data?.data?.result || data?.data?.message || data?.data?.transcript
if (preferred && typeof preferred !== "object") return String(preferred).trim()
return flattenToolValues(data).filter(value => !/^https?:\/\//i.test(value)).join("\n").trim()
}

const sendEndpointResult = async ({ sock, m, command = "", title, data, prefer = "text", sourceUrl = "" }) => {
const imageUrl = extractFirstUrl(data, /^https?:\/\/.+\.(?:png|jpe?g|webp|gif)(?:\?.*)?$/i) || extractFirstUrl(data, /^data:image\//i)
const audioUrl = extractFirstUrl(data, /^https?:\/\/.+\.(?:mp3|wav|ogg|m4a|opus)(?:\?.*)?$/i)
const videoUrl = extractFirstUrl(data, /^https?:\/\/.+\.(?:mp4|mov|webm)(?:\?.*)?$/i)
const zipUrl = extractFirstUrl(data, /^https?:\/\/.+\.(?:zip|rar|7z)(?:\?.*)?$/i)
const anyUrl = extractFirstUrl(data)
const textResult = extractToolText(data)
const caption = `╭━━〔 ${title} 〕━━╮\n${textResult || anyUrl || "Done."}${sourceUrl ? `\n\nSource: ${sourceUrl}` : ""}`
if (prefer === "image" && imageUrl) return sock.sendMessage(m.chat, { image: { url: imageUrl }, caption }, { quoted: m })
if (prefer === "audio" && audioUrl) return sock.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: "audio/mpeg", ptt: command === "speech" }, { quoted: m })
if (prefer === "video" && videoUrl) return sock.sendMessage(m.chat, { video: { url: videoUrl }, caption, mimetype: "video/mp4" }, { quoted: m })
if (prefer === "zip" && zipUrl) return sock.sendMessage(m.chat, { document: { url: zipUrl }, mimetype: "application/zip", fileName: "website.zip", caption }, { quoted: m })
if (imageUrl) return sock.sendMessage(m.chat, { image: { url: imageUrl }, caption }, { quoted: m })
if (audioUrl) return sock.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: "audio/mpeg" }, { quoted: m })
if (videoUrl) return sock.sendMessage(m.chat, { video: { url: videoUrl }, caption, mimetype: "video/mp4" }, { quoted: m })
if (zipUrl) return sock.sendMessage(m.chat, { document: { url: zipUrl }, mimetype: "application/zip", fileName: "website.zip", caption }, { quoted: m })
return m.reply(caption)
}

const loadBanCardJimp = () => {
const JimpLib = require("jimp")
return {
lib: JimpLib,
Jimp: JimpLib.Jimp || JimpLib,
loadFont: JimpLib.loadFont || JimpLib.Jimp?.loadFont,
rgbaToInt: JimpLib.rgbaToInt || JimpLib.Jimp?.rgbaToInt
}
}

const createJimpImage = async (Jimp, width, height, color) => {
try {
return await new Jimp(width, height, color)
} catch {
return await new Jimp({ width, height, color })
}
}

const loadBanCardFont = async (jimp, size = 32) => {
const fontNames = {
16: ["SANS_16_WHITE", "FONT_SANS_16_WHITE"],
32: ["SANS_32_WHITE", "FONT_SANS_32_WHITE"],
64: ["SANS_64_WHITE", "FONT_SANS_64_WHITE"]
}
const candidates = []
for (const name of fontNames[size] || fontNames[32]) {
if (jimp.lib[name]) candidates.push(jimp.lib[name])
if (jimp.Jimp?.[name]) candidates.push(jimp.Jimp[name])
}
try {
const fonts = require("jimp/fonts")
for (const name of fontNames[size] || fontNames[32]) if (fonts[name]) candidates.push(fonts[name])
} catch {}
for (const font of candidates) {
try {
return await jimp.loadFont(font)
} catch {}
}
throw new Error(`Jimp white font ${size} is unavailable.`)
}

const jimpPrint = (image, font, x, y, text, maxWidth, maxHeight) => {
try {
return image.print(font, x, y, text, maxWidth, maxHeight)
} catch {
return image.print({ font, x, y, text, maxWidth, maxHeight })
}
}

const getJimpPngBuffer = async (image, mime) => {
if (typeof image.getBufferAsync === "function") return image.getBufferAsync(mime)
try {
const maybeBuffer = image.getBuffer(mime)
if (maybeBuffer && typeof maybeBuffer.then === "function") return await maybeBuffer
if (Buffer.isBuffer(maybeBuffer)) return maybeBuffer
} catch {}
return new Promise((resolve, reject) => {
image.getBuffer(mime, (err, buffer) => err ? reject(err) : resolve(buffer))
})
}

const banCardRequester = (name = "", fallback = "") => {
const raw = String(name || fallback || "Unknown").replace(/^@+/, "").trim()
return `@${(raw || "Unknown").replace(/\s+/g, "_").slice(0, 28)}`
}

const renderBanStatusImage = async (result = {}, requesterName = "", requesterJid = "") => {
const isBanned = result.isBanned === true || result.banStatus === "banned"
const isSafe = result.isBanned === false || result.banStatus === "not_banned"
const status = isBanned ? "is banned from using whatsapp." : isSafe ? "is not banned from using whatsapp." : "ban status is unknown."
const number = `+${String(result.number || "-").replace(/^\+/, "")}`
const requester = banCardRequester(requesterName, jidUser(requesterJid))
try {
const jimp = loadBanCardJimp()
const white = jimp.rgbaToInt ? jimp.rgbaToInt(255, 255, 255, 255) : 0xffffffff
const dim = jimp.rgbaToInt ? jimp.rgbaToInt(52, 40, 70, 255) : 0x342846ff
const bg = jimp.rgbaToInt ? jimp.rgbaToInt(6, 6, 18, 255) : 0x060612ff
const image = await createJimpImage(jimp.Jimp, 1080, 1920, bg)
const set = (x, y, color = white) => {
if (x >= 0 && y >= 0 && x < 1080 && y < 1920) image.setPixelColor(color, x, y)
}
for (let y = 0; y < 1920; y++) {
if (y % 18 === 0) for (let x = 0; x < 1080; x++) set(x, y, dim)
for (let x = 0; x < 1080; x += 8) {
const noise = (x * 17 + y * 31 + ((x ^ y) * 13)) % 97
if (noise < 5) {
set(x, y, white)
if (noise < 2) set(x + 1, y, white)
}
}
}
const drawLine = (x1, y1, x2, y2, color = white, thickness = 4) => {
if (x1 === x2) {
for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let t = 0; t < thickness; t++) set(x1 + t, y, color)
return
}
if (y1 === y2) {
for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) for (let t = 0; t < thickness; t++) set(x, y1 + t, color)
return
}
let dx = Math.abs(x2 - x1)
let sx = x1 < x2 ? 1 : -1
let dy = -Math.abs(y2 - y1)
let sy = y1 < y2 ? 1 : -1
let err = dx + dy
let x = x1
let y = y1
while (true) {
for (let tx = 0; tx < thickness; tx++) for (let ty = 0; ty < thickness; ty++) set(x + tx, y + ty, color)
if (x === x2 && y === y2) break
const e2 = 2 * err
if (e2 >= dy) {
err += dy
x += sx
}
if (e2 <= dx) {
err += dx
y += sy
}
}
}
const drawRoundRect = (x, y, w, h, r, color = white, thickness = 5) => {
drawLine(x + r, y, x + w - r, y, color, thickness)
drawLine(x + r, y + h, x + w - r, y + h, color, thickness)
drawLine(x, y + r, x, y + h - r, color, thickness)
drawLine(x + w, y + r, x + w, y + h - r, color, thickness)
for (let a = 0; a <= 90; a += 0.5) {
const rad = a * Math.PI / 180
for (let t = 0; t < thickness; t++) {
const rr = r - t
set(Math.round(x + r - Math.cos(rad) * rr), Math.round(y + r - Math.sin(rad) * rr), color)
set(Math.round(x + w - r + Math.cos(rad) * rr), Math.round(y + r - Math.sin(rad) * rr), color)
set(Math.round(x + r - Math.cos(rad) * rr), Math.round(y + h - r + Math.sin(rad) * rr), color)
set(Math.round(x + w - r + Math.cos(rad) * rr), Math.round(y + h - r + Math.sin(rad) * rr), color)
}
}
}
const drawSpiral = (cx, cy, color = white) => {
let last = null
for (let t = 0; t < 42; t += 0.12) {
const radius = 2 + t * 1.2
const x = Math.round(cx + Math.cos(t) * radius)
const y = Math.round(cy + Math.sin(t) * radius)
if (last) {
drawLine(last.x, last.y, x, y, color, 3)
} else {
set(x, y, color)
}
last = { x, y }
}
}
const font16 = await loadBanCardFont(jimp, 16)
const font32 = await loadBanCardFont(jimp, 32)
const font64 = await loadBanCardFont(jimp, 64)
drawSpiral(540, 95)
drawRoundRect(145, 285, 790, 205, 34)
drawLine(540, 285, 540, 390)
drawLine(145, 390, 935, 390)
drawRoundRect(260, 490, 560, 125, 30)
drawRoundRect(65, 755, 950, 410, 46)
drawLine(65, 1060, 1015, 1060)
drawLine(540, 1060, 540, 1165)
jimpPrint(image, font64, 245, 320, "CLOSE", 280, 70)
jimpPrint(image, font64, 645, 320, "NEXT", 250, 70)
jimpPrint(image, font32, 410, 425, "EMPIRE MD BOT", 300, 50)
jimpPrint(image, font32, 315, 535, number.replace(/^\+(\d{3})(\d{3})(\d{3})(\d+)$/, "+ $1      $2 $3 $4"), 460, 50)
jimpPrint(image, font64, 110, 815, number, 850, 75)
jimpPrint(image, font32, 112, 935, status, 850, 55)
jimpPrint(image, font32, 112, 1000, `By ${requester}`, 850, 55)
jimpPrint(image, font64, 245, 1095, "EXIT", 250, 70)
jimpPrint(image, font64, 655, 1095, "SUPPORT", 320, 70)
return getJimpPngBuffer(image, jimp.lib.MIME_PNG || jimp.Jimp.MIME_PNG || "image/png")
} catch (err) {
console.error("Ban card render fallback:", err.message)
const bg = isBanned ? "2b0d12" : isSafe ? "0d241a" : "191a24"
const fg = isBanned ? "ff3b4f" : isSafe ? "35d07f" : "ffc857"
const lines = [
"EMPIRE MD BAN CHECK",
isBanned ? "BANNED" : isSafe ? "NOT BANNED" : "UNKNOWN",
`Number +${result.number || "-"}`,
`By ${requester}`,
`Status ${result.status || "-"}`,
`Checked ${result.timestamp || new Date().toISOString()}`
]
const text = encodeURIComponent(lines.join("\n"))
return `https://placehold.co/1200x720/${bg}/${fg}.png?font=montserrat&text=${text}&cache=${Date.now()}`
}
}

const downloadCapcutTemplate = async (url) => {
if (!/capcut\.net/i.test(url)) throw new Error("Please send a valid CapCut template link.")
const response = await axios.get(url, {
timeout: 60000,
headers: {
"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
}
})
const html = response.data || ""
const match = html.match(/<script nonce="argus-csp-token">window\._ROUTER_DATA = (.*?)<\/script>/) || html.match(/window\._ROUTER_DATA\s*=\s*({.+?})<\/script>/)
if (!match?.[1]) throw new Error("CapCut metadata was not found on that page.")
const routerData = JSON.parse(match[1])
const loaderData = routerData.loaderData || {}
const templateDetail = loaderData["template-detail_$"]?.templateDetail || Object.values(loaderData).find(item => item?.templateDetail)?.templateDetail
if (!templateDetail?.videoUrl) throw new Error("CapCut did not expose a downloadable preview video.")
return templateDetail
}

const searchTikTokVideos = async (query) => {
const response = await axios.get("https://api.siputzx.my.id/api/s/tiktok", {
params: { query },
timeout: 60000
})
const data = response.data || {}
if (!data.status || !Array.isArray(data.data) || !data.data.length) throw new Error("No TikTok videos were found.")
return data.data
}

const fetchKaoriArticles = async (query = "") => {
const url = query ? `https://www.kaorinusantara.or.id/?s=${encodeURIComponent(query)}` : "https://www.kaorinusantara.or.id/newsline"
const { data: html } = await axios.get(url, { timeout: 60000 })
const $ = cheerio.load(html)
const articles = []
$(".td_module_10").each((_, el) => {
const title = $(el).find(".entry-title a").text().trim()
const articleUrl = $(el).find(".entry-title a").attr("href")
const excerpt = $(el).find(".td-excerpt").text().trim()
const date = $(el).find(".td-post-date time").text().trim()
const author = $(el).find(".td-post-author-name a").text().trim()
const category = $(el).find(".td-post-category").text().trim()
const image = $(el).find(".td-module-thumb img").attr("data-src") || $(el).find(".td-module-thumb img").attr("src")
if (title && articleUrl) articles.push({ title, url: articleUrl, excerpt, date, author, category, image })
})
return articles.slice(0, 5)
}

const fetchFootballNews = async () => {
const { data: html } = await axios.get("https://vivagoal.com/category/berita-bola/", {
timeout: 60000,
httpsAgent: new https.Agent({ rejectUnauthorized: false })
})
const $ = cheerio.load(html)
const articles = []
$(".swiper-wrapper .swiper-slide, .col-lg-6.mb-4, .col-lg-4.mb-4").each((_, el) => {
const url = $(el).find("a").attr("href")
const image = $(el).find("figure img").attr("src")
const title = $(el).find("h3 a").text().trim()
const categories = $(el).find("a.vg_pill_cat").map((__, cat) => $(cat).text().trim()).get()
const date = $(el).find("time").attr("datetime") || $(el).find(".posted-on").text().trim()
if (url && title) articles.push({ url, image, title, categories, date })
})
return articles.slice(0, 5)
}

const getExtensionFromMime = (mime = "") => {
if (/jpeg|jpg/.test(mime)) return "jpg"
if (/png/.test(mime)) return "png"
if (/webp/.test(mime)) return "webp"
if (/gif/.test(mime)) return "gif"
if (/mp4/.test(mime)) return "mp4"
if (/mpeg|mp3/.test(mime)) return "mp3"
if (/ogg|opus/.test(mime)) return "ogg"
return "bin"
}

const uploadToCatbox = async (buffer, filename = "empire-md.bin") => {
const postUpload = async (endpoint, fields = {}) => {
const tempPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`)
fs.writeFileSync(tempPath, buffer)
const form = new FormData()
Object.entries(fields).forEach(([key, value]) => form.append(key, value))
form.append("fileToUpload", fs.createReadStream(tempPath), { filename })
const headers = {
...form.getHeaders(),
"User-Agent": "Empire-MD/2.0.0",
"Content-Length": await new Promise((resolve, reject) => {
form.getLength((err, length) => err ? reject(err) : resolve(length))
})
}
try {
const response = await axios.post(endpoint, form, {
headers,
maxBodyLength: Infinity,
maxContentLength: Infinity,
timeout: 180000
})
const link = String(response.data || "").trim()
if (!/^https?:\/\//i.test(link)) throw new Error(link || "Catbox did not return a valid URL.")
return link
} finally {
if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
}
}

try {
return await postUpload("https://catbox.moe/user/api.php", { reqtype: "fileupload" })
} catch (err) {
const status = err?.response?.status
const message = String(err?.response?.data || err.message || "")
console.error("Catbox primary upload failed:", status || "", message)
return postUpload("https://litterbox.catbox.moe/resources/internals/api.php", {
reqtype: "fileupload",
time: "1h"
})
}
}

const downloadYoutubeAudio = async (url) => {
if (!ytdl.validateURL(url)) throw new Error("Please send a valid YouTube URL.")
const info = await ytdl.getInfo(url)
const details = info.videoDetails || {}
const title = (details.title || "youtube-audio").replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "youtube-audio"
const lengthSeconds = Number(details.lengthSeconds || 0)
if (lengthSeconds && lengthSeconds > 60 * 20) throw new Error("Please use a YouTube video shorter than 20 minutes.")
const outputPath = path.join(os.tmpdir(), `empire-md-youtube-${Date.now()}.mp3`)
const stream = ytdl.downloadFromInfo(info, {
quality: "highestaudio",
filter: "audioonly"
})
const buffer = await new Promise((resolve, reject) => {
ffmpeg(stream)
.audioBitrate(128)
.format("mp3")
.on("error", (err) => {
if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
reject(err)
})
.on("end", () => {
try {
const audio = fs.readFileSync(outputPath)
fs.unlinkSync(outputPath)
resolve(audio)
} catch (err) {
reject(err)
}
})
.save(outputPath)
})
return {
title,
author: details.author?.name || "YouTube",
seconds: lengthSeconds,
buffer
}
}

const readAiState = () => {
try {
if (!fs.existsSync(aiStatePath)) fs.writeFileSync(aiStatePath, JSON.stringify({}, null, 2))
return JSON.parse(fs.readFileSync(aiStatePath, "utf8") || "{}")
} catch {
return {}
}
}

const saveAiState = (data) => {
fs.writeFileSync(aiStatePath, JSON.stringify(data, null, 2))
}

const AI_TEXT_TIMEOUT = 25000
const AI_VOICE_TIMEOUT = 45000

const readSudoUsers = () => {
try {
if (!fs.existsSync(sudoPath)) fs.writeFileSync(sudoPath, JSON.stringify([], null, 2))
const data = JSON.parse(fs.readFileSync(sudoPath, "utf8") || "[]")
return Array.isArray(data) ? data : []
} catch {
return []
}
}

const saveSudoUsers = (data) => {
fs.writeFileSync(sudoPath, JSON.stringify([...new Set(data)].sort(), null, 2))
}

const readOwnerUsers = () => {
try {
if (!fs.existsSync(ownerPath)) fs.writeFileSync(ownerPath, JSON.stringify([], null, 2))
const data = JSON.parse(fs.readFileSync(ownerPath, "utf8") || "[]")
return Array.isArray(data) ? data : []
} catch {
return []
}
}

const saveOwnerUsers = (data) => {
fs.writeFileSync(ownerPath, JSON.stringify([...new Set(data)].sort(), null, 2))
}

const ensureJsonFile = (filePath, fallback) => {
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2))
try {
return JSON.parse(fs.readFileSync(filePath, "utf8") || JSON.stringify(fallback))
} catch {
fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2))
return fallback
}
}

const writeJsonFile = (filePath, data) => {
const dir = path.dirname(filePath)
if (dir && dir !== "." && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
return data
}

const normalizePhoneNumber = (value = "") => String(value || "").replace(/\D/g, "")
const getRentSessionDir = (phone = "") => path.join(rentSessionsRoot, normalizePhoneNumber(phone))

const readPremiumDb = () => {
const data = ensureJsonFile(premiumPath, { premiumUsers: [] })
const users = Array.isArray(data) ? data : Array.isArray(data.premiumUsers) ? data.premiumUsers : []
return { premiumUsers: [...new Set(users.map(normalizePhoneNumber).filter(Boolean))] }
}

const savePremiumDb = (data) => writeJsonFile(premiumPath, {
premiumUsers: [...new Set((data?.premiumUsers || []).map(normalizePhoneNumber).filter(Boolean))]
})

const readRentSessions = () => {
const data = ensureJsonFile(rentSessionsPath, { sessions: [] })
return { sessions: Array.isArray(data.sessions) ? data.sessions : [] }
}

const saveRentSessions = (data) => writeJsonFile(rentSessionsPath, {
sessions: Array.isArray(data?.sessions) ? data.sessions : []
})

const readPrefixSetting = () => {
const prefix = String(global.prefix || ".").trim()
return prefix || "."
}

const savePrefixSetting = (prefix = ".") => {
const safePrefix = String(prefix || ".").trim() || "."
let configText = fs.readFileSync(configPath, "utf8")
if (/^global\.prefix\s*=/m.test(configText)) {
configText = configText.replace(/^global\.prefix\s*=.*$/m, `global.prefix = ${JSON.stringify(safePrefix)}`)
} else {
configText = `global.prefix = ${JSON.stringify(safePrefix)}\n\n${configText}`
}
fs.writeFileSync(configPath, configText)
global.prefix = safePrefix
}

const tttWins = [
[0, 1, 2], [3, 4, 5], [6, 7, 8],
[0, 3, 6], [1, 4, 7], [2, 5, 8],
[0, 4, 8], [2, 4, 6]
]

const renderTicTacToe = (room) => {
const icons = room.board.map((cell, index) => cell === "X" ? "❌" : cell === "O" ? "⭕" : `${index + 1}️⃣`)
return `${icons.slice(0, 3).join("")}
${icons.slice(3, 6).join("")}
${icons.slice(6, 9).join("")}`
}

const getTicTacToeWinner = (board) => {
for (const [a, b, c] of tttWins) {
if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
}
return board.every(Boolean) ? "draw" : null
}

const getActiveTicTacToeRoom = (rooms, jid) => {
return Object.values(rooms).find(room => room.state === "PLAYING" && [room.playerX, room.playerO].includes(jid))
}

const getAiRoom = (chatId) => {
const state = readAiState()
return state[chatId] || { enabled: false, provider: global.aiChat?.defaultProvider || "dynamic" }
}

const setAiRoom = (chatId, data) => {
const state = readAiState()
state[chatId] = { ...getAiRoom(chatId), ...data }
saveAiState(state)
return state[chatId]
}

const getAiMemoryKey = (chatId = "", sender = "") => `${chatId}:${sender}`

const getAiMemory = (chatId = "", sender = "") => {
const state = readAiState()
const memory = state.__memory || {}
const key = getAiMemoryKey(chatId, sender)
return Array.isArray(memory[key]) ? memory[key] : []
}

const appendAiMemory = (chatId = "", sender = "", role = "user", content = "") => {
const clean = String(content || "").replace(/\s+/g, " ").trim()
if (!clean) return
const state = readAiState()
state.__memory = state.__memory || {}
const key = getAiMemoryKey(chatId, sender)
const current = Array.isArray(state.__memory[key]) ? state.__memory[key] : []
state.__memory[key] = [...current, {
role,
content: clean.slice(0, 600),
at: Date.now()
}].slice(-12)
saveAiState(state)
}

const buildAiPromptWithMemory = (message = "", chatId = "", sender = "", name = "", isGroup = false) => {
const memory = getAiMemory(chatId, sender)
.map(item => `${item.role === "assistant" ? "Empress" : name || "User"}: ${item.content}`)
.join("\n")
const context = memory ? `Recent chat memory:\n${memory}\n\n` : ""
const current = isGroup
? `New group message directed to Empress from ${name || "this user"}: ${message}`
: `New message from ${name || "this user"}: ${message}`
return `${context}${current}\n\nReply naturally, stay aware of the recent chat memory, and do not treat casual wording as a bot command unless the user clearly asks you to run one.`
}

const callOpenAi = async (prompt) => {
const config = global.aiChat || {}
const openai = config.openai || {}
if (!openai.apiKey) throw new Error("OpenAI API key is missing. Add OPENAI_API_KEY in the environment or config.js.")
const response = await axios.post("https://api.openai.com/v1/chat/completions", {
model: openai.model || "gpt-4o-mini",
messages: [
{ role: "system", content: config.systemPrompt || "You are Empress, a friendly AI assistant." },
{ role: "user", content: prompt }
],
max_tokens: config.maxTokens || 350,
temperature: config.temperature ?? 0.8
}, {
headers: {
Authorization: `Bearer ${openai.apiKey}`,
"Content-Type": "application/json"
},
timeout: AI_TEXT_TIMEOUT
})
return response.data?.choices?.[0]?.message?.content?.trim()
}

const longCatExtractText = (payload) => {
if (!payload) return ""
if (typeof payload === "string") return payload
return payload?.choices?.[0]?.delta?.content
|| payload?.choices?.[0]?.message?.content
|| payload?.data?.choices?.[0]?.delta?.content
|| payload?.data?.choices?.[0]?.message?.content
|| payload?.data?.message?.content
|| payload?.data?.delta?.content
|| payload?.data?.content
|| payload?.message?.content
|| payload?.delta?.content
|| payload?.content
|| payload?.answer
|| payload?.text
|| ""
}

const longCatReadStream = async (stream) => new Promise((resolve, reject) => {
let raw = ""
stream.on("data", chunk => {
raw += chunk.toString("utf8")
})
stream.on("error", reject)
stream.on("end", () => {
let answer = ""
let finalAnswer = ""
for (const line of raw.split(/\r?\n/)) {
const clean = line.trim()
if (!clean || clean === "data: [DONE]" || clean === "[DONE]") continue
const data = clean.startsWith("data:") ? clean.slice(5).trim() : clean
if (!data || data === "[DONE]") continue
try {
const parsed = JSON.parse(data)
const text = longCatExtractText(parsed)
if (text) answer += text
const full = parsed?.data?.message || parsed?.message || parsed?.data?.answer || parsed?.answer
if (typeof full === "string" && full.length >= finalAnswer.length) finalAnswer = full
} catch {
answer += data
}
}
resolve((finalAnswer || answer).trim())
})
})

const longCatWebHeaders = (longcat) => {
const headers = {
"Content-Type": "application/json",
Accept: "text/event-stream, application/json, text/plain, */*",
Origin: "https://longcat.chat",
Referer: "https://longcat.chat/",
"User-Agent": "Mozilla/5.0"
}
if (longcat.cookie) headers.Cookie = longcat.cookie
if (longcat.apiKey) headers.Authorization = `Bearer ${longcat.apiKey}`
return headers
}

const longCatFindId = (payload) => {
if (!payload || typeof payload !== "object") return ""
for (const key of ["conversationId", "sessionId", "chatId", "id"]) {
if (typeof payload[key] === "string" || typeof payload[key] === "number") return String(payload[key])
}
for (const value of Object.values(payload)) {
const found = longCatFindId(value)
if (found) return found
}
return ""
}

const longCatWebChatUrl = (baseUrl = "") => {
const clean = String(baseUrl || "https://longcat.chat/api/v1/chat-completion-V2").replace(/\/+$/, "")
if (/chat-completion-V2$/i.test(clean)) return clean
if (/\/api\/v1$/i.test(clean)) return `${clean}/chat-completion-V2`
return `${clean}/api/v1/chat-completion-V2`
}

const longCatCreateSession = async (longcat) => {
try {
const response = await axios.post("https://longcat.chat/api/v1/session-create", { agentId: 0 }, {
headers: longCatWebHeaders(longcat),
timeout: AI_TEXT_TIMEOUT
})
const conversationId = longCatFindId(response.data)
if (!conversationId) throw new Error("LongCat session-create did not return a conversationId.")
return conversationId
} catch (err) {
if (err?.response?.status === 401) {
throw new Error("LongCat web endpoint needs browser cookies. Set LONGCAT_COOKIE from a logged-in longcat.chat session, or set LONGCAT_BASE_URL to an OpenAI-compatible LongCat API endpoint.")
}
throw err
}
}

const callLongCatWeb = async (prompt, longcat, config) => {
if (!longcat.cookie) {
throw new Error("LongCat web endpoint needs LONGCAT_COOKIE. Copy your logged-in longcat.chat Cookie header into the environment, or use an OpenAI-compatible LONGCAT_BASE_URL.")
}
const conversationId = await longCatCreateSession(longcat)
const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
const response = await axios.post(longCatWebChatUrl(longcat.baseUrl), {
agentId: 0,
conversationId,
parentMessageId: "0",
messageId: requestId,
requestId,
reasonEnabled: false,
searchEnabled: false,
model: longcat.model || "gpt-5",
content: prompt,
message: prompt,
prompt,
inputContent: prompt,
messages: [
{ role: "system", content: config.systemPrompt || "You are Empress, a friendly AI assistant." },
{ role: "user", content: prompt }
]
}, {
headers: longCatWebHeaders(longcat),
responseType: "stream",
timeout: AI_TEXT_TIMEOUT
})
return longCatReadStream(response.data)
}

const callLongCatOpenAiCompatible = async (prompt, longcat, config) => {
if (!longcat.apiKey) throw new Error("LongCat API key is missing. Add LONGCAT_API_KEY in the environment or config.js.")
const response = await axios.post(longcat.baseUrl || "https://longcat.chat/api/v1/chat-completion-V2", {
model: longcat.model || "gpt-5",
messages: [
{ role: "system", content: config.systemPrompt || "You are Empress, a friendly AI assistant." },
{ role: "user", content: prompt }
],
max_tokens: config.maxTokens || 350,
temperature: config.temperature ?? 0.8
}, {
headers: {
Authorization: `Bearer ${longcat.apiKey}`,
"Content-Type": "application/json"
},
timeout: AI_TEXT_TIMEOUT
})
return response.data?.choices?.[0]?.message?.content?.trim()
|| response.data?.message?.content?.trim()
|| response.data?.data?.choices?.[0]?.message?.content?.trim()
|| response.data?.text?.trim()
}

const callLongCat = async (prompt) => {
const config = global.aiChat || {}
const longcat = config.longcat || {}
const baseUrl = longcat.baseUrl || "https://longcat.chat/api/v1/chat-completion-V2"
if (/longcat\.chat/i.test(baseUrl) || /chat-completion-V2/i.test(baseUrl)) {
return callLongCatWeb(prompt, { ...longcat, baseUrl }, config)
}
return callLongCatOpenAiCompatible(prompt, { ...longcat, baseUrl }, config)
}

const callKimi = async (prompt) => {
const config = global.aiChat || {}
const kimi = config.kimi || {}
if (!kimi.apiKey) throw new Error("Kimi API key is missing. Add KIMI_API_KEY or NVIDIA_API_KEY in the environment or config.js.")
const response = await axios.post(kimi.baseUrl || "https://integrate.api.nvidia.com/v1/chat/completions", {
model: kimi.model || "moonshotai/kimi-k2.6",
messages: [
{ role: "system", content: config.systemPrompt || "You are Empress, a friendly AI assistant." },
{ role: "user", content: prompt }
],
max_tokens: config.maxTokens || 350,
temperature: config.temperature ?? 0.8
}, {
headers: {
Authorization: `Bearer ${kimi.apiKey}`,
"Content-Type": "application/json"
},
timeout: AI_TEXT_TIMEOUT
})
return response.data?.choices?.[0]?.message?.content?.trim()
}

const callOpenRouter = async (prompt) => {
const config = global.aiChat || {}
const openrouter = config.openrouter || {}
if (!openrouter.apiKey) throw new Error("OpenRouter API key is missing. Add OPENROUTER_API_KEY in the environment or config.js.")
const headers = {
Authorization: `Bearer ${openrouter.apiKey}`,
"Content-Type": "application/json"
}
if (openrouter.referer) headers["HTTP-Referer"] = openrouter.referer
if (openrouter.title) headers["X-OpenRouter-Title"] = openrouter.title
const models = [
openrouter.model || "openrouter/free",
...(Array.isArray(openrouter.fallbackModels) ? openrouter.fallbackModels : [])
].filter(Boolean)
let lastError
for (const model of [...new Set(models)]) {
try {
const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
model,
messages: [
{ role: "system", content: config.systemPrompt || "You are Empress, a friendly AI assistant." },
{ role: "user", content: prompt }
],
max_tokens: config.maxTokens || 350,
temperature: config.temperature ?? 0.8
}, { headers, timeout: AI_TEXT_TIMEOUT })
const answer = response.data?.choices?.[0]?.message?.content?.trim()
if (answer) return answer
lastError = new Error(`OpenRouter model ${model} returned an empty response.`)
} catch (err) {
lastError = err
const message = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || ""
const canTryNext = /rate limit|credits|quota|not found|unavailable|no endpoints|model/i.test(message)
if (!canTryNext) throw err
console.error(`OpenRouter model ${model} failed, trying fallback:`, message)
}
}
throw lastError || new Error("OpenRouter did not return a response.")
}

const callGemini = async (prompt) => {
const config = global.aiChat || {}
const gemini = config.gemini || {}
if (!gemini.apiKey) throw new Error("Gemini API key is missing. Add GEMINI_API_KEY in the environment or config.js.")
const models = [
gemini.model || "gemini-3.5-flash",
...(Array.isArray(gemini.fallbackModels) ? gemini.fallbackModels : [])
].filter(Boolean)
let lastError
for (const model of [...new Set(models)]) {
try {
const response = await axios.post(
`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
{
systemInstruction: {
parts: [{ text: config.systemPrompt || "You are Empress, a friendly AI assistant." }]
},
contents: [
{ role: "user", parts: [{ text: prompt }] }
],
generationConfig: {
temperature: config.temperature ?? 0.8,
maxOutputTokens: config.maxTokens || 350
}
},
{ headers: { "Content-Type": "application/json", "x-goog-api-key": gemini.apiKey }, timeout: AI_TEXT_TIMEOUT }
)
const answer = response.data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim()
if (answer) return answer
lastError = new Error(`Gemini model ${model} returned an empty response.`)
} catch (err) {
lastError = err
const message = err?.response?.data?.error?.message || err.message || ""
const canTryNext = /not found|not supported|unsupported|deprecated|shut down/i.test(message)
if (!canTryNext) throw err
console.error(`Gemini model ${model} failed, trying fallback:`, message)
}
}
throw lastError || new Error("Gemini did not return a response.")
}

const pcmToWav = (pcmBuffer, sampleRate = 24000, channels = 1, bitDepth = 16) => {
const byteRate = sampleRate * channels * bitDepth / 8
const blockAlign = channels * bitDepth / 8
const header = Buffer.alloc(44)
header.write("RIFF", 0)
header.writeUInt32LE(36 + pcmBuffer.length, 4)
header.write("WAVE", 8)
header.write("fmt ", 12)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(channels, 22)
header.writeUInt32LE(sampleRate, 24)
header.writeUInt32LE(byteRate, 28)
header.writeUInt16LE(blockAlign, 32)
header.writeUInt16LE(bitDepth, 34)
header.write("data", 36)
header.writeUInt32LE(pcmBuffer.length, 40)
return Buffer.concat([header, pcmBuffer])
}

const normalizeGeminiAudio = (base64Audio = "", mimeType = "") => {
const audioBuffer = Buffer.from(base64Audio, "base64")
if (/mpeg|mp3/i.test(mimeType)) return { buffer: audioBuffer, extension: "mp3", mimetype: "audio/mpeg" }
if (/wav/i.test(mimeType)) return { buffer: audioBuffer, extension: "wav", mimetype: "audio/wav" }
if (/pcm|L16/i.test(mimeType)) {
const sampleRate = Number(String(mimeType).match(/rate=(\d+)/i)?.[1] || 24000)
return { buffer: pcmToWav(audioBuffer, sampleRate), extension: "wav", mimetype: "audio/wav" }
}
return { buffer: audioBuffer, extension: "wav", mimetype: "audio/wav" }
}

const callGeminiVoiceNote = async (prompt) => {
const config = global.aiChat || {}
const gemini = config.gemini || {}
if (!gemini.apiKey) throw new Error("Gemini API key is missing. Add GEMINI_API_KEY in the environment or config.js.")
const models = [
gemini.voiceModel || gemini.model || "gemini-2.5-flash-preview-tts",
...(Array.isArray(gemini.voiceFallbackModels) ? gemini.voiceFallbackModels : [])
].filter(Boolean)
let lastError
for (const model of [...new Set(models)]) {
try {
const response = await axios.post(
`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
{
contents: [
{ role: "user", parts: [{ text: prompt }] }
],
generationConfig: {
responseModalities: ["AUDIO"],
speechConfig: {
voiceConfig: {
prebuiltVoiceConfig: {
voiceName: gemini.voiceName || "Puck"
}
}
}
}
},
{ headers: { "Content-Type": "application/json", "x-goog-api-key": gemini.apiKey }, timeout: AI_VOICE_TIMEOUT }
)
const parts = response.data?.candidates?.[0]?.content?.parts || []
const audioPart = parts.find(part => part?.inlineData?.data)
const base64Audio = audioPart?.inlineData?.data
if (!base64Audio) {
lastError = new Error(`Gemini model ${model} returned no audio data.`)
continue
}
const audio = normalizeGeminiAudio(base64Audio, audioPart?.inlineData?.mimeType || "")
const extension = audio.extension
const outputPath = path.join(os.tmpdir(), `empress-vn-${Date.now()}-${randomInt(1000, 9999)}.${extension}`)
fs.writeFileSync(outputPath, audio.buffer)
return {
path: outputPath,
mimetype: audio.mimetype
}
} catch (err) {
lastError = err
const message = err?.response?.data?.error?.message || err.message || ""
const canTryNext = /not found|not supported|unsupported|deprecated|shut down|audio|modality|voice|model/i.test(message)
if (!canTryNext) throw err
console.error(`Gemini voice model ${model} failed, trying fallback:`, message)
}
}
throw lastError || new Error("Gemini did not return voice-note audio.")
}

const callEdgeTtsVoiceNote = async (text = "") => {
const edge = global.aiChat?.edgeTts || {}
if (edge.enabled === false) throw new Error("Edge TTS is disabled.")
const voice = String(edge.voice || "en-US-AvaNeural").trim() || "en-US-AvaNeural"
const configuredPython = String(process.env.EDGE_TTS_PYTHON || edge.python || "").trim()
const pythonCandidates = [...new Set([
configuredPython,
path.join(__dirname, ".venv", "bin", "python"),
"python3",
"python"
].filter(Boolean))]
const safeText = String(text || "").replace(/\s+/g, " ").trim().slice(0, Number(edge.maxChars || 1400))
if (!safeText) throw new Error("Edge TTS needs text to speak.")
let lastError
for (const python of pythonCandidates) {
const outputPath = path.join(os.tmpdir(), `empress-edge-vn-${Date.now()}-${randomInt(1000, 9999)}.mp3`)
try {
await execFileAsync(python, [
"-m",
"edge_tts",
"--voice",
voice,
"--text",
safeText,
"--write-media",
outputPath
], {
timeout: Number(edge.timeout || AI_VOICE_TIMEOUT),
maxBuffer: 1024 * 1024
})
if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 256) {
throw new Error("Edge TTS did not create a usable audio file.")
}
return {
path: outputPath,
mimetype: "audio/mpeg"
}
} catch (err) {
lastError = err
if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
const message = String(err?.stderr || err?.message || "")
const canTryNext = /not found|No module named edge_tts|python.*not found|ENOENT|bad interpreter|can't open file/i.test(message)
if (!canTryNext) throw err
console.error(`Edge TTS python candidate failed (${python}):`, message.split("\n").slice(-2).join(" ").trim() || err.message)
}
}
throw lastError || new Error("Edge TTS could not find a working Python with edge-tts installed. Run: python3 -m pip install -r requirements.txt")
}

const callVoiceNoteBackend = async (text = "") => {
const backends = Array.isArray(global.aiChat?.voiceBackends) && global.aiChat.voiceBackends.length
? global.aiChat.voiceBackends
: ["edge", "gemini"]
let lastError
for (const backend of backends.map(item => String(item).toLowerCase())) {
try {
if (backend === "edge" || backend === "edgetts" || backend === "edge-tts") return await callEdgeTtsVoiceNote(text)
if (backend === "gemini") return await callGeminiVoiceNote(text)
} catch (err) {
lastError = err
console.error(`Empress voice backend ${backend} failed, trying next backend:`, err.message)
}
}
throw lastError || new Error("No voice-note backend returned audio.")
}

const getSimpleAiReply = (message = "") => {
const input = String(message || "").trim().toLowerCase()
if (/^(hi|hey|hello|yo|sup|good morning|good afternoon|good evening|good night)[!. ]*$/.test(input)) {
return pickRandom([
"Heyy, I'm here.",
"Hello. What's up?",
"Hey, love. How can I help?",
"Hi hi. I'm listening."
])
}
if (/\b(compliment|praised you|said something nice|called you cute|called you smart)\b/.test(input)) {
return pickRandom([
"Aww, thank you. I’ll take that warmly.",
"That’s sweet of you. Thank you.",
"Haha, I appreciate that.",
"Thank you. You just made Empress smile a little."
])
}
if (/^(thanks|thank you|ty|appreciate it|nice|good job|well done|you did well)[!. ]*$/i.test(input)) {
return pickRandom([
"You’re welcome.",
"Anytime.",
"Glad I could help.",
"Aww, thank you."
])
}
if (/^(how are you|how far|what'?s up|wyd|are you there)[?.! ]*$/i.test(input)) {
return pickRandom([
"I’m here and doing fine. What’s up?",
"I’m good, thank you. What do you need?",
"Still here with you.",
"I’m awake and listening."
])
}
return ""
}

const sanitizeAiAnswer = (answer = "", prompt = "") => {
let clean = String(answer || "").trim()
if (!clean) return ""
clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
clean = clean.replace(/^```(?:json|text|markdown)?\s*/i, "").replace(/```$/i, "").trim()
const answerMatch = clean.match(/\*\*Answer:\s*([\s\S]*)$/i) || clean.match(/\bAnswer:\s*([\s\S]*)$/i)
if (answerMatch?.[1]) clean = answerMatch[1].trim()
clean = clean
.replace(/\*\*/g, "")
.replace(/^\s*(used in this study|clarifying question|key points)\b[\s\S]*?(?=\bAnswer:|$)/i, "")
.trim()
const leakedReasoning = /\b(used in this study|clarifying question|key points|most appropriate action|avoid guessing or hallucinating|the user's request is extremely brief)\b/i.test(clean)
if (leakedReasoning) return ""
const promptText = String(prompt || "").trim()
const shortCasualPrompt = promptText.length <= 120 && !/[?]|https?:\/\//i.test(promptText)
const randomArticle = /\b(unveiled in september|sp1could|neural machine translation|emerging technologies|cross-cultural understanding|sustainable,equitable|responsible development)\b/i.test(clean)
if (randomArticle) return ""
if (shortCasualPrompt && clean.length > 450) return ""
if (/\b(compliment|praised you|said something nice)\b/i.test(promptText) && !/\b(thank|appreciate|sweet|kind|aww|glad)\b/i.test(clean)) return ""
if (clean.length > 900) clean = `${clean.slice(0, 900).trim()}...`
return clean
}

const aiProviderCallers = {
openai: callOpenAi,
chatgpt: callOpenAi,
longcat: callLongCat,
kimi: callKimi,
moonshot: callKimi,
nvidia: callKimi,
openrouter: callOpenRouter,
gemini: callGemini
}

const providerHasKey = (provider) => {
const config = global.aiChat || {}
if (provider === "openai" || provider === "chatgpt") return Boolean(config.openai?.apiKey)
if (provider === "longcat") return Boolean(config.longcat?.apiKey)
if (provider === "kimi" || provider === "moonshot" || provider === "nvidia") return Boolean(config.kimi?.apiKey)
if (provider === "openrouter") return Boolean(config.openrouter?.apiKey)
if (provider === "gemini") return Boolean(config.gemini?.apiKey)
return false
}

const getDynamicAiProviders = (preferredProvider = "") => {
const normalized = String(preferredProvider || global.aiChat?.defaultProvider || "dynamic").toLowerCase()
const available = ["longcat", "kimi", "gemini", "openrouter", "openai"].filter(providerHasKey)
if (!available.length) return [normalized]
if (["dynamic", "random", "auto", "all"].includes(normalized)) return shuffleItems(available)
const canonical = normalized === "chatgpt" ? "openai" : ["moonshot", "nvidia"].includes(normalized) ? "kimi" : normalized
return [canonical, ...shuffleItems(available.filter(provider => provider !== canonical))]
}

const askEmpressAi = async (prompt, provider) => {
const providers = getDynamicAiProviders(provider)
let lastError
for (const chosenProvider of providers) {
const caller = aiProviderCallers[chosenProvider]
if (!caller) {
lastError = new Error(`Unsupported AI provider "${chosenProvider}". Use dynamic, kimi, openrouter, openai, or gemini.`)
continue
}
try {
const answer = sanitizeAiAnswer(await caller(prompt), prompt)
if (answer) return answer
lastError = new Error(`${chosenProvider} returned an empty or unsafe response.`)
} catch (err) {
lastError = err
const message = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || ""
console.error(`Empress AI provider ${chosenProvider} failed, trying next provider:`, message)
}
}
throw lastError || new Error("Empress AI did not return a response.")
}

const isAiImageRequest = (text = "") => {
const input = String(text || "").toLowerCase()
return /\b(send|show|find|get|search|generate|give)\b.*\b(image|picture|photo|pic|wallpaper)\b/.test(input)
|| /\b(image|picture|photo|pic|wallpaper)\b.*\b(of|for|about)\b/.test(input)
}

const isAiVisionRequest = (text = "", mimeType = "") => {
const input = String(text || "").toLowerCase()
return /image/.test(mimeType || "") && /\b(see|look|view|read|describe|analy[sz]e|what is|what's|caption|explain)\b/.test(input)
}

const isAiVoiceRequest = (text = "") => {
const input = String(text || "").toLowerCase()
return /\b(vn|voice note|voice-note|voice message|speak|talk|say this|say it|say)\b/.test(input)
}

const getAiVoicePrompt = (text = "") => {
const cleaned = String(text || "")
.replace(/\b(send|make|record|reply|respond|answer|with|in|as|a|an|the|me|please)\b/gi, " ")
.replace(/\b(vn|voice note|voice-note|voice message|speak|talk|say this|say it|say)\b/gi, " ")
.replace(/\s+/g, " ")
.trim()
return cleaned || "Hello, I am Empress. How can I help you today?"
}

const getAiImageQuery = (text = "") => {
const cleaned = String(text || "")
.replace(new RegExp(`\\b(${[
"send", "show", "find", "get", "search", "generate", "give", "me", "an", "a", "the",
"image", "picture", "photo", "pic", "wallpaper", "of", "for", "about", "please"
].join("|")})\\b`, "gi"), " ")
.replace(/\s+/g, " ")
.trim()
return cleaned || "beautiful scenery"
}

module.exports = async (sock, m, store) => {
loadDataBase(sock, m);
try {
const rawBody = (m?.body || "").trim()
const isPrefixCmd = rawBody.startsWith(m.prefix)
const isCmd = isPrefixCmd
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = isCmd ? rawBody.split(/ +/).slice(1) : []
const qmsg = (m.quoted || m)
const text = q = args.join(" ")

const command = isPrefixCmd ? rawBody.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const pushname = m.pushName || `${m.sender.split("@")[0]}`
const botNumber = await sock.decodeJid(sock.user.id)
m.fromMe = m.key.fromMe || m.sender === botNumber;
const configuredOwnerJids = getConfiguredOwnerJids()
const ownerCompareJids = [botNumber, ...configuredOwnerJids].map(jid => normalizeJidForCompare(sock, jid))
const senderCompareJids = getSenderCompareJids(sock, m)
const isOwner = senderCompareJids.some(jid => ownerCompareJids.includes(jid)) || m.isDeveloper
const sudoUsers = readSudoUsers()
const isSudo = senderCompareJids.some(jid => sudoUsers.map(user => normalizeJidForCompare(sock, user)).includes(jid))
const premiumDb = readPremiumDb()
const senderPhone = jidUser(m.sender)
const isPremium = premiumDb.premiumUsers.includes(senderPhone)

const botJids = [
botNumber,
sock.user?.id,
sock.user?.jid,
sock.user?.lid,
sock.authState?.creds?.me?.id,
sock.authState?.creds?.me?.jid,
sock.authState?.creds?.me?.lid
].filter(Boolean)

const isBotJid = (jid) => {
const normalized = normalizeJidForCompare(sock, jid)
const normalizedUser = jidUser(normalized)
return botJids.some(candidate => {
const normalizedCandidate = normalizeJidForCompare(sock, candidate)
return normalizedCandidate === normalized || jidUser(normalizedCandidate) === normalizedUser
})
}

const quotedSenderCandidates = [
m.quoted?.sender,
m.quoted?.participant,
m.quoted?.key?.participant,
m.msg?.contextInfo?.participant
].filter(Boolean)

const mentionedBot = (m.mentionedJid || []).some(isBotJid)
const repliedToBot = Boolean(m.quoted && (m.quoted.fromMe || m.quoted.key?.fromMe || quotedSenderCandidates.some(isBotJid)))
const addressedByName = /\b(empress|empire)\b/i.test(rawBody)
const aiShouldReply = !m.isGroup || mentionedBot || repliedToBot || addressedByName
global.public = false // default

if (isPrefixCmd && !botCommands.has(command)) return
if (isCmd && !sock.public && !isOwner && !isSudo && !isPremium) {
console.log(`[SYSTEM] Ignored command in private mode from ${m.sender}: ${m.body}`)
return m.reply("Empress is in private mode. Only the owner, sudo, and premium users can use commands right now.")
}

const participantJid = (participant = {}) => participant.jid || participant.id || participant.lid || participant.participant || ""
const participantPhoneJid = (participant = {}) => participant.jid || participant.phoneNumber || participant.pn || participant.id || participant.participant || participant.lid || ""
const isParticipantAdmin = (participant = {}) => Boolean(participant.admin)

const resolveGroupMemberJid = (target = "") => {
const raw = normalizeJidForCompare(sock, target)
if (!raw || !m.isGroup) return raw
const rawUser = jidUser(raw)
const participants = m.metadata?.participants || []
const found = participants.find(member => {
const candidates = [
member.jid,
member.id,
member.lid,
member.participant,
member.phoneNumber,
member.pn
].filter(Boolean).map(jid => normalizeJidForCompare(sock, jid))
return candidates.some(jid => jid === raw || jidUser(jid) === rawUser)
})
return found ? normalizeJidForCompare(sock, participantPhoneJid(found)) : raw
}

const sendWarmSticker = async (jid = m.chat, quotedMessage = m) => {
if (global.warmStickers?.enabled !== true || typeof sock.sendImageAsSticker !== "function") return
const stickerImage = getRandomStickerImage()
if (!stickerImage) return
try {
await sock.sendImageAsSticker(jid, stickerImage, quotedMessage, {
packname: namabot,
author: "Empress"
})
} catch (err) {
console.error("Empress sticker failed:", err.message)
}
}

const dialogueMoods = ["✨", "💗", "🌸", "⚡", "👑"]
const formatDialogue = (teks = "") => {
const cleanText = String(teks || "").trim()
if (!cleanText) return ""
return cleanText
}

const safeSendMessage = async (jid, content, options = {}) => {
try {
return await sock.sendMessage(jid, content, options)
} catch (err) {
if (options?.quoted) {
console.error("Quoted send failed, retrying without quoted:", err.message)
return sock.sendMessage(jid, content)
}
throw err
}
}

const sendImageCaption = async (caption, type = "game", query = "", extraContent = {}) => {
const image = await getDynamicImage(type, query)
if (!image) return sock.sendMessage(m.chat, { text: caption, ...extraContent }, { quoted: m })
const sendTextFallback = () => sock.sendMessage(m.chat, { text: caption, ...extraContent }, { quoted: m })
try {
return await sock.sendMessage(m.chat, { image: { url: image }, caption, ...extraContent }, { quoted: m })
} catch (err) {
console.error(`Image caption URL failed for ${type}, retrying as buffer:`, err.message)
try {
const buffer = await fetchImageBuffer(image)
return await sock.sendMessage(m.chat, { image: buffer, caption, ...extraContent }, { quoted: m })
} catch (bufferErr) {
console.error(`Image caption buffer failed for ${type}:`, bufferErr.message)
return sendTextFallback()
}
}
}

const sendTextWithSticker = async (jid, teks, options = {}, quotedMessage = m) => {
const sent = await safeSendMessage(jid, { text: formatDialogue(teks), ...options }, { quoted: quotedMessage })
await sendWarmSticker(jid, quotedMessage)
return sent
}

const downloadSelectedMedia = async () => {
const selected = m.quoted ? m.quoted : m
if (typeof selected.download === "function") return selected.download()
const savedPath = await sock.downloadAndSaveMediaMessage(selected)
const buffer = fs.readFileSync(savedPath)
fs.unlinkSync(savedPath)
return buffer
}

const getTargetJid = (fallback = m.sender) => {
const input = m.mentionedJid?.[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "")
if (!input) return fallback
const target = String(input).includes("@") ? normalizeJidForCompare(sock, input) : `${input}@s.whatsapp.net`
return resolveGroupMemberJid(target)
}

const requireGroupAdmin = () => {
if (!m.isGroup) return mess.group
if (!m.isAdmin && !isOwner) return mess.admin
if (!m.isBotAdmin) return mess.botadmin
return null
}

//==========[ Metadata Groups ]==========//
try {
m.isGroup = m.chat.endsWith("g.us");
m.metadata = m.isGroup ? await sock.groupMetadata(m.chat).catch(_ => {}) : {};
const participants = m.metadata?.participants || [];

m.isAdmin = Boolean(participants.find(p => isParticipantAdmin(p) && normalizeJidForCompare(sock, participantJid(p)) === normalizeJidForCompare(sock, m.sender)));
m.isBotAdmin = Boolean(participants.find(p => isParticipantAdmin(p) && isBotJid(participantJid(p))));
} catch (error) {
console.error("Error metadata:", error);
m.metadata = {};
m.isAdmin = false;
m.isBotAdmin = false;
}


//==========[ Database Group ]==========//
if (m.isGroup && antilink.some(i => i.id === m.chat)) {
    const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com)\/[0-9A-Za-z]{20,}/gi;

    if (linkRegex.test(m.text || "") && !isOwner && !m.isAdmin && !m.fromMe) {
        console.log(`${chalk.red.bold("[ ALERT ] Group link detected")} :  ${chalk.white.bold(m.text)}`);

        try {
            const gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`;
            const isLinkThisGc = new RegExp(gclink, "i");

            if (isLinkThisGc.test(m.text)) return;

            const room = antilink.find(i => i.id === m.chat);
            const { participant, id } = m.key;

            console.log("Mode :", room.kick ? "kick" : "delete message");

            await sendTextWithSticker(m.chat, `\n*Group Link Detected*\n\nEmpress caught a group invite link. ${room.kick ? "I will remove you from the group" : "I will remove the message"} because an admin or owner enabled *Group Antilink*.\n`, {
                mentions: [m.sender]
            }, m);

            // delete link
            try {
                await sock.sendMessage(m.chat, {
                    delete: { remoteJid: m.chat, fromMe: false, id, participant }
                });
                console.log("Link message deleted successfully");
            } catch (err) {
                console.log("Failed to delete message:", err.message);
            }

            // Kick when kick mode is enabled.
            if (room.kick) {
                try {
                    await sleep(1000);
                    await sock.groupParticipantsUpdate(m.chat, [m.sender], "remove");
                    console.log("User kicked successfully:", m.sender);
                } catch (err) {
                    console.log("Failed to kick user:", err.message);
                }
            }
        } catch (error) {
            console.error("Error while processing antilink:", error);
        }
    }
}

let gconly = false
try {
    gconly = JSON.parse(fs.readFileSync("./lib/database/gconly.json"))
} catch (e) {
    gconly = false
    fs.writeFileSync("./lib/database/gconly.json", JSON.stringify(false, null, 2))
}

//==========[ Fake Quoted ]==========//
const qtext = {
key: {
remoteJid: 'status@broadcast',
fromMe: false,
participant: '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: '123@newsletter',
caption: `# ${namaowner}.`,
inviteExpiration: 0
}
}
}

const qlock = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
locationMessage: {
name: `# ${namaowner}.`,
jpegThumbnail: ''
}
}
}

//==========[ Function Bug ]==========//



//==========[ Reply Message ]==========//
const reply = m.reply = async (teks) => {
return sendTextWithSticker(m.chat, teks, {}, m)
}

const example = async (teks) => {
const commander = `Aww, tiny command wobble spotted 💗

Try it like this:
*${cmd}* ${teks}

Empress has you, love.`
return sendTextWithSticker(m.chat, commander, { contextInfo: {} }, m)
}

const sendBotTtsVoiceNote = async (speechText = "") => {
const clean = String(speechText || "").replace(/\s+/g, " ").trim()
if (!clean) throw new Error("TTS needs text to speak.")
const spoken = clean.slice(0, 200)
const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(spoken)}`
return sock.sendMessage(m.chat, { audio: { url }, mimetype: "audio/mpeg", ptt: true }, { quoted: m })
}

const sendAiVoiceNote = async (voiceText = rawBody) => {
await sock.sendPresenceUpdate("composing", m.chat)
const userPrompt = getAiVoicePrompt(voiceText)
const prompt = `${buildAiPromptWithMemory(userPrompt, m.chat, m.sender, pushname, m.isGroup)}

The user asked for the reply as a voice note. Give one natural spoken answer under 180 characters.`
const aiAnswer = await askEmpressAi(prompt, getAiRoom(m.chat).provider)
if (!aiAnswer) throw new Error("The AI provider returned an empty voice reply.")
appendAiMemory(m.chat, m.sender, "user", voiceText)
appendAiMemory(m.chat, m.sender, "assistant", aiAnswer)
await sock.sendPresenceUpdate("recording", m.chat)
await sendBotTtsVoiceNote(aiAnswer)
await sock.sendPresenceUpdate("paused", m.chat)
}

sock.tictactoe = sock.tictactoe || {}
sock.menfess = sock.menfess || {}
const activeMenfess = Object.values(sock.menfess).find(room => room.state === "CHATTING" && [room.from, room.to].includes(m.sender))
if (!isCmd && activeMenfess && rawBody) {
const target = activeMenfess.from === m.sender ? activeMenfess.to : activeMenfess.from
await sock.sendMessage(target, {
text: `Confess relay from @${jidUser(m.sender)}:\n\n${rawBody}`,
mentions: [m.sender]
})
return m.reply("Message relayed. Send .stopmenfess when you want to end the session.")
}

const activeTttRoom = getActiveTicTacToeRoom(sock.tictactoe, m.sender)
if (!isCmd && activeTttRoom && rawBody) {
const answer = rawBody.toLowerCase().trim()
if (/^(surrender|nyerah|quit|leave)$/i.test(answer)) {
const winner = activeTttRoom.playerX === m.sender ? activeTttRoom.playerO : activeTttRoom.playerX
clearTimeout(activeTttRoom.timer)
delete sock.tictactoe[activeTttRoom.id]
return sock.sendMessage(m.chat, {
text: `TicTacToe ended.\n@${jidUser(m.sender)} surrendered, so @${jidUser(winner)} wins.`,
mentions: [m.sender, winner]
}, { quoted: m })
}

if (/^[1-9]$/.test(answer)) {
if (activeTttRoom.turn !== m.sender) return m.reply("It is not your turn yet.")
const position = Number(answer) - 1
if (activeTttRoom.board[position]) return m.reply("That square is already taken.")
activeTttRoom.board[position] = activeTttRoom.playerX === m.sender ? "X" : "O"
const result = getTicTacToeWinner(activeTttRoom.board)
if (result) {
clearTimeout(activeTttRoom.timer)
delete sock.tictactoe[activeTttRoom.id]
const caption = result === "draw"
? `TicTacToe ended in a draw.\n\n${renderTicTacToe(activeTttRoom)}`
: `TicTacToe winner: @${jidUser(m.sender)}\n\n${renderTicTacToe(activeTttRoom)}`
return sock.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })
}
activeTttRoom.turn = activeTttRoom.playerX === m.sender ? activeTttRoom.playerO : activeTttRoom.playerX
return sock.sendMessage(m.chat, {
text: `TicTacToe\n\n${renderTicTacToe(activeTttRoom)}\n\nTurn: @${jidUser(activeTttRoom.turn)}\nSend a number from 1-9, or type surrender.`,
mentions: [activeTttRoom.turn]
}, { quoted: m })
}
}

if (isCmd && !isOwner && !isSudo && gconly && !m.isGroup) {
return m.reply(`\n*Group Only Mode*\nEmpress can only respond in groups right now because the owner enabled *gconly*.`)
}

const menuQuoted = m
const menuCommands = new Set(["menu", "menj", "allmenu", "index", "downloadmenu", "groupmenu", "gamemenu", "ownermenu"])

const sendMenuAudio = async (menuName = command) => {
const config = global.menuAudio || {}
if (!config.enabled || !menuCommands.has(menuName)) return
const audioUrl = getRandomMenuAudio()
if (!audioUrl) return
try {
await sock.sendMessage(m.chat, {
audio: { url: audioUrl },
mimetype: config.mimetype || "audio/ogg; codecs=opus",
ptt: config.ptt !== false
}, { quoted: m })
} catch (err) {
console.error("Menu audio failed:", err.message)
}
}

const sendPlainMenu = async (caption, menuName = command) => {
try {
const sent = await sock.sendMessage(m.chat, { text: caption })
await sendMenuAudio(menuName)
return sent
} catch (err) {
console.error("Plain menu failed:", err.message)
const sent = await sock.sendMessage(m.chat, { text: caption })
await sendMenuAudio(menuName)
return sent
}
}

const sendMenuImage = async (caption, buttons = [], menuName = command) => {
const controls = buttons.length
? `\n\n╭──〔 QUICK PICKS 〕──╮\n${buttons.map((button) => `│ ${button.displayText}: ${button.id}`).join("\n")}\n╰────────────────╯`
: ""
const menuImage = await getDynamicImage("menu")
if (!menuImage) return sendPlainMenu(`${caption}${controls}`, menuName)
try {
const sent = await sock.sendMessage(m.chat, {
image: { url: menuImage },
caption: `${caption}${controls}`
})
await sendMenuAudio(menuName)
return sent
} catch (err) {
console.error("Menu image send failed, sending text fallback:", err.message)
return sendPlainMenu(`${caption}${controls}`, menuName)
}
}

const menuButton = (id, displayText) => ({
id,
displayText
})

const animeMenuSection = (title, items = []) => {
const rows = items.map(item => `▢ ${item}`).join("\n")
return `┏ ⌜ ${title} ⌟\n${rows}\n┗`
}

const animeMenuFrame = (title, sections = []) => {
const now = new Date()
const menuDate = now.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })
const menuTime = now.toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })
return `┏ ⌜ ${title} ⌟
┃ ▱ owner : ${jidUser(configuredOwnerJids[0] || global.owner)}
┃ ▱ user : ${pushname}
┃ ▱ prefix : ${m.prefix}
┃ ▱ mode : ${sock.public ? "public" : "self"}
┃ ▱ host : ${jidUser(botNumber)}
┃ ▱ uptime : ${runtime(process.uptime()) || "0s"}
┃ ▱ speed : fast
┃ ▱ date : ${menuDate}
┃ ▱ time : ${menuTime}
┃ ▱ library :
┃   @whiskeysockets/baileys
┃ ▱ total cmds : ${botCommands.size}
┃ ▱ type : case
┗

${sections.join("\n\n")}`
}

const buildNaturalMenuCaption = () => animeMenuFrame(namabot.toUpperCase(), [
animeMenuSection("Commands", [
`${m.prefix}menu / ${m.prefix}help`,
`${m.prefix}allmenu`,
`${m.prefix}index`,
`${m.prefix}downloadmenu`,
`${m.prefix}groupmenu`,
`${m.prefix}gamemenu`,
`${m.prefix}ownermenu`,
`${m.prefix}status`,
`${m.prefix}infobot`,
`${m.prefix}tools`
])
])

const getNaturalCommandIntent = (message = "") => {
const input = String(message || "").toLowerCase()
if (/\b(promote|make admin|give admin|upgrade)\b/.test(input)) {
return {
speak: "On it. I'll promote them now.",
command: { action: "promote", target: null }
}
}
if (/\b(menu|commands?|command list|all commands|show commands)\b/.test(input) || /^\s*help\s*$/i.test(message)) {
return {
speak: "Coming right up. Here's the menu list.",
command: { action: "menu", target: null }
}
}
return null
}

const getNaturalTargetJid = () => {
const mentioned = m.mentionedJid?.[0]
if (mentioned) return resolveGroupMemberJid(mentioned)
const quotedTarget = m.quoted && !repliedToBot ? (m.quoted.sender || m.quoted.participant || m.quoted.key?.participant) : ""
if (quotedTarget) return resolveGroupMemberJid(quotedTarget)
const number = rawBody.replace(/[^0-9]/g, "")
return number ? `${number}@s.whatsapp.net` : ""
}

const executeNaturalCommandIntent = async (intent) => {
const action = intent?.command?.action
if (!action) return false
if (intent.speak) await m.reply(intent.speak)
if (action === "menu") {
await sendMenuImage(buildNaturalMenuCaption(), [], "menu")
return true
}
if (action === "promote") {
const blocked = requireGroupAdmin()
if (blocked) {
await m.reply(blocked)
return true
}
const target = getNaturalTargetJid()
if (!target) {
await m.reply(`Mention or reply to the person you want promoted.\nExample: ${m.prefix}promote @user`)
return true
}
try {
await sock.groupParticipantsUpdate(m.chat, [target], "promote")
await sock.sendMessage(m.chat, {
text: `Done. @${jidUser(target)} has been promoted.`,
mentions: [target]
}, { quoted: m })
} catch (err) {
await m.reply(`Empress could not promote that user: ${err.message}`)
}
return true
}
return false
}

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const extractFirstUrl = (message = "") => String(message || "").match(/https?:\/\/\S+/i)?.[0] || ""

const stripNaturalCommandArgs = (message = "", commandName = "") => {
let value = String(message || "")
const url = extractFirstUrl(value)
if (url) return url
value = value
.replace(/\b(empress|empire)\b/gi, " ")
.replace(/\b(please|pls|kindly|help me|can you|could you|would you|for me|this|that|the|a|an|my|me|to|with|through)\b/gi, " ")
.replace(new RegExp(`\\b${escapeRegex(commandName)}\\b`, "gi"), " ")
.replace(/\b(download|fetch|save|get|send|show|make|create|turn|convert|search|find|check|tell|give|run|do|use|say)\b/gi, " ")
.replace(/\s+/g, " ")
.trim()
return value
}

const getNaturalDownloadCommand = (message = "") => {
const input = String(message || "").toLowerCase()
const url = extractFirstUrl(message)
if (!url && !/\b(download|fetch|save|get)\b/.test(input)) return null
if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com|\btiktok\b/.test(input)) return "tiktok"
if (/instagram\.com|\b(instagram|ig)\b/.test(input)) return "instagram"
if (/facebook\.com|fb\.watch|fb\.com|\b(facebook|fb)\b/.test(input)) return "facebook"
if (/(^|\/\/)(x\.com|twitter\.com)|\b(twitter|tweet)\b/.test(input)) return "twitter"
if (/pinterest\.com|pin\.it|\bpinterest\b/.test(input)) return "pinterest"
if (/reddit\.com|redd\.it|\breddit\b/.test(input)) return "reddit"
if (/capcut\.com|\bcapcut\b/.test(input)) return "capcut"
if (/snapchat\.com|\bsnapchat\b/.test(input)) return "snapchat"
if (/soundcloud\.com|\bsoundcloud\b/.test(input)) return "soundcloud"
if (/snackvideo\.com|\bsnackvideo\b/.test(input)) return "snackvideo"
if (/douyin\.com|\bdouyin\b/.test(input)) return "douyin"
if (/youtu\.be|youtube\.com|\byoutube\b/.test(input)) return /\b(audio|song|music|mp3)\b/.test(input) ? "ytmp3" : "ytmp4"
if (url) return "alldl"
return null
}

const resolveNaturalCommand = (message = "") => {
const input = String(message || "").toLowerCase()
const downloadCommand = getNaturalDownloadCommand(message)
if (downloadCommand) {
return {
command: downloadCommand,
args: extractFirstUrl(message) || stripNaturalCommandArgs(message, downloadCommand)
}
}
if (/\b(all menu|full menu|all commands?|all cmds?)\b/.test(input)) return { command: "allmenu", args: "" }
if (/\b(download menu|download commands?|download cmds?)\b/.test(input)) return { command: "downloadmenu", args: "" }
if (/\b(group menu|group commands?|group cmds?)\b/.test(input)) return { command: "groupmenu", args: "" }
if (/\b(game menu|game commands?|game cmds?)\b/.test(input)) return { command: "gamemenu", args: "" }
if (/\b(owner menu|owner commands?|owner cmds?)\b/.test(input)) return { command: "ownermenu", args: "" }
if (/\b(menu|commands?|cmds?|command list|show commands?|show cmds?)\b/.test(input) || /^\s*help\s*$/i.test(message)) return { command: "menu", args: "" }

const explicitToolRequest = /^(weather|tts|translate|tr|wiki|qr|calc|calculate)\b/i.test(message)
|| /\b(use|run|do|please|pls|kindly|help me|can you|could you|would you|make|create|turn|convert|download|fetch|save|get|send|show|find|search|check|tell|give|open|close|mute|unmute|lock|unlock|promote|demote|kick|remove|add|play)\b/i.test(message)
if (!explicitToolRequest) return null

const aliasRules = [
{ test: /\b(make|create|turn).*\bsticker\b|\bsticker\b/i, command: "sticker" },
{ test: /\b(promote|make admin|give admin|upgrade)\b/i, command: "promote" },
{ test: /\b(demote|remove admin)\b/i, command: "demote" },
{ test: /\b(kick|remove).*\b(user|member|person|him|her|them)?\b/i, command: "kick" },
{ test: /\b(open|unmute).*\bgroup\b|\bunmute\b/i, command: "unmute" },
{ test: /\b(close|mute).*\bgroup\b|\bmute\b/i, command: "mute" },
{ test: /\b(lock).*\bgroup\b|\blockgc\b/i, command: "lockgc" },
{ test: /\b(unlock).*\bgroup\b|\bunlockgc\b/i, command: "unlockgc" },
{ test: /\b(group link|invite link)\b/i, command: "link" },
{ test: /\b(reset|revoke).*\b(link|invite)\b/i, command: "revoke" },
{ test: /\b(weather|temperature)\b/i, command: "weather" },
{ test: /\b(calculate|calculator|solve|math)\b/i, command: "calc" },
{ test: /\b(translate|translation)\b/i, command: "translate" },
{ test: /\b(wikipedia|wiki)\b/i, command: "wiki" },
{ test: /\b(qr|qr code)\b/i, command: "qr" },
{ test: /\b(voice note|voice message|audio|vn|speak|say this|say it)\b/i, command: "vn" },
{ test: /\b(text to speech|tts)\b/i, command: "tts" },
{ test: /\b(balance|wallet|money)\b/i, command: "balance" },
{ test: /\b(leaderboard|top users|ranking)\b/i, command: "leaderboard" },
{ test: /\b(play|song|music)\b/i, command: "play" }
]
for (const rule of aliasRules) {
if (rule.test.test(message) && botCommands.has(rule.command)) {
return { command: rule.command, args: stripNaturalCommandArgs(message, rule.command) }
}
}
return null
}

const runNaturalCommand = async (message = "") => {
const resolved = resolveNaturalCommand(message)
if (!resolved?.command || !botCommands.has(resolved.command)) return false
if (["tts"].includes(resolved.command)) return executeNaturalCommand(resolved)
const pendingKey = `${m.chat}:${m.sender}`
sock.naturalCommands = sock.naturalCommands || {}
sock.naturalCommands[pendingKey] = {
...resolved,
createdAt: Date.now()
}
await m.reply(getNaturalCommandConfirmationText(resolved))
return true
}

const getNaturalCommandConfirmationText = (resolved = {}) => {
const commandName = resolved.command || ""
const argsText = resolved.args ? ` ${resolved.args}` : ""
const fullCommand = `${m.prefix}${commandName}${argsText}`.trim()
const platformNames = {
tiktok: "TikTok",
tt: "TikTok",
instagram: "Instagram",
ig: "Instagram",
facebook: "Facebook",
twitter: "Twitter/X",
x: "Twitter/X",
pinterest: "Pinterest",
reddit: "Reddit",
capcut: "CapCut",
soundcloud: "SoundCloud",
ytmp4: "YouTube video",
ytmp3: "YouTube audio",
alldl: "media"
}
if (["kick", "promote", "demote", "add"].includes(commandName)) {
return `I think you want me to run ${fullCommand}.\nConfirm this group action by saying: yh yh\nSay no to cancel.`
}
if (["vn", "voice", "voicenote", "speak", "say", "tts"].includes(commandName)) {
return `Should I send this as a voice note?\n${fullCommand}\nReply yh yh to confirm, or no to cancel.`
}
if (["wiki", "kaorinews", "animenews", "footballnews", "soccernews"].includes(commandName)) {
return `Oh, should I find that article/info for you?\nI’ll run: ${fullCommand}\nReply yh yh to confirm, or no to cancel.`
}
if (platformNames[commandName] || ["download", "dl", "social", "video", "anydl"].includes(commandName)) {
return `Should I download this ${platformNames[commandName] || "media"} for you?\nI’ll run: ${fullCommand}\nReply yh yh to confirm, or no to cancel.`
}
if (["menu", "allmenu", "downloadmenu", "groupmenu", "gamemenu", "ownermenu", "index"].includes(commandName)) {
return `Should I open ${commandName === "menu" ? "the menu" : `the ${commandName}`}?\nReply yh yh to confirm, or no to cancel.`
}
return `I think you want me to run: ${fullCommand}\nReply yh yh to confirm, or no to cancel.`
}

const executeNaturalCommand = async (resolved = {}) => {
if (!resolved?.command || !botCommands.has(resolved.command)) return false
const nextBody = `${m.prefix}${resolved.command}${resolved.args ? ` ${resolved.args}` : ""}`.trim()
const nextMessage = {
...m,
body: nextBody,
text: nextBody,
__naturalCommand: true
}
await module.exports(sock, nextMessage, store)
return true
}

const getPendingNaturalCommand = () => {
sock.naturalCommands = sock.naturalCommands || {}
const pendingKey = `${m.chat}:${m.sender}`
const pending = sock.naturalCommands[pendingKey]
if (!pending) return { pendingKey, pending: null }
if (Date.now() - Number(pending.createdAt || 0) > 2 * 60 * 1000) {
delete sock.naturalCommands[pendingKey]
return { pendingKey, pending: null }
}
return { pendingKey, pending }
}

const isNaturalConfirm = (message = "") => /^(y|yes|yeah|yep|yh|yh yh|confirm|confirmed|ok|okay|sure|do it|run it|go ahead)$/i.test(String(message || "").trim())

const isNaturalCancel = (message = "") => /^(n|no|nah|nope|cancel|stop|don't|dont|never mind|nevermind)$/i.test(String(message || "").trim())

if (!isCmd && !m.__naturalCommand && rawBody && !m.fromMe) {
const { pendingKey, pending } = getPendingNaturalCommand()
if (pending && isNaturalConfirm(rawBody)) {
delete sock.naturalCommands[pendingKey]
await m.reply("Confirmed. Running it now.")
return executeNaturalCommand(pending)
}
if (pending && isNaturalCancel(rawBody)) {
delete sock.naturalCommands[pendingKey]
return m.reply("Okay, cancelled.")
}
}

if (!isCmd && !m.__naturalCommand && rawBody && !m.fromMe && global.aiChat?.enabled) {
const aiRoom = getAiRoom(m.chat)
if (aiRoom.enabled && aiShouldReply) {
try {
await sock.sendPresenceUpdate("composing", m.chat)
if (isAiVisionRequest(rawBody, mime || "")) {
await sock.sendPresenceUpdate("paused", m.chat)
return m.reply("The image can't be seen using Empress AI.")
}
if (isAiImageRequest(rawBody)) {
const query = getAiImageQuery(rawBody)
const image = await getDynamicImage("game", query)
await sock.sendPresenceUpdate("paused", m.chat)
if (!image) return m.reply("The image can't be seen using Empress AI.")
return sock.sendMessage(m.chat, { image: { url: image }, caption: `Empress found this for: ${query}` }, { quoted: m })
}
const simpleReply = getSimpleAiReply(rawBody)
if (simpleReply) {
await sock.sendPresenceUpdate("paused", m.chat)
appendAiMemory(m.chat, m.sender, "user", rawBody)
appendAiMemory(m.chat, m.sender, "assistant", simpleReply)
return m.reply(simpleReply)
}
if (isAiVoiceRequest(rawBody)) {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
return sendAiVoiceNote(rawBody)
}
if (await runNaturalCommand(rawBody)) {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
return
}
const prompt = buildAiPromptWithMemory(rawBody, m.chat, m.sender, pushname, m.isGroup)
const aiAnswer = await askEmpressAi(prompt, aiRoom.provider)
await sock.sendPresenceUpdate("paused", m.chat)
if (!aiAnswer) return m.reply("Empress is here, but the AI provider returned an empty reply.")
appendAiMemory(m.chat, m.sender, "user", rawBody)
appendAiMemory(m.chat, m.sender, "assistant", aiAnswer)
return m.reply(aiAnswer)
} catch (err) {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
console.error("Empress AI Error:", err?.response?.data || err.message)
return m.reply(`Empress AI ran into a problem: ${err?.response?.data?.error?.message || err.message}`)
}
}
}

//==========[ Console Log ]==========//
if (isCmd) {
console.log(chalk.blue.bold(`[ NEW MESSAGE ]`), chalk.blue.bold(`${m.sender.split("@")[0]} :`), chalk.white.bold(`${m.prefix+command}`))
}

//=============================================//

switch (command) {
case "menu": case "menj": case "help": {
const teks = buildNaturalMenuCaption()
await sendMenuImage(teks)
}
break

//=============================================//

case "allmenu": {
const teks = animeMenuFrame("ALL MENU", [
animeMenuSection("CORE", [`${m.prefix}menu`, `${m.prefix}allmenu`, `${m.prefix}status`, `${m.prefix}infobot`, `${m.prefix}tqto`]),
animeMenuSection("DOWNLOADS", [`${m.prefix}play song name`, `${m.prefix}ytmp3 youtube-link`, `${m.prefix}ytmp4 youtube-link`, `${m.prefix}alldl any-supported-link`, `${m.prefix}tiktok / ${m.prefix}tt`, `${m.prefix}instagram / ${m.prefix}ig`, `${m.prefix}facebook / ${m.prefix}fb`, `${m.prefix}twitter / ${m.prefix}x`, `${m.prefix}reddit / ${m.prefix}capcut`, `${m.prefix}soundcloud / ${m.prefix}douyin`, `${m.prefix}pinterest / ${m.prefix}pin`, `${m.prefix}social / ${m.prefix}dl`, `${m.prefix}sticker reply/send media`, `${m.prefix}catbox reply/send media`, `${m.prefix}tourl`]),
animeMenuSection("ENDPOINT TOOLS", [`${m.prefix}transcribe reply-audio/url`, `${m.prefix}tth text`, `${m.prefix}speech text`, `${m.prefix}pixelster prompt`, `${m.prefix}tempmail`, `${m.prefix}unovel title/link`, `${m.prefix}webzip website-url`, `${m.prefix}findtube topic`, `${m.prefix}medster`, `${m.prefix}longcat question`]),
animeMenuSection("UTILITIES", [`${m.prefix}myinfo`, `${m.prefix}mypremium`, `${m.prefix}buypremium`, `${m.prefix}tools`, `${m.prefix}cekban 234xxxxxxxxxx`, `${m.prefix}checkwa 234xxxxxxxxxx`, `${m.prefix}unban 234xxxxxxxxxx | Owner Name`, `${m.prefix}weather Lagos`, `${m.prefix}calc 25 * 4`, `${m.prefix}translate es hello`, `${m.prefix}tts hello`, `${m.prefix}qr text/link`, `${m.prefix}wiki topic`, `${m.prefix}convert 100 USD to NGN`, `${m.prefix}device reply`]),
animeMenuSection("MEDIA & PROFILE", [`${m.prefix}swm pack|author`, `${m.prefix}toimg reply-sticker`, `${m.prefix}jpeg reply-image`, `${m.prefix}pp @user/reply`, `${m.prefix}setpp reply-image`, `${m.prefix}setname name`, `${m.prefix}setbio text`]),
animeMenuSection("GROUPS", [`${m.prefix}welcome on/off`, `${m.prefix}antilink kick on/off`, `${m.prefix}antilink nokick on/off`, `${m.prefix}gconly on/off`, `${m.prefix}open / ${m.prefix}close`, `${m.prefix}kick @user`, `${m.prefix}kickall confirm`, `${m.prefix}add number`, `${m.prefix}promote / ${m.prefix}demote`, `${m.prefix}mute / ${m.prefix}unmute`, `${m.prefix}lockgc / ${m.prefix}unlockgc`, `${m.prefix}link / ${m.prefix}revoke`, `${m.prefix}groupinfo`, `${m.prefix}tagadmins`, `${m.prefix}listmembers`, `${m.prefix}hidetag text`, `${m.prefix}totag reply-message`, `${m.prefix}tagall text`, `${m.prefix}cekidch channel-link`]),
animeMenuSection("GAME", [`${m.prefix}tictactoe`, `${m.prefix}ttt room-name`, `${m.prefix}blackjack start 1000`, `${m.prefix}casino 500`, `${m.prefix}slot 500`, `${m.prefix}work driver`, `${m.prefix}woodcut`, `${m.prefix}balance`, `${m.prefix}leaderboard money`, `${m.prefix}delttt`]),
animeMenuSection("OWNER", [`${m.prefix}public / ${m.prefix}private`, `${m.prefix}prefix / ${m.prefix}setprefix ?`, `${m.prefix}addsudo number`, `${m.prefix}ai on/off`, `${m.prefix}ai provider dynamic/kimi/openrouter/openai/gemini`, `${m.prefix}rentbot number`, `${m.prefix}delrent number`, `${m.prefix}listrent`, `${m.prefix}addpremium number`, `${m.prefix}backup`, `${m.prefix}addcase`, `${m.prefix}delcase`, `${m.prefix}getcase`, `${m.prefix}listcase`])
])
await sendMenuImage(teks)
}
break

//=============================================//

case "index": {
const teks = animeMenuFrame("COMMAND INDEX", [
animeMenuSection("Registered Commands", buildCommandIndex(m.prefix).split(/\s{2}|\n/).filter(Boolean))
])
await sendMenuImage(teks)
}
break

//=============================================//

case "ownermenu": {
const teks = `╭━━〔 ⚙️ OWNER MENU ⚙️ 〕━━╮
│ ✦ Crown tools for ${namaowner} ✦
╰━━━━━━━━━━━━━━━━━━━━╯

👑 MODE
┣ ✧ ${m.prefix}public
┣ ✧ ${m.prefix}private
┣ ✧ ${m.prefix}self
┣ ✧ ${m.prefix}prefix
┣ ✧ ${m.prefix}setprefix ?
┗ ✧ ${m.prefix}resetprefix

🛡️ SUDO
┣ ✧ ${m.prefix}addowner number/reply
┣ ✧ ${m.prefix}delowner number/reply
┣ ✧ ${m.prefix}listowner
┣ ✧ ${m.prefix}addsudo number/reply
┣ ✧ ${m.prefix}delsudo number/reply
┗ ✧ ${m.prefix}listsudo

🤖 AI CHAT
┣ ✧ ${m.prefix}ai on
┣ ✧ ${m.prefix}ai off
┣ ✧ ${m.prefix}ai status
┗ ✧ ${m.prefix}ai provider dynamic/kimi/openrouter/openai/gemini

👤 BOT PROFILE
┣ ✧ ${m.prefix}setpp reply-image
┣ ✧ ${m.prefix}delpp
┣ ✧ ${m.prefix}setname name
┗ ✧ ${m.prefix}setbio text

🧰 SCRIPT TOOLS
┣ ✧ ${m.prefix}rentbot number
┣ ✧ ${m.prefix}delrent number
┣ ✧ ${m.prefix}listrent
┣ ✧ ${m.prefix}addpremium number
┣ ✧ ${m.prefix}delpremium number
┣ ✧ ${m.prefix}listpremium
┣ ✧ ${m.prefix}backup
┣ ✧ ${m.prefix}addcase
┣ ✧ ${m.prefix}delcase
┣ ✧ ${m.prefix}getcase
┗ ✧ ${m.prefix}listcase

🤝 GROUP OWNER TOOLS
┣ ✧ ${m.prefix}listgc
┣ ✧ ${m.prefix}join group-link
┗ ✧ ${m.prefix}leavegroup

📞 OWNERS
┣ ✧ +234 906 435 0587
┗ ✧ +234 708 641 2154`
await sendMenuImage(teks)
}
break

//=============================================//

case "groupmenu": {
const teks = `╭━━〔 👥 GROUP MENU 👥 〕━━╮
│ ✦ Clean order for busy groups ✦
╰━━━━━━━━━━━━━━━━━━━━╯

🌷 WELCOME
┣ ✧ ${m.prefix}welcome on
┗ ✧ ${m.prefix}welcome off

🔗 ANTILINK
┣ ✧ ${m.prefix}antilink kick on
┣ ✧ ${m.prefix}antilink kick off
┣ ✧ ${m.prefix}antilink nokick on
┗ ✧ ${m.prefix}antilink nokick off

📣 GROUP TOOLS
┣ ✧ ${m.prefix}add number
┣ ✧ ${m.prefix}promote @user
┣ ✧ ${m.prefix}demote @user
┣ ✧ ${m.prefix}open / ${m.prefix}close
┣ ✧ ${m.prefix}mute / ${m.prefix}unmute
┣ ✧ ${m.prefix}lockgc / ${m.prefix}unlockgc
┣ ✧ ${m.prefix}link / ${m.prefix}revoke
┣ ✧ ${m.prefix}setgname text
┣ ✧ ${m.prefix}setdesc text
┣ ✧ ${m.prefix}setgpp / ${m.prefix}setppgc reply-image
┣ ✧ ${m.prefix}getgpp / ${m.prefix}delgpp
┣ ✧ ${m.prefix}groupinfo
┣ ✧ ${m.prefix}listmembers
┣ ✧ ${m.prefix}tagadmins
┣ ✧ ${m.prefix}tag @user
┣ ✧ ${m.prefix}hidetag text
┣ ✧ ${m.prefix}totag reply-message
┣ ✧ ${m.prefix}tagall text
┣ ✧ ${m.prefix}kick @user
┣ ✧ ${m.prefix}kickall confirm
┗ ✧ ${m.prefix}cekidch channel-link`
await sendMenuImage(teks)
}
break

//=============================================//

case "downloadmenu": {
const teks = `╭━━〔 📥 DOWNLOAD MENU 📥 〕━━╮
│ ✦ Drop a link, Empress fetches ✦
╰━━━━━━━━━━━━━━━━━━━━╯

🎬 SOCIAL VIDEOS
┣ ✧ ${m.prefix}play song name
┣ ✧ ${m.prefix}ytmp3 youtube-link
┣ ✧ ${m.prefix}ytmp4 youtube-link
┣ ✧ ${m.prefix}alldl any-supported-link
┣ ✧ ${m.prefix}tiktok link
┣ ✧ ${m.prefix}instagram link
┣ ✧ ${m.prefix}facebook link
┣ ✧ ${m.prefix}twitter link
┣ ✧ ${m.prefix}pinterest link
┣ ✧ ${m.prefix}reddit link
┣ ✧ ${m.prefix}capcut link
┣ ✧ ${m.prefix}ttsearch keywords
┣ ✧ ${m.prefix}soundcloud link
┣ ✧ ${m.prefix}douyin link
┗ ✧ ${m.prefix}social link

🖼️ MEDIA TOOLS
┣ ✧ ${m.prefix}sticker reply/send image or video
┣ ✧ ${m.prefix}brat text
┣ ✧ ${m.prefix}bratvid text
┣ ✧ ${m.prefix}furbrat text
┣ ✧ ${m.prefix}swm pack|author
┣ ✧ ${m.prefix}toimg reply-sticker
┣ ✧ ${m.prefix}jpeg reply-image
┣ ✧ ${m.prefix}qr text/link
┣ ✧ ${m.prefix}tts text
┣ ✧ ${m.prefix}catbox reply/send image/video/audio
┣ ✧ ${m.prefix}kaorinews anime name
┗ ✧ ${m.prefix}footballnews`
await sendMenuImage(teks)
}
break

//=============================================//

case "gamemenu": {
const teks = `╭━━〔 🎮 GAME MENU 🎮 〕━━╮
│ ✦ Tiny battles, clean fun ✦
╰━━━━━━━━━━━━━━━━━━━━╯

	🎮 GAMES
	┣ ✧ ${m.prefix}tictactoe
	┣ ✧ ${m.prefix}ttt room-name
	┣ ✧ ${m.prefix}blackjack start 1000
	┣ ✧ ${m.prefix}blackjack hit/stand/double/end
	┣ ✧ ${m.prefix}casino 500
	┣ ✧ ${m.prefix}slot 500
	┣ ✧ ${m.prefix}work driver
	┣ ✧ ${m.prefix}work trader
	┣ ✧ ${m.prefix}work doctor
	┣ ✧ ${m.prefix}work farmer
	┣ ✧ ${m.prefix}work mechanic
	┣ ✧ ${m.prefix}work builder
	┣ ✧ ${m.prefix}woodcut
	┣ ✧ ${m.prefix}balance
	┣ ✧ ${m.prefix}leaderboard money
	┗ ✧ ${m.prefix}delttt
	
	How it works:
	1. Use ${m.prefix}ttt for tic-tac-toe rooms.
	2. Use ${m.prefix}blackjack start amount to sit at the table.
	3. Use ${m.prefix}casino or ${m.prefix}slot when you want quick money risk.
	4. Use ${m.prefix}work and ${m.prefix}woodcut to earn safely.`
await sendMenuImage(teks)
}
break

//=============================================//

case "status": case "runtime": case "ping2": case "speed": case "speedtest": {
let timestamp = speed()
let latensi = speed() - timestamp
let totalDisk = await nou.drive.info()
const teks = `╭─〔 📡 STATUS 〕─╮
│ Empress is online and sparkling.
╰────────────────╯

👑 Owner: ${namaowner}
🌐 Mode: ${sock.public ? "Public" : "Self"}
⏱️ Runtime: ${runtime(process.uptime())}
🖥️ Platform: ${nou.os.type()}
🧠 RAM: ${formatp(os.totalmem())}
💾 Disk: ${totalDisk.totalGb} GB
⚡ Response: ${latensi.toFixed(4)} seconds

Everything feels warm from here 💗`
await sendMenuImage(teks, [
menuButton(`${m.prefix}menu`, "🏠 Home"),
menuButton(`${m.prefix}allmenu`, "🌸 All Menu"),
menuButton(`${m.prefix}downloadmenu`, "🍯 Downloads")
])
}
break

//=============================================//

case "infobot": case "info": {
const teks = `╭━━━〔 💌 BOT INFO 💌 〕━━━╮
┃ ✦ A little card from Empress ✦
╰━━━━━━━━━━━━━━━━━━━━━━╯

┣ ⟡ Name: ${namabot}
┣ ⟡ Assistant: Empress
┣ ⟡ Version: ${versisc}
┣ ⟡ Owner: ${namaowner}
┣ ⟡ Pairing: ${pairing}
┗ ⟡ Channel: ${global.namasaluran}

╭─────────────╮
│ 💗 Useful • Soft • Royal │
╰─────────────╯`
await sendMenuImage(teks, [
menuButton(`${m.prefix}menu`, "🏠 Home"),
menuButton(`${m.prefix}status`, "📡 Status"),
menuButton(`${m.prefix}allmenu`, "🌸 All Menu")
])
}
break

//=============================================//

case "tqto": case "thx": {
const teks = `╭━━━〔 💗 THANK YOU 💗 〕━━━╮
┃ ✦ Empress is giving flowers ✦
╰━━━━━━━━━━━━━━━━━━━━━━╯

┣ ⟡ ${namaowner}
┣ ⟡ Baileys
┣ ⟡ Empire MD users
┗ ⟡ Everyone testing and improving this

╭─────────────╮
│ 💗 Tiny crown, big gratitude │
╰─────────────╯`
await sendMenuImage(teks, [
menuButton(`${m.prefix}menu`, "🏠 Home"),
menuButton(`${m.prefix}allmenu`, "🌸 All Menu"),
menuButton(`${m.prefix}infobot`, "💌 Info")
])
}
break

//=============================================//

case "myinfo": {
const role = isOwner ? "Owner" : isSudo ? "Sudo User" : isPremium ? "Premium User" : m.isAdmin ? "Group Admin" : "User"
const teks = `╭━━〔 👤 MY INFO 〕━━╮
│ Your little identity card.
╰━━━━━━━━━━━━━━━━╯

Name: ${pushname}
Number: ${jidUser(m.sender)}
Role: ${role}
Chat: ${m.isGroup ? "Group" : "Private"}
JID: ${m.sender}
Mode: ${sock.public ? "Public" : "Self"}`
return m.reply(teks)
}
break

//=============================================//

case "mypremium": {
return m.reply(`╭━━〔 👑 PREMIUM STATUS 〕━━╮
│ 幻影 access card
╰━━━━━━━━━━━━━━━━━━━━╯

Number: ${senderPhone}
Status: ${isPremium ? "Premium active" : "Free user"}
Mode access: ${isPremium ? "Allowed in self/private mode" : "Public mode only unless owner/sudo"}`)
}
break

//=============================================//

case "buypremium": {
return sock.sendMessage(m.chat, {
text: `╭━━〔 💳 BUY PREMIUM 〕━━╮
Premium unlocks access while Empress is in self/private mode.

Contact owner:
@${jidUser(configuredOwnerJids[0] || global.owner)}

Channel:
${global.linksaluran || "Not configured"}`,
mentions: configuredOwnerJids
}, { quoted: m })
}
break

//=============================================//

case "addpremium": {
if (!isOwner) return m.reply(mess.owner)
const input = m.mentionedJid?.[0] || m.quoted?.sender || text
const phone = normalizePhoneNumber(input.includes("@") ? jidUser(input) : input)
if (!phone) return example("234xxxxxxxxxx")
const db = readPremiumDb()
if (!db.premiumUsers.includes(phone)) db.premiumUsers.push(phone)
savePremiumDb(db)
return m.reply(`Done. +${phone} now has premium access.`)
}
break

//=============================================//

case "delpremium": {
if (!isOwner) return m.reply(mess.owner)
const input = m.mentionedJid?.[0] || m.quoted?.sender || text
const phone = normalizePhoneNumber(input.includes("@") ? jidUser(input) : input)
if (!phone) return example("234xxxxxxxxxx")
const db = readPremiumDb()
const next = db.premiumUsers.filter(user => user !== phone)
savePremiumDb({ premiumUsers: next })
return m.reply(next.length === db.premiumUsers.length ? "That number is not premium right now." : `Done. +${phone} premium access removed.`)
}
break

//=============================================//

case "listpremium": {
if (!isOwner) return m.reply(mess.owner)
const db = readPremiumDb()
if (!db.premiumUsers.length) return m.reply("No premium users yet.")
return m.reply(`╭━━〔 👑 PREMIUM USERS 〕━━╮
${db.premiumUsers.map((phone, index) => `${index + 1}. +${phone}`).join("\n")}`)
}
break

//=============================================//

case "tools": case "seotools": {
return m.reply(`╭━━〔 🧰 TOOL HUB 〕━━╮
SEO Studio Tools:
https://seostudio.tools

WhatsApp account helpers:
${m.prefix}cekban 234xxxxxxxxxx
${m.prefix}checkwa 234xxxxxxxxxx
${m.prefix}unban 234xxxxxxxxxx | Owner Name

Endpoint tools:
${m.prefix}transcribe reply-audio or audio-url
${m.prefix}tth text
${m.prefix}speech text
${m.prefix}pixelster prompt
${m.prefix}tempmail
${m.prefix}unovel title/search
${m.prefix}webzip https://site.com
${m.prefix}longcat question`)
}
break

//=============================================//

case "transcribe": case "stt": {
let mediaUrl = text
try {
if (!mediaUrl && /audio|video/.test(mime || "")) {
await m.reply("Empress is uploading that media for transcription.")
const media = await downloadSelectedMedia()
const ext = getExtensionFromMime(mime)
mediaUrl = await uploadToCatbox(media, `empire-transcribe-${Date.now()}.${ext}`)
}
if (!mediaUrl) return example("reply to audio/video or send an audio URL")
await m.reply("Empress is transcribing it now.")
const data = await ahm7ToolRequest("transcribe", { url: mediaUrl, audio: mediaUrl, file: mediaUrl })
return sendEndpointResult({ sock, m, command, title: "TRANSCRIBE", data, sourceUrl: mediaUrl })
} catch (err) {
console.error("Transcribe Error:", err?.response?.data || err.message)
return m.reply(`Transcription failed: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "tth": case "handwriting": {
if (!text) return example("Empire MD is writing this")
try {
await m.reply("Empress is generating handwriting now.")
const data = await ahm7ToolRequest("tth", { text, prompt: text })
return sendEndpointResult({ sock, m, command, title: "TEXT TO HANDWRITING", data, prefer: "image" })
} catch (err) {
console.error("TTH Error:", err?.response?.data || err.message)
return m.reply(`Text-to-handwriting failed: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "speech": case "ahmtts": {
if (!text) return example("Hello from Empire MD")
try {
await m.reply("Empress is generating speech now.")
const data = await ahm7ToolRequest("speech", { text, prompt: text })
return sendEndpointResult({ sock, m, command, title: "SPEECH", data, prefer: "audio" })
} catch (err) {
console.error("Speech Error:", err?.response?.data || err.message)
return m.reply(`Speech generation failed: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "tempmail": case "mailtemp": {
try {
await m.reply("Empress is opening temp mail now.")
const data = await ahm7ToolRequest("tempmail", { action: args[0] || "new", email: args[1] || text })
return sendEndpointResult({ sock, m, command, title: "TEMP MAIL", data })
} catch (err) {
console.error("TempMail Error:", err?.response?.data || err.message)
return m.reply(`Temp mail failed: ${err?.response?.data?.message || err.message}\nOpen: https://ahm7xmakki.com/tempmail`)
}
}
break

//=============================================//

case "unovel": case "novel": {
if (!text) return example("novel title or novel link")
try {
await m.reply("Empress is checking UNovel now.")
const data = await ahm7ToolRequest("unovel", { q: text, query: text, url: text })
return sendEndpointResult({ sock, m, command, title: "UNOVEL", data })
} catch (err) {
console.error("UNovel Error:", err?.response?.data || err.message)
return m.reply(`UNovel failed: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "pixelster": case "imagine": case "imggen": {
if (!text) return example("cyberpunk queen in Lagos, cinematic")
try {
await m.reply("Empress is generating your image now.")
const data = await ahm7ToolRequest("pixelster", { prompt: text, text, q: text })
return sendEndpointResult({ sock, m, command, title: "PIXELSTER IMAGE", data, prefer: "image" })
} catch (err) {
console.error("Pixelster Error:", err?.response?.data || err.message)
return m.reply(`Image generation failed: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "webzip": case "sitezip": {
if (!/^https?:\/\//i.test(text)) return example("https://example.com")
try {
await m.reply("Empress is asking WebZips to pack that website.")
const data = await axios.get("https://webzips.vercel.app/api/zip", {
params: { url: text },
timeout: 180000,
headers: { "User-Agent": "Empire-MD/2.0.0" }
}).then(res => res.data).catch(async () => ahm7ToolRequest("webzip", { url: text }))
return sendEndpointResult({ sock, m, command, title: "WEBZIP", data, prefer: "zip", sourceUrl: text })
} catch (err) {
console.error("WebZip Error:", err?.response?.data || err.message)
return m.reply(`WebZip failed: ${err?.response?.data?.message || err.message}\nOpen: http://webzips.vercel.app`)
}
}
break

//=============================================//

case "medster": {
const query = text ? `?q=${encodeURIComponent(text)}` : ""
return m.reply(`Medster:\nhttp://medster.vercel.app${query}`)
}
break

//=============================================//

case "findtube": {
if (!text) return example("video search query")
return m.reply(`FindTube search:\nhttps://findtube.ai/?q=${encodeURIComponent(text)}`)
}
break

//=============================================//

case "aitools": {
return m.reply(`╭━━〔 AI TOOLS 〕━━╮
Image: Pixelster, Vheer, Firefly, MidJourney, Leonardo, Ideogram, Recraft
Voice: ElevenLabs, Luvvoice, Qwen, PlayHT, Murf, OpenVoice
Video: Sora, Runway, Kling, Luma, Pika, Hailuo, Deevid
Slides: Gamma, Tome, Beautiful AI, SlidesAI

Quick commands:
${m.prefix}pixelster prompt
${m.prefix}speech text
${m.prefix}longcat question
${m.prefix}findtube topic`)
}
break

//=============================================//

case "longcat": {
if (!text) return example("write a clean WhatsApp promo for Empire MD")
try {
await sock.sendPresenceUpdate("composing", m.chat)
const answer = sanitizeAiAnswer(await callLongCat(buildAiPromptWithMemory(text, m.chat, m.sender, pushname, m.isGroup)), text)
if (!answer) return m.reply("LongCat returned an empty response.")
appendAiMemory(m.chat, m.sender, "user", text)
appendAiMemory(m.chat, m.sender, "assistant", answer)
return sendTextWithSticker(m.chat, answer, {}, m)
} catch (err) {
console.error("LongCat Error:", err?.response?.data || err.message)
return m.reply(`LongCat failed: ${err?.response?.data?.error?.message || err?.response?.data?.message || err.message}`)
} finally {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
}
}
break

//=============================================//

case "cekban": case "checkban": {
const phone = text.replace(/\D/g, "")
if (!phone) return example("234xxxxxxxxxx")
await sock.sendPresenceUpdate("composing", m.chat)
try {
const result = await cekbanAsync(phone)
const bannedText = result.isBanned === true || result.banStatus === "banned"
? "BANNED / restricted"
: result.isBanned === false || result.banStatus === "not_banned"
? "Not banned"
: "Unknown / API did not confirm"
const caption = `╭━━〔 🔎 BAN CHECK 〕━━╮
Number: +${result.number}
Status: ${result.status}
Result: ${bannedText}
Message: ${result.message || "-"}
Checked: ${result.timestamp}`
try {
const image = await renderBanStatusImage(result, pushname, m.sender)
return sock.sendMessage(m.chat, { image: Buffer.isBuffer(image) ? image : { url: image }, caption }, { quoted: m })
} catch (imageErr) {
console.error("Cekban Image Error:", imageErr.message)
return m.reply(caption)
}
} catch (err) {
console.error("Cekban Error:", err?.response?.data || err.message || err)
return m.reply(`Ban check failed: ${err?.response?.data?.message || err.message || err}`)
} finally {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
}
}
break

//=============================================//

case "checkwa": {
const phone = text.replace(/\D/g, "")
if (!phone) return example("234xxxxxxxxxx")
await sock.sendPresenceUpdate("composing", m.chat)
try {
const [result] = await sock.onWhatsApp(`${phone}@s.whatsapp.net`)
const exists = result?.exists === true
return m.reply(`╭━━〔 📱 WHATSAPP CHECK 〕━━╮
Number: +${phone}
Status: ${exists ? "Registered on WhatsApp" : "Not registered or unavailable"}
JID: ${result?.jid || "-"}`)
} catch (err) {
return m.reply(`Empress could not check that number: ${err.message}`)
} finally {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
}
}
break

//=============================================//

case "unban": {
if (!text) return example("234xxxxxxxxxx | Owner Name")
const [phoneInput, ...nameParts] = text.split("|")
const phone = String(phoneInput || "").replace(/\D/g, "")
const ownerName = nameParts.join("|").trim() || pushname || "Unknown"
if (!phone) return example("234xxxxxxxxxx | Owner Name")
const result = await unbanAsync(phone, ownerName)
if (!result.success) return m.reply(`Unban appeal failed: ${result.error}`)
return m.reply(`╭━━〔 📤 UNBAN APPEAL SENT 〕━━╮
Number: +${result.number}
Owner: ${result.owner}
Recipients: ${result.recipients.join(", ")}
Provider: ${result.delivery?.provider || "-"}
From: ${result.delivery?.from || "-"}
Sent: ${result.timestamp}`)
}
break

//=============================================//

case "clearchat": {
return sock.sendMessage(m.chat, { text: "\n".repeat(60) }, { quoted: m })
}
break

//=============================================//

case "weather": {
if (!text) return example("Lagos")
try {
const res = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1`, { timeout: 30000 })
const cur = res.data?.current_condition?.[0]
const area = res.data?.nearest_area?.[0]
if (!cur || !area) return m.reply("Empress could not read the weather for that place.")
const city = `${area.areaName?.[0]?.value || text}, ${area.country?.[0]?.value || "Unknown"}`
return m.reply(`╭━━〔 ☁️ WEATHER 〕━━╮
Location: ${city}
Condition: ${cur.weatherDesc?.[0]?.value || "Unknown"}
Temperature: ${cur.temp_C}°C / ${cur.temp_F}°F
Feels Like: ${cur.FeelsLikeC}°C
Humidity: ${cur.humidity}%
Wind: ${cur.windspeedKmph} km/h ${cur.winddir16Point}
Visibility: ${cur.visibility} km`)
} catch (err) {
console.error("Weather Error:", err.message)
return m.reply("Empress could not fetch that weather. Check the city name and try again.")
}
}
break

//=============================================//

case "calculate": case "calc": {
if (!text) return example("25 * 4 + 10")
const expr = text.replace(/\^/g, "**")
if (!/^[0-9+\-*/().%\s*]+$/.test(expr)) return m.reply("That expression has characters I will not run. Use numbers and math operators only.")
try {
const result = Function(`"use strict"; return (${expr})`)()
if (!Number.isFinite(Number(result))) return m.reply("That calculation did not produce a normal number.")
return m.reply(`╭━━〔 🧮 CALCULATOR 〕━━╮
Input: ${text}
Result: ${result}`)
} catch {
return m.reply("Empress could not calculate that expression.")
}
}
break

//=============================================//

case "translate": case "tr": {
if (!args[0] || !args[1]) return example("es Hello world")
const lang = args[0].toLowerCase()
const phrase = args.slice(1).join(" ")
try {
const res = await axios.get("https://translate.googleapis.com/translate_a/single", {
params: { client: "gtx", sl: "auto", tl: lang, dt: "t", q: phrase },
timeout: 30000
})
const translated = res.data?.[0]?.map(item => item[0]).join("").trim()
if (!translated) return m.reply("Empress could not translate that text.")
return m.reply(`╭━━〔 🌐 TRANSLATE 〕━━╮
From: ${phrase}
To (${lang}): ${translated}`)
} catch (err) {
console.error("Translate Error:", err.message)
return m.reply("Translation failed. Check the language code and try again.")
}
}
break

//=============================================//

case "tts": {
if (!text) return example("Hello from Empire MD")
if (text.length > 200) return m.reply("Please keep TTS under 200 characters.")
try {
return sendBotTtsVoiceNote(text)
} catch (err) {
console.error("TTS Error:", err.message)
return m.reply("Empress could not create that voice note.")
}
}
break

//=============================================//

case "qr": {
if (!text) return example("https://t.me/empiremd")
const qrUrl = `https://quickchart.io/qr?size=500&text=${encodeURIComponent(text)}`
return sock.sendMessage(m.chat, {
image: { url: qrUrl },
caption: `QR code ready.\n\n${text.slice(0, 400)}`
}, { quoted: m })
}
break

//=============================================//

case "wiki": {
if (!text) return example("Artificial intelligence")
try {
const wikiHeaders = {
"User-Agent": "Empire-MD/2.0.0 (WhatsApp bot; contact: https://github.com/empire-md)",
"Accept": "application/json"
}
const search = await axios.get("https://en.wikipedia.org/w/api.php", {
params: { action: "query", list: "search", srsearch: text, format: "json", origin: "*" },
headers: wikiHeaders,
timeout: 30000
})
const title = search.data?.query?.search?.[0]?.title
if (!title) return m.reply("Empress found no Wikipedia result for that.")
let page
try {
page = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
headers: wikiHeaders,
timeout: 30000
})
} catch (summaryErr) {
console.error("Wiki Summary Fallback:", summaryErr?.response?.status || summaryErr.message)
const fallback = await axios.get("https://en.wikipedia.org/w/api.php", {
params: {
action: "query",
prop: "extracts|info",
exintro: 1,
explaintext: 1,
inprop: "url",
titles: title,
format: "json",
origin: "*"
},
headers: wikiHeaders,
timeout: 30000
})
const pages = fallback.data?.query?.pages || {}
const item = Object.values(pages)[0] || {}
page = {
data: {
title: item.title || title,
extract: item.extract || "No summary available.",
content_urls: { desktop: { page: item.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` } }
}
}
}
const summary = String(page.data?.extract || "No summary available.").slice(0, 900)
return m.reply(`╭━━〔 📚 WIKIPEDIA 〕━━╮
${page.data?.title || title}

${summary}${summary.length >= 900 ? "..." : ""}

Source: ${page.data?.content_urls?.desktop?.page || ""}`)
} catch (err) {
console.error("Wiki Error:", err.message)
return m.reply("Empress could not search Wikipedia right now.")
}
}
break

//=============================================//

case "convert": {
const amount = Number(args[0])
const fromCurrency = (args[1] || "").toUpperCase()
const toCurrency = (args[3] || args[2] || "").toUpperCase()
if (!amount || !fromCurrency || !toCurrency) return example("100 USD to NGN")
try {
const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`, { timeout: 30000 })
const rate = res.data?.rates?.[toCurrency]
if (!rate) return m.reply(`Empress could not find ${toCurrency}.`)
const result = (amount * rate).toFixed(2)
return m.reply(`╭━━〔 💱 CURRENCY 〕━━╮
${amount} ${fromCurrency} = ${result} ${toCurrency}
Rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`)
} catch (err) {
console.error("Currency Error:", err.message)
return m.reply("Currency conversion failed. Try again in a moment.")
}
}
break

//=============================================//

case "device": case "checkdevice": case "getdevice": {
const stanzaId = m.message?.extendedTextMessage?.contextInfo?.stanzaId || m.quoted?.id || m.quoted?.key?.id
if (!stanzaId) return example("reply to a message")
const device = stanzaId.length > 21 ? "Android" : stanzaId.startsWith("3A") ? "iOS" : "WhatsApp Web or Bot/API"
return m.reply(`╭━━〔 📱 DEVICE CHECK 〕━━╮
Likely device: ${device}`)
}
break

//=============================================//

case "confess": case "confes": case "menfes": case "menfess": {
sock.menfess = sock.menfess || {}
if (m.isGroup) return m.reply("Confess works in private chat only.")
const activeRoom = Object.values(sock.menfess).find(room => [room.from, room.to].includes(m.sender))
if (activeRoom) return m.reply("You already have an active or pending confess session. Use .stopmenfess first.")
if (!text || !text.includes("|")) return example(`${pushname}|234xxxxxxxxxx|I have something to tell you`)
let [alias, number, message] = text.split("|")
alias = String(alias || pushname).trim()
number = String(number || "").replace(/[^0-9]/g, "")
message = String(message || "").trim()
if (number.startsWith("0")) number = `234${number.slice(1)}`
if (number.length < 8 || !message) return m.reply("Use: name|number|message. The number must include country code.")
const target = `${number}@s.whatsapp.net`
if (target === m.sender) return m.reply("You cannot send a confess to yourself.")
const sessionId = `${m.sender}-${Date.now()}`
sock.menfess[sessionId] = {
id: sessionId,
from: m.sender,
to: target,
alias,
message,
state: "WAITING",
createdAt: Date.now()
}
const note = `╭━━〔 💌 CONFESS 〕━━╮
Someone sent you a private confess.

From: ${alias}
Message: ${message}

Reply with:
${m.prefix}balasmenfess - accept and chat through the bot
${m.prefix}tolakmenfess - reject this confess

Send ${m.prefix}stopmenfess anytime to end the session.`
try {
await sock.sendMessage(target, { text: note })
return m.reply("Confess sent. Empress will let you know if they accept.")
} catch (err) {
delete sock.menfess[sessionId]
return m.reply(`Empress could not send that confess: ${err.message}`)
}
}
break

//=============================================//

case "balasmenfess": {
sock.menfess = sock.menfess || {}
const room = Object.values(sock.menfess).find(item => item.to === m.sender && item.state === "WAITING")
if (!room) return m.reply("No pending confess is waiting for you.")
room.state = "CHATTING"
room.acceptedAt = Date.now()
await sock.sendMessage(room.from, {
text: `@${jidUser(m.sender)} accepted your confess. You can now chat through Empress.\n\nSend ${m.prefix}stopmenfess to end the session.`,
mentions: [m.sender]
})
return m.reply(`Confess accepted. Send messages here and Empress will relay them.\n\nUse ${m.prefix}stopmenfess to end it.`)
}
break

//=============================================//

case "tolakmenfess": {
sock.menfess = sock.menfess || {}
const room = Object.values(sock.menfess).find(item => item.to === m.sender && item.state === "WAITING")
if (!room) return m.reply("No pending confess is waiting for you.")
await sock.sendMessage(room.from, {
text: `@${jidUser(m.sender)} rejected your confess.`,
mentions: [m.sender]
})
delete sock.menfess[room.id]
return m.reply("Confess rejected.")
}
break

//=============================================//

case "stopmenfess": {
sock.menfess = sock.menfess || {}
const room = Object.values(sock.menfess).find(item => [item.from, item.to].includes(m.sender))
if (!room) return m.reply("You do not have an active confess session.")
const other = room.from === m.sender ? room.to : room.from
await sock.sendMessage(other, {
text: `The confess session was ended by @${jidUser(m.sender)}.`,
mentions: [m.sender]
}).catch(() => {})
delete sock.menfess[room.id]
return m.reply("Confess session ended.")
}
break

//=============================================//

case "vn": case "voice": case "voicenote": case "speak": case "say": {
if (!global.aiChat?.enabled) return m.reply("Empress AI is disabled in config.js.")
if (!text) return example("hello, this is Empress")
try {
return await sendAiVoiceNote(text)
} catch (err) {
await sock.sendPresenceUpdate("paused", m.chat).catch(() => {})
console.error("Empress VN Error:", err?.response?.data || err.message)
return m.reply(`Empress could not send that voice note: ${err?.response?.data?.error?.message || err.message}`)
}
}
break

//=============================================//

case "ai": case "aichat": case "empress": {
if (!isOwner) return m.reply(mess.owner)
if (!global.aiChat?.enabled) return m.reply("Empress AI is disabled in config.js.")

const action = (args[0] || "status").toLowerCase()
const current = getAiRoom(m.chat)
const provider = (current.provider || global.aiChat.defaultProvider || "dynamic").toLowerCase()

if (action === "on") {
const updated = setAiRoom(m.chat, { enabled: true, provider })
return m.reply(`Empress AI is now active in this chat.\nProvider: ${updated.provider}`)
}

if (action === "off") {
const updated = setAiRoom(m.chat, { enabled: false, provider })
return m.reply(`Empress AI is now off in this chat.\nProvider stays set to ${updated.provider}.`)
}

if (action === "provider") {
const nextProvider = (args[1] || "").toLowerCase()
if (!["dynamic", "random", "auto", "all", "kimi", "moonshot", "nvidia", "openrouter", "openai", "chatgpt", "gemini"].includes(nextProvider)) {
return example("provider dynamic/kimi/openrouter/openai/gemini")
}
const normalizedProvider = nextProvider === "chatgpt" ? "openai" : ["random", "auto", "all"].includes(nextProvider) ? "dynamic" : ["moonshot", "nvidia"].includes(nextProvider) ? "kimi" : nextProvider
const updated = setAiRoom(m.chat, { provider: normalizedProvider })
return m.reply(`Empress AI provider is now set to ${updated.provider} for this chat.`)
}

if (action === "status") {
return m.reply(`Empress AI status for this chat:
Status: ${current.enabled ? "On" : "Off"}
Provider: ${provider}
Default provider: ${global.aiChat.defaultProvider || "dynamic"}
Fallback order this reply would use: ${getDynamicAiProviders(provider).join(" > ")}`)
}

return example("on/off/status/provider dynamic/kimi/openrouter/openai/gemini")
}
break

//=============================================//

case "play": {
if (!text) return example("impossible")
await sock.sendMessage(m.chat, { react: { text: "🤗", key: m.key } }).catch(() => {})
try {
const search = await yts(text)
const result = search.videos?.[0] || search.all?.find(item => item.type === "video")
if (!result?.url) {
await sock.sendMessage(m.chat, { react: { text: "", key: m.key } }).catch(() => {})
return m.reply("Empress could not find that song on YouTube.")
}

const audio = await downloadYoutubeAudio(result.url)
await sock.sendMessage(m.chat, {
audio: audio.buffer,
mimetype: "audio/mpeg",
fileName: `${audio.title}.mp3`,
contextInfo: {
externalAdReply: {
thumbnailUrl: result.thumbnail,
title: result.title || audio.title,
body: `Author ${result.author?.name || audio.author} || Duration ${result.timestamp || "unknown"}`,
sourceUrl: result.url,
renderLargerThumbnail: true,
mediaType: 1
}
}
}, { quoted: m })
await sock.sendMessage(m.chat, { react: { text: "", key: m.key } }).catch(() => {})
} catch (err) {
await sock.sendMessage(m.chat, { react: { text: "", key: m.key } }).catch(() => {})
console.error("Play Command Error:", err.message)
return m.reply(`Empress could not play that audio: ${err.message}`)
}
}
break

//=============================================//

case "ytmp3": case "ytaudio": case "ytmusic": {
if (!text) return example("https://youtube.com/watch?v=...")
await m.reply("Empress is fetching the YouTube audio now. Please use this only for content you own or have permission to download.")
try {
try {
const result = await downloadWithAhm7(text)
if (result.audioUrl) {
await sock.sendMessage(m.chat, {
audio: { url: result.audioUrl },
mimetype: "audio/mpeg",
fileName: `${result.title}.mp3`,
contextInfo: {
externalAdReply: {
title: result.title,
body: result.platform || "YouTube",
thumbnailUrl: result.thumbnail,
sourceUrl: text,
mediaType: 2
}
}
}, { quoted: m })
await sendWarmSticker(m.chat, m)
return
}
} catch (apiErr) {
console.error("AHM7 YouTube Audio fallback:", apiErr.message)
}
const result = await downloadYoutubeAudio(text)
await sock.sendMessage(m.chat, {
audio: result.buffer,
mimetype: "audio/mpeg",
fileName: `${result.title}.mp3`,
contextInfo: {
externalAdReply: {
title: result.title,
body: result.author,
sourceUrl: text,
mediaType: 2
}
}
}, { quoted: m })
await sendWarmSticker(m.chat, m)
} catch (err) {
console.error("YouTube Audio Error:", err.message)
return m.reply(`Empress could not fetch that YouTube audio: ${err.message}`)
}
}
break

//=============================================//

case "capcut": case "capcutdl": case "cc": {
if (!text) return example("https://www.capcut.net/template-detail/...")
await m.reply("Empress is reading that CapCut template now.")
try {
try {
const detail = await downloadCapcutTemplate(text)
const caption = `╭━━〔 CAPCUT TEMPLATE 〕━━╮
Title: ${detail.title || "Untitled"}
Description: ${detail.desc || "No description"}
Template ID: ${detail.templateId || "Unknown"}
Source: ${detail.structuredData?.url || text}`
await sock.sendMessage(m.chat, {
video: { url: detail.videoUrl },
caption,
mimetype: "video/mp4",
contextInfo: {
externalAdReply: {
title: detail.title || "CapCut Template",
body: detail.desc || "CapCut preview",
thumbnailUrl: detail.coverUrl || detail.coverURL || detail.posterUrl,
sourceUrl: detail.structuredData?.url || text,
renderLargerThumbnail: true,
mediaType: 1
}
}
}, { quoted: m })
await sendWarmSticker(m.chat, m)
return
} catch (scrapeErr) {
console.error("CapCut Metadata Error:", scrapeErr.message)
const fallback = await downloadWithAhm7(text)
const mediaUrl = fallback.videoUrl || fallback.audioUrl
if (!mediaUrl) throw new Error("No downloadable CapCut media URL was returned.")
await sock.sendMessage(m.chat, {
video: { url: mediaUrl },
caption: `Done. Empress fetched your CapCut download.\n\nTitle: ${fallback.title}`,
mimetype: "video/mp4",
fileName: `${fallback.title || "capcut"}.mp4`
}, { quoted: m })
await sendWarmSticker(m.chat, m)
}
} catch (err) {
console.error("CapCut Downloader Error:", err?.response?.data || err.message)
return m.reply(`Empress could not download that CapCut link: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "ttsearch": {
if (!text) return example("Furina")
await m.reply("Empress is searching TikTok now.")
try {
const videos = (await searchTikTokVideos(text)).slice(0, 5)
const lines = videos.map((item, index) => {
const author = item.author?.nickname || item.author?.unique_id || "Unknown creator"
const duration = item.duration ? `${item.duration}s` : "unknown duration"
const videoLink = item.play || item.url || item.link || item.share_url || ""
return `${index + 1}. ${item.title || "Untitled"}\nCreator: ${author}\nDuration: ${duration}\nLikes: ${formatMoney(item.digg_count || 0)}\nVideo: ${videoLink || "No direct URL"}`
}).join("\n\n")
const previewUrl = videos.find(item => item.play || item.url || item.link || item.share_url)
const caption = `╭━━〔 TIKTOK SEARCH 〕━━╮
Query: ${text}

${lines}`
if (!previewUrl) {
await m.reply(caption)
return
}
await sock.sendMessage(m.chat, {
video: { url: previewUrl.play || previewUrl.url || previewUrl.link || previewUrl.share_url },
caption,
mimetype: "video/mp4"
}, { quoted: m })
await sendWarmSticker(m.chat, m)
} catch (err) {
console.error("TikTok Search Error:", err?.response?.data || err.message)
return m.reply(`Empress could not search TikTok: ${err?.response?.data?.message || err.message}`)
}
}
break

//=============================================//

case "sticker": case "stiker": case "s": {
if (!/image|video/.test(mime || "")) return m.reply("Please send or reply to an image/video, love.")
try {
const media = await downloadSelectedMedia()
if (/image/.test(mime)) {
await sock.sendImageAsSticker(m.chat, media, m, { packname: namabot, author: "Empress" })
} else {
await sock.sendVideoAsSticker(m.chat, media, m, { packname: namabot, author: "Empress" })
}
} catch (err) {
console.error("Sticker Error:", err)
return m.reply("Empress could not turn that media into a sticker. Try a shorter video or a clearer image.")
}
}
break

//=============================================//

case "brat": case "bratimg": case "bratimage": case "bratgambar": {
const stickerText = text || m.quoted?.text || ""
if (!stickerText) return example("Empire MD")
try {
const bratUrl = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(stickerText)}&background=%23ffffff&color=%23000000&emojiStyle=apple`
await sock.sendImageAsSticker(m.chat, bratUrl, m, { packname: namabot, author: "Empress" })
} catch (err) {
console.error("Brat Sticker Error:", err?.response?.data || err.message)
return m.reply(`Empress could not make that Brat sticker: ${err.message}`)
}
}
break

//=============================================//

case "bratvid": case "bratvideo": {
const stickerText = text || m.quoted?.text || ""
if (!stickerText) return example("Empire MD")
try {
const bratVideoUrl = `https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(stickerText)}`
await sock.sendVideoAsSticker(m.chat, bratVideoUrl, m, { packname: namabot, author: "Empress" })
} catch (err) {
console.error("Brat Video Sticker Error:", err?.response?.data || err.message)
try {
const fallbackUrl = `https://aqul-brat.hf.space/?text=${encodeURIComponent(stickerText)}`
await sock.sendVideoAsSticker(m.chat, fallbackUrl, m, { packname: namabot, author: "Empress" })
} catch (fallbackErr) {
console.error("Brat Video Fallback Error:", fallbackErr?.response?.data || fallbackErr.message)
return m.reply(`Empress could not make that Brat video sticker: ${fallbackErr.message}`)
}
}
}
break

//=============================================//

case "furbrat": {
const stickerText = text || m.quoted?.text || ""
if (!stickerText) return example("Empire MD")
try {
const furbratUrl = `https://fastrestapis.fasturl.link/tool/furbrat?text=${encodeURIComponent(stickerText)}`
await sock.sendImageAsSticker(m.chat, furbratUrl, m, { packname: namabot, author: "Empress" })
} catch (err) {
console.error("Furbrat Sticker Error:", err?.response?.data || err.message)
return m.reply(`Empress could not make that Furbrat sticker: ${err.message}`)
}
}
break

//=============================================//

case "swm": case "steal": case "stickerwm": case "take": {
if (!/image|video/.test(mime || "")) return m.reply("Reply to an image/video with packname|author.")
const [packname = namabot, author = "Empress"] = text.split("|").map(v => v.trim())
try {
const media = await downloadSelectedMedia()
if (/image/.test(mime)) {
await sock.sendImageAsSticker(m.chat, media, m, { packname, author })
} else {
await sock.sendVideoAsSticker(m.chat, media, m, { packname, author })
}
} catch (err) {
console.error("Sticker WM Error:", err.message)
return m.reply("Empress could not make that sticker with watermark.")
}
}
break

//=============================================//

case "toimg": {
if (!/webp/.test(mime || "")) return m.reply("Reply to a sticker, love.")
try {
const media = await downloadSelectedMedia()
const image = await toJpegBuffer(media, 92)
return sock.sendMessage(m.chat, { image, caption: "Converted sticker to image." }, { quoted: m })
} catch (err) {
console.error("To Image Error:", err.message)
return m.reply("Empress could not convert that sticker.")
}
}
break

//=============================================//

case "jpeg": {
if (!/image/.test(mime || "")) return m.reply("Reply to an image, love.")
try {
const media = await downloadSelectedMedia()
const image = await toJpegBuffer(media, 90)
return sock.sendMessage(m.chat, { image, caption: "Converted to JPEG." }, { quoted: m })
} catch (err) {
console.error("JPEG Error:", err.message)
return m.reply("Empress could not convert that image.")
}
}
break

//=============================================//

case "pp": case "getpp": {
const target = getTargetJid(m.isGroup ? m.sender : m.chat)
try {
const ppUrl = await sock.profilePictureUrl(target, "image")
return sock.sendMessage(m.chat, {
image: { url: ppUrl },
caption: `Profile picture for @${jidUser(target)}`,
mentions: [target]
}, { quoted: m })
} catch {
return m.reply("Empress could not find a profile picture for that user.")
}
}
break

//=============================================//

case "setpp": {
if (!isOwner) return m.reply(mess.owner)
if (!/image/.test(mime || "")) return m.reply("Reply to an image to set your profile picture.")
try {
const media = await downloadSelectedMedia()
await sock.updateProfilePicture(botNumber, media)
return m.reply("Done. Empress updated the bot profile picture.")
} catch (err) {
console.error("Set PP Error:", err.message)
return m.reply(`Empress could not update the profile picture: ${err.message}`)
}
}
break

//=============================================//

case "delpp": {
if (!isOwner) return m.reply(mess.owner)
try {
await sock.removeProfilePicture(botNumber)
return m.reply("Done. Empress removed the bot profile picture.")
} catch (err) {
return m.reply(`Empress could not remove the profile picture: ${err.message}`)
}
}
break

//=============================================//

case "bio": case "setbio": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return example("Empire MD is online")
try {
await sock.updateProfileStatus(text)
return m.reply(`Done. Bio updated to:\n${text}`)
} catch (err) {
return m.reply(`Empress could not update the bio: ${err.message}`)
}
}
break

//=============================================//

case "setname": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return example("Empire MD")
try {
await sock.updateProfileName(text)
return m.reply(`Done. Bot name updated to ${text}.`)
} catch (err) {
return m.reply(`Empress could not update the name: ${err.message}`)
}
}
break

//=============================================//

case "catbox": case "catboxurl": case "url": {
if (!/image|video|audio/.test(mime || "")) return m.reply("Please send or reply to an image, video, or audio file, love.")
try {
await m.reply("Empress is uploading your media to Catbox now.")
const media = await downloadSelectedMedia()
const ext = getExtensionFromMime(mime)
const link = await uploadToCatbox(media, `empire-md-${Date.now()}.${ext}`)
return sendTextWithSticker(m.chat, link, {}, m)
} catch (err) {
console.error("Catbox Upload Error:", err?.response?.data || err.message)
return m.reply(`Empress could not upload that file: ${err.message}`)
}
}
break

//=============================================//

case "kaorinews": case "animenews": {
await m.reply(`Empress is fetching ${text ? "matching" : "latest"} anime news now.`)
try {
const articles = await fetchKaoriArticles(text)
if (!articles.length) return m.reply("Empress could not find anime news from Kaori Nusantara right now.")
const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Lagos" })
const caption = `╭━━〔 ANIME NEWS 〕━━╮
${text ? `Search: ${text}` : "Latest anime and pop-culture news"}
Updated: ${timestamp}

${articles.map((article, index) => `${index + 1}. ${article.title}
Date: ${article.date || "Unknown"}
Author: ${article.author || "Unknown"}
Category: ${article.category || "News"}
${article.excerpt ? `Summary: ${article.excerpt}\n` : ""}Read: ${article.url}`).join("\n\n")}`

const image = articles.find(article => article.image)?.image
if (image) {
await sock.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m })
} else {
await m.reply(caption)
}
await sendWarmSticker(m.chat, m)
} catch (err) {
console.error("Kaori News Error:", err?.response?.data || err.message)
return m.reply(`Empress could not fetch anime news: ${err.message}`)
}
}
break

//=============================================//

case "footballnews": case "soccernews": {
await m.reply("Empress is fetching football news now.")
try {
const articles = await fetchFootballNews()
if (!articles.length) return m.reply("Empress could not find football news right now.")
const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Lagos" })
const caption = `╭━━〔 FOOTBALL NEWS 〕━━╮
Updated: ${timestamp}

${articles.map((article, index) => `${index + 1}. ${article.title}
Date: ${article.date || "Unknown"}
Category: ${article.categories?.join(", ") || "Football"}
Read: ${article.url}`).join("\n\n")}`

const image = articles.find(article => article.image)?.image
if (image) {
await sock.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m })
} else {
await m.reply(caption)
}
await sendWarmSticker(m.chat, m)
} catch (err) {
console.error("Football News Error:", err?.response?.data || err.message)
return m.reply(`Empress could not fetch football news: ${err.message}`)
}
}
break

//=============================================//

case "tiktok":
case "tt":
case "instagram":
case "igdl":
case "ig":
case "facebook":
case "fb":
case "twitter":
case "x":
case "pinterest":
case "pin":
case "reddit":
case "snapchat":
case "soundcloud":
case "snackvideo":
case "douyin":
case "alldl":
case "anydl":
case "video":
case "ytmp4":
case "ytvideo":
case "social":
case "dl":
case "download": {
if (!text) return example("the social media link")

const platform = getSocialPlatform(text)
await m.reply(`Empress is fetching your ${platform === "social" ? "media" : platform} download now. One moment, love.`)

try {
const result = await downloadWithAhm7(text)
const mediaUrl = command === "soundcloud" && result.audioUrl ? result.audioUrl : result.videoUrl || result.audioUrl
if (!mediaUrl) throw new Error("No downloadable media URL was returned.")
const caption = `╭━━〔 📥 UNIVERSAL DOWNLOAD 〕━━╮
Title: ${result.title}
Platform: ${result.platform || platform}
Source: AHM7xMakki`
if (result.audioUrl && !result.videoUrl) {
await sock.sendMessage(m.chat, {
audio: { url: result.audioUrl },
mimetype: "audio/mpeg",
fileName: `${result.title}.mp3`,
contextInfo: {
externalAdReply: {
title: result.title,
body: result.platform || "Audio",
thumbnailUrl: result.thumbnail,
sourceUrl: text,
mediaType: 2
}
}
}, { quoted: m })
} else {
await sock.sendMessage(m.chat, {
video: { url: mediaUrl },
caption,
mimetype: "video/mp4",
fileName: `${result.title}.mp4`,
contextInfo: {
externalAdReply: {
title: result.title,
body: result.platform || platform,
thumbnailUrl: result.thumbnail,
sourceUrl: text,
renderLargerThumbnail: true,
mediaType: 1
}
}
}, { quoted: m })
}
if (result.audioUrl && result.videoUrl && /youtu/.test(text)) {
await sock.sendMessage(m.chat, {
audio: { url: result.audioUrl },
mimetype: "audio/mpeg",
fileName: `${result.title}.mp3`
}, { quoted: m })
}
await sendWarmSticker(m.chat, m)
} catch (err) {
console.error("AHM7 Downloader Error:", err?.response?.data || err.message)
if (platform === "youtube" || ["reddit", "capcut", "snapchat", "soundcloud", "snackvideo", "douyin"].includes(platform)) {
return m.reply(`Empress could not download that link: ${err?.response?.data?.message || err.message}`)
}
try {
const result = await downloadWithBitSaver(text)
await sock.sendMessage(m.chat, {
video: { url: result.proxyUrl },
caption: `Done. Empress fetched your ${result.platform || platform} video.`,
mimetype: "video/mp4",
fileName: result.filename
}, { quoted: m })
await sendWarmSticker(m.chat, m)
} catch (fallbackErr) {
console.error("BitSaver Downloader Error:", fallbackErr?.response?.data || fallbackErr.message)
const message = fallbackErr?.response?.data?.message || fallbackErr.message || err.message || "Empress could not download that video."
await m.reply(`Empress ran into a problem with that link: ${message}`)
}
}
}
break

//=============================================//

case "kick": case "kik": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if (text || m.quoted) {
let input = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
input = resolveGroupMemberJid(input)
if (!input) return example("@tag/reply")
if (input.endsWith("@s.whatsapp.net")) {
var onWa = await sock.onWhatsApp(input.split("@")[0])
if (onWa.length < 1) return m.reply("Empress could not find that number on WhatsApp.")
}
await sock.groupParticipantsUpdate(m.chat, [input], 'remove')
return m.reply(`Done. Removed @${jidUser(input)} from the group.`)
} else {
return example("@tag/reply")
}
}
break

//=============================================//

case "kickall": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if ((args[0] || "").toLowerCase() !== "confirm") {
return m.reply(`This removes every non-admin member except owners and the bot.\n\nRun *${cmd} confirm* if you really want to continue.`)
}

const protectedJids = new Set([
botNumber,
m.sender,
...configuredOwnerJids
].map(jid => normalizeJidForCompare(sock, jid)))

const targets = (m.metadata?.participants || [])
.filter(member => !isParticipantAdmin(member))
.map(member => participantJid(member))
.filter(Boolean)
.filter(jid => !protectedJids.has(normalizeJidForCompare(sock, jid)))

if (!targets.length) return m.reply("Empress found no removable non-admin members in this group.")

await m.reply(`Empress is removing ${targets.length} group member${targets.length === 1 ? "" : "s"} now.`)
let removed = 0
let failed = 0
for (let i = 0; i < targets.length; i += 5) {
const batch = targets.slice(i, i + 5)
try {
await sock.groupParticipantsUpdate(m.chat, batch, "remove")
removed += batch.length
await sleep(700)
} catch (err) {
failed += batch.length
console.error("Kickall failed for batch", batch, err.message)
}
}

return m.reply(`Kickall finished.\nRemoved: ${removed}\nFailed: ${failed}`)
}
break

//=============================================//

case "hidetag": case "h": case "ht": case "tagall": case "everyone": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
const members = (m.metadata?.participants || []).map(member => participantJid(member)).filter(Boolean)
if (!members.length) return m.reply("Empress could not read the member list.")
if (command === "hidetag" || command === "h" || command === "ht") {
return sock.sendMessage(m.chat, { text: text || "", mentions: members }, { quoted: m })
}
const marker = `@${jidUser(m.sender)}`
let teks = `╭━━〔 📣 TAG ALL 〕━━╮
Caller: ${marker}
Message: ${text || "No message"}

${members.map(jid => `• @${jidUser(jid)}`).join("\n")}`
return sock.sendMessage(m.chat, { text: teks, mentions: [m.sender, ...members] }, { quoted: m })
}
break

//=============================================//

case "totag": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if (!m.quoted?.fakeObj) return example("reply to a message")
const members = (m.metadata?.participants || []).map(member => participantJid(member)).filter(Boolean)
if (!members.length) return m.reply("Empress could not read the member list.")
return sock.sendMessage(m.chat, {
forward: m.quoted.fakeObj,
mentions: members
})
}
break

//=============================================//

case "tag": {
if (!m.isGroup) return m.reply(mess.group)
if (!isOwner && !m.isAdmin) return m.reply(mess.admin)
const target = getTargetJid("")
if (!target) return example("@user or reply")
return sock.sendMessage(m.chat, {
text: `Tagged @${jidUser(target)}`,
mentions: [target]
}, { quoted: m })
}
break

//=============================================//

case "tagadmins": {
if (!m.isGroup) return m.reply(mess.group)
const admins = (m.metadata?.participants || [])
.filter(member => isParticipantAdmin(member))
.map(member => participantJid(member))
.filter(Boolean)
if (!admins.length) return m.reply("Empress found no admins here.")
return sock.sendMessage(m.chat, {
text: `Group admins:\n\n${admins.map((jid, index) => `${index + 1}. @${jidUser(jid)}`).join("\n")}`,
mentions: admins
}, { quoted: m })
}
break

//=============================================//

case "listmembers": {
if (!m.isGroup) return m.reply(mess.group)
const members = (m.metadata?.participants || []).map(member => participantJid(member)).filter(Boolean)
if (!members.length) return m.reply("Empress could not read the member list.")
return sock.sendMessage(m.chat, {
text: `Members (${members.length}):\n\n${members.map((jid, index) => `${index + 1}. @${jidUser(jid)}`).join("\n")}`,
mentions: members
}, { quoted: m })
}
break

//=============================================//

case "groupinfo": {
if (!m.isGroup) return m.reply(mess.group)
const admins = (m.metadata?.participants || []).filter(member => isParticipantAdmin(member))
return m.reply(`╭━━〔 👥 GROUP INFO 〕━━╮
Name: ${m.metadata?.subject || "Unknown"}
Members: ${m.metadata?.participants?.length || 0}
Admins: ${admins.length}
Bot Admin: ${m.isBotAdmin ? "Yes" : "No"}
JID: ${m.chat}`)
}
break

//=============================================//

case "listgc": {
if (!isOwner) return m.reply(mess.owner)
try {
const groups = Object.values(await sock.groupFetchAllParticipating())
if (!groups.length) return m.reply("Empress is not in any groups.")
return m.reply(`Groups:\n\n${groups.map((group, index) => `${index + 1}. ${group.subject}\n${group.id}`).join("\n\n")}`)
} catch (err) {
return m.reply(`Empress could not fetch group list: ${err.message}`)
}
}
break

//=============================================//

case "add": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
const number = text.replace(/[^0-9]/g, "")
if (!number) return example("234xxxxxxxxxx")
try {
const jid = `${number}@s.whatsapp.net`
await sock.groupParticipantsUpdate(m.chat, [jid], "add")
return m.reply(`Done. Added @${number}.`)
} catch (err) {
return m.reply(`Empress could not add that user: ${err.message}`)
}
}
break

//=============================================//

case "promote": case "demote": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
const target = getTargetJid("")
if (!target) return example("@user or reply")
try {
await sock.groupParticipantsUpdate(m.chat, [target], command)
return m.reply(`Done. @${jidUser(target)} has been ${command === "promote" ? "promoted" : "demoted"}.`)
} catch (err) {
return m.reply(`Empress could not ${command} that user: ${err.message}`)
}
}
break

//=============================================//

case "open": case "close": case "mute": case "mutegc": case "unmute": case "unmutegc": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
const mute = command === "mute" || command === "mutegc" || command === "close"
try {
await sock.groupSettingUpdate(m.chat, mute ? "announcement" : "not_announcement")
return m.reply(`Done. Group is now ${mute ? "muted for members" : "open for members"}.`)
} catch (err) {
return m.reply(`Empress could not update group messages: ${err.message}`)
}
}
break

//=============================================//

case "lockgc": case "unlockgc": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
const locked = command === "lockgc"
try {
await sock.groupSettingUpdate(m.chat, locked ? "locked" : "unlocked")
return m.reply(`Done. Group settings are now ${locked ? "locked to admins" : "open to members"}.`)
} catch (err) {
return m.reply(`Empress could not update group settings: ${err.message}`)
}
}
break

//=============================================//

case "link": case "invite": {
if (!m.isGroup) return m.reply(mess.group)
if (!m.isBotAdmin) return m.reply(mess.botadmin)
try {
const code = await sock.groupInviteCode(m.chat)
return m.reply(`https://chat.whatsapp.com/${code}`)
} catch (err) {
return m.reply(`Empress could not fetch the invite link: ${err.message}`)
}
}
break

//=============================================//

case "revoke": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
try {
await sock.groupRevokeInvite(m.chat)
const code = await sock.groupInviteCode(m.chat)
return m.reply(`Done. Invite link reset:\nhttps://chat.whatsapp.com/${code}`)
} catch (err) {
return m.reply(`Empress could not reset the invite: ${err.message}`)
}
}
break

//=============================================//

case "setgname": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if (!text) return example("New group name")
try {
await sock.groupUpdateSubject(m.chat, text)
return m.reply(`Done. Group name updated to ${text}.`)
} catch (err) {
return m.reply(`Empress could not update the group name: ${err.message}`)
}
}
break

//=============================================//

case "setdesc": case "setgdesc": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if (!text) return example("New group description")
try {
await sock.groupUpdateDescription(m.chat, text)
return m.reply("Done. Group description updated.")
} catch (err) {
return m.reply(`Empress could not update the description: ${err.message}`)
}
}
break

//=============================================//

case "setgpp": case "setppgc": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
if (!/image/.test(mime || "")) return m.reply("Reply to an image to set the group profile picture.")
try {
const media = await downloadSelectedMedia()
await sock.updateProfilePicture(m.chat, media)
return m.reply("Done. Group profile picture updated.")
} catch (err) {
return m.reply(`Empress could not update the group picture: ${err.message}`)
}
}
break

//=============================================//

case "getgpp": {
if (!m.isGroup) return m.reply(mess.group)
try {
const ppUrl = await sock.profilePictureUrl(m.chat, "image")
return sock.sendMessage(m.chat, { image: { url: ppUrl }, caption: "Group profile picture." }, { quoted: m })
} catch {
return m.reply("Empress could not find a group profile picture.")
}
}
break

//=============================================//

case "delgpp": {
const blocked = requireGroupAdmin()
if (blocked) return m.reply(blocked)
try {
await sock.removeProfilePicture(m.chat)
return m.reply("Done. Group profile picture removed.")
} catch (err) {
return m.reply(`Empress could not remove the group picture: ${err.message}`)
}
}
break

//=============================================//

case "join": case "joingroup": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return example("https://chat.whatsapp.com/xxxx")
const code = (text.split("chat.whatsapp.com/")[1] || text).split("?")[0].split("/")[0]
if (!code) return m.reply("That invite link does not look valid.")
try {
await sock.groupAcceptInvite(code)
return m.reply("Done. Empress joined the group.")
} catch (err) {
return m.reply(`Empress could not join that group: ${err.message}`)
}
}
break

//=============================================//

case "left": case "leavegroup": {
if (!isOwner) return m.reply(mess.owner)
if (!m.isGroup) return m.reply(mess.group)
await m.reply("Empress is leaving this group now.")
await sock.groupLeave(m.chat)
}
break

//=============================================//

case "gconly": case "grouponly": {
    if (!isOwner) return m.reply(mess.owner)

    if (!text || !/^(on|off)$/i.test(text.trim())) {
        const status = gconly ? "Active" : "Inactive"
        return m.reply(`\nEmpress needs one option here.\nTry: *${cmd}* on/off\n\nGlobal Group Only status: *${status}*`)
    }

    const input = text.toLowerCase().trim()

    if (input === "on") {
        if (gconly) return m.reply("Group Only is already active, love.")
        gconly = true
        fs.writeFileSync("./lib/database/gconly.json", JSON.stringify(true, null, 2))
        return m.reply("Group Only is now active for everyone. Empress will only respond in groups.")
    }

    if (input === "off") {
        if (!gconly) return m.reply("Group Only is already off, love.")
        gconly = false
        fs.writeFileSync("./lib/database/gconly.json", JSON.stringify(false, null, 2))
        return m.reply("Group Only is now off. Empress can respond in private chats again.")
    }
}
break

//=============================================//

case "antilink": case "antilinkgc": {
if (!isOwner) return m.reply(mess.owner);
if (!m.isGroup) return m.reply(mess.group);

let room = antilink.find((i) => i.id == m.chat);

if (!args[0] || !args[1]) return example(`kick/nokick on/off\n\n*Group Antilink status:* ${room ? `Active (${room.kick ? "kick" : "no kick"})` : "Inactive"}`)

let mode = args[0].toLowerCase();
let state = args[1].toLowerCase();
let isOn = /on/g.test(state);
let isOff = /off/g.test(state);

if (!["kick", "nokick", "kik", "nokik"].includes(mode)) return example(`kick/nokick on/off\n\n*Group Antilink status:* ${room ? `Active (${room.kick ? "kick" : "no kick"})` : "Inactive"}`)

if (!isOn && !isOff) return example(`kick/nokick on/off\n\n*Group Antilink status:* ${room ? `Active (${room.kick ? "kick" : "no kick"})` : "Inactive"}`)

let shouldKick = mode === "kick" || mode === "kik";

if (isOn) {
if (room && room.kick === shouldKick)
return m.reply(
`Group Antilink ${shouldKick ? "kick" : "no kick"} is already active here, love.`
);

if (room) {
let ind = antilink.indexOf(room);
antilink.splice(ind, 1);
}

antilink.push({ id: m.chat, kick: shouldKick });
fs.writeFileSync("./lib/database/antilink.json", JSON.stringify(antilink, null, 2));
return m.reply(
`Group Antilink ${shouldKick ? "kick" : "no kick"} is now active. Empress will keep watch.`
);
} else if (isOff) {
if (!room || room.kick !== shouldKick)
return m.reply(
`Group Antilink ${shouldKick ? "kick" : "no kick"} is already off here, love.`
);

let ind = antilink.indexOf(room);
antilink.splice(ind, 1);
fs.writeFileSync("./lib/database/antilink.json", JSON.stringify(antilink, null, 2));
return m.reply(
`Group Antilink ${shouldKick ? "kick" : "no kick"} is now off.`
);
}
}
break

//=============================================//

case "welcome": case "welkam": {
if (!isOwner) return m.reply(mess.owner)
if (!m.isGroup) return m.reply(mess.group)

if (!text || !/^(on|off)$/i.test(text.trim())) {
const status = welcome.includes(m.chat) ? "Active" : "Inactive"
return m.reply(`\nEmpress needs one option here.\nTry: *${cmd}* on/off\n\nWelcome status in this group: *${status}*`)
}

const input = text.toLowerCase().trim()

if (input === "on") {
if (welcome.includes(m.chat)) {
return m.reply("Welcome is already active in this group, love.")
}
welcome.push(m.chat)
fs.writeFileSync("./lib/database/welcome.json", JSON.stringify(welcome, null, 2))
return m.reply("Welcome is now active for this group. Empress will greet new members warmly.")
}

if (input === "off") {
if (!welcome.includes(m.chat)) {
return m.reply("Welcome is already off in this group, love.")
}
const index = welcome.indexOf(m.chat)
welcome.splice(index, 1)
fs.writeFileSync("./lib/database/welcome.json", JSON.stringify(welcome, null, 2))
return m.reply("Welcome is now off for this group.")
}
}
break

//=============================================//

case "vv": case "rvo": case "readviewonce": {
if (!m.quoted) return example("reply to a view-once message")

let msg = m.quoted.fakeObj.message
let type = Object.keys(msg)[0]
if (!msg[type].viewOnce && m.quoted.mtype !== "viewOnceMessageV2") return m.reply("That message is not view-once, love.")
let media = await downloadContentFromMessage(msg[type], type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio')
let buffer = Buffer.from([])
for await (const chunk of media) {
buffer = Buffer.concat([buffer, chunk])
}
if (/video/.test(type)) {
return sock.sendMessage(m.chat, {video: buffer, caption: msg[type].caption || ""}, {quoted: m})
} else if (/image/.test(type)) {
return sock.sendMessage(m.chat, {image: buffer, caption: msg[type].caption || ""}, {quoted: m})
} else if (/audio/.test(type)) {
return sock.sendMessage(m.chat, {audio: buffer, mimetype: "audio/mpeg", ptt: true}, {quoted: m})
} 
}
break

//=============================================//

case "self": case "private": case "public": {
if (!isOwner) return m.reply(mess.owner)
let status = command === "public"
sock.public = status
fs.writeFileSync("./lib/database/mode.json", JSON.stringify({ public: status }, null, 2))
return m.reply(`Done. Empress switched to *${status ? "public" : "private"}* mode.`)
}
break

//=============================================//

case "prefix": {
if (!isOwner) return m.reply(mess.owner)
const currentPrefix = readPrefixSetting()
return m.reply(`Current prefix: *${currentPrefix}*

Change it with:
${currentPrefix}setprefix ,
${currentPrefix}setprefix ?

Reset it with:
${currentPrefix}resetprefix`)
}
break

//=============================================//

case "setprefix": {
if (!isOwner) return m.reply(mess.owner)
const nextPrefix = String(args[0] || "").trim()
if (!nextPrefix) return example(",")
if (nextPrefix.length > 3 || /\s/.test(nextPrefix) || /[a-z0-9]/i.test(nextPrefix)) {
return m.reply("Please choose a short symbol prefix only, like `.`, `,`, `?`, `!`, or `#`.")
}
savePrefixSetting(nextPrefix)
m.prefix = nextPrefix
return m.reply(`Done. Prefix changed to *${nextPrefix}*

Try it now:
${nextPrefix}menu
${nextPrefix}prefix`)
}
break

//=============================================//

case "resetprefix": {
if (!isOwner) return m.reply(mess.owner)
savePrefixSetting(".")
m.prefix = "."
return m.reply(`Done. Prefix reset to *.*

Try it now:
.menu`)
}
break

//=============================================//

case "rentbot": case "pair": case "bot": {
if (!isOwner) return m.reply(mess.owner)
const phone = normalizePhoneNumber(text)
if (!phone || phone.length < 7) return example("234xxxxxxxxxx")
const rentDb = readRentSessions()
const existingSession = rentDb.sessions.find(session => session.number === phone)
if (existingSession) {
return m.reply(`A rent session for +${phone} already exists.

Folder: ${existingSession.sessionDir || getRentSessionDir(phone)}
Use *${m.prefix}listrent* to check status or *${m.prefix}delrent ${phone}* to remove it.`)
}
const sessionName = `rent_${phone}`
const sessionDir = getRentSessionDir(phone)
const configFile = `./lib/database/${sessionName}.json`
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })
writeJsonFile(configFile, {
number: phone,
sessionId: sessionName,
sessionDir,
prefix: readPrefixSetting(),
botName: namabot,
ownerNumber: jidUser(configuredOwnerJids[0] || global.owner),
createdAt: new Date().toISOString(),
active: false
})
rentDb.sessions.push({
number: phone,
configPath: configFile,
sessionDir,
active: false,
paired: false,
createdAt: new Date().toISOString()
})
saveRentSessions(rentDb)

let pairNote = "Restart the panel to load this rent session and generate the pairing code."
if (typeof global.startEmpireRentSession === "function") {
try {
await global.startEmpireRentSession(phone, sessionDir, {
requirePairingCode: true,
throwOnPairingError: true,
onPairingCode: async (code) => {
pairNote = `Pairing code: ${code}

Open WhatsApp > Linked Devices > Link with phone number.`
}
})
} catch (err) {
pairNote = `Registered, but live pairing did not start: ${err.message}

Restart the panel or run the command again after the main bot is fully online.`
}
}
return m.reply(`Session registered for +${phone}.

Folder: sessions/rent/${phone}
Config: lib/database/${sessionName}.json

${pairNote}`)
}
break

//=============================================//

case "listrent": case "rentlist": {
if (!isOwner) return m.reply(mess.owner)
const rentDb = readRentSessions()
if (!rentDb.sessions.length) return m.reply("No rented sessions registered.")
const list = rentDb.sessions.map((session, index) => {
const status = session.active ? "active" : session.paired ? "paired" : "pending"
const dir = session.sessionDir || getRentSessionDir(session.number)
return `${index + 1}. +${session.number} - ${status}
   ${dir}`
}).join("\n")
return m.reply(`╭━━〔 RENT SESSIONS 〕━━╮\n${list}`)
}
break

//=============================================//

case "rentstatus": {
if (!isOwner) return m.reply(mess.owner)
const phone = normalizePhoneNumber(text)
if (!phone || phone.length < 7) return example("234xxxxxxxxxx")
const rentDb = readRentSessions()
const session = rentDb.sessions.find(item => item.number === phone)
if (!session) return m.reply(`No rent session found for +${phone}.`)
const sessionDir = session.sessionDir || getRentSessionDir(phone)
const configFile = session.configPath || `./lib/database/rent_${phone}.json`
return m.reply(`Rent session +${phone}

Status: ${session.active ? "active" : session.paired ? "paired" : "pending"}
Folder: ${sessionDir}
Config: ${configFile}
Created: ${session.createdAt || "unknown"}
Paired: ${session.pairedAt || "not yet"}`)
}
break

//=============================================//

case "delrent": case "delrentbot": {
if (!isOwner) return m.reply(mess.owner)
const phone = normalizePhoneNumber(text)
if (!phone || phone.length < 7) return example("234xxxxxxxxxx")
const rentDb = readRentSessions()
const index = rentDb.sessions.findIndex(session => session.number === phone)
if (index === -1) return m.reply(`No rent session found for +${phone}.`)
const [session] = rentDb.sessions.splice(index, 1)
saveRentSessions(rentDb)
const configFile = session.configPath || `./lib/database/rent_${phone}.json`
const sessionDir = session.sessionDir || getRentSessionDir(phone)
try {
if (fs.existsSync(configFile)) fs.rmSync(configFile, { force: true })
if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
} catch (err) {
console.error("Delete rent session failed:", err.message)
return m.reply(`Removed +${phone} from rent database, but file cleanup failed: ${err.message}`)
}
return m.reply(`Deleted rent session for +${phone}.

Restart the panel to stop it if it is currently online.`)
}
break

//=============================================//

case "addowner": case "addowenr": {
if (!isOwner) return m.reply(mess.owner)
const rawInput = text.trim()
const quotedTarget = m.quoted?.sender || m.quoted?.participant || m.quoted?.key?.participant
const input = m.mentionedJid?.[0] || quotedTarget || rawInput.replace(/^lid[:\s]+/i, "").replace(/[^0-9@.a-z]/gi, "")
if (!input) return example("234xxxxxxxxxx, lid 298xxxxxxxxxx, @tag, or reply to a user")
const isLidInput = /@lid$/i.test(input) || /^lid[:\s]+/i.test(rawInput) || (quotedTarget && /@lid$/i.test(quotedTarget))
const jid = input.includes("@") ? normalizeJidForCompare(sock, input) : isLidInput ? lidToJid(input) : ownerToJid(input)
const normalized = normalizeJidForCompare(sock, jid)
if (!normalized) return example("234xxxxxxxxxx, lid 298xxxxxxxxxx, @tag, or reply to a user")
const ownerUsers = readOwnerUsers()
const allOwners = getConfiguredOwnerJids().map(owner => normalizeJidForCompare(sock, owner))
if (allOwners.includes(normalized)) return m.reply("That user is already an owner.")
ownerUsers.push(normalized)
saveOwnerUsers(ownerUsers)
const nextSudo = sudoUsers.filter(user => normalizeJidForCompare(sock, user) !== normalized)
if (nextSudo.length !== sudoUsers.length) saveSudoUsers(nextSudo)
return m.reply(`Done. Added @${jidUser(normalized)} as owner. They now have owner privileges.`)
}
break

//=============================================//

case "delowner": {
if (!isOwner) return m.reply(mess.owner)
const rawInput = text.trim()
const quotedTarget = m.quoted?.sender || m.quoted?.participant || m.quoted?.key?.participant
const input = m.mentionedJid?.[0] || quotedTarget || rawInput.replace(/^lid[:\s]+/i, "").replace(/[^0-9@.a-z]/gi, "")
if (!input) return example("234xxxxxxxxxx, lid 298xxxxxxxxxx, @tag, or reply to a user")
const isLidInput = /@lid$/i.test(input) || /^lid[:\s]+/i.test(rawInput) || (quotedTarget && /@lid$/i.test(quotedTarget))
const jid = input.includes("@") ? normalizeJidForCompare(sock, input) : isLidInput ? lidToJid(input) : ownerToJid(input)
const normalized = normalizeJidForCompare(sock, jid)
const configOwnerJids = [
global.owner,
...(Array.isArray(global.owners) ? global.owners : []),
...(Array.isArray(global.ownerLids) ? global.ownerLids.map(lidToJid) : [])
].map(owner => normalizeJidForCompare(sock, ownerToJid(owner))).filter(Boolean)
if (configOwnerJids.includes(normalized)) return m.reply("That owner is set in config.js, so I will not remove it from chat.")
const ownerUsers = readOwnerUsers()
const nextOwners = ownerUsers.filter(owner => normalizeJidForCompare(sock, owner) !== normalized)
if (nextOwners.length === ownerUsers.length) return m.reply("That user is not in the command-added owner list.")
saveOwnerUsers(nextOwners)
return m.reply(`Done. Removed @${jidUser(normalized)} from command-added owners.`)
}
break

//=============================================//

case "listowner": case "owners": {
if (!isOwner) return m.reply(mess.owner)
const owners = getConfiguredOwnerJids()
if (!owners.length) return m.reply("No owners are configured yet.")
return m.reply(`Owners:\n\n${owners.map((jid, index) => `${index + 1}. @${jidUser(jid)}`).join("\n")}`)
}
break

//=============================================//

case "addsudo": {
if (!isOwner) return m.reply(mess.owner)
const input = m.mentionedJid?.[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "")
if (!input) return example("234xxxxxxxxxx or reply to a user")
const jid = input.includes("@") ? normalizeJidForCompare(sock, input) : `${input}@s.whatsapp.net`
const normalized = normalizeJidForCompare(sock, jid)
if (ownerCompareJids.includes(normalized)) return m.reply("That user is an owner already, so they do not need sudo.")
if (sudoUsers.map(user => normalizeJidForCompare(sock, user)).includes(normalized)) {
return m.reply("That user is already sudo, love.")
}
sudoUsers.push(normalized)
saveSudoUsers(sudoUsers)
return m.reply(`Done. Added @${jidUser(normalized)} as sudo. They can use bot commands even in private mode.`)
}
break

//=============================================//

case "delsudo": {
if (!isOwner) return m.reply(mess.owner)
const input = m.mentionedJid?.[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "")
if (!input) return example("234xxxxxxxxxx or reply to a user")
const jid = input.includes("@") ? normalizeJidForCompare(sock, input) : `${input}@s.whatsapp.net`
const normalized = normalizeJidForCompare(sock, jid)
const nextSudo = sudoUsers.filter(user => normalizeJidForCompare(sock, user) !== normalized)
if (nextSudo.length === sudoUsers.length) return m.reply("That user is not in the sudo list.")
saveSudoUsers(nextSudo)
return m.reply(`Done. Removed @${jidUser(normalized)} from sudo.`)
}
break

//=============================================//

case "listsudo": {
if (!isOwner) return m.reply(mess.owner)
if (!sudoUsers.length) return m.reply("No sudo users added yet.")
return m.reply(`Sudo users:\n\n${sudoUsers.map((jid, index) => `${index + 1}. @${jidUser(jid)}`).join("\n")}`)
}
break

//=============================================//

case "getcase": { 
if (!isOwner) return m.reply(mess.owner);
if (!text) return example("the case name")
try {
let hasil = Case.get(text);
m.reply(hasil);
} catch (e) {
m.reply(e.message);
}
}
break;

//=============================================//

case "addcase": {
if (!isOwner) return m.reply(mess.owner);
if (!text) return example("the case code")
try {
Case.add(text);
reply("Done. Empress added the case.")
} catch (e) {
reply(e.message);
}
}
break;

//=============================================//

case "delcase": {
if (!isOwner) return m.reply(mess.owner);
if (!text) return example("the case name")
try {
Case.delete(text);
reply(`Done. Empress deleted the "${text}" case.`)
} catch (e) {
reply(e.message);
}
}
break;

//=============================================//

case "listcase": {
if (!isOwner) return m.reply(mess.owner);
try {
reply("📜 List Case:\n\n" + Case.list());
} catch (e) {
m.reply(e.message);
}
}
break;

//=============================================//

case "developerbot": case "owner": case "own": case "dev": {
const ownerNumbers = configuredOwnerJids.map(jidUser)
await sock.sendContact(m.chat, ownerNumbers, null)
await reply(`Hi @${m.sender.split("@")[0]}, these are my configured owners.`)
}
break

//=============================================//

case "tourl": { 
if (!/image/.test(mime)) return m.reply("Please send or reply to a photo, love.")
const { ImageUploadService } = require('node-upload-images');
try {
let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
const service = new ImageUploadService('pixhost.to');
let buffer = fs.readFileSync(mediaPath);
let { directLink } = await service.uploadFromBinary(buffer, 'jarroffc.png');
await sendTextWithSticker(m.chat, directLink, {}, m)
await fs.unlinkSync(mediaPath);
} catch (err) {
console.error("Tourl Error:", err);
m.reply("Empress could not turn that media into a URL. Please try again.")
}
}
break;

//=============================================//

case "cekidch": case "idch": {
if (!text) return example("the channel link")
if (!text.includes("https://whatsapp.com/channel/")) return m.reply("That channel link does not look valid, love.")
let result = text.split('https://whatsapp.com/channel/')[1]
let res = await sock.newsletterMetadata("invite", result)
let teks = `${res.id}

* ${res.name}
* ${res.subscribers} followers`
return m.reply(teks)
}
break

//=============================================//

case "ping": case "uptime": {
let timestamp = speed();
let latensi = speed() - timestamp;
let tio = await nou.os.oos();
var tot = await nou.drive.info();
let respon = `*Server VPS Info*
- *Platform :* ${nou.os.type()}
- *Total RAM :* ${formatp(os.totalmem())}
- *Total Disk :* ${tot.totalGb} GB
- *Total CPU :* ${os.cpus().length} Core
- *VPS Runtime :* ${runtime(os.uptime())}

*Panel Server Info*
- *Response Speed :* ${latensi.toFixed(4)} seconds
- *Runtime Bot :* ${runtime(process.uptime())}`
await m.reply(respon)
}
break

//=============================================//

case "support": case "donate": case "pay": case "payment": {
const supportText = `╭━━〔 SUPPORT ${namabot.toUpperCase()} 〕━━╮
Thanks for wanting to support the bot.

Contact owner:
@${jidUser(configuredOwnerJids[0] || global.owner)} / ${namaowner}

Channel:
${global.linksaluran || "Not configured"}

Ask the owner for current payment details before sending anything.`
return sock.sendMessage(m.chat, { text: supportText, mentions: configuredOwnerJids }, { quoted: m })
}
break

//=============================================//

case "balance": {
if (!m.isGroup) return m.reply(mess.group)
const who = m.mentionedJid?.[0] || m.sender
const user = getGameUser(who)
return sendImageCaption(gameFrame("🏦 BANK CHECK 💳", `│ 👤 User: @${jidUser(who)}
│ 💵 Wallet: ${formatMoney(user.money)}
│ 🏛️ Bank: ${formatMoney(user.bank)} / ${formatMoney(user.fullatm)}
│ 💳 ATM: Level ${user.atm}
│ ✨ Exp: ${formatMoney(user.exp)}
│ 🪵 Wood: ${formatMoney(user.wood)}
│ 🎰 Chip: ${formatMoney(user.chip)}
│ Rank: ${gameStars(Math.min(6, Math.max(1, user.atm || 1)))}`), "balance", "", { mentions: [who] })
}
break

//=============================================//

case "leaderboard": {
if (!m.isGroup) return m.reply(mess.group)
const type = (args[0] || "money").toLowerCase()
const allowed = ["money", "exp", "wood", "bank", "chip"]
if (!allowed.includes(type)) return m.reply(`Choose a leaderboard:
${allowed.map(item => `- ${m.prefix}${command} ${item}`).join("\n")}`)
const users = Object.entries(global.db?.users || {})
.map(([jid, data]) => ({ jid, value: Number(getGameUser(jid)[type] || 0) }))
.filter(item => item.value > 0)
.sort((a, b) => b.value - a.value)
.slice(0, 10)
if (!users.length) return m.reply(`No ${type} leaderboard data yet.`)
const mentions = users.map(item => item.jid)
const rows = users.map((item, index) => `│ ${index + 1}. ${index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔹"} @${jidUser(item.jid)} - ${formatMoney(item.value)}`).join("\n")
return sendImageCaption(gameFrame(`🏆 LEADERBOARD: ${type.toUpperCase()} 🏆`, rows, `🔥 Top rank: ${gameStars(Math.min(6, users.length || 1))}`), "leaderboard", "", { mentions })
}
break

//=============================================//

case "woodcut": {
if (!m.isGroup) return m.reply(mess.group)
const user = getGameUser(m.sender)
const cooldown = 30 * 60 * 1000
const remaining = cooldown - (Date.now() - user.lastparming)
if (remaining > 0) return m.reply(`You are tired from chopping wood. Rest for ${formatDuration(remaining)}.`)
const wood = randomInt(8, 50)
const money = randomInt(1000, 50000)
user.wood += wood
user.money += money
user.lastparming = Date.now()
saveGameDb()
return sendImageCaption(gameFrame("🪓 WOOD RUN 🌲", `│ 🪵 Harvest: +${wood} wood
│ 💰 Earned: +${formatMoney(money)} money
│ 💵 Balance: ${formatMoney(user.money)}
│ 🌳 Storage: ${formatMoney(user.wood)} wood
│ Luck: ${gameStars(Math.min(6, Math.ceil(wood / 9)))}`, "🌲 The forest paid tribute to the empire."), "woodcut")
}
break

//=============================================//

case "work": {
if (!m.isGroup) return m.reply(mess.group)
const user = getGameUser(m.sender)
const cooldown = 5 * 60 * 1000
const remaining = cooldown - (Date.now() - user.lastwork)
if (remaining > 0) return m.reply(`You already worked recently. Rest for ${formatDuration(remaining)}.`)
const jobs = {
driver: ["drove a client across town", "traffic tried its best, but you were smoother"],
trader: ["sold out your market stall", "customers came back twice"],
doctor: ["handled a clinic rush", "your patient left smiling"],
farmer: ["brought in a fresh harvest", "the farm finally paid you back"],
mechanic: ["fixed a stubborn engine", "the workshop is proud"],
builder: ["finished a heavy build", "hard work, honest pay"]
}
const type = (args[0] || "").toLowerCase()
if (!jobs[type]) {
return m.reply(`Choose a job:
${Object.keys(jobs).map(job => `- ${m.prefix}${command} ${job}`).join("\n")}`)
}
const pay = randomInt(15000, 150000)
const exp = randomInt(25, 150)
user.money += pay
user.exp += exp
user.lastwork = Date.now()
saveGameDb()
return sendImageCaption(gameFrame(`⚒️ WORK: ${type.toUpperCase()} 💼`, `│ ✅ Task: ${jobs[type][0]}
│ 💬 ${jobs[type][1]}.
│ 💰 Pay: +${formatMoney(pay)}
│ ✨ Exp: +${formatMoney(exp)}
│ 💵 Balance: ${formatMoney(user.money)}
│ Rating: ${gameStars(Math.min(6, Math.ceil(pay / 25000)))}`, "📜 Honest work, imperial reward."), "work", `${type} work`)
}
break

//=============================================//

case "casino": {
if (!m.isGroup) return m.reply(mess.group)
sock.casino = sock.casino || {}
if (sock.casino[m.chat]) return m.reply("A casino round is already running in this group.")
const user = getGameUser(m.sender)
const bet = Math.max(1, /all/i.test(args[0] || "") ? user.money : parseInt(args[0] || "0", 10))
if (!bet) return example("500")
if (user.money < bet) return m.reply(`You need ${formatMoney(bet)} money. Current balance: ${formatMoney(user.money)}.`)
sock.casino[m.chat] = true
try {
user.money -= bet
const player = randomInt(1, 100)
const dealer = randomInt(1, 100)
let result = "You lost this roll."
let payout = 0
if (player > dealer) {
payout = bet * 2
result = "You win."
} else if (player === dealer) {
payout = bet
result = "Draw. Bet returned."
}
user.money += payout
user.exp += randomInt(5, 25)
saveGameDb()
const casinoStars = player > dealer ? gameStars(5) : player === dealer ? gameStars(3) : gameStars(1)
const casinoMood = player > dealer ? "🎉 JACKPOT ENERGY" : player === dealer ? "🤝 TABLE STALEMATE" : "💀 HOUSE STRIKES"
return sendImageCaption(gameFrame("🎲 CASINO ROYALE 🎲", `│ 🧑 You: ${player}
│ 🎩 Dealer: ${dealer}
│ 💸 Bet: ${formatMoney(bet)}
│ 💵 Payout: ${formatMoney(payout)}
│ ${casinoStars}
│ ${casinoMood}
│ 📣 Result: ${result}
│ 💰 Balance: ${formatMoney(user.money)}`), "casino")
} finally {
delete sock.casino[m.chat]
}
}
break

//=============================================//

case "slot": {
if (!m.isGroup) return m.reply(mess.group)
sock.slots = sock.slots || {}
if (sock.slots[m.chat]) return m.reply("The slot machine is already spinning here.")
const user = getGameUser(m.sender)
const bet = Math.max(1, /all/i.test(args[0] || "") ? user.money : parseInt(args[0] || "0", 10))
if (!bet) return example("500")
if (user.money < bet) return m.reply(`You need ${formatMoney(bet)} money. Current balance: ${formatMoney(user.money)}.`)
sock.slots[m.chat] = true
try {
user.money -= bet
const icons = ["7️⃣", "🍒", "⭐", "💎", "👑", "🔔"]
const spin = () => Array.from({ length: 9 }, () => icons[randomInt(0, icons.length - 1)])
for (let i = 0; i < 2; i++) {
const preview = spin()
await m.reply(gameFrame("🎰 SLOT SPINNING 🎰", `│ ${preview.slice(0, 3).join(" │ ")}
│ ${preview.slice(3, 6).join(" │ ")}  ⬅️
│ ${preview.slice(6, 9).join(" │ ")}`, "✨ Reels are dancing..."))
await sleep(650)
}
const reels = spin()
const lines = [
reels.slice(0, 3),
reels.slice(3, 6),
reels.slice(6, 9),
[reels[0], reels[4], reels[8]],
[reels[2], reels[4], reels[6]]
]
const winningLines = lines.filter(line => line.every(item => item === line[0])).length
const payout = winningLines >= 3 ? bet * 5 : winningLines === 2 ? bet * 3 : winningLines === 1 ? bet * 2 : 0
user.money += payout
user.exp += randomInt(3, 18)
saveGameDb()
return sendImageCaption(gameFrame("🎰 SLOT RESULT 🎰", `│ ${reels.slice(0, 3).join(" │ ")}
│ ${reels.slice(3, 6).join(" │ ")}  ⬅️
│ ${reels.slice(6, 9).join(" │ ")}
│
│ 💸 Bet: ${formatMoney(bet)}
│ 🔥 Winning lines: ${winningLines}
│ 💵 Payout: ${formatMoney(payout)}
│ 💰 Balance: ${formatMoney(user.money)}
│ Luck: ${gameStars(Math.max(1, Math.min(6, winningLines + 1)))}`), "slot")
} finally {
delete sock.slots[m.chat]
}
}
break

//=============================================//

case "blackjack": {
if (!m.isGroup) return m.reply(mess.group)
sock.blackjack = sock.blackjack || {}
const action = (args[0] || "help").toLowerCase()
const session = sock.blackjack[m.chat]
const user = getGameUser(m.sender)
if (action === "help") {
return m.reply(`Blackjack commands:
${m.prefix}blackjack start 1000
${m.prefix}blackjack hit
${m.prefix}blackjack stand
${m.prefix}blackjack double
${m.prefix}blackjack end

Beat the dealer without going over 21.`)
}
if (action === "end") {
if (!session) return m.reply("No blackjack table is active here.")
if (session.playerJid !== m.sender && !isOwner) return m.reply("Only the current player or owner can close this table.")
delete sock.blackjack[m.chat]
return m.reply("Blackjack table closed.")
}
if (action === "start") {
if (session && !session.done) return sock.sendMessage(m.chat, {
text: `A blackjack table is already active for @${jidUser(session.playerJid)}.`,
mentions: [session.playerJid]
}, { quoted: m })
const bet = Math.max(1, parseInt(args[1] || "1000", 10))
if (user.money < bet) return m.reply(`You need ${formatMoney(bet)} money. Current balance: ${formatMoney(user.money)}.`)
user.money -= bet
const next = {
playerJid: m.sender,
bet,
deck: createDeck(),
player: [],
dealer: [],
done: false,
payout: 0,
result: ""
}
next.player.push(drawCard(next), drawCard(next))
next.dealer.push(drawCard(next), drawCard(next))
sock.blackjack[m.chat] = next
if (scoreCards(next.player) === 21) {
finishBlackjack(next)
user.money += next.payout
delete sock.blackjack[m.chat]
}
saveGameDb()
return sendImageCaption(renderBlackjack(next, m.prefix), "blackjack")
}
if (!session) return m.reply(`No active blackjack table. Start one with ${m.prefix}blackjack start 1000.`)
if (session.playerJid !== m.sender) return sock.sendMessage(m.chat, {
text: `This table belongs to @${jidUser(session.playerJid)}.`,
mentions: [session.playerJid]
}, { quoted: m })
if (action === "hit") {
session.player.push(drawCard(session))
if (scoreCards(session.player) >= 21) {
finishBlackjack(session)
user.money += session.payout
delete sock.blackjack[m.chat]
saveGameDb()
}
return sendImageCaption(renderBlackjack(session, m.prefix), "blackjack")
}
if (action === "stand") {
finishBlackjack(session)
user.money += session.payout
delete sock.blackjack[m.chat]
saveGameDb()
return sendImageCaption(renderBlackjack(session, m.prefix), "blackjack")
}
if (action === "double") {
if (session.player.length !== 2) return m.reply("Double is only allowed on your first move.")
if (user.money < session.bet) return m.reply(`You need another ${formatMoney(session.bet)} to double.`)
user.money -= session.bet
session.bet *= 2
session.player.push(drawCard(session))
finishBlackjack(session)
user.money += session.payout
delete sock.blackjack[m.chat]
saveGameDb()
return sendImageCaption(renderBlackjack(session, m.prefix), "blackjack")
}
return m.reply(`Unknown blackjack action. Try ${m.prefix}blackjack help.`)
}
break

//=============================================//

case "ttt": case "ttc": case "tictactoe": {
sock.tictactoe = sock.tictactoe || {}
const active = getActiveTicTacToeRoom(sock.tictactoe, m.sender)
if (active) return m.reply("You are already in a TicTacToe game. Finish it or type surrender.")
const roomName = text.trim().toLowerCase()
const waitingRoom = Object.values(sock.tictactoe).find(room => room.state === "WAITING" && (roomName ? room.name === roomName : true))

if (waitingRoom) {
if (waitingRoom.playerX === m.sender) return m.reply("You cannot join your own TicTacToe room.")
waitingRoom.playerO = m.sender
waitingRoom.state = "PLAYING"
waitingRoom.turn = waitingRoom.playerX
clearTimeout(waitingRoom.timer)
waitingRoom.timer = setTimeout(() => {
delete sock.tictactoe[waitingRoom.id]
sock.sendMessage(waitingRoom.chat, { text: "TicTacToe room expired because no one moved for a while." }).catch(() => {})
}, 10 * 60 * 1000)
return sock.sendMessage(m.chat, {
text: `TicTacToe started.\n\n${renderTicTacToe(waitingRoom)}\n\n❌ @${jidUser(waitingRoom.playerX)}\n⭕ @${jidUser(waitingRoom.playerO)}\n\nTurn: @${jidUser(waitingRoom.turn)}\nSend a number from 1-9.`,
mentions: [waitingRoom.playerX, waitingRoom.playerO, waitingRoom.turn]
}, { quoted: m })
}

const id = `tictactoe-${Date.now()}`
sock.tictactoe[id] = {
id,
name: roomName,
chat: m.chat,
state: "WAITING",
playerX: m.sender,
playerO: "",
turn: "",
board: Array(9).fill(null),
timer: setTimeout(() => {
delete sock.tictactoe[id]
sock.sendMessage(m.chat, { text: "TicTacToe room expired. Start a new one when you are ready." }).catch(() => {})
}, 3 * 60 * 1000)
}
return m.reply(`TicTacToe room created. Waiting for another player.\n\n${roomName ? `Room: ${roomName}\n` : ""}Second player should send:\n${m.prefix}${command}${roomName ? ` ${roomName}` : ""}`)
}
break

//=============================================//

case "delttt": case "delttc": {
sock.tictactoe = sock.tictactoe || {}
const rooms = Object.values(sock.tictactoe).filter(room => isOwner || [room.playerX, room.playerO].includes(m.sender) || room.chat === m.chat)
if (!rooms.length) return m.reply("No TicTacToe room found to delete.")
for (const room of rooms) {
clearTimeout(room.timer)
delete sock.tictactoe[room.id]
}
return m.reply(`Deleted ${rooms.length} TicTacToe room${rooms.length === 1 ? "" : "s"}.`)
}
break

//=============================================//

case "crashempire": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);

for (let i = 0; i < 100; i++) {
await sleep(500)
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "crashempire2": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);


for (let i = 0; i < 150; i++) {
await sleep(500);
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "crashempire3": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);


for (let i = 0; i < 150; i++) {
await sleep(500);
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "crashempire4": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);


for (let i = 0; i < 150; i++) {
await sleep(500);
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "crashempire5": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);


for (let i = 0; i < 150; i++) {
await sleep(500);
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "crashempire6": { // case bug
if (!isOwner) return m.reply(mess.owner);
if (!q) return example("62xxx")

let memek = q.replace(/[^0-9]/g, "");
if (memek.startsWith('0')) return m.reply(`Please start with the country code instead of 0.\nExample: ${m.prefix + command} 234xxx`);

let target = `${memek}@s.whatsapp.net`;

m.reply(`\n*✅ Success send ${command} to ${memek}*\n`)
console.log(`
${chalk.yellow.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.yellow.bold("┃")} ${chalk.yellow.bold("( ⏳ ) Waiting")} 
${chalk.yellow.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.yellow.bold("┃")} ${chalk.white.bold("- Status : Process")}
${chalk.yellow.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);


for (let i = 0; i < 150; i++) {
await sleep(500);
}
console.log(`
${chalk.green.bold("┏━━━━━━━━━━━━━━━━━━━━┓")}
${chalk.green.bold("┃")} ${chalk.green.bold("( ✅ ) Success")} 
${chalk.green.bold("┣━━━━━━━━━━━━━━━━━━━━┫")}
${chalk.green.bold("┃")} ${chalk.white.bold("- Command : " + command)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Number : " + memek)}
${chalk.green.bold("┃")} ${chalk.white.bold("- Status : Done")}
${chalk.green.bold("┗━━━━━━━━━━━━━━━━━━━━┛")}
`);
}
break

//=============================================//

case "backupsc":
case "bck":
case "backup": { 
if (!isOwner) return m.reply(mess.owner);
try {
const tmpDir = "./lib/database/Sampah";
if (fs.existsSync(tmpDir)) {
const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
for (let file of files) {
fs.unlinkSync(`${tmpDir}/${file}`);
}
}

await m.reply("Empress is preparing your backup now. One moment, love.");

const name = `${namabot.replace(/\s+/g, "_")}_Version${versisc.replace(/\s+/g, "_")}`;
const exclude = ["node_modules", "Session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

if (!filesToZip.length) return m.reply("Empress could not find any files to back up.");

console.log("Files to zip:", filesToZip);
execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

if (!fs.existsSync(`./${name}.zip`)) return m.reply("Empress could not create the ZIP file.");

await sock.sendMessage(m.sender, {
document: fs.readFileSync(`./${name}.zip`),
fileName: `${name}.zip`,
mimetype: "application/zip"
}, { quoted: m });

fs.unlinkSync(`./${name}.zip`);

if (m.chat !== m.sender) m.reply("Done. Empress sent the bot script to your private chat.");
} catch (err) {
console.error("Backup Error:", err);
m.reply("Empress ran into a problem while making the backup. Please try again.");
}
}
break

//=============================================//

default:
if (m.text.toLowerCase().startsWith("xx")) {
if (!isOwner) return;

try {
const result = await eval(`(async () => { ${text} })()`);
const output = typeof result !== "string" ? util.inspect(result) : result;
return sock.sendMessage(m.chat, { text: formatDialogue(util.format(output)) }, { quoted: m });
} catch (err) {
return sock.sendMessage(m.chat, { text: formatDialogue(util.format(err)) }, { quoted: m });
}
}

if (m.text.toLowerCase().startsWith("x")) {
if (!isOwner) return;

try {
let result = await eval(text);
if (typeof result !== "string") result = util.inspect(result);
return sock.sendMessage(m.chat, { text: formatDialogue(util.format(result)) }, { quoted: m });
} catch (err) {
return sock.sendMessage(m.chat, { text: formatDialogue(util.format(err)) }, { quoted: m });
}
}

if (m.text.startsWith('$')) {
if (!isOwner) return;

exec(m.text.slice(2), (err, stdout) => {
if (err) {
return sock.sendMessage(m.chat, { text: formatDialogue(err.toString()) }, { quoted: m });
}
if (stdout) {
return sock.sendMessage(m.chat, { text: formatDialogue(util.format(stdout)) }, { quoted: m });
}
});
}

}

} catch (err) {
console.log(err)
const errorOwner = ownerToJid(global.owner)
if (errorOwner) await sock.sendMessage(errorOwner, {text: err.toString()}, {quoted: m ? m : null })
}}

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
delete require.cache[file];
require(file);
});
