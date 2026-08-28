const { cmd } = require('../command');
const os = require('os');
const config = require('../config');
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
  pattern: "uptime",
  desc: "Shows how long the bot has been running.",
  category: "tools",
  react: "⏳",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    const uptime = process.uptime(); // uptime in seconds
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const formattedUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const memUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
    const memTotal = (os.totalmem() / 1024 / 1024).toFixed(2);

    const uptimeLayout = 
        `╭───〔 🌸 *Tsala Uptime* 🌸 〕───⬣
│ ⏱️ *Uptime:* ${formattedUptime}
│ 🖥️ *Platform:* ${os.platform()}
│ 💾 *Memory:* ${memUsed} MB / ${memTotal} MB
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

    const styledText = tiny(uptimeLayout);
    const photoPath = getRandomPhoto();

    const contextInfo = {
        mentionedJid: [sender],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363412950068938@newsletter',
            newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤'
        },
        externalAdReply: {
            showAdAttribution: false,
            containsAutoReply: true,
            title: "✧ Tsala Yame - Uptime Report ✧",
            body: "Powered By Mulax Prime",
            thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
            sourceUrl: "https://github.com/mulaxprime/Tsala_Yame",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };

    if (photoPath && fs.existsSync(photoPath)) {
        const imageBuffer = fs.readFileSync(photoPath);
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: styledText,
            contextInfo
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, {
            text: styledText,
            contextInfo
        }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply(tiny(`❌ Error: ${e.message}`));
  }
});