const config = require('../config');
const { cmd } = require('../command');
const { tiny } = require("../lib/fancy_font/fancy"); 

const stylizedChars = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

cmd({
    pattern: "channelreact",
    alias: ["creact"],
    react: "🔤",
    desc: "React to a channel message with a stylized character.",
    category: "channel",
    use: '.creact <channel-link> <letter>',
    filename: __filename
},
async (conn, mek, m, { from, q, isOwner, reply }) => {
    try {
        if (!isOwner) return reply(tiny("❌ Owner only command"));
        if (!q) return reply(tiny("❌ Usage:\n.creact https://whatsapp.com/channel/0029Va.../123 A"));

        const [link, ...textParts] = q.split(' ');
        if (!link.includes("whatsapp.com/channel/")) return reply(tiny("❌ Invalid channel link format."));
        
        const inputText = textParts.join(' ').toLowerCase();
        if (!inputText) return reply(tiny("❌ Please provide a letter to react with."));

        // FIX 1: Grab ONLY the first character to prevent server rejection.
        const firstChar = inputText.charAt(0);
        const emoji = stylizedChars[firstChar] || firstChar;

        // FIX 2: Safely parse the link and remove query parameters.
        const parts = link.split('/');
        const inviteCode = parts[4];
        let messageIdStr = parts[5];
        
        if (!inviteCode || !messageIdStr) {
            return reply(tiny("❌ Invalid link - missing Channel ID or Message ID."));
        }

        // Clean the message ID (removes anything after '?')
        const messageId = parseInt(messageIdStr.split('?')[0]); 

        // Fetch channel metadata to get the true Channel JID
        const channelMeta = await conn.newsletterMetadata("invite", inviteCode);
        if (!channelMeta || !channelMeta.id) {
            return reply(tiny("❌ Could not fetch channel metadata."));
        }

        // FIX 3: Robust reaction payload logic
        if (typeof conn.newsletterReactMessage === 'function') {
            await conn.newsletterReactMessage(channelMeta.id, messageId, emoji);
        } else {
            // Fallback for standard Baileys instances
            await conn.sendMessage(channelMeta.id, {
                react: {
                    text: emoji,
                    key: {
                        remoteJid: channelMeta.id,
                        id: '', // Standard message ID is left blank for channels
                        server_id: messageId 
                    }
                }
            });
        }

        const infoText = 
            `│ ▸ *Sᴜᴄᴄᴇss!* Rᴇᴀᴄᴛɪᴏɴ Sᴇɴᴛ
│ ▸ *Cʜᴀɴɴᴇʟ:* ${channelMeta.name}
│ ▸ *Rᴇᴀᴄᴛɪᴏɴ:* ${emoji}
│ ▸ *Mᴇssᴀɢᴇ ID:* ${messageId}`;

        const cardContent = 
            `╭───〔 🌸 *Tsala Channel* 🌸 〕───⬣
${infoText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        return reply(tiny(cardContent));

    } catch (e) {
        console.error("Channel React Error:", e);
        reply(tiny(`❎ Error: ${e.message || "Failed to send reaction"}`));
    }
});