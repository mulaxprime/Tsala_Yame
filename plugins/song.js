const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
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
    pattern: "song",
    alias: ["ytplay", "play"],
    react: "🎶",
    desc: "Plays music from YouTube (audio only).",
    category: "downloader",
    filename: __filename,
}, async (conn, mek, m, { from, sender, q, reply }) => {

    if (!q) return reply(tiny("❌ Please enter the name of the song.\nExample: .play let me love you"));

    try {
        await conn.sendMessage(from, { react: { text: '🎶', key: mek.key } });

        // 1. Search YouTube (optional metadata fallback, or directly use David Cyril's play endpoint search query)
        const search = await yts(q);
        const video = search && search.videos && search.videos.length > 0 ? search.videos[0] : null;
        
        let title = video ? video.title : q;
        let duration = video ? video.timestamp : 'N/A';
        let views = video && video.views ? video.views.toLocaleString() : 'N/A';
        let url = video ? video.url : '';
        let thumbnail = video ? video.thumbnail : '';

        // 2. Use David Cyril Play Endpoint API (https://apis.davidcyril.name.ng/play?query=...)
        let audioUrl = null;

        try {
            const res = await axios.get(`https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(q)}`);
            const data = res.data;
            
            if (data && data.status && data.result) {
                title = data.result.title || title;
                duration = data.result.duration || duration;
                views = data.result.views ? Number(data.result.views).toLocaleString() : views;
                url = data.result.video_url || url;
                thumbnail = data.result.thumbnail || thumbnail;
                audioUrl = data.result.download_url;
            }
        } catch (e) {
            console.error("David Cyril API failed:", e.message);
        }

        if (!audioUrl || typeof audioUrl !== 'string') {
            return reply(tiny("❌ Failed to get audio download link from David Cyril API. Try again later."));
        }

        const infoText = 
            `│ 🎵 *Title:* ${title}
│ ⏱️ *Duration:* ${duration}
│ 👀 *Views:* ${views}
│ 🔗 *URL:* ${url}
│ 
│ ⏳ *Downloading audio...*`;

        const cardContent = 
            `╭───〔 🌸 *Tsala YouTube Downloader* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        const styledText = tiny(cardContent);
        const photoPath = getRandomPhoto();

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363412950068938@newsletter',
                newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤'
            },
            externalAdReply: {
                showAdAttribution: false,
                containsAutoReply: true,
                title: `✧ ${title} ✧`,
                body: "Powered By Mulax Prime",
                thumbnailUrl: thumbnail,
                sourceUrl: url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: styledText,
                contextInfo
            }, { quoted: mek });
        } else if (thumbnail) {
            await conn.sendMessage(from, {
                image: { url: thumbnail },
                caption: styledText,
                contextInfo
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: styledText, contextInfo }, { quoted: mek });
        }

        // 3. Download and send audio
        const audioBuffer = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        await conn.sendMessage(from, {
            audio: Buffer.from(audioBuffer.data),
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: mek });

    } catch (err) {
        console.error("Song command error:", err);
        reply(tiny("❌ Error occurred while processing your request."));
    }
});