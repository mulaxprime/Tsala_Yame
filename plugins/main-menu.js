const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");

const mediaPath = {
    audio: path.join(__dirname, '../lib/media/menu-audio.mp3')
};

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
        for (const category in categories) {
            menu[category] = '';
        }

        commands.forEach(command => {
            if (command.pattern && !command.dontAddCommandList && categories[command.category]) {
                menu[command.category] += `│ ❉ ${command.pattern}\n`;
            }
        });

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

        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        let madeMenu =
`╭───〔 🌸 *Tsala Yame* 🌸 〕───⬣
│ 📅 *Dᴀᴛᴇ:* ${date}
│ 🕐 *Tɪᴍᴇ:* ${time}
│ ⏱️ *Uᴘᴛɪᴍᴇ:* ${days}d ${hours}h ${minutes}m ${seconds}s
│ 👑 *Oᴡɴᴇʀ:* MULAX PRIME
│ 🔧 *Pʀᴇғɪx:* .
╰──────────────\n`;

        for (const [category, title] of Object.entries(categories)) {
            if (menu[category]) {
                madeMenu += `
┅┅┅✦《 ${title} 》✦┅┅┅
${menu[category]}╰───────────❍`;
            }
        }

        madeMenu += "\n\n> *Tsala Yame | 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 Mulax Prime*";
        const kenu = tiny(madeMenu);

        // ===== Status style (the one you want) =====
        const statusQuote = {
            key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                conversation: "TSALA GO"
            }
        };

        const photoPath = getRandomPhoto();

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);

            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: kenu,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363412950068938@newsletter',
                        newsletterName: 'Tsala Yame'
                    }
                }
            }, {
                quoted: statusQuote
            });
        } else {
            await conn.sendMessage(from, {
                text: kenu,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363412950068938@newsletter',
                        newsletterName: 'Tsala Yame'
                    }
                }
            }, {
                quoted: statusQuote
            });
        }

        if (fs.existsSync(mediaPath.audio)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(mediaPath.audio),
                mimetype: 'audio/mp4',
                ptt: false
            });
        }

    } catch (e) {
        console.error('Menu Error:', e);
        await reply(`❌ Error: ${e.message}`);
    }
});