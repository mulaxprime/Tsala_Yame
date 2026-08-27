const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { tiny } = require("../lib/fancy_font/fancy");

// Path configuration
const mediaPath = {
    audio: path.join(__dirname, '../lib/media/menu-audio.mp3')
};

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
    pattern: "menu",
    desc: "Get command list with media",
    category: "main",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const categories = {
            ai: '𝙰𝙸',
            main: '𝙼𝙰𝙸𝙽',
            anime: '𝙰𝙽𝙸𝙼𝙴',
            whatsapp: '𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿', 
            group: '𝙶𝚁𝙾𝚄𝙿',
            admin: '𝙰𝙳𝙼𝙸𝙽',
            fun: '𝙵𝚄𝙽', 
            other: '𝙾𝚃𝙷𝙴𝚁',
            owner: '𝙾𝚆𝙽𝙴𝚁',
            settings: '𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂',
            general: '𝙶𝙴𝙽𝙴𝚁𝙰𝙻',
            tools: '𝚃𝙾𝙾𝙻𝚂',
        };

        let menu = {};

        // Initialize categories
        for (const category in categories) {
            menu[category] = '';
        }

        // Populate commands
        commands.forEach(command => {
            if (command.pattern && !command.dontAddCommandList && categories[command.category]) {
                menu[command.category] += `│ ❉ ${command.pattern}\n`;
            }
        });
        
        // fake status and quoted.       
        const voltage = { 
            key: { participant: `0@s.whatsapp.net`, ...(m.chat ? { remoteJid: `status@broadcast` } : {}) }, 
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363292215098632@newsletter',
                    newsletterName: tiny('mulaxprime'),
                    caption: tiny('tsala Go')
                }
            }
        };
    
        // Date and time configuration
        const dateOptions = {
            timeZone: 'Africa/Lagos',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const timeOptions = {
            timeZone: 'Africa/Lagos',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const date = new Date().toLocaleDateString('en-US', dateOptions);
        const time = new Date().toLocaleTimeString('en-US', timeOptions);

        // Uptime calculation
        const uptime = process.uptime();  
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Build menu sections
        let madeMenu = 
            `╭───〔 🌸 *Tsala Yame* 🌸 〕───⬣
│ 📅 *Dᴀᴛᴇ:* ${date}
│ 🕐 *Tɪᴍᴇ:* ${time}
│ ⏱️ *Uᴘᴛɪᴍᴇ:* ${days}d ${hours}h ${minutes}m ${seconds}s
│ 👑 *Oᴡ𝒏ᴇʀ:* MULAX PRIME 
│ 🔧 *Pʀᴇғɪx:* .\n
╰──────────────\n`;

        for (const [category, title] of Object.entries(categories)) {
            if (menu[category]) {
                madeMenu += `
┅┅┅✦《 ${title} 》✦┅┅┅
${menu[category]}╰───────────❍`;
            }
        }

        madeMenu += "\n\n> *Tsala Yame | 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 Mulax Prime*";
        let kenu = tiny(madeMenu);
        
        const photoPath = getRandomPhoto();
        
        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: kenu,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 9999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420003990090@newsletter',
                            newsletterName: '⏤͟͟͟͟͞͞͞͞Tsala Yame⏤'
                        }
                    }
                },
                { quoted: voltage }
            );
        } else {
            // Fallback text message if no photos are found in the folder
            await conn.sendMessage(
                from,
                {
                    text: kenu,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 9999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420003990090@newsletter',
                            newsletterName: '⏤͟͟͟͟͞͞͞͞Tsala Yame⏤'
                        },
                        externalAdReply: {
                            showAdAttribution: false,
                            containsAutoReply: true,
                            title: "✧ Tsala Yame - COMMANDS PANEL✧",
                            body: "Powered by Mulax Prime",
                            thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
                            sourceUrl: "https://whatsapp.com/channel/0029Vb5Tm5E6rsQnV4DIRO3z",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: voltage }
            );
        }

    } catch (e) {
        console.error('Menu Error:', e);
        await reply(`❌ Error: ${e.message}`);
    }
});

/* Coded by Techbros*/