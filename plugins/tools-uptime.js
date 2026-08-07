const { cmd } = require('../command');
const os = require('os');
const config = require('../config');

cmd({
  pattern: "uptime",
  desc: "Shows how long the bot has been running.",
  category: "tools",
  filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
  try {
    const uptime = process.uptime(); // uptime in seconds
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const formattedUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const caption = `╭─❒ ᴜᴘᴛɪᴍᴇ ʀᴇᴘᴏʀᴛ
│
├ ᴜᴘᴛɪᴍᴇ: ${formattedUptime}
├ ᴘʟᴀᴛғᴏʀᴍ: ${os.platform()}
├ ᴍᴇᴍᴏʀʏ: ${(os.totalmem() - os.freemem()) / 1024 / 1024} MB / ${os.totalmem() / 1024 / 1024} MB
╰───────────────❒`;

    await conn.sendMessage(
      from,
      {
        text: caption,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420003990090@newsletter',
            newsletterName: '⏤͟͟͞͞MULAA-MD  ͟͞͞⏤'
          },
          externalAdReply: {
            showAdAttribution: false,
            containsAutoReply: true,
            title: "✧ MULAA MD - Uptime Report ✧",
            body: "Powered By Mulax Prime",
            thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
            sourceUrl: "https://github.com/romeobwiii/MULAA-MD",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: mek }
    );
  } catch (e) {
    console.log(e);
    reply(`${e}`);
  }
});
                      
