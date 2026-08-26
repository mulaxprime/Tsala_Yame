const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "song",
    alias: ["ytplay", "play"],
    react: "🎶",
    desc: "Plays music from YouTube (audio only).",
    category: "downloader",
    filename: __filename,
}, async (conn, mek, m, { from, args, q, reply }) => {   // ← changed text → q

    if (!q) return reply("❌ Please enter the name of the song.\nExample: `.play let me love you`");

    try {
        // 1. Search YouTube
        const search = await yts(q);
        if (!search || !search.videos || search.videos.length === 0) {
            return reply("❌ No results found.");
        }

        const video = search.videos[0];
        const url = video.url;
        const title = video.title;
        const duration = video.timestamp;
        const thumbnail = video.thumbnail;

        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `🎵 *Title:* ${title}\n🕒 *Duration:* ${duration}\n\n⏳ Downloading audio...`,
        }, { quoted: mek });

        // 2. Try multiple APIs
        let audioUrl = null;

        // API 1
        try {
            const res1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`);
            if (res1.data?.data?.dl) {
                audioUrl = res1.data.data.dl;
            }
        } catch (e) {}

        // API 2
        if (!audioUrl) {
            try {
                const res2 = await axios.get(`https://api.agungnyne.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
                if (res2.data?.result?.url) {
                    audioUrl = res2.data.result.url;
                }
            } catch (e) {}
        }

        // API 3
        if (!audioUrl) {
            try {
                const res3 = await axios.get(`https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=${encodeURIComponent(url)}`);
                if (res3.data?.result?.link) {
                    audioUrl = res3.data.result.link;
                }
            } catch (e) {}
        }

        if (!audioUrl) {
            return reply("❌ Failed to get audio download link. All free APIs are currently down.\nTry again later.");
        }

        // 3. Download and send
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
        reply("❌ Error occurred while processing your request.");
    }
});