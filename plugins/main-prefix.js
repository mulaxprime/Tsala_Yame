const { cmd } = require('../command');
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
    pattern: "setprefix",
    alias: ["prefix"],
    react: "🔧",
    desc: "Change the bot's command prefix.",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, sender, reply }) => {
    
    if (!isCreator) return reply(tiny("*📛 Only the owner can use this command!*"));

    const newPrefix = args[0]; 
    if (!newPrefix) return reply(tiny("❌ Please provide a new prefix.\nExample: `.setprefix !`"));

    try {
        await conn.sendMessage(from, { react: { text: '🔧', key: mek.key } });

        // 1. Update the prefix in live memory (works immediately without restart)
        config.PREFIX = newPrefix;

        // 2. Update the config.js file permanently
        const configPath = path.join(__dirname, '../config.js');
        if (fs.existsSync(configPath)) {
            let configContent = fs.readFileSync(configPath, 'utf8');
            
            // Regex to find and replace the prefix in config.js
            // Matches formats like: PREFIX: process.env.PREFIX || "."
            const regexEnv = /(PREFIX\s*:\s*process\.env\.PREFIX\s*\|\|\s*)(['"`]).*?\2/g;
            // Matches formats like: PREFIX: "."
            const regexSimple = /(PREFIX\s*:\s*)(['"`]).*?\2/g;

            if (regexEnv.test(configContent)) {
                configContent = configContent.replace(regexEnv, `$1$2${newPrefix}$2`);
                fs.writeFileSync(configPath, configContent);
            } else if (regexSimple.test(configContent)) {
                configContent = configContent.replace(regexSimple, `$1$2${newPrefix}$2`);
                fs.writeFileSync(configPath, configContent);
            } else {
                console.log("Could not find the PREFIX line in config.js to update.");
            }
        }

        const infoText = 
            `│ 🔧 *Settings Updated*
│ 
│ 🔣 *New Prefix:* [ ${newPrefix} ]
│ 🔄 *Status:* Successfully Saved to config.js
│ ⚠️ *Note:* Use ${newPrefix}help to see commands now.`;

        const cardContent = 
            `╭───〔 🌸 *Tsala Configuration* 🌸 〕───⬣
${infoText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        const styledText = tiny(cardContent);
        const photoPath = getRandomPhoto();

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420003990090@newsletter',
                newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤'
            },
            externalAdReply: {
                showAdAttribution: false,
                containsAutoReply: true,
                title: "✧ Tsala Yame - Prefix Updated ✧",
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

    } catch (err) {
        console.error("Setprefix command error:", err);
        reply(tiny("❌ Error occurred while updating the prefix."));
    }
});