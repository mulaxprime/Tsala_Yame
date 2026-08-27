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

        // 1. Search YouTube
        const search = await yts(q);
        if (!search || !search.videos || search.videos.length === 0) {
            return reply(tiny("❌ No results found."));
        }

        const video = search.videos[0];
        const url = video.url;
        const title = video.title;
        const duration = video.timestamp;
        const views = video.views ? video.views.toLocaleString() : 'N/A';
        const author = video.author?.name || 'N/A';
        const ago = video.ago || 'N/A';
        const thumbnail = video.thumbnail;

        const infoText = 
            `│ 🎵 *Title:* ${title}
│ ⏱️ *Duration:* ${duration}
│ 👀 *Views:* ${views}
│ 👤 *Author:* ${author}
│ 📅 *Uploaded:* ${ago}
│ 🔗 *URL:* ${url}
│ 
│ ⏳ *Downloading audio...*`;

        const cardContent = 
            `╭───〔 🌸 *Tsala YouTube Downloader* 🌸 〕───⬣
${infoText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

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
        } else {
            await conn.sendMessage(from, {
                image: { url: thumbnail },
                caption: styledText,
                contextInfo
            }, { quoted: mek });
        }

        // 2. Try multiple reliable APIs
        let audioUrl = null;

        // API 1: BK9 (Highly Reliable)
        try {
            const res1 = await axios.get(`https://bk9.fun/download/ytmp3?url=${encodeURIComponent(url)}`);
            if (res1.data?.BK9?.mp3) {
                audioUrl = res1.data.BK9.mp3;
            }
        } catch (e) {
            console.log("API 1 (BK9) failed");
        }

        // API 2: Vreden (Good fallback)
        if (!audioUrl) {
            try {
                const res2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
                if (res2.data?.result?.download?.url) {
                    audioUrl = res2.data.result.download.url;
                }
            } catch (e) {
                console.log("API 2 (Vreden) failed");
            }
        }

        // API 3: Siputzx (Backup)
        if (!audioUrl) {
            try {
                const res3 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`);
                if (res3.data?.data?.dl) {
                    audioUrl = res3.data.data.dl;
                }
            } catch (e) {
                console.log("API 3 (Siputzx) failed");
            }
        }

        if (!audioUrl) {
            return reply(tiny("❌ Failed to get audio download link. All free APIs are currently down.\nTry again later."));
        }

        // 3. Download and send
        const audioBuffer = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 60000 // 60 seconds timeout for large files
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