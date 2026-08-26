const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "owner",
    desc: "👑 Get bot owner information",
    react: "👑",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
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
    
    await conn.sendMessage(from, {
        contacts: {
            displayName: "Mulax_prime",
            contacts: [{ vcard }]
        }
    }, { quoted: mek });
    
    reply(`👑 *Bot Owner Information* 👑
    
🤖 *Bot Name:* Tsala Yame
👨‍💻 *Developer:* MULAXPRIME (Gamer-Abby)
📱 *Contact:* +${config.OWNER_NUMBER}
📧 *Email:* amantlempaekae@gmail.com
🌐 *Website:* https://mulax-prime.vercel.app`);
});

