const fetch = require("node-fetch");
const { cmd } = require("../command");
const Config = require("../config");
const { tiny } = require("../lib/fancy_font/fancy");

// List of all the command names (each corresponds to a JSON file)
const cmdnames = [
  'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chitanda', 'chitoge', 
  'deidara', 'doraemon', 'elaina', 'emilia', 'erza', 'gremory', 'hestia', 
  'hinata', 'inori', 'itachi', 'isuzu', 'itori', 'kaga', 'kagura', 'kakasih', 'kaori', 
  'kaneki', 'kosaki', 'kotori', 'kuriyama', 'kuroha', 'kurumi', 'madara', 'mikasa', 
  'miku', 'minato', 'naruto', 'natsukawa', 'neko2', 'nekohime', 'nezuko', 'nishimiya', 
  'onepiece', 'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina', 'shinka', 
  'shizuka', 'shota', 'tomori', 'toukachan', 'tsunade', 'yatogami', 'yuki'
];

cmdnames.forEach(cmdname => {
  cmd({
      pattern: cmdname,
      desc: `Get a random ${cmdname} wallpaper.`,
      category: "anime",
      react: "🎨",
      filename: __filename,
    },
    async (conn, mek, m, { from, sender, reply }) => {
      try {
        await conn.sendMessage(from, { react: { text: '🎨', key: mek.key } });

        // Construct the API URL dynamically using the command name
        let apiUrl = `https://raw.githubusercontent.com/KazukoGans/database/main/anime/${cmdname}.json`;
        let response = await fetch(apiUrl);
        let jsonResponse = await response.json();
        
        if (jsonResponse && jsonResponse.length > 0) {
          // Select a random wallpaper from the JSON array
          let randomIndex = Math.floor(Math.random() * jsonResponse.length);
          let randomWallpaperUrl = jsonResponse[randomIndex];
          
          const infoText = 
            `│ 🎨 *Character:* ${cmdname.charAt(0).toUpperCase() + cmdname.slice(1)}
│ 🖼️ *Type:* Anime Wallpaper
│ 🔗 *Source:* KazukoGans DB`;

          const cardContent = 
            `╭───〔 🌸 *Tsala Anime* 🌸 〕───⬣
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
                title: `✧ Tsala Yame - ${cmdname.toUpperCase()} ✧`,
                body: "Powered By Mulax Prime",
                thumbnailUrl: randomWallpaperUrl, // Using the fetched anime image for the thumbnail
                sourceUrl: "https://github.com/mulaxprime/Tsala_Yame",
                mediaType: 1,
                renderLargerThumbnail: true
            }
          };
          
          // Send the random image with caption
          await conn.sendMessage(from, { 
            image: { url: randomWallpaperUrl }, 
            caption: styledText,
            contextInfo
          }, { quoted: mek });
          
        } else {
          return reply(tiny("❌ Request not processed! No images found."));
        }
        
      } catch (error) {
        console.error(`Error fetching ${cmdname} image:`, error);
        reply(tiny(`❌ Error fetching ${cmdname} image. Please try again later.`));
      }
    }
  );
});