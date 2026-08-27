const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");

// Function to get a random photo safely (supports jpg, jpeg, png, webp)
function getRandomPhoto() {
    const photosDir = path.join(__dirname, '../lib/photos');
    if (!fs.existsSync(photosDir)) return null;
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const photoFiles = fs.readdirSync(photosDir).filter(file => 
        validExtensions.includes(path.extname(file).toLowerCase())
    );
    
    if (photoFiles.length === 0) return null;
    
    const randomFile = photoFiles[Math.floor(Math.random() * photoFiles.length)];
    return path.join(photosDir, randomFile);
}

cmd({
    pattern: "ping",
    alias: ["speed", "p2"],
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Send reaction
        await conn.sendMessage(from, { react: { text: '⚡', key: mek.key } });

        const startTime = Date.now();
        const message = await conn.sendMessage(from, { text: tiny('> *CHECKING TSALA YAME PING...*') }, { quoted: mek });
        const endTime = Date.now();
        const ping = endTime - startTime;

        let pingText = 
            `╭───〔 🌸 *T𝚜𝚊𝚕𝚊 P𝙸𝙽𝙶* 🌸 〕───⬣
│ ⚡ *R𝚎𝚜𝚙𝚘𝚗𝚜𝚎:* ${ping}ms
╰──────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        let styledPing = tiny(pingText);
        
        const photoPath = getRandomPhoto();

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: styledPing
            }, { quoted: message });
        } else {
            await conn.sendMessage(from, { text: styledPing }, { quoted: message });
        }

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});