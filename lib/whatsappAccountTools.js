const whatsappTeams = [
"support@support.whatsapp.com",
"security@whatsapp.com",
"abuse@support.whatsapp.com",
"appeals@support.whatsapp.com",
"android_web@support.whatsapp.com",
"android@support.whatsapp.com",
"abuse@whatsapp.com",
"legal@whatsapp.com"
];

const net = require("net");
const tls = require("tls");

const cleanPhoneNumber = (phoneNumber = "") => String(phoneNumber || "").replace(/\D/g, "");

const cekbanApiUrl = () => String(process.env.CEKBAN_API_URL || "https://cekban.otax.fun/cek-ban").replace(/\/+$/, "");
const cekbanApiKey = () => process.env.CEKBAN_API_KEY || "mantaxcekban02";

const getFetch = () => {
if (typeof fetch === "function") return fetch;
return require("node-fetch");
};

const normalizeOwnerName = (ownerName = "") => {
const clean = String(ownerName || "").replace(/\s+/g, " ").trim();
return clean || "Unknown";
};

const normalizeRecipients = (value = "") => String(value || "")
.split(/[,\n]/)
.map(item => item.trim())
.filter(Boolean);

const unbanRecipients = () => normalizeRecipients(process.env.UNBAN_RECIPIENTS).length
? normalizeRecipients(process.env.UNBAN_RECIPIENTS)
: whatsappTeams.slice(0, 4);

const mailProvider = () => String(process.env.UNBAN_MAIL_PROVIDER || "guerrilla").trim().toLowerCase();

const smtpConfig = () => ({
host: process.env.SMTP_HOST || "",
port: Number(process.env.SMTP_PORT || 465),
secure: process.env.SMTP_SECURE !== "false",
user: process.env.SMTP_USER || "",
pass: process.env.SMTP_PASS || "",
from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
recipients: normalizeRecipients(process.env.UNBAN_RECIPIENTS).length
? normalizeRecipients(process.env.UNBAN_RECIPIENTS)
: unbanRecipients()
});

const smtpConfigured = (config = smtpConfig()) => Boolean(config.host && config.port && config.from);

const encodeHeader = (value = "") => String(value).replace(/[\r\n]+/g, " ").trim();

const dotStuff = (value = "") => String(value).replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");

const readSmtpReply = (socket) => new Promise((resolve, reject) => {
let data = "";
const cleanup = () => {
socket.off("data", onData);
socket.off("error", onError);
};
const onError = (err) => {
cleanup();
reject(err);
};
const onData = (chunk) => {
data += chunk.toString("utf8");
const lines = data.split(/\r?\n/).filter(Boolean);
const last = lines[lines.length - 1] || "";
if (/^\d{3}\s/.test(last)) {
cleanup();
resolve({ code: Number(last.slice(0, 3)), message: data.trim() });
}
};
socket.on("data", onData);
socket.once("error", onError);
});

const assertSmtpCode = (reply, expected, label) => {
const allowed = Array.isArray(expected) ? expected : [expected];
if (!allowed.includes(reply.code)) throw new Error(`${label} failed: ${reply.message}`);
};

const writeSmtp = async (socket, command, expected, label) => {
socket.write(`${command}\r\n`);
const reply = await readSmtpReply(socket);
assertSmtpCode(reply, expected, label || command);
return reply;
};

const sendMailViaSmtp = async ({ to, subject, text }) => {
const config = smtpConfig();
if (!smtpConfigured(config)) {
throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
}

const recipients = Array.isArray(to) && to.length ? to : config.recipients;
if (!recipients.length) throw new Error("No unban recipients configured.");

let socket = config.secure
? tls.connect({ host: config.host, port: config.port, servername: config.host })
: net.connect({ host: config.host, port: config.port });

try {
assertSmtpCode(await readSmtpReply(socket), 220, "SMTP greeting");
await writeSmtp(socket, `EHLO ${process.env.SMTP_HELO || "empire-md.local"}`, 250, "EHLO");

if (config.user || config.pass) {
await writeSmtp(socket, "AUTH LOGIN", 334, "SMTP auth start");
await writeSmtp(socket, Buffer.from(config.user).toString("base64"), 334, "SMTP username");
await writeSmtp(socket, Buffer.from(config.pass).toString("base64"), 235, "SMTP password");
}

await writeSmtp(socket, `MAIL FROM:<${config.from}>`, 250, "MAIL FROM");
for (const recipient of recipients) {
await writeSmtp(socket, `RCPT TO:<${recipient}>`, [250, 251], `RCPT TO ${recipient}`);
}

await writeSmtp(socket, "DATA", 354, "DATA");
const message = [
`From: ${encodeHeader(config.from)}`,
`To: ${recipients.map(encodeHeader).join(", ")}`,
`Subject: ${encodeHeader(subject)}`,
"MIME-Version: 1.0",
"Content-Type: text/plain; charset=UTF-8",
"",
dotStuff(text),
"."
].join("\r\n");
socket.write(`${message}\r\n`);
assertSmtpCode(await readSmtpReply(socket), 250, "Message delivery");
await writeSmtp(socket, "QUIT", 221, "QUIT").catch(() => {});

return {
sent: true,
provider: "smtp",
from: config.from,
recipients
};
} finally {
socket.destroy();
}
};

const updateCookieJar = (jar, setCookies = []) => {
for (const cookie of setCookies || []) {
const pair = String(cookie).split(";")[0];
const index = pair.indexOf("=");
if (index > 0) jar[pair.slice(0, index)] = pair.slice(index + 1);
}
return jar;
};

const cookieHeader = (jar = {}) => Object.entries(jar).map(([key, value]) => `${key}=${value}`).join("; ");

const guerrillaApiCall = async (func, params = {}, jar = {}) => {
const request = getFetch();
const body = new URLSearchParams({
f: func,
ip: process.env.GUERRILLA_API_IP || "127.0.0.1",
agent: "EmpireMD",
...params
});
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), Number(process.env.GUERRILLA_TIMEOUT || 15000));
let response;
try {
response = await request(process.env.GUERRILLA_API_URL || "http://api.guerrillamail.com/ajax.php", {
method: "POST",
body: body.toString(),
signal: controller.signal,
headers: {
"Content-Type": "application/x-www-form-urlencoded",
"User-Agent": "EmpireMD",
...(cookieHeader(jar) ? { Cookie: cookieHeader(jar) } : {})
}
});
clearTimeout(timer);
} catch (err) {
clearTimeout(timer);
throw err;
}
const setCookies = typeof response.headers?.raw === "function"
? response.headers.raw()["set-cookie"]
: typeof response.headers?.getSetCookie === "function"
? response.headers.getSetCookie()
: response.headers?.get("set-cookie")
? [response.headers.get("set-cookie")]
: [];
updateCookieJar(jar, setCookies);
const text = await response.text();
let data;
try {
data = JSON.parse(text);
} catch {
throw new Error(`Guerrilla Mail returned non-JSON response: ${text.slice(0, 80)}`);
}
if (!response.ok) throw new Error(data?.error || `Guerrilla Mail HTTP ${response.status}`);
return data;
};

const sendMailViaGuerrilla = async ({ to, subject, text }) => {
const recipients = Array.isArray(to) && to.length ? to : unbanRecipients();
if (!recipients.length) throw new Error("No unban recipients configured.");

const jar = {};
let mailbox = await guerrillaApiCall("get_email_address", {}, jar);
const emailUser = String(process.env.GUERRILLA_EMAIL_USER || "").replace(/[^a-zA-Z0-9_.-]/g, "");
if (emailUser) mailbox = await guerrillaApiCall("set_email_user", { email_user: emailUser, lang: "en" }, jar);

const from = mailbox?.email_addr || `${emailUser || "empiremd"}@guerrillamail.com`;
const results = [];
for (const recipient of recipients) {
const result = await guerrillaApiCall("send_email", {
to: recipient,
subject,
body: text
}, jar);
if (result?.error) throw new Error(`Guerrilla Mail rejected ${recipient}: ${result.error}`);
results.push({ recipient, result });
}

return {
sent: true,
provider: "guerrilla",
from,
recipients,
results
};
};

const sendUnbanMail = async ({ to, subject, text }) => {
const provider = mailProvider();
if (provider === "smtp") return sendMailViaSmtp({ to, subject, text });
if (provider === "guerrilla" || provider === "guerrillamail") return sendMailViaGuerrilla({ to, subject, text });
throw new Error(`Unknown UNBAN_MAIL_PROVIDER "${provider}". Use "guerrilla" or "smtp".`);
};

const readNestedValue = (source, keys = []) => {
for (const key of keys) {
if (source && Object.prototype.hasOwnProperty.call(source, key)) return source[key];
}
return undefined;
};

const inferBanStatus = (data = {}) => {
const explicit = readNestedValue(data, ["isBanned", "banned", "ban", "is_banned", "restricted", "isRestricted"]);
if (typeof explicit === "boolean") return explicit ? "banned" : "not_banned";
if (typeof explicit === "number") return explicit > 0 ? "banned" : "not_banned";
if (typeof explicit === "string") {
const value = explicit.toLowerCase();
if (/\b(true|yes|banned|blocked|restricted|ban)\b/.test(value)) return "banned";
if (/\b(false|no|clean|safe|active|normal|not.?banned|unbanned)\b/.test(value)) return "not_banned";
}

const text = [
data.status,
data.result,
data.state,
data.message,
data.reason,
data?.data?.status,
data?.data?.result,
data?.data?.message
].filter(Boolean).join(" ").toLowerCase();

if (/\b(not.?banned|unbanned|clean|safe|active|normal)\b/.test(text)) return "not_banned";
if (/\b(banned|blocked|restricted|suspended|ban detected)\b/.test(text)) return "banned";
return "unknown";
};

async function cekbanAsync(phoneNumber) {
const formattedPhone = cleanPhoneNumber(phoneNumber);
if (!formattedPhone) throw new Error("Nomor kosong");
if (formattedPhone.length < 10) throw new Error("Nomor tidak valid");

const request = getFetch();
const response = await request(`${cekbanApiUrl()}?number=${encodeURIComponent(formattedPhone)}`, {
headers: {
"x-api-key": cekbanApiKey(),
"Accept": "application/json",
"User-Agent": "Empire-MD/1.0",
"Content-Type": "application/json"
}
});
const responseText = await response.text();

let data;
try {
data = JSON.parse(responseText);
} catch {
if (response.status === 502) {
throw new Error("Cekban API is down right now (502 Bad Gateway). Try again later or set CEKBAN_API_URL to a working checker endpoint.");
}
throw new Error(`API Error / Bukan JSON (Status: ${response.status}). Response: ${responseText.slice(0, 50)}...`);
}

if (!response.ok) {
throw new Error(data.message || `API HTTP Error ${response.status}`);
}

const banStatus = inferBanStatus(data);
return {
success: true,
number: formattedPhone,
status: data.status || "unknown",
banStatus,
isBanned: banStatus === "banned",
message: data.message || data.reason || "",
data,
timestamp: new Date().toLocaleString()
};
}

async function unbanAsync(phoneNumber, ownerName = "Unknown") {
const formattedNumber = cleanPhoneNumber(phoneNumber);
if (!formattedNumber) {
return {
success: false,
error: "Invalid phone number",
number: null
};
}
if (formattedNumber.length < 10) {
return {
success: false,
error: "Phone number is too short",
number: formattedNumber
};
}

const owner = normalizeOwnerName(ownerName);
const timestamp = new Date().toLocaleString();
const reportId = Math.floor(Math.random() * 9000) + 1000;
const recipients = unbanRecipients();
const subject = `Account review request for +${formattedNumber}`;
const emailTemplate = `Hello WhatsApp Support Team,

I am requesting a review of the WhatsApp account linked to +${formattedNumber}.

Account owner: ${owner}
Phone number: +${formattedNumber}
Reference: EMPIRE-APPEAL-${reportId}
Prepared at: ${timestamp}

I believe this account may have been restricted or banned by mistake. I am the legitimate owner/user of this number and I am willing to complete any verification steps required.

Please review the account status, confirm the reason for the restriction where possible, and let me know what I need to do to restore access while following WhatsApp's Terms of Service.

Thank you.`;

let delivery;
try {
delivery = await sendUnbanMail({
to: recipients,
subject,
text: emailTemplate
});
} catch (err) {
return {
success: false,
error: err.message,
number: formattedNumber,
owner,
recipients,
subject,
emailTemplate,
timestamp,
provider: mailProvider(),
smtpConfigured: smtpConfigured()
};
}

return {
success: true,
number: formattedNumber,
owner,
recipients,
subject,
emailTemplate,
delivery,
timestamp,
message: `Unban appeal sent for +${formattedNumber}`
};
}

module.exports = {
cekbanAsync,
unbanAsync,
sendMailViaSmtp,
sendMailViaGuerrilla,
sendUnbanMail,
whatsappTeams
};
