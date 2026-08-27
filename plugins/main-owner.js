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
    pattern: "owner",
    desc: "👑 Get bot owner information",
    react: "👑",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        // Send reaction
        await conn.sendMessage(from, { react: { text: '👑', key: mek.key } });

        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:MULAX PRIME 
ORG:Developer of Tsala Yame;
TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}
X-ABLabel:📞 Call Owner
EMAIL: amantlempaekae@gmail.com
X-ABLabel:📧 Email
URL: https://mulax-prime.vercel.app
X-ABLabel:🌐 Website
NOTE:Contact for bot related queries
END:VCARD
        `.trim();
        
        // Send the vcard contact card first
        await conn.sendMessage(from, {
            contacts: {
                displayName: "Mulax_prime",
                contacts: [{ vcard }]
            }
        }, { quoted: mek });
        
        // Build a sleek, non-boring styled info card
        let ownerInfo = 
            `╭───〔 🌸 *T𝚜𝚊𝚕𝚊 O𝚠𝚗𝚎𝚛* 🌸 〕───⬣
│ 🤖 *Bᴏᴛ:* Tsala Yame
│ 👨‍💻 *Dᴇᴠ:* MULAX PRIME
│ 📱 *Pʜᴏɴᴇ:* +${config.OWNER_NUMBER}
│ 📧 *Eᴍᴀɪʟ:* amantlempaekae@gmail.com
│ 🌐 *Wᴇʙ:* https://mulax-prime.vercel.app
╰──────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        let styledInfo = tiny(ownerInfo);
        
        const photoPath = getRandomPhoto();

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: styledInfo
            }, { quoted: mek });
        } else {
            await reply(styledInfo);
        }

    } catch (e) {
        console.error('Owner Error:', e);
        await reply(`❌ Error: ${e.message}`);
    }
});