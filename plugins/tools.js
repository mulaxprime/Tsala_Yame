const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');

// 1. Emoji Mix Command
cmd({
    pattern: "emix",
    desc: "🎭 Mix two emojis together",
    react: "🎭",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('+')) return reply('Please provide two emojis separated by +\nExample: emix 😊+😂');
    const [emoji1, emoji2] = q.split('+');
    try {
        const response = await axios.get(`https://emix-api.vercel.app/combine?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`);
        reply({ url: response.data.url }, 'image');
    } catch {
        reply('Failed to mix emojis. Please try different emojis.');
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
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Abbey-Tech
ORG:Developer of Maria-MD;
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
            displayName: "mulax Prime",
            contacts: [{ vcard }]
        }
    }, { quoted: mek });
    
    reply(`👑 *Bot Owner Information* 👑
    
🤖 *Bot Name:* MULAA-MD
👨‍💻 *Developer:* MULAX PRIME 
📱 *Contact:* +${config.OWNER_NUMBER}
📧 *Email:* amantlempaekae@gmail.com
🌐 *Website:* https://mulax-prime.vercel.app`);
});

// 3. Credits Command
cmd({
    pattern: "credits",
    desc: "🌟 Show bot credits and developers",
    react: "🌟",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const creditsMsg = `
:::::::::::::::::::::::::::::::::: *Mulax Prime (ɢᴀᴍᴇʀ-ᴀʙʙʏ)* :::::::::::::::::::::::::::::::::::
*Overall Developer of MULAA-MD*
🔗 *Channel link:* https://whatsapp.com/channel/0029Vb5Tm5E6rsQnV4DIRO3z
*Let's grow to 1K followers*


::::::::::::::::::::::::::::: *GAMERPRAISE* :::::::::::::::::::::::::

*The Gaming Legend*
👑 *Leader of Ultimate Killers Clan (UK Clan)*

*Gaming Community Ambassador*
👥 *President of Gamer's Society Nigeria*

*Innovative Thinker*
💡 *Contributor to Program Development Ideas*

*Follow the Legend*
▶️ *Subscribe to GAMERPRAISE on YouTube*
https://youtube.com/@Gamerpraise-mods


::::::::::::::::::::::::::::::::::::: *GAMERKENE* :::::::::::::::::::::::::::::::::::::::

*The Modding Mastermind*
🔥 *EBENEZER MODS - Renowned Apk Editor & Moderator*

*Whatsapp Mod Expert*
📱 *Owner of Whatsapp Mod*

*Get Exclusive Mods*
📲 *Follow EBENEZER MODS on Telegram for Whatsapp Apk Downloads*
https://t.me/Ebenezermodapkss


::::::::::::::::::::::::::::::::::::: *SPECIAL THANKS* :::::::::::::::::::::::::::::::::::::::
🤝 *All Beta Testers*
❤️ *Our Supportive Community*
🚀 *Open Source Contributors*
    `;
    reply(creditsMsg);
});

// 4. Password Generator
cmd({
    pattern: "password",
    desc: "🔑 Generate a strong password",
    react: "🔑",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const length = q && !isNaN(q) ? Math.min(64, Math.max(8, parseInt(q))) : 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    reply(`🔑 *Generated Password (${length} chars):*\n\`\`\`${password}\`\`\``);
});

// 5. Random Number Generator
cmd({
    pattern: "random",
    desc: "🎲 Generate random number in range",
    react: "🎲",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('-')) return reply('Please provide range like: random 1-100');
    const [min, max] = q.split('-').map(Number);
    if (isNaN(min) || isNaN(max)) return reply('Invalid range. Use numbers like: 1-100');
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    reply(`🎲 *Random number between ${min} and ${max}:*\n${num}`);
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
        const response = await axios.get('https://randomuser.me/api/');
        const user = response.data.results[0];
        const info = `
👤 *Fake Person Data:*
📛 *Name:* ${user.name.first} ${user.name.last}
📧 *Email:* ${user.email}
📞 *Phone:* ${user.phone}
🏠 *Address:*
${user.location.street.number} ${user.location.street.name}
${user.location.city}, ${user.location.state}
${user.location.country} ${user.location.postcode}
🎂 *DOB:* ${new Date(user.dob.date).toLocaleDateString()} (${user.dob.age} years)
        `;
        reply(info);
    } catch {
        reply('Failed to generate fake data. Try again later.');
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
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        reply(`😂 *Joke:*\n${response.data.joke}`);
    } catch {
        reply('Failed to fetch joke. Try again later!');
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
    if (!q) return reply('Please provide text to convert to QR code.');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(q)}`;
    reply({ url: qrUrl }, 'image');
});

// 9. URL Shortener
cmd({
    pattern: "shorten",
    desc: "🔗 Shorten a long URL",
    react: "🔗",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('Please provide URL to shorten.');
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(q)}`);
        reply(`🔗 *Original:* ${q}\n🆕 *Shortened:* ${response.data}`);
    } catch {
        reply('URL shortening failed. Please check your URL.');
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
    if (!q) return reply('Please provide a word to define.');
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`);
        const data = response.data[0];
        let definitions = `📖 *Word:* ${data.word}\n\n`;
        data.meanings.forEach(meaning => {
            definitions += `*${meaning.partOfSpeech}:*\n`;
            meaning.definitions.slice(0, 3).forEach((def, i) => {
                definitions += `${i+1}. ${def.definition}\n`;
            });
            definitions += '\n';
        });
        reply(definitions);
    } catch {
        reply('Word not found in dictionary.');
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
    if (!q) return reply('Please provide text to reverse.');
    reply(`🔄 *Reversed Text:*\n${q.split('').reverse().join('')}`);
});

// 12. Text Repeater
cmd({
    pattern: "repeat",
    desc: "🔁 Repeat text multiple times",
    react: "🔁",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q || !q.includes('|')) return reply('Please provide text and count separated by |\nExample: repeat Hello|3');
    const [text, count] = q.split('|');
    const times = Math.min(20, Math.max(1, parseInt(count) || 3));
    reply(`🔁 *Repeated ${times} times:*\n${text.repeat(times)}`);
});

// 13. Character Counter
cmd({
    pattern: "count",
    desc: "🔢 Count characters, words, lines",
    react: "🔢",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('Please provide text to analyze.');
    const chars = q.length;
    const words = q.trim() === '' ? 0 : q.trim().split(/\s+/).length;
    const lines = q.split('\n').length;
    reply(`📊 *Text Analysis:*\n🔢 Characters: ${chars}\n📝 Words: ${words}\n📜 Lines: ${lines}`);
});

// 14. UUID Generator
cmd({
    pattern: "uuid",
    desc: "🆔 Generate random UUID",
    react: "🆔",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    reply(`🆔 *UUID:*\n\`\`\`${uuid}\`\`\``);
});

// 15. ASCII Art Generator
cmd({
    pattern: "ascii",
    desc: "🎨 Convert text to ASCII art",
    react: "🎨",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('Please provide text (max 10 chars).');
    if (q.length > 10) return reply('Maximum 10 characters.');
    
    const asciiMap = {
        A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
        B: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
        // Add more characters as needed
    };
    
    let asciiArt = '';
    for (let i = 0; i < 6; i++) {
        for (const char of q.toUpperCase()) {
            asciiArt += (asciiMap[char] && asciiMap[char][i]) || '      ';
        }
        asciiArt += '\n';
    }
    
    reply(`🎨 *ASCII Art:*\n\`\`\`${asciiArt}\`\`\``);
});

// 16. Lorem Ipsum Generator
cmd({
    pattern: "lorem",
    desc: "📜 Generate Lorem Ipsum text",
    react: "📜",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const count = q && !isNaN(q) ? Math.min(10, Math.max(1, parseInt(q))) : 3;
    const lorem = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
        "Officia deserunt mollit anim id est laborum.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.",
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
        "Consectetur, adipisci velit, sed quia non numquam eius modi tempora.",
        "Incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
    ];
    reply(`📜 *Lorem Ipsum (${count} paragraphs):*\n\n${lorem.slice(0, count).join('\n\n')}`);
});

// 17. Text Statistics
cmd({
    pattern: "stats",
    desc: "📊 Get detailed text statistics",
    react: "📊",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('Please provide text to analyze.');
    
    const charCount = q.length;
    const wordCount = q.trim() === '' ? 0 : q.trim().split(/\s+/).length;
    const lineCount = q.split('\n').length;
    const letterCount = q.replace(/[^a-zA-Z]/g, '').length;
    const digitCount = q.replace(/[^0-9]/g, '').length;
    const spaceCount = q.replace(/[^\s]/g, '').length;
    const uniqueChars = new Set(q.split('')).size;
    
    reply(`📊 *Text Statistics:*
🔢 Characters: ${charCount}
📝 Words: ${wordCount}
📜 Lines: ${lineCount}
🔤 Letters: ${letterCount}
🔢 Digits: ${digitCount}
␣ Spaces: ${spaceCount}
✨ Unique chars: ${uniqueChars}`);
});

// 18. Color Converter
cmd({
    pattern: "color",
    desc: "🎨 Convert color formats",
    react: "🎨",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply('Please provide color in HEX (#FF0000), RGB (rgb(255,0,0)), or HSL (hsl(0,100%,50%))');
    
    try {
        // HEX to RGB conversion
        if (/^#?([0-9A-F]{3}){1,2}$/i.test(q)) {
            const hex = q.replace('#', '');
            const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
            const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
            const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
            reply(`🎨 *Color Conversion:*
HEX: ${q.startsWith('#') ? q : '#' + q}
RGB: rgb(${r}, ${g}, ${b})`);
        }
        // RGB to HEX conversion
        else if (/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.test(q)) {
            const [, r, g, b] = q.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
            const hex = `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
            reply(`🎨 *Color Conversion:*
RGB: ${q}
HEX: ${hex}`);
        } else {
            reply('Invalid color format. Use HEX (#FF0000), RGB (rgb(255,0,0)), or HSL (hsl(0,100%,50%))');
        }
    } catch {
        reply('Color conversion failed. Check your input format.');
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
    if (!q) return reply('Please provide text and action (encode/decode).\nExample: url encode Hello World');
    const [action, ...textParts] = q.split(' ');
    const text = textParts.join(' ');
    
    if (action === 'encode') {
        reply(`🔗 *URL Encoded:*\n${encodeURIComponent(text)}`);
    } else if (action === 'decode') {
        try {
            reply(`🔗 *URL Decoded:*\n${decodeURIComponent(text)}`);
        } catch {
            reply('Invalid URL encoded string.');
        }
    } else {
        reply('Invalid action. Use "encode" or "decode".');
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
    if (!q) return reply('Please provide text to convert to emojis.');
    
    const emojiMap = {
        a: '😊', b: '🐝', c: '🐱', d: '🐶', e: '🐘',
        f: '🐸', g: '🦒', h: '🏠', i: '❄️', j: '🎷',
        k: '🔑', l: '🦁', m: '🐒', n: '🌙', o: '🐙',
        p: '🐧', q: '👑', r: '🌈', s: '☀️', t: '🌴',
        u: '🦄', v: '🎻', w: '🐋', x: '❌', y: '🧶',
        z: '🦓', ' ': '  '
    };
    
    const emojiText = q.toLowerCase().split('').map(c => emojiMap[c] || c).join('');
    reply(`😊 *Emoji Text:*\n${emojiText}`);
});

module.exports = commands;
