process.on("uncaughtException", (err) => {
    console.error("Caught exception:", err);
});

require("./settings.js")
require("./lib/webp.js")
require("./lib/myfunction.js")
require("./lib/database.js")

const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    getContentType,
    jidDecode,
    areJidsSameUser,
    MessageRetryMap,
    proto,
    delay,
    Browsers
} = require("@whiskeysockets/baileys")

const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const PhoneNumber = require("awesome-phonenumber")
const readline = require("readline")
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const FileType = require('file-type');
const http = require("http");
const { URLSearchParams } = require("url");
const path = require("path");

const ConfigBaileys = require("./lib/utils.js");
const { createTelegramPairingBot } = require("./lib/telegram/pairingBot");

// default public
let mode = { public: false }
if (fs.existsSync("./lib/database/mode.json")) {
    mode = JSON.parse(fs.readFileSync("./lib/database/mode.json"))
}

let pairingServer = null
let telegramPairingBot = null
let telegramSessionsReconnectStarted = false
let rentSessionsStarted = false
let latestConnection = "starting"
const activeSessions = new Map()
const sessionsRoot = path.join(__dirname, "sessions")
const mainSessionDir = path.join(sessionsRoot, "main")
const linkedSessionsRoot = path.join(sessionsRoot, "telegram")
const rentSessionsRoot = path.join(sessionsRoot, "rent")
const rentSessionsPath = path.join(__dirname, "lib", "database", "rentsessions.json")
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

for (const dir of [sessionsRoot, mainSessionDir, linkedSessionsRoot, rentSessionsRoot]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copySessionIfNeeded(fromDir, toDir) {
    if (!fromDir || !fs.existsSync(fromDir) || fs.existsSync(path.join(toDir, "creds.json"))) return;
    if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });
    fs.cpSync(fromDir, toDir, { recursive: true, force: false });
}

copySessionIfNeeded(path.join(__dirname, "Session"), mainSessionDir);

async function InputNumber(promptText) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

const groupMetadataCache = new Map()

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
            if (body.length > 1e6) req.destroy();
        });
        req.on("end", () => {
            try {
                if (req.headers["content-type"]?.includes("application/json")) {
                    return resolve(JSON.parse(body || "{}"));
                }
                return resolve(Object.fromEntries(new URLSearchParams(body)));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

function safeSessionName(phoneNumber) {
    return String(phoneNumber || "").replace(/[^0-9]/g, "");
}

function getSessionKey(sessionDir) {
    return path.resolve(sessionDir);
}

function getSessionDirForPhone(phoneNumber) {
    return path.join(rentSessionsRoot, safeSessionName(phoneNumber));
}

function getSessionDirForTelegram(telegramUserId, phoneNumber) {
    return path.join(linkedSessionsRoot, String(telegramUserId), safeSessionName(phoneNumber));
}

function getTelegramClientKey(telegramUserId, phoneNumber) {
    return `${telegramUserId}_${safeSessionName(phoneNumber)}`;
}

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getBrowserConfig(label = "Firefox") {
    try {
        if (typeof Browsers?.ubuntu === "function") {
            return Browsers.ubuntu(label);
        }
    } catch {}
    return ["Ubuntu", label, "20.00.1"];
}

function isConnectionClosedError(err) {
    return /connection\s*closed|timed?\s*out|socket|stream/i.test(String(err?.message || err || ""));
}

async function endSessionSocket(client) {
    if (typeof client?.stopKeepAlive === "function") client.stopKeepAlive();
    try {
        if (client?.sock?.end) await client.sock.end();
    } catch {}
}

async function decorateSocket(sock) {
    sock.public = mode.public

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
            ? message.mtype.replace(/Message/gi, "")
            : mime.split("/")[0];
        const fil = Date.now()
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        let type = await FileType.fromBuffer(buffer) || { ext: "bin" };
        const outputDir = "./lib/database/Sampah";
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        let trueFileName = attachExtension ? `${outputDir}/${fil}.${type.ext}` : filename;
        fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    sock.sendImageAsSticker = async (jid, stickerPath, quoted, options = {}) => {
        let buff = Buffer.isBuffer(stickerPath)
            ? stickerPath
            : /^data:.*?\/.*?;base64,/i.test(stickerPath)
                ? Buffer.from(stickerPath.split`, `[1], 'base64')
                : /^https?:\/\//.test(stickerPath)
                    ? await getBuffer(stickerPath)
                    : fs.existsSync(stickerPath)
                        ? fs.readFileSync(stickerPath)
                        : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author)
            ? await writeExifImg(buff, options)
            : await imageToWebp(buff);
        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    sock.sendVideoAsSticker = async (jid, stickerPath, quoted, options = {}) => {
        let buff = Buffer.isBuffer(stickerPath)
            ? stickerPath
            : /^data:.*?\/.*?;base64,/i.test(stickerPath)
                ? Buffer.from(stickerPath.split`, `[1], 'base64')
                : /^https?:\/\//.test(stickerPath)
                    ? await getBuffer(stickerPath)
                    : fs.existsSync(stickerPath)
                        ? fs.readFileSync(stickerPath)
                        : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author)
            ? await writeExifVid(buff, options)
            : await videoToWebp(buff);
        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    sock.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: `${namaowner}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${namaowner}\nFN:${namaowner}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD`
            })
        }
        return sock.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }

    sock.getName = async (jid = '', withoutContact = false) => {
        try {
            jid = sock.decodeJid(jid || '');
            withoutContact = sock.withoutContact || withoutContact;
            let v;
            if (jid.endsWith('@g.us')) {
                v = sock.chats?.[jid] || {};
                if (!(v.name || v.subject)) v = await sock.groupMetadata(jid).catch(() => ({}));
                return v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') || 'Unknown Group';
            }
            v = jid === '0@s.whatsapp.net'
                ? { jid, vname: 'WhatsApp' }
                : areJidsSameUser(jid, sock.user.id)
                    ? sock.user
                    : sock.chats?.[jid] || {};
            const safeJid = typeof jid === 'string' ? jid : '';
            return (withoutContact ? '' : v.name) ||
                v.subject ||
                v.vname ||
                v.notify ||
                v.verifiedName ||
                (safeJid ? PhoneNumber('+' + safeJid.replace('@s.whatsapp.net', '')).getNumber('international').replace(new RegExp("[()+-/ +/]", "gi"), "") : 'Unknown Contact');
        } catch {
            return 'Error occurred';
        }
    }

    return sock;
}

async function attachBotHandlers(sock, sessionStore, sessionGroupMetadataCache, sessionLabel) {
    await decorateSocket(sock);
    sessionStore?.bind(sock.ev)

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;
            m = await ConfigBaileys(sock, msg);
            await loadDataBase(sock, msg);
            require("./whatsapp.js")(sock, m, sessionGroupMetadataCache);
        } catch (err) {
            console.error(`[${sessionLabel}] Error on message:`, err);
        }
    });

    sock.ev.on('group-participants.update', async (anu) => {
        const welcomeGroups = fs.existsSync("./lib/database/welcome.json")
            ? JSON.parse(fs.readFileSync("./lib/database/welcome.json"))
            : [];
        if (welcomeGroups.includes(anu.id)) {
            console.log(anu)
            let botNumber = await sock.decodeJid(sock.user.id)
            if (anu.participants.includes(botNumber)) return
            try {
                let metadata = await sock.groupMetadata(anu.id)
                let namagc = metadata.subject
                let participants = anu.participants
                for (let num of participants) {
                    let check = anu.author !== num && (anu.author || "").length > 1
                    let tag = check ? [anu.author, num] : [num]
                    if (anu.action == 'add') {
                        sock.sendMessage(anu.id, {
                            text: `hello @${num.split("@")[0]} welcome to *${namagc}*`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/ic51evmj.jpg",
                                    title: '© Empire MD Welcome',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        })
                    }
                    if (anu.action == 'remove') {
                        sock.sendMessage(anu.id, {
                            text: `@${num.split("@")[0]} has left group *${namagc}*`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/7afhwfrz.jpg",
                                    title: '© Empire MD Leaving',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        })
                    }
                    if (anu.action == "promote") {
                        sock.sendMessage(anu.id, {
                            text: `@${anu.author.split("@")[0]} has made @${num.split("@")[0]} as admin of this group`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/ibiu2td5.jpg",
                                    title: '© Empire MD Promote',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        })
                    }
                    if (anu.action == "demote") {
                        sock.sendMessage(anu.id, {
                            text: `@${anu.author.split("@")[0]} has removed @${num.split("@")[0]} as admin of this group`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/papz9tat.jpg",
                                    title: '© Empire MD Demote',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
    })
}

async function startTelegramLinkedSession(telegramUserId, phoneNumber, options = {}) {
    const uid = String(telegramUserId);
    const safePhone = safeSessionName(phoneNumber);
    const sessionDir = getSessionDirForTelegram(uid, safePhone);
    const clientKey = getTelegramClientKey(uid, safePhone);
    const notify = typeof options.notify === "function" ? options.notify : null;
    const retryCount = Number(options.retryCount || 0);

    if (!safePhone || safePhone.length < 8) throw new Error("Please enter a valid WhatsApp number with country code.");
    if (activeSessions.has(clientKey)) {
        const existing = activeSessions.get(clientKey);
        if (existing?.status !== "closed") return existing.sock;
        await endSessionSocket(existing);
        activeSessions.delete(clientKey);
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
    const sessionGroupMetadataCache = new Map();

    const sock = makeWASocket({
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        generateHighQualityLinkPreview: false,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        logger: pino({ level: "silent" }),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 2000,
        maxMsgRetryCount: 5,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        emitOwnEvents: false,
        fireInitQueries: true,
        cachedGroupMetadata: async (jid) => {
            if (sessionGroupMetadataCache.has(jid)) return sessionGroupMetadataCache.get(jid);
            try {
                const metadata = await sock.groupMetadata(jid);
                sessionGroupMetadataCache.set(jid, metadata);
                return metadata;
            } catch {
                return { id: jid, subject: 'Unknown Group', participants: [] };
            }
        }
    });

    await attachBotHandlers(sock, store, sessionGroupMetadataCache, `telegram:${uid}:${safePhone}`);
    sock.ev.on('creds.update', saveCreds);

    let keepAliveInterval = null;
    const stopKeepAlive = () => {
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    };
    const startKeepAlive = () => {
        stopKeepAlive();
        keepAliveInterval = setInterval(async () => {
            const client = activeSessions.get(clientKey);
            if (!client || client.status !== "open") return stopKeepAlive();
            await sock.sendPresenceUpdate("available").catch(() => {});
        }, 30000);
    };

    activeSessions.set(clientKey, {
        sock,
        store,
        status: "connecting",
        sessionDir,
        telegramUserId: uid,
        phoneNumber: safePhone,
        retryCount,
        stopKeepAlive
    });

    sock.ev.on("connection.update", async ({ connection, lastDisconnect } = {}) => {
        const client = activeSessions.get(clientKey);
        if (!client) return;

        if (connection === "open") {
            client.status = "open";
            client.retryCount = 0;
            startKeepAlive();
            if (notify) await notify(`✅ WhatsApp paired successfully for <code>${safePhone}</code>`);
        }

        if (connection === "close") {
            stopKeepAlive();
            client.status = "closed";
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if ([DisconnectReason.loggedOut, 401, 403].includes(reason)) {
                await deleteTelegramLinkedSession(uid, safePhone, false);
                if (notify) await notify(`🚫 Session removed for <code>${safePhone}</code>. Please pair again with /addbot.`);
                return;
            }

            const backoff = Math.min(5000 * (retryCount + 1), 60000);
            setTimeout(() => {
                activeSessions.delete(clientKey);
                startTelegramLinkedSession(uid, safePhone, { notify, retryCount: retryCount + 1 }).catch(err => {
                    console.error(`Telegram linked reconnect failed for ${uid}/${safePhone}:`, err.message);
                });
            }, backoff);
        }
    });

    return sock;
}

async function deleteTelegramLinkedSession(telegramUserId, phoneNumber, endSocket = true) {
    const uid = String(telegramUserId);
    const safePhone = safeSessionName(phoneNumber);
    const clientKey = getTelegramClientKey(uid, safePhone);
    const client = activeSessions.get(clientKey);
    if (client) {
        if (typeof client.stopKeepAlive === "function") client.stopKeepAlive();
        if (endSocket && client.sock?.end) {
            try { await client.sock.end(); } catch {}
        }
        activeSessions.delete(clientKey);
    }
    const sessionDir = getSessionDirForTelegram(uid, safePhone);
    if (fs.existsSync(sessionDir)) await fs.promises.rm(sessionDir, { recursive: true, force: true });
}

async function requestTelegramPairingCode(telegramUserId, phoneNumber, options = {}) {
    const uid = String(telegramUserId);
    const safePhone = safeSessionName(phoneNumber);
    const notify = typeof options.notify === "function" ? options.notify : null;
    let lastError = null;

    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
            await deleteTelegramLinkedSession(uid, safePhone).catch(() => {});
            if (notify) await notify(`Retrying pairing for <code>${safePhone}</code> (${attempt + 1}/3)...`);
        }

        const sock = await startTelegramLinkedSession(uid, safePhone, { notify });
        await sleep(3500 + attempt * 1500);

        try {
            if (!sock?.requestPairingCode) throw new Error("Pairing code not supported by this Baileys build.");
            return await sock.requestPairingCode(safePhone, `${pairing}`);
        } catch (err) {
            lastError = err;
            if (!isConnectionClosedError(err) || attempt === 2) break;
        }
    }

    await deleteTelegramLinkedSession(uid, safePhone).catch(() => {});
    throw lastError || new Error("Pairing failed.");
}

function updateRentSessionRecord(phoneNumber, updates = {}) {
    if (!fs.existsSync(rentSessionsPath)) return;
    const rentDb = JSON.parse(fs.readFileSync(rentSessionsPath, "utf8"));
    const session = (rentDb.sessions || []).find(item => item.number === phoneNumber);
    if (session) Object.assign(session, updates);
    fs.writeFileSync(rentSessionsPath, JSON.stringify(rentDb, null, 2));

    const configPath = path.join(__dirname, "lib", "database", `rent_${phoneNumber}.json`);
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        fs.writeFileSync(configPath, JSON.stringify(Object.assign(config, updates), null, 2));
    }
}

async function startRentSession(phoneNumber, sessionDir, options = {}) {
    const safePhone = safeSessionName(phoneNumber);
    const sessionId = `rent_${safePhone}`;
    const clientKey = `rent:${safePhone}`;
    const retryCount = Number(options.retryCount || 0);
    const notifyPairingCode = typeof options.onPairingCode === "function" ? options.onPairingCode : null;

    if (!safePhone || safePhone.length < 8) throw new Error("Invalid rent session number.");
    if (activeSessions.has(clientKey)) {
        const existing = activeSessions.get(clientKey);
        if (existing?.status !== "closed") {
            if (options.requirePairingCode) throw new Error("Rent session is already loading. Try again in a few seconds.");
            return existing.sock;
        }
        await endSessionSocket(existing);
        activeSessions.delete(clientKey);
    }
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
    const sessionGroupMetadataCache = new Map();
    const logger = pino({ level: "silent" });

    const sock = makeWASocket({
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        generateHighQualityLinkPreview: false,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        logger,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 2000,
        maxMsgRetryCount: 5,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        emitOwnEvents: false,
        fireInitQueries: true,
        cachedGroupMetadata: async (jid) => {
            if (sessionGroupMetadataCache.has(jid)) return sessionGroupMetadataCache.get(jid);
            try {
                const metadata = await sock.groupMetadata(jid);
                sessionGroupMetadataCache.set(jid, metadata);
                return metadata;
            } catch {
                return { id: jid, subject: "Unknown Group", participants: [] };
            }
        }
    });

    await attachBotHandlers(sock, store, sessionGroupMetadataCache, sessionId);
    sock.ev.on("creds.update", saveCreds);

    activeSessions.set(clientKey, {
        sock,
        store,
        status: "connecting",
        sessionDir,
        phoneNumber: safePhone,
        retryCount
    });

    if (!sock.authState.creds.registered) {
        await sleep(3000);
        try {
            const code = await sock.requestPairingCode(safePhone);
            const formatted = String(code).match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n[${sessionId}] Pairing code: ${formatted}\n`);
            if (notifyPairingCode) await notifyPairingCode(formatted);
        } catch (err) {
            await endSessionSocket(activeSessions.get(clientKey));
            activeSessions.delete(clientKey);
            console.error(`[${sessionId}] Pairing error:`, err.message);
            if (isConnectionClosedError(err) && retryCount < 2) {
                await sleep(1500);
                return startRentSession(safePhone, sessionDir, {
                    ...options,
                    retryCount: retryCount + 1
                });
            }
            if (options.throwOnPairingError) throw err;
            return null;
        }
    }

    sock.ev.on("connection.update", async ({ connection, lastDisconnect } = {}) => {
        const client = activeSessions.get(clientKey);
        if (!client) return;

        if (connection === "connecting") console.log(`[${sessionId}] Connecting...`);

        if (connection === "open") {
            client.status = "open";
            client.retryCount = 0;
            updateRentSessionRecord(safePhone, {
                active: true,
                paired: true,
                pairedAt: new Date().toISOString()
            });
            console.log(`[${sessionId}] Connected.`);
        }

        if (connection === "close") {
            client.status = "closed";
            updateRentSessionRecord(safePhone, { active: false });
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`[${sessionId}] Disconnected. Code: ${reason}`);
            if ([DisconnectReason.loggedOut, 401, 403].includes(reason)) {
                activeSessions.delete(clientKey);
                console.log(`[${sessionId}] Logged out. Delete the session folder to re-pair.`);
                return;
            }

            const backoff = Math.min(5000 * (retryCount + 1), 60000);
            setTimeout(() => {
                activeSessions.delete(clientKey);
                startRentSession(safePhone, sessionDir, { retryCount: retryCount + 1 }).catch(err => {
                    console.error(`[${sessionId}] Reconnect failed:`, err.message);
                });
            }, backoff);
        }
    });

    return sock;
}

global.startEmpireRentSession = startRentSession;

async function startRentSessions() {
    if (!fs.existsSync(rentSessionsPath)) return;
    const rentDb = JSON.parse(fs.readFileSync(rentSessionsPath, "utf8"));
    let changed = false;
    for (const session of rentDb.sessions || []) {
        const phone = safeSessionName(session.number);
        const sessionDir = getSessionDirForPhone(phone);
        if (!phone) continue;
        try {
            const legacyDir = session.sessionDir || path.join(__dirname, "session", `rent_${phone}`);
            copySessionIfNeeded(legacyDir, sessionDir);
            if (session.sessionDir !== sessionDir) {
                session.sessionDir = sessionDir;
                changed = true;
            }
            console.log(`\nLoading rent session: ${phone}`);
            await sleep(2000);
            await startRentSession(phone, sessionDir);
        } catch (err) {
            console.error(`Failed to load rent session ${phone}:`, err.message);
        }
    }
    if (changed) fs.writeFileSync(rentSessionsPath, JSON.stringify(rentDb, null, 2));
}

function getTelegramLinkedBots(telegramUserId) {
    const uid = String(telegramUserId);
    const root = path.join(linkedSessionsRoot, uid);
    const saved = fs.existsSync(root)
        ? fs.readdirSync(root).filter(item => fs.statSync(path.join(root, item)).isDirectory())
        : [];
    const phones = new Set(saved);
    for (const [key, client] of activeSessions.entries()) {
        if (key.startsWith(`${uid}_`)) phones.add(client.phoneNumber);
    }
    return [...phones].sort().map(phoneNumber => {
        const client = activeSessions.get(getTelegramClientKey(uid, phoneNumber));
        return {
            phoneNumber,
            status: client?.status || "saved"
        };
    });
}

function getTelegramStats(telegramUserId) {
    const bots = getTelegramLinkedBots(telegramUserId);
    const active = bots.filter(botInfo => botInfo.status === "open").length;
    return { bots, active };
}

function formatClock() {
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" });
    const time = now.toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" });
    return { date, time };
}

function buildTelegramAnimeMenu(ctx, commandPrefix = "/") {
    const user = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name || "telegram user";
    const uid = String(ctx.from?.id || "");
    const { active, bots } = getTelegramStats(uid);
    const { date, time } = formatClock();
    const owner = Array.isArray(global.owners) && global.owners.length ? global.owners[0] : global.owner;
    return `┏ ⌜ ${namabot} ⌟
▢ owner : ${owner}
▢ user : ${user}
▢ uptime : ${runtime(process.uptime()) || "0s"}
▢ Status : Ready
▢ speed : fast
▢ active sessions : ${active}/${Math.max(bots.length, 1)}
▢ Prefix : ${commandPrefix}
▢ date : ${date}
▢ time : ${time}
▢ library :
@whiskeysockets/baileys
▢ total cmds : ${botCommandsCount()}
▢ type : case
┗

┏ ⌜ Commands⌟
▢ /pair
▢ /delpair
▢ /listpaired
▢ /broadcast
▢ /reportissue <msg>
┗`;
}

function botCommandsCount() {
    try {
        const source = fs.readFileSync(path.join(__dirname, "whatsapp.js"), "utf8");
        const match = source.match(/const botCommands = new Set\(\[([\s\S]*?)\]\)/);
        if (!match) return "many";
        return (match[1].match(/"/g) || []).length / 2;
    } catch {
        return "many";
    }
}

function getTelegramMenuImage() {
    const images = Array.isArray(global.menuImages) && global.menuImages.length ? global.menuImages : [];
    if (!images.length) return "";
    return images[Math.floor(Math.random() * images.length)];
}

async function reconnectTelegramLinkedSessions() {
    if (!fs.existsSync(linkedSessionsRoot)) return;
    const userIds = fs.readdirSync(linkedSessionsRoot).filter(item => fs.statSync(path.join(linkedSessionsRoot, item)).isDirectory());
    for (const uid of userIds) {
        const userSessionRoot = path.join(linkedSessionsRoot, uid);
        const phones = fs.readdirSync(userSessionRoot).filter(item => fs.statSync(path.join(userSessionRoot, item)).isDirectory());
        for (const phone of phones) {
            try {
                await startTelegramLinkedSession(uid, phone, { retryCount: 0 });
                await sleep(1000);
            } catch (err) {
                console.error(`Failed to reconnect Telegram linked session ${uid}/${phone}:`, err.message);
            }
        }
    }
}

function startTelegramPairingBot() {
    const config = global.telegramPairing || {};
    if (telegramPairingBot) return;
    telegramPairingBot = createTelegramPairingBot({
        config,
        namabot,
        owner: Array.isArray(global.owners) && global.owners.length ? global.owners[0] : global.owner,
        pairing,
        runtime,
        botCommandsCount,
        safeSessionName,
        escapeHtml,
        getTelegramStats,
        getTelegramLinkedBots,
        getTelegramClientKey,
        startTelegramLinkedSession,
        requestTelegramPairingCode,
        deleteTelegramLinkedSession,
        activeSessions,
        getMenuImage: getTelegramMenuImage
    });
}

function pairingPage() {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Empire MD Pairing</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#10131f;color:#f7f7fb;font-family:Inter,system-ui,Arial,sans-serif;padding:24px}.wrap{width:min(460px,100%);background:#181d2d;border:1px solid #2b3148;border-radius:24px;padding:24px;box-shadow:0 20px 70px rgba(0,0,0,.35)}h1{margin:0 0 8px;font-size:30px}p{color:#b8bfd6;line-height:1.5}.field{display:flex;gap:10px;margin-top:20px}input{flex:1;border:1px solid #353c56;background:#0f1321;color:white;border-radius:14px;padding:14px;font-size:16px}button{border:0;border-radius:14px;background:#7b5cff;color:white;font-weight:800;padding:14px 18px;cursor:pointer}.code{margin-top:18px;padding:18px;border-radius:18px;background:#0f1321;border:1px solid #353c56;text-align:center;font-size:28px;font-weight:900;letter-spacing:3px;min-height:70px}.hint{font-size:13px}.ok{color:#79f2b0}.err{color:#ff8b8b}
</style>
</head>
<body>
<main class="wrap">
<h1>Empire MD Pairing</h1>
<p>Enter your WhatsApp number with country code. Empress will generate a pairing code for your Linked Devices screen.</p>
<form id="pairForm" class="field">
<input id="phone" name="phone" placeholder="2349064350587" autocomplete="tel" required>
<button>Pair</button>
</form>
<div id="code" class="code">Waiting</div>
<p id="status" class="hint">Open WhatsApp > Linked devices > Link with phone number.</p>
</main>
<script>
const form=document.getElementById("pairForm");
const codeBox=document.getElementById("code");
const statusBox=document.getElementById("status");
form.addEventListener("submit",async(e)=>{
e.preventDefault();
codeBox.textContent="...";
statusBox.textContent="Empress is asking WhatsApp for a pairing code.";
statusBox.className="hint";
const phone=document.getElementById("phone").value;
try{
const res=await fetch("/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})});
const data=await res.json();
if(!res.ok||!data.success)throw new Error(data.message||"Pairing failed");
codeBox.textContent=data.code;
statusBox.textContent="Use this code in WhatsApp before it expires.";
statusBox.className="hint ok";
}catch(err){
codeBox.textContent="Try again";
statusBox.textContent=err.message;
statusBox.className="hint err";
}
});
</script>
</body>
</html>`;
}

function startPairingServer(sock) {
    if (!global.pairingWeb?.enabled || pairingServer) return;
    const host = global.pairingWeb.host || "0.0.0.0";
    const port = global.pairingWeb.port || 3000;

    pairingServer = http.createServer(async (req, res) => {
        try {
            if (req.method === "GET" && req.url === "/") {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                return res.end(pairingPage());
            }

            if (req.method === "GET" && req.url === "/status") {
                return sendJson(res, 200, {
                    registered: Boolean(sock.authState.creds.registered),
                    connection: latestConnection,
                    user: sock.user?.id || null
                });
            }

            if (req.method === "POST" && req.url === "/pair") {
                if (sock.authState.creds.registered) {
                    return sendJson(res, 400, { success: false, message: "Empire MD is already paired." });
                }

                const body = await parseBody(req);
                const phoneNumber = String(body.phone || "").replace(/[^0-9]/g, "");
                if (!phoneNumber || phoneNumber.length < 8) {
                    return sendJson(res, 400, { success: false, message: "Please enter a valid WhatsApp number with country code." });
                }

                const code = await sock.requestPairingCode(phoneNumber, `${pairing}`);
                return sendJson(res, 200, { success: true, code });
            }

            sendJson(res, 404, { success: false, message: "Not found" });
        } catch (err) {
            console.error("Pairing web error:", err);
            sendJson(res, 500, { success: false, message: err.message || "Pairing server error" });
        }
    });

    pairingServer.listen(port, host, () => {
        const displayUrl = global.pairingWeb.publicUrl || `http://${host === "0.0.0.0" ? "YOUR_SERVER_IP" : host}:${port}`;
        console.log(chalk.blue.bold(`Empire MD pairing website: ${displayUrl}`));
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(mainSessionDir);
    const store = makeInMemoryStore({
        logger: pino({ level: "silent" })
    });
    const pairingCode = true
    let browser;
    try {
        if (typeof Browsers?.ubuntu === "function") {
            browser = Browsers.ubuntu("Firefox");
        } else {
            browser = ["Ubuntu", "Firefox", "20.00.1"];
        }
    } catch {
        browser = ["Ubuntu", "Firefox", "20.00.1"];
    }

    const sock = makeWASocket({
        browser,
        generateHighQualityLinkPreview: true,
        printQRInTerminal: !pairingCode,
        auth: state,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg?.message || undefined
            }
        },
        logger: pino({ level: "silent" }),
        cachedGroupMetadata: async (jid) => {
            if (groupMetadataCache.has(jid)) {
                return groupMetadataCache.get(jid);
            }
            try {
                const metadata = await sock.groupMetadata(jid);
                groupMetadataCache.set(jid, metadata);
                return metadata;
            } catch (err) {
                console.error(`Failed to fetch metadata for group ${jid}:`, err);
                return { id: jid, subject: 'Unknown Group', participants: [] };
            }
        },
    });

    startPairingServer(sock);
    startTelegramPairingBot();
    if (!telegramSessionsReconnectStarted) {
        telegramSessionsReconnectStarted = true;
        setTimeout(() => {
            reconnectTelegramLinkedSessions().catch(err => {
                console.error("Telegram linked session reconnect failed:", err.message);
            });
        }, 2000);
    }

    if (pairingCode && !sock.authState.creds.registered && !global.pairingWeb?.enabled) {
        let phoneNumber = await InputNumber(chalk.blue.bold('Enter WhatsApp Number:\n'));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber, `${pairing}`)
            await console.log(`${chalk.blue.bold('Empire MD Pairing Code')} : ${chalk.white.bold(code)}`)
        }, 4000)
    }

    store?.bind(sock.ev)

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (!connection) return;
        latestConnection = connection;
        if (connection === "connecting") {
            if (qr && !pairingCode) {
                console.log("Scan QR ini di WhatsApp:");
                qrcode.generate(qr, { small: true });
            }
        }
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.error(lastDisconnect.error);

            switch (reason) {
                case DisconnectReason.badSession:
                    console.log("Bad Session File, Please Delete Session and Scan Again");
                    process.exit();
                case DisconnectReason.connectionClosed:
                    console.log("[SYSTEM] Connection closed, reconnecting...");
                    await startBot();
                case DisconnectReason.connectionLost:
                    console.log("[SYSTEM] Connection lost, trying to reconnect...");
                    await startBot();
                case DisconnectReason.connectionReplaced:
                    console.log("Connection Replaced, Another New Session Opened. Please Close Current Session First.");
                    await sock.logout();
                    break;
                case DisconnectReason.restartRequired:
                    console.log("Restart Required...");
                    await startBot();
                case DisconnectReason.loggedOut:
                    console.log("Device Logged Out, Please Scan Again And Run.");
                    await sock.logout();
                    break;
                case DisconnectReason.timedOut:
                    console.log("Connection TimedOut, Reconnecting...");
                    await startBot();
                default:
                    await startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.blue.bold("Empire MD connected successfully √"))
            if (!rentSessionsStarted) {
                rentSessionsStarted = true;
                setTimeout(() => {
                    startRentSessions().catch(err => {
                        console.error("Rent session loader failed:", err.message);
                    });
                }, 2000);
            }
            return startsBot(sock)
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;
            m = await ConfigBaileys(sock, msg);
            await loadDataBase(sock, msg);
            require("./whatsapp.js")(sock, m, groupMetadataCache);
        } catch (err) {
            console.error("Error on message:", err);
        }
    });

    sock.ev.on('group-participants.update', async (anu) => {
        const welcomeGroups = fs.existsSync("./lib/database/welcome.json")
            ? JSON.parse(fs.readFileSync("./lib/database/welcome.json"))
            : [];
        if (welcomeGroups.includes(anu.id)) {
            console.log(anu)
            let botNumber = await sock.decodeJid(sock.user.id)
            if (anu.participants.includes(botNumber)) return
            try {
                let metadata = await sock.groupMetadata(anu.id)
                let namagc = metadata.subject
                let participants = anu.participants
                for (let num of participants) {
                    let check = anu.author !== num && (anu.author || "").length > 1
                    let tag = check ? [anu.author, num] : [num]
                    try {
                        ppuser = await sock.profilePictureUrl(num, 'image')
                    } catch {
                        ppuser = 'https://telegra.ph/file/de7c8230aff02d7bd1a93.jpg'
                    }

                    if (anu.action == 'add') {
                        sock.sendMessage(anu.id, {
                            text: check ? `hello @${num.split("@")[0]} welcome to *${namagc}*` : `hello @${num.split("@")[0]} welcome to *${namagc}*`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/ic51evmj.jpg",
                                    title: '© Empire MD Welcome',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        }
                        )
                    }
                    if (anu.action == 'remove') {
                        sock.sendMessage(anu.id, {
                            text: check ? `@${num.split("@")[0]} has left group *${namagc}*` : `@${num.split("@")[0]} has left group *${namagc}*`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/7afhwfrz.jpg",
                                    title: '© Empire MD Leaving',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        }
                        )
                    }
                    if (anu.action == "promote") {
                        sock.sendMessage(anu.id, {
                            text: `@${anu.author.split("@")[0]} has made @${num.split("@")[0]} as admin of this group`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/ibiu2td5.jpg",
                                    title: '© Empire MD Promote',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        }
                        )
                    }
                    if (anu.action == "demote") {
                        sock.sendMessage(anu.id, {
                            text: `@${anu.author.split("@")[0]} has removed @${num.split("@")[0]} as admin of this group`,
                            contextInfo: {
                                mentionedJid: [...tag],
                                externalAdReply: {
                                    thumbnailUrl: "https://pomf2.lain.la/f/papz9tat.jpg",
                                    title: '© Empire MD Demote',
                                    body: '',
                                    renderLargerThumbnail: true,
                                    sourceUrl: global.linksaluran,
                                    mediaType: 1
                                }
                            }
                        }
                        )
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
    }
    )

    sock.public = mode.public

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
            ? message.mtype.replace(/Message/gi, "")
            : mime.split("/")[0];
        const Randoms = Date.now()
        const fil = Randoms
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? "./lib/database/Sampah/" + fil + "." + type.ext : filename;
        await fs.writeFileSync(trueFileName, buffer);

        return trueFileName;
    };


    sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
                ? Buffer.from(path.split`, `[1], 'base64')
                : /^https?:\/\//.test(path)
                    ? await (await getBuffer(path))
                    : fs.existsSync(path)
                        ? fs.readFileSync(path)
                        : Buffer.alloc(0);

        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }

        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path)
            ? path
            : /^data:.*?\/.*?;base64,/i.test(path)
                ? Buffer.from(path.split`, `[1], 'base64')
                : /^https?:\/\//.test(path)
                    ? await (await getBuffer(path))
                    : fs.existsSync(path)
                        ? fs.readFileSync(path)
                        : Buffer.alloc(0);

        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }

        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    sock.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: `${namaowner}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${namaowner}\nFN:${namaowner}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD` //vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await sock.getName(i + '@s.whatsapp.net')}\nFN:${await sock.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:whatsapp@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/conn_dev\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        sock.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }

    sock.getName = async (jid = '', withoutContact = false) => {
        try {
            jid = sock.decodeJid(jid || '');

            withoutContact = sock.withoutContact || withoutContact;

            let v;

            if (jid.endsWith('@g.us')) {
                return new Promise(async (resolve) => {
                    try {
                        v = sock.chats[jid] || {};
                        if (!(v.name || v.subject)) {
                            v = await sock.groupMetadata(jid).catch(() => ({}));
                        }

                        resolve(
                            v.name ||
                            v.subject ||
                            (typeof jid === 'string'
                                ? PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
                                : 'Unknown Group')
                        );
                    } catch (err) {
                        resolve('Unknown Group');
                    }
                });
            } else {

                v =
                    jid === '0@s.whatsapp.net'
                        ? { jid, vname: 'WhatsApp' }
                        : areJidsSameUser(jid, sock.user.id)
                            ? sock.user
                            : sock.chats[jid] || {};
            }

            // Hasil validasi & fallback
            const safeJid = typeof jid === 'string' ? jid : '';
            const result =
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.vname ||
                v.notify ||
                v.verifiedName ||
                (safeJid && safeJid !== 'undefined' && safeJid !== ''
                    ? PhoneNumber('+' + safeJid.replace('@s.whatsapp.net', '')).getNumber('international').replace(new RegExp("[()+-/ +/]", "gi"), "")
                    : 'Unknown Contact');
            return result;
        } catch (error) {
            return 'Error occurred';
        }
    }

}

startBot();
