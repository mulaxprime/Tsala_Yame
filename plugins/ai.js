const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios'); 
const { tiny } = require("../lib/fancy_font/fancy");

cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt"],
    react: "🤖",
    desc: "Chat with AI",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, q, sender, reply }) => {
    try {
        // 1. Check if the user provided a question
        if (!q) return reply(tiny("❌ Please provide a prompt.\nExample: `.ai Hello, how are you?`"));

        await conn.sendMessage(from, { react: { text: '🤖', key: mek.key } });

        let aiResponse = null;

        // 2. Try reliable APIs with fallbacks
        
        // API 1: BK9 GPT-4
        try {
            const res1 = await axios.get(`https://bk9.fun/ai/gpt4?q=${encodeURIComponent(q)}`);
            if (res1.data && res1.data.BK9) {
                aiResponse = res1.data.BK9;
            }
        } catch (e) {
            console.log("API 1 (BK9) failed");
        }

        // API 2: Vreden OpenAI (Fallback)
        if (!aiResponse) {
            try {
                const res2 = await axios.get(`https://api.vreden.my.id/api/openai?text=${encodeURIComponent(q)}`);
                if (res2.data && res2.data.result) {
                    aiResponse = res2.data.result;
                }
            } catch (e) {
                console.log("API 2 (Vreden) failed");
            }
        }

        // API 3: Original Prabath API (Backup)
        if (!aiResponse) {
            try {
                let data = await fetchJson(`https://chatgptforprabath-md.vercel.app/api/gptv1?q=${encodeURIComponent(q)}`);
                if (data && data.data) {
                    aiResponse = data.data;
                }
            } catch (e) {
                console.log("API 3 (Prabath) failed");
            }
        }

        if (!aiResponse) {
            return reply(tiny("❌ Failed to get a response from AI. All free APIs are currently busy."));
        }

        // 3. Format the response with Tsala Yame layout
        const infoText = 
`│ 🤖 *Tsala AI*
│
│ ${aiResponse}`;

        const cardContent = 
            `╭───〔 🌸 *Tsala AI Chat* 🌸 〕───⬣
${infoText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        const styledText = tiny(cardContent);

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
                title: "✧ Tsala AI ✧",
                body: "Powered By Mulax Prime",
                thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg", 
                sourceUrl: "https://github.com/mulaxprime/Tsala_Yame",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        // 4. Send the message
        await conn.sendMessage(from, {
            text: styledText,
            contextInfo
        }, { quoted: mek });

    } catch (e) {
        console.error("AI Command Error:", e);
        reply(tiny(`❌ Error occurred: ${e.message}`));
    }
});