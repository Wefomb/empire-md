const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

function createTelegramPairingBot(deps) {
    const {
        config,
        namabot,
        owner,
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
        getMenuImage
    } = deps;

    const token = String(config.token || "").trim();
    if (!config.enabled || !token) return null;

    let Bot;
    let InputFile;
    try {
        ({ Bot, InputFile } = require("grammy"));
    } catch {
        console.log(chalk.yellow("Telegram pairing is enabled, but grammy is not installed. Run npm install first."));
        return null;
    }

    const bot = new Bot(token);
    const pairingTimers = new Map();
    const maxBots = Number(config.maxBotsPerUser || 3);

    function formatClock() {
        const now = new Date();
        return {
            date: now.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" }),
            time: now.toLocaleTimeString("en-US", { timeZone: "Africa/Lagos" })
        };
    }

    function buildMenu(ctx, commandPrefix = "/") {
        const user = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name || "telegram user";
        const uid = String(ctx.from?.id || "");
        const { active, bots } = getTelegramStats(uid);
        const { date, time } = formatClock();

        return `┏ ⌜ ${namabot} ⌟
▢ owner : ${owner}
▢ user : ${user}
▢ uptime : ${runtime(process.uptime()) || "0s"}
▢ Status : Ready
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
▢ /pair +number
▢ /delpair +number
▢ /listpaired
▢ /delallpairs
▢ /broadcast <msg>
▢ /reportissue <msg>
┗`;
    }

    const sendHelp = async (ctx) => {
        const caption = buildMenu(ctx);
        const image = typeof getMenuImage === "function" ? getMenuImage() : "";
        if (image) {
            if (/^https?:\/\//i.test(image)) return ctx.replyWithPhoto(image, { caption });
            const imagePath = path.resolve(image);
            if (fs.existsSync(imagePath)) return ctx.replyWithPhoto(new InputFile(imagePath), { caption });
        }
        return ctx.reply(caption);
    };

    const pairCommand = async (ctx) => {
        const uid = String(ctx.from?.id || "");
        const phone = safeSessionName(ctx.match || "");
        if (!uid) return;
        if (!phone || phone.length < 8) return ctx.reply("Use: /pair +234xxxxxxxxxx");

        const currentBots = getTelegramLinkedBots(uid);
        if (!currentBots.some(botInfo => botInfo.phoneNumber === phone) && currentBots.length >= maxBots) {
            return ctx.reply(`You already have ${currentBots.length}/${maxBots} linked sessions. Use /delpair first.`);
        }

        await ctx.reply(`Generating pairing code for +${phone}...`);
        const notify = (message) => ctx.api.sendMessage(ctx.chat.id, message, { parse_mode: "HTML" }).catch(() => {});
        try {
            if (typeof requestTelegramPairingCode === "function") {
                const code = await requestTelegramPairingCode(uid, phone, { notify });
                await ctx.reply(`Pairing code for <code>+${escapeHtml(phone)}</code>:\n\n<code>${escapeHtml(code)}</code>\n\nThis code expires soon.`, { parse_mode: "HTML" });
            } else {
                const sock = await startTelegramLinkedSession(uid, phone, { notify });
                const code = await sock.requestPairingCode(phone, `${pairing}`);
                await ctx.reply(`Pairing code for <code>+${escapeHtml(phone)}</code>:\n\n<code>${escapeHtml(code)}</code>\n\nThis code expires soon.`, { parse_mode: "HTML" });
            }

            const clientKey = getTelegramClientKey(uid, phone);
            if (pairingTimers.has(clientKey)) clearTimeout(pairingTimers.get(clientKey));
            pairingTimers.set(clientKey, setTimeout(async () => {
                const client = activeSessions.get(clientKey);
                if (client?.status !== "open") {
                    await deleteTelegramLinkedSession(uid, phone).catch(() => {});
                    await ctx.api.sendMessage(ctx.chat.id, `Pairing expired for +${phone}. Request a fresh code with /pair +${phone}.`).catch(() => {});
                }
                pairingTimers.delete(clientKey);
            }, Number(config.codeTtlMs || 60000)));
        } catch (err) {
            await deleteTelegramLinkedSession(uid, phone).catch(() => {});
            await ctx.reply(`Pairing failed for +${phone}: ${err.message}`);
        }
    };

    const listPairedCommand = async (ctx) => {
        const uid = String(ctx.from?.id || "");
        const bots = getTelegramLinkedBots(uid);
        if (!bots.length) return ctx.reply("No WhatsApp sessions linked yet. Use /pair +234xxxxxxxxxx.");
        const lines = bots.map((botInfo, index) => {
            const icon = botInfo.status === "open" ? "online" : botInfo.status === "connecting" ? "connecting" : "saved";
            return `${index + 1}. ${escapeHtml(botInfo.phoneNumber)} - ${escapeHtml(icon)}`;
        });
        return ctx.reply(`Your paired WhatsApp sessions\n\n${lines.join("\n")}`, { parse_mode: "HTML" });
    };

    const deletePairCommand = async (ctx) => {
        const uid = String(ctx.from?.id || "");
        const phone = safeSessionName(ctx.match || "");
        if (!phone) return ctx.reply("Use: /delpair +234xxxxxxxxxx");
        await deleteTelegramLinkedSession(uid, phone);
        return ctx.reply(`Removed session for +${phone}`);
    };

    const deleteAllPairsCommand = async (ctx) => {
        const uid = String(ctx.from?.id || "");
        const bots = getTelegramLinkedBots(uid);
        for (const botInfo of bots) await deleteTelegramLinkedSession(uid, botInfo.phoneNumber);
        return ctx.reply(`Removed ${bots.length} linked session${bots.length === 1 ? "" : "s"}.`);
    };

    const broadcastCommand = async (ctx) => {
        const uid = String(ctx.from?.id || "");
        const text = String(ctx.match || "").trim();
        if (!text) return ctx.reply("Use: /broadcast message");
        const bots = getTelegramLinkedBots(uid);
        const openBots = bots.filter(botInfo => activeSessions.get(getTelegramClientKey(uid, botInfo.phoneNumber))?.status === "open");
        if (!openBots.length) return ctx.reply("No open paired sessions. Pair one first with /pair +234xxxxxxxxxx.");

        let sent = 0;
        for (const botInfo of openBots) {
            const client = activeSessions.get(getTelegramClientKey(uid, botInfo.phoneNumber));
            const ownJid = client?.sock?.user?.id ? client.sock.user.id.split(":")[0] + "@s.whatsapp.net" : null;
            if (!client?.sock || !ownJid) continue;
            await client.sock.sendMessage(ownJid, { text: `Telegram broadcast\n\n${text}` }).then(() => sent++).catch(() => {});
        }
        return ctx.reply(`Broadcast sent through ${sent}/${openBots.length} open session${openBots.length === 1 ? "" : "s"}.`);
    };

    const reportIssueCommand = async (ctx) => {
        const issue = String(ctx.match || "").trim();
        if (!issue) return ctx.reply("Use: /reportissue describe the problem");
        const reportChatId = String(config.reportChatId || "").trim();
        const report = `Empire MD issue report\nUser: ${ctx.from?.username ? "@" + ctx.from.username : ctx.from?.id}\nMessage: ${issue}`;
        if (reportChatId) await ctx.api.sendMessage(reportChatId, report).catch(() => null);
        return ctx.reply(`Issue received.${reportChatId ? " I forwarded it to the report chat." : ` Send owner a WhatsApp message here: https://wa.me/${owner}`}`);
    };

    bot.command(["start", "menu", "help"], sendHelp);
    bot.command(["pair", "addbot"], pairCommand);
    bot.command(["listpaired", "mybots"], listPairedCommand);
    bot.command(["delpair", "delbot"], deletePairCommand);
    bot.command(["delallpairs", "delallbots"], deleteAllPairsCommand);
    bot.command("broadcast", broadcastCommand);
    bot.command("reportissue", reportIssueCommand);

    bot.catch((err) => console.error("Telegram pairing bot error:", err.error?.message || err.message));
    bot.start({
        onStart: (info) => console.log(chalk.green(`Empire MD Telegram pairing bot: @${info.username}`))
    });

    return bot;
}

module.exports = { createTelegramPairingBot };
