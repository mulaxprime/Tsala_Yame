const { cmd } = require('../command');
const config = require('../config');
const { tiny } = require("../lib/fancy_font/fancy");
const axios = require('axios');
const { downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// ==================== CHATBOT TOGGLE ====================
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
        return reply(tiny("🤖 Auto Chatbot has been turned *ON*."));
    } 
    
    if (status === 'off') {
        config.AUTO_CHATBOT = "false";
        return reply(tiny("🤖 Auto Chatbot has been turned *OFF*."));
    }

    return reply(tiny(
        `🤖 *Auto Chatbot Status:* ${config.AUTO_CHATBOT || "false"}\n\n` +
        `Use:\n.chatbot on\n.chatbot off`
    ));
});

// ==================== VIEW ONCE RECOVERY ====================
cmd({
    pattern: "vv",
    alias: ["viewonce", "vo", "reveal"],
    desc: "Recover View Once message (reply to it)",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, quoted, isOwner, reply }) => {
    try {
        if (!quoted) {
            return reply(tiny("Reply to a *View Once* message with `.vv`"));
        }

        // Get the real quoted message
        let msg = quoted.message || quoted;
        let type = getContentType(msg);

        // Unwrap viewOnce wrappers
        if (type === "viewOnceMessage" || type === "viewOnceMessageV2" || type === "viewOnceMessageV2Extension") {
            msg = msg[type].message;
            type = getContentType(msg);
        }

        const mediaMsg = msg[type];
        if (!mediaMsg) {
            return reply(tiny("This is not a valid View Once media message."));
        }

        // Download the media
        const buffer = await downloadMediaMessage(
            { message: msg, key: quoted.key || mek.key },
            "buffer",
            {},
            { logger: console, reuploadRequest: conn.updateMediaMessage }
        );

        if (!buffer) {
            return reply(tiny("Failed to download the media."));
        }

        const caption = mediaMsg.caption ? `*Recovered View Once*\n\n${mediaMsg.caption}` : "*Recovered View Once Message*";

        if (type === "imageMessage") {
            await conn.sendMessage(from, {
                image: buffer,
                caption: caption
            }, { quoted: mek });
        } 
        else if (type === "videoMessage") {
            await conn.sendMessage(from, {
                video: buffer,
                caption: caption
            }, { quoted: mek });
        } 
        else if (type === "audioMessage") {
            await conn.sendMessage(from, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: mediaMsg.ptt || false
            }, { quoted: mek });
        } 
        else {
            return reply(tiny("Unsupported View Once type."));
        }

    } catch (err) {
        console.error("ViewOnce Error:", err);
        reply(tiny("Failed to recover View Once message.\nMake sure you replied to a valid View Once media."));
    }
});

// ==================== AUTO CHATBOT - DEBUG VERSION ====================
cmd({
    on: "text"
}, async (conn, mek, m, { from, body, isGroup, isMe }) => {
    console.log("========== CHATBOT HANDLER FIRED ==========");
    console.log("AUTO_CHATBOT:", config.AUTO_CHATBOT);
    console.log("Body:", body);
    console.log("isGroup:", isGroup);
    console.log("isMe:", isMe);
    console.log("from:", from);

    // Temporary: Reply to EVERY private message for testing
    if (isGroup) return;
    if (!body) return;
    if (body.startsWith(".")) return;

    try {
        await conn.sendMessage(from, {
            text: `Chatbot received: ${body}`
        }, { quoted: mek });
        console.log("Test reply sent successfully");
    } catch (e) {
        console.error("Failed to send test reply:", e);
    }
});
