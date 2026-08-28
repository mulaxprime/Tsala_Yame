const axios = require("axios");
const { cmd } = require("../command");
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
  pattern: "botrepo",
  react: "📁",
  alias: ["repo", "bot"],
  desc: "Sends info about the WhatsApp bot repository",
  category: "general",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '📁', key: mek.key } });

    const response = await axios.get("https://api.github.com/repos/mulaxprime/Tsala_Yame");
    const repoData = response.data;

    const repoInfo = 
        `│ 📂 *Repository:* ${repoData.name}
│ 📝 *Description:* ${repoData.description || 'No description available'}
│ ⭐ *Stars:* ${repoData.stargazers_count}
│ 🍴 *Forks:* ${repoData.forks_count}
│ 👀 *Watchers:* ${repoData.watchers_count}
│ 🐛 *Open Issues:* ${repoData.open_issues_count}
│ ⚖️ *License:* ${repoData.license ? repoData.license.name : 'No License'}
│ 🔗 *URL:* https://github.com/mulaxprime/Tsala_Yame`;

    const cardContent = 
        `╭───〔 🌸 *Tsala Repository* 🌸 〕───⬣
${repoInfo}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

    const styledText = tiny(cardContent);
    const photoPath = getRandomPhoto();

    const contextInfo = {
        mentionedJid: [sender],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363412950068938@newsletter',
            newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤'
        },
        externalAdReply: {
            showAdAttribution: false,
            containsAutoReply: true,
            title: "✧ Tsala Yame - Repository ✧",
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

  } catch (error) {
    console.log(error);
    reply(tiny("❌ Error fetching repository info. Please try again later."));
  }
});