const { cmd } = require("../command");
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");

// Function to get a random photo safely
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

// Helper function to build and send the Tsala Yame card for fun commands
async function sendTsalaCard(conn, mek, from, sender, title, content) {
    const infoText = 
`│ 🎈 *${title}*
│
│ ${content}`;

    const cardContent = 
        `╭───〔 🌸 *Tsala Fun* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

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
            title: `✧ Tsala Yame - ${title} ✧`,
            body: "Powered By Mulax Prime",
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
}


// 1. Joke
cmd({
    pattern: "joke",
    desc: "Get a random joke",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const { data } = await axios.get("https://official-joke-api.appspot.com/random_joke");
        await sendTsalaCard(conn, mek, from, sender, "Random Joke", `${data.setup}\n\n${data.punchline}`);
    } catch {
        reply(tiny("😔 Couldn't fetch a joke."));
    }
});

// 2. Meme
cmd({
    pattern: "meme",
    desc: "Get a random meme",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const { data } = await axios.get("https://meme-api.com/gimme");
        
        const cardContent = `╭───〔 🌸 *Tsala Meme* 🌸 〕───⬣\n│ 🤣 *${data.title}*\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;
        const styledText = tiny(cardContent);

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: '120363420003990090@newsletter', newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤' },
            externalAdReply: { title: "✧ Tsala Meme ✧", body: "Powered By Mulax Prime", thumbnailUrl: data.url, sourceUrl: "https://github.com/mulaxprime/Tsala_Yame", mediaType: 1, renderLargerThumbnail: true }
        };

        await conn.sendMessage(from, { image: { url: data.url }, caption: styledText, contextInfo }, { quoted: mek });
    } catch {
        reply(tiny("😔 Couldn't fetch a meme."));
    }
});

// 3. Truth
cmd({
    pattern: "truth",
    desc: "Get a truth question",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const truths = ["What is your biggest fear?", "Have you ever lied to a friend?", "What's your guilty pleasure?", "What’s the most embarrassing thing you’ve done?"];
    await sendTsalaCard(conn, mek, from, sender, "Truth", truths[Math.floor(Math.random() * truths.length)]);
});

// 4. Dare
cmd({
    pattern: "dare",
    desc: "Get a dare challenge",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const dares = ["Do 10 push-ups!", "Text your crush and say hi!", "Sing the chorus of your favorite song!", "Change your profile pic to a cartoon for a day!"];
    await sendTsalaCard(conn, mek, from, sender, "Dare", dares[Math.floor(Math.random() * dares.length)]);
});

// 5. Say
cmd({
    pattern: "say",
    desc: "Echo your message",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args, reply }) => {
    if (!args.length) return reply(tiny("🔊 Say something!"));
    await sendTsalaCard(conn, mek, from, sender, "Echo", args.join(" "));
});

// 6. Hack (fake)
cmd({
    pattern: "hack",
    desc: "Simulate a fake hack",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args }) => {
    const name = args.join(" ") || `@${sender.split('@')[0]}`;
    await sendTsalaCard(conn, mek, from, sender, "Hack Simulation", `🧠 Hacking ${name}...\n🔍 Finding IP...\n⚠️ Uploading virus...\n✅ Hack complete! 😂`);
});

// 7. Rate
cmd({
    pattern: "rate",
    desc: "Rate someone",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args }) => {
    const name = args.join(" ") || "You";
    const rate = Math.floor(Math.random() * 100);
    await sendTsalaCard(conn, mek, from, sender, "Cool Rate", `📊 ${name} is ${rate}% cool!`);
});

// 8. Ship
cmd({
    pattern: "ship",
    desc: "Ship two names",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args, reply }) => {
    if (args.length < 2) return reply(tiny("💞 Please provide two names to ship!"));
    const love = Math.floor(Math.random() * 100);
    await sendTsalaCard(conn, mek, from, sender, "Love Ship", `❤️ ${args[0]} & ${args[1]}\n\n✨ Match: ${love}%!`);
});

// 9. Reverse
cmd({
    pattern: "reverse",
    desc: "Reverse text",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args, reply }) => {
    if (!args.length) return reply(tiny("🔁 Give text to reverse"));
    await sendTsalaCard(conn, mek, from, sender, "Reversed Text", args.join(" ").split("").reverse().join(""));
});

// 10. Flip coin
cmd({
    pattern: "flip",
    desc: "Flip a coin",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const result = Math.random() > 0.5 ? "🪙 Heads" : "🪙 Tails";
    await sendTsalaCard(conn, mek, from, sender, "Coin Flip", result);
});

// 11. Rock Paper Scissors
cmd({
    pattern: "rps",
    desc: "Play rock paper scissors",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const choices = ["Rock 🪨", "Paper 📄", "Scissors ✂️"];
    await sendTsalaCard(conn, mek, from, sender, "RPS Game", `🎮 I choose: ${choices[Math.floor(Math.random() * choices.length)]}`);
});

// 12. Slots
cmd({
    pattern: "slots",
    desc: "Slot machine game",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const items = ["🍒", "🍋", "🍉", "⭐", "💎"];
    const spin = [0, 0, 0].map(() => items[Math.floor(Math.random() * items.length)]);
    const result = (new Set(spin).size === 1) ? "🎉 Jackpot!" : "😢 Try again";
    await sendTsalaCard(conn, mek, from, sender, "Slot Machine", `🎰 [ ${spin.join(" | ")} ]\n\n${result}`);
});

// 13. 8ball
cmd({
    pattern: "8ball",
    desc: "Magic 8-ball answer",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args, reply }) => {
    if (!args.length) return reply(tiny("🎱 Ask a yes/no question."));
    const replies = ["Yes", "No", "Maybe", "Definitely", "Never"];
    await sendTsalaCard(conn, mek, from, sender, "Magic 8-Ball", `🎱 ${replies[Math.floor(Math.random() * replies.length)]}`);
});

// 14. Guess number
cmd({
    pattern: "guess",
    desc: "Guess a number 1-10",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const number = Math.floor(Math.random() * 10) + 1;
    await sendTsalaCard(conn, mek, from, sender, "Number Guess", `🤔 I'm thinking of a number between 1 and 10...\n\nIt was: *${number}*!`);
});

// 15. Fact
cmd({
    pattern: "fact",
    desc: "Random fact",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const facts = [
        "A group of flamingos is called a 'flamboyance'.",
        "Bananas are berries, but strawberries aren’t.",
        "Octopuses have three hearts.",
        "Honey never spoils."
    ];
    await sendTsalaCard(conn, mek, from, sender, "Fun Fact", `📚 ${facts[Math.floor(Math.random() * facts.length)]}`);
});

// 16. Insult
cmd({
    pattern: "insult",
    desc: "Funny roast",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const insults = [
        "You're as useless as the 'g' in lasagna.",
        "If I had a dollar for every smart thing you say, I'd be broke.",
        "You're the reason shampoo has instructions."
    ];
    await sendTsalaCard(conn, mek, from, sender, "Roast", `🔥 ${insults[Math.floor(Math.random() * insults.length)]}`);
});

// 17. Typing effect (Kept simple to prevent API spam with giant cards)
cmd({
    pattern: "type",
    desc: "Typing simulation",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    const msg = args.join(" ");
    if (!msg) return reply(tiny("💬 Give something to type"));
    for (let i = 1; i <= msg.length; i++) {
        await new Promise(r => setTimeout(r, 100));
        await reply(tiny(msg.slice(0, i)));
    }
});

// 18. Howgay
cmd({
    pattern: "howgay",
    desc: "How gay are you?",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, args }) => {
    const name = args.join(" ") || "You";
    const percent = Math.floor(Math.random() * 100);
    await sendTsalaCard(conn, mek, from, sender, "Gay Radar", `🌈 ${name} is ${percent}% gay today!`);
});

// 19. Sayjoke (TTS)
cmd({
    pattern: "sayjoke",
    desc: "Tell a joke with TTS",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender, reply }) => {
    const jokes = [
        "Why did the chicken cross the road? To get to the other side!",
        "I'm on a seafood diet. I see food and I eat it."
    ];
    const text = jokes[Math.floor(Math.random() * jokes.length)];
    const ttsUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=1`;
    
    const contextInfo = {
        mentionedJid: [sender],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid: '120363420003990090@newsletter', newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤' },
        externalAdReply: { title: "✧ Tsala Audio Joke ✧", body: "Powered By Mulax Prime", thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg", sourceUrl: "https://github.com/mulaxprime/Tsala_Yame", mediaType: 1, renderLargerThumbnail: true }
    };

    try {
        await conn.sendMessage(from, { audio: { url: ttsUrl }, mimetype: "audio/mpeg", ptt: true, contextInfo }, { quoted: mek });
    } catch {
        await sendTsalaCard(conn, mek, from, sender, "Joke Fallback", text);
    }
});

// 20. Textart
cmd({
    pattern: "textart",
    desc: "Random ASCII art",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, sender }) => {
    const arts = [
        "(¯`·.¸¸.·´¯)",
        "(¯`·.¸¸.-> ❤️ <-.¸¸.·´¯)",
        "(づ｡◕‿‿◕｡)づ",
        "(╯°□°）╯︵ ┻━┻"
    ];
    await sendTsalaCard(conn, mek, from, sender, "Text Art", arts[Math.floor(Math.random() * arts.length)]);
});