const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");
const axios = require('axios');

// Helper to grab a random photo for the card layout
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

// Command to toggle or check status of the chatbot
cmd({
    pattern: "chatbot",
    desc: "Turn auto chatbot on or off",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply(tiny("Only the owner can use this command!"));
    
    const status = args[0] ? args[0].toLowerCase() : '';
    if (status === 'on') {
        config.AUTO_CHATBOT = "true";
        return reply(tiny("🤖 Auto Chatbot has been turned ON."));
    } else if (status === 'off') {
        config.AUTO_CHATBOT = "false";
        return reply(tiny("🤖 Auto Chatbot has been turned OFF."));
    } else {
        return reply(tiny(`🤖 Auto Chatbot Status: *${config.AUTO_CHATBOT}*\nUse \`.chatbot on\` or \`.chatbot off\` to change it.`));
    }
});

// Event Listener for Incoming Messages (Auto-Reply Engine using David Cyril Gemini AI Endpoint)
cmd({
    on: "text"
}, async (conn, mek, m, { from, body, sender, isGroup, isMe }) => {
    try {
        // Skip if chatbot is disabled, message is from bot itself, or if it's a command
        if (config.AUTO_CHATBOT !== "true" || isMe) return;
        if (body.startsWith(config.PREFIX || ".")) return;

        // Optional: Restrict auto-reply strictly to private chats (DMs) so it doesn't spam groups
        if (isGroup) return; 

        // Generate response using David Cyril Gemini AI endpoint based on the correct /ai/gemini-3.1-flash-lite route
        let replyText = "";
        try {
            const apiRes = await axios.get(`https://apis.davidcyril.name.ng/ai/gemini-3.1-flash-lite?prompt=${encodeURIComponent(body)}`);
            const data = apiRes.data;
            replyText = data.result || data.data || data.response || data.answer || "Hey! Mulax Prime is currently offline right now, but I have received your message and will pass it along as soon as they are back!";
        } catch {
            replyText = "Hello! Mulax Prime is currently offline. Your message has been saved, and they will get back to you shortly.";
        }

        const infoText = 
`│ 🤖 *Auto Response*
│
│ ${replyText}`;

        const cardContent = 
            `╭───〔 🌸 *Tsala Bot* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

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
                title: "✧ Tsala Auto-Chatbot ✧",
                body: "Owner is currently away",
                thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
                sourceUrl: "https://github.com/mulaxprime/Tsala_Yame",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(from, { image: imageBuffer, caption: styledText, contextInfo }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: styledText, contextInfo }, { quoted: mek });
        }

    } catch (err) {
        console.error("Chatbot Error:", err);
    }
});