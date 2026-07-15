const chalk = require("chalk");
const fs = require("fs");
require("./config.js")

//========== Setting Owner ==========//
global.owner = global.owner || "2349064350587"
global.owners = Array.isArray(global.owners) && global.owners.length ? global.owners : [global.owner]
global.namaowner = global.namaowner || "Sins.Outlaw"
global.namabot = "Empire MD"
global.versisc = "2.0.0"
global.pairing = "EMPIREMD"


//========== Setting ID ==========//
global.idsaluran = '120363367787013309@newsletter'
global.namasaluran = 'Empire MD x Baileys'
global.linksaluran = "https://t.me/empiremd"


//========== Setting Message ==========//
global.mess = {
 owner: "Hi, Empress here. This one is reserved for my owners.",
 admin: "Empress needs a group admin to use this command.",
 botAdmin: "Please make Empress a group admin first, then I can help.",
 botadmin: "Please make Empress a group admin first, then I can help.",
 group: "This command works inside groups only.",
 private: "Please use this feature in a private chat with Empress.",
}

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})
