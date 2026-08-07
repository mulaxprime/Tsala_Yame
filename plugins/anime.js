const fs = require("fs");
const fetch = require("node-fetch"); // For fetching the JSON data
const { cmd } = require("../command");
const Config = require("../config");

// List of all the command names (each corresponds to a JSON file)
const cmdnames = [
  'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chitanda', 'chitoge', 
  'deidara', 'doraemon', 'elaina', 'emilia', 'asuna', 'erza', 'gremory', 'hestia', 
  'hinata', 'inori', 'itachi', 'isuzu', 'itori', 'kaga', 'kagura', 'kakasih', 'kaori', 
  'kaneki', 'kosaki', 'kotori', 'kuriyama', 'kuroha', 'kurumi', 'madara', 'mikasa', 
  'miku', 'minato', 'naruto', 'natsukawa', 'neko2', 'nekohime', 'nezuko', 'nishimiya', 
  'onepiece', 'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina', 'shinka', 
  'shizuka', 'shota', 'tomori', 'toukachan', 'tsunade', 'yatogami', 'yuki'
];

cmdnames.forEach(cmdname => {
  cmd(
    {
      pattern: cmdname,
      desc: `Get a random ${cmdname} wallpaper.`,
      category: "anime",
      react: "🎨",
      filename: __filename,
    },
    async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, botNumber, pushname, isMe, isOwner, reply }) => {
      try {
        // Construct the API URL dynamically using the command name
        let apiUrl = `https://raw.githubusercontent.com/KazukoGans/database/main/anime/${cmdname}.json`;
        let response = await fetch(apiUrl);
        let jsonResponse = await response.json();
        
        if (jsonResponse && jsonResponse.length > 0) {
          // Select a random wallpaper from the JSON array
          let randomIndex = Math.floor(Math.random() * jsonResponse.length);
          let randomWallpaperUrl = jsonResponse[randomIndex];
          
          // Send the random image with caption from Config
          await conn.sendMessage(m.chat, { 
            image: { url: randomWallpaperUrl }, 
            caption: Config.caption 
          }, { quoted: mek });
        } else {
          await reply("*_Request not processed!_*");
        }
        
        // React to the command invocation
        await m.react("🎨");
        // Clear the reaction after 5 seconds
        setTimeout(() => {
          m.react("");
        }, 5000);
        
      } catch (error) {
        await m.error(
          error + `\n\ncommand: ${cmdname}`,
          error,
          "*_No response from API, Sorry!!_*"
        );
      }
    }
  );
});
