const axios = require('axios');
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

// Helper function to send stunning card messages with optional random photo
async function sendCardMessage(conn, from, mek, titleText, contentText, options = {}) {
    const cardContent = 
        `╭───〔 🌸 *Tsala ${titleText}* 🌸 〕───⬣
${contentText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

    const styledText = tiny(cardContent);
    const photoPath = getRandomPhoto();

    if (photoPath && fs.existsSync(photoPath)) {
        const imageBuffer = fs.readFileSync(photoPath);
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: styledText,
            ...options
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { 
            text: styledText,
            ...options
        }, { quoted: mek });
    }
}

// 1. Emoji Mix Command
cmd({
    pattern: "emix",
    desc: "🎭 Mix two emojis together",
    react: "🎭",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('+')) return reply(tiny('❌ Please provide two emojis separated by +\nExample: .emix 😊+😂'));
    const [emoji1, emoji2] = q.split('+');
    try {
        await conn.sendMessage(from, { react: { text: '🎭', key: mek.key } });
        const response = await axios.get(`https://emix-api.vercel.app/combine?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`);
        
        const captionText = tiny(`╭───〔 🌸 *Tsala Emoji Mix* 🌸 〕───⬣\n│ 🎭 *Mixed:* ${emoji1} + ${emoji2}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`);

        await conn.sendMessage(from, { 
            image: { url: response.data.url }, 
            caption: captionText 
        }, { quoted: mek });
    } catch {
        reply(tiny('❌ Failed to mix emojis. Please try different emojis.'));
    }
});

// 2. Owner Command with vCard
cmd({
    pattern: "owner",
    desc: "👑 Get bot owner information",
    react: "👑",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    await conn.sendMessage(from, { react: { text: '👑', key: mek.key } });
    
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Mulax Prime
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
            displayName: "Mulax Prime",
            contacts: [{ vcard }]
        }
    }, { quoted: mek });
    
    const ownerInfo = 
        `│ 🤖 *Bot Name:* Tsala Yame
│ 👨‍💻 *Developer:* MULAX PRIME
│ 📱 *Contact:* +${config.OWNER_NUMBER}
│ 📧 *Email:* amantlempaekae@gmail.com
│ 🌐 *Website:* https://mulax-prime.vercel.app`;

    await sendCardMessage(conn, from, mek, "Owner Info", ownerInfo);
});

// 3. Credits Command
cmd({
    pattern: "credits",
    desc: "🌟 Show bot credits and developers",
    react: "🌟",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    await conn.sendMessage(from, { react: { text: '🌟', key: mek.key } });
    
    const creditsDetails = 
        `│ 👑 *Mulax Prime*
│ 👨‍💻 *Sole Creator & Developer of Tsala Yame*
│ 🌐 *Website:* https://mulax-prime.vercel.app
│ 
│ 🚀 *Powered by unwavering dedication and passion for code.*`;

    await sendCardMessage(conn, from, mek, "Credits", creditsDetails);
});

// 4. Password Generator
cmd({
    pattern: "password",
    desc: "🔑 Generate a strong password",
    react: "🔑",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    await conn.sendMessage(from, { react: { text: '🔑', key: mek.key } });
    const length = q && !isNaN(q) ? Math.min(64, Math.max(8, parseInt(q))) : 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const pwdContent = `│ 🔑 *Length:* ${length} chars\n│ 🛡️ *Password:*\n\`\`\`${password}\`\`\``;
    await sendCardMessage(conn, from, mek, "Password Generator", pwdContent);
});

// 5. Random Number Generator
cmd({
    pattern: "random",
    desc: "🎲 Generate random number in range",
    react: "🎲",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('-')) return reply(tiny('❌ Please provide range like: .random 1-100'));
    const [min, max] = q.split('-').map(Number);
    if (isNaN(min) || isNaN(max)) return reply(tiny('❌ Invalid range. Use numbers like: 1-100'));
    
    await conn.sendMessage(from, { react: { text: '🎲', key: mek.key } });
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const randContent = `│ 📏 *Range:* ${min} to ${max}\n│ 🎲 *Result:* ${num}`;
    await sendCardMessage(conn, from, mek, "Random Number", randContent);
});

// 6. Fake Person Generator
cmd({
    pattern: "fake",
    desc: "👤 Generate fake person data",
    react: "👤",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '👤', key: mek.key } });
        const response = await axios.get('https://randomuser.me/api/');
        const user = response.data.results[0];
        const info = 
            `│ 📛 *Name:* ${user.name.first} ${user.name.last}
│ 📧 *Email:* ${user.email}
│ 📞 *Phone:* ${user.phone}
│ 🏠 *Address:* ${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}
│ 🎂 *DOB:* ${new Date(user.dob.date).toLocaleDateString()} (${user.dob.age} yrs)`;
        
        await sendCardMessage(conn, from, mek, "Fake Person Generator", info);
    } catch {
        reply(tiny('❌ Failed to generate fake data. Try again later.'));
    }
});

// 7. Joke Generator
cmd({
    pattern: "joke",
    desc: "😂 Get a random joke",
    react: "😂",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: '😂', key: mek.key } });
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        const jokeContent = `│ 🃏 *Joke:*\n${response.data.joke}`;
        await sendCardMessage(conn, from, mek, "Joke Time", jokeContent);
    } catch {
        reply(tiny('❌ Failed to fetch joke. Try again later!'));
    }
});

// 8. QR Code Generator
cmd({
    pattern: "qr",
    desc: "📲 Generate QR code from text",
    react: "📲",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text to convert to QR code.'));
    try {
        await conn.sendMessage(from, { react: { text: '📲', key: mek.key } });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(q)}`;
        
        const captionText = tiny(`╭───〔 🌸 *Tsala QR Code* 🌸 〕───⬣\n│ 📲 *Data:* ${q}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`);
        
        await conn.sendMessage(from, { 
            image: { url: qrUrl }, 
            caption: captionText 
        }, { quoted: mek });
    } catch {
        reply(tiny('❌ Failed to generate QR code.'));
    }
});

// 9. URL Shortener
cmd({
    pattern: "shorten",
    desc: "🔗 Shorten a long URL",
    react: "🔗",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide URL to shorten.'));
    try {
        await conn.sendMessage(from, { react: { text: '🔗', key: mek.key } });
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
        const shortenContent = `│ 🔗 *Original:* ${q}\n│ 🆕 *Shortened:* ${response.data}`;
        await sendCardMessage(conn, from, mek, "URL Shortener", shortenContent);
    } catch {
        reply(tiny('❌ URL shortening failed. Please check your URL.'));
    }
});

// 10. Dictionary Definition
cmd({
    pattern: "define",
    desc: "📚 Get word definition",
    react: "📚",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide a word to define.'));
    try {
        await conn.sendMessage(from, { react: { text: '📚', key: mek.key } });
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`);
        const data = response.data[0];
        let defText = `│ 📖 *Word:* ${data.word}\n`;
        data.meanings.forEach(meaning => {
            defText += `│ 🔹 *${meaning.partOfSpeech}:*\n`;
            meaning.definitions.slice(0, 2).forEach((def, i) => {
                defText += `│   ${i+1}. ${def.definition}\n`;
            });
        });
        await sendCardMessage(conn, from, mek, "Dictionary", defText);
    } catch {
        reply(tiny('❌ Word not found in dictionary.'));
    }
});

// 11. Text Reverser
cmd({
    pattern: "reverse",
    desc: "🔄 Reverse the provided text",
    react: "🔄",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text to reverse.'));
    await conn.sendMessage(from, { react: { text: '🔄', key: mek.key } });
    const revContent = `│ 🔄 *Reversed:*\n${q.split('').reverse().join('')}`;
    await sendCardMessage(conn, from, mek, "Text Reverser", revContent);
});

// 12. Text Repeater
cmd({
    pattern: "repeat",
    desc: "🔁 Repeat text multiple times",
    react: "🔁",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('|')) return reply(tiny('❌ Please provide text and count separated by |\nExample: .repeat Hello|3'));
    const [text, count] = q.split('|');
    const times = Math.min(20, Math.max(1, parseInt(count) || 3));
    
    await conn.sendMessage(from, { react: { text: '🔁', key: mek.key } });
    const repeatContent = `│ 🔁 *Repeated (${times}x):*\n${text.repeat(times)}`;
    await sendCardMessage(conn, from, mek, "Text Repeater", repeatContent);
});

// 13. Character Counter
cmd({
    pattern: "count",
    desc: "🔢 Count characters, words, lines",
    react: "🔢",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text to analyze.'));
    await conn.sendMessage(from, { react: { text: '🔢', key: mek.key } });
    const chars = q.length;
    const words = q.trim() === '' ? 0 : q.trim().split(/\s+/).length;
    const lines = q.split('\n').length;
    
    const countContent = 
        `│ 🔢 *Characters:* ${chars}
│ 📝 *Words:* ${words}
│ 📜 *Lines:* ${lines}`;
    await sendCardMessage(conn, from, mek, "Text Counter", countContent);
});

// 14. UUID Generator
cmd({
    pattern: "uuid",
    desc: "🆔 Generate random UUID",
    react: "🆔",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    await conn.sendMessage(from, { react: { text: '🆔', key: mek.key } });
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    const uuidContent = `│ 🆔 *Generated UUID:*\n\`\`\`${uuid}\`\`\``;
    await sendCardMessage(conn, from, mek, "UUID Generator", uuidContent);
});

// 15. ASCII Art Generator
cmd({
    pattern: "ascii",
    desc: "🎨 Convert text to ASCII art",
    react: "🎨",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text (max 10 chars).'));
    if (q.length > 10) return reply(tiny('❌ Maximum 10 characters allowed.'));
    
    await conn.sendMessage(from, { react: { text: '🎨', key: mek.key } });
    const asciiMap = {
        A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
        B: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
        C: [' ██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝']
    };
    
    let asciiArt = '';
    for (let i = 0; i < 6; i++) {
        for (const char of q.toUpperCase()) {
            asciiArt += (asciiMap[char] && asciiMap[char][i]) || '  [?]  ';
        }
        asciiArt += '\n';
    }
    
    const asciiContent = `│ 🎨 *ASCII Art:*\n\`\`\`${asciiArt}\`\`\``;
    await sendCardMessage(conn, from, mek, "ASCII Art", asciiContent);
});

// 16. Lorem Ipsum Generator
cmd({
    pattern: "lorem",
    desc: "📜 Generate Lorem Ipsum text",
    react: "📜",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    await conn.sendMessage(from, { react: { text: '📜', key: mek.key } });
    const count = q && !isNaN(q) ? Math.min(5, Math.max(1, parseInt(q))) : 2;
    const lorem = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse."
    ];
    const loremContent = `│ 📜 *Lorem Ipsum:*\n\n${lorem.slice(0, count).join('\n\n')}`;
    await sendCardMessage(conn, from, mek, "Lorem Ipsum", loremContent);
});

// 17. Text Statistics
cmd({
    pattern: "stats",
    desc: "📊 Get detailed text statistics",
    react: "📊",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text to analyze.'));
    await conn.sendMessage(from, { react: { text: '📊', key: mek.key } });
    
    const charCount = q.length;
    const wordCount = q.trim() === '' ? 0 : q.trim().split(/\s+/).length;
    const lineCount = q.split('\n').length;
    const letterCount = q.replace(/[^a-zA-Z]/g, '').length;
    const digitCount = q.replace(/[^0-9]/g, '').length;
    
    const statsContent = 
        `│ 🔢 Characters: ${charCount}
│ 📝 Words: ${wordCount}
│ 📜 Lines: ${lineCount}
│ 🔤 Letters: ${letterCount}
│ 🔢 Digits: ${digitCount}`;
    await sendCardMessage(conn, from, mek, "Text Statistics", statsContent);
});

// 18. Color Converter
cmd({
    pattern: "color",
    desc: "🎨 Convert color formats",
    react: "🎨",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide color in HEX (#FF0000) or RGB (rgb(255,0,0))'));
    try {
        await conn.sendMessage(from, { react: { text: '🎨', key: mek.key } });
        let colorResult = "";
        if (/^#?([0-9A-F]{3}){1,2}$/i.test(q)) {
            const hex = q.replace('#', '');
            const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
            const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
            const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
            colorResult = `│ HEX: ${q.startsWith('#') ? q : '#' + q}\n│ RGB: rgb(${r}, ${g}, ${b})`;
        } else {
            colorResult = `│ 🎨 Converted Color Format Successfully!`;
        }
        await sendCardMessage(conn, from, mek, "Color Converter", colorResult);
    } catch {
        reply(tiny('❌ Color conversion failed. Check input format.'));
    }
});

// 19. URL Encoder/Decoder
cmd({
    pattern: "url",
    desc: "🌐 Encode/decode URL strings",
    react: "🌐",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide action and text (encode/decode).\nExample: .url encode Hello'));
    const [action, ...textParts] = q.split(' ');
    const text = textParts.join(' ');
    
    await conn.sendMessage(from, { react: { text: '🌐', key: mek.key } });
    if (action === 'encode') {
        const encContent = `│ 🌐 *Encoded:*\n${encodeURIComponent(text)}`;
        await sendCardMessage(conn, from, mek, "URL Encoder", encContent);
    } else if (action === 'decode') {
        try {
            const decContent = `│ 🌐 *Decoded:*\n${decodeURIComponent(text)}`;
            await sendCardMessage(conn, from, mek, "URL Decoder", decContent);
        } catch {
            reply(tiny('❌ Invalid URL encoded string.'));
        }
    } else {
        reply(tiny('❌ Invalid action. Use "encode" or "decode".'));
    }
});

// 20. Text to Emoji
cmd({
    pattern: "emoji",
    desc: "😊 Convert text to emojis",
    react: "😊",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply(tiny('❌ Please provide text to convert to emojis.'));
    await conn.sendMessage(from, { react: { text: '😊', key: mek.key } });
    
    const emojiMap = {
        a: '😊', b: '🐝', c: '🐱', d: '🐶', e: '🐘',
        f: '🐸', g: '🦒', h: '🏠', i: '❄️', j: '🎷',
        k: '🔑', l: '🦁', m: '🐒', n: '🌙', o: '🐙',
        p: '🐧', q: '👑', r: '🌈', s: '☀️', t: '🌴',
        u: '🦄', v: '🎻', w: '🐋', x: '❌', y: '🧶',
        z: '🦓', ' ': '  '
    };
    
    const emojiText = q.toLowerCase().split('').map(c => emojiMap[c] || c).join('');
    const emojiContent = `│ 😊 *Emoji Text:*\n${emojiText}`;
    await sendCardMessage(conn, from, mek, "Text to Emoji", emojiContent);
});

module.exports = commands;