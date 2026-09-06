const { cmd } = require('../command');
const os = require('os');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");

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
    const uptime = process.uptime();
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
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363412950068938@newsletter',
        newsletterName: 'Tsala Yame'
      }
    };

    if (photoPath && fs.existsSync(photoPath)) {
      const imageBuffer = fs.readFileSync(photoPath);
      await conn.sendMessage(from, {
        image: imageBuffer,
        caption: styledText,
        contextInfo
      });
    } else {
      await conn.sendMessage(from, {
        text: styledText,
        contextInfo
      });
    }

  } catch (e) {
    console.log(e);
    reply(tiny(`❌ Error: ${e.message}`));
  }
});