/* Credits:
Mr Frank
 Dont remove this credits 
 */

const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const config = require('../config');
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
    pattern: "update",  
    alias: ["upgrade", "sync"],  
    react: '🚀',  
    desc: "Update the bot to the latest version",  
    category: "system",  
    filename: __filename
}, async (client, message, args, { from, reply, sender, isOwner }) => {  
    if (!isOwner) return reply(tiny("❌ Owner only command!"));
  
    try {
        // Send reaction explicitly
        await client.sendMessage(from, { react: { text: '🚀', key: message.key } });

        const repoUrl = config.REPO || "https://github.com/mulaxprime/Tsala_Yame";
        const repoName = repoUrl.split('/').pop();
        
        await reply(tiny("📥 Downloading updates directly..."));
        
        // 1. Download the ZIP directly to memory
        const { data } = await axios.get(`${repoUrl}/archive/main.zip`, {
            responseType: "arraybuffer",
            timeout: 30000
        });

        // 2. Process ZIP directly in memory
        const zip = new AdmZip(data);
        const zipEntries = zip.getEntries();
        
        // 3. Find and process files directly from ZIP
        const protectedFiles = ["config.js", "app.json", "data"];
        const basePath = `${repoName}-main/`;
        
        await reply(tiny("🔄 Applying updates..."));
        
        for (const entry of zipEntries) {
            if (entry.isDirectory) continue;
            
            const relativePath = entry.entryName.replace(basePath, '');
            const destPath = path.join(__dirname, '..', relativePath);
            
            // Skip protected files
            if (protectedFiles.some(f => destPath.includes(f))) continue;
            
            // Ensure directory exists
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Write file directly from ZIP
            zip.extractEntryTo(entry, dir, false, true, entry.name);
        }

        let successText = 
            `╭───〔 🌸 *T𝚜𝚊𝚕𝚊 U𝚙𝚍𝚊𝚝𝚎* 🌸 〕───⬣
│ ✅ *Status:* Update complete!
│ 🔄 *Action:* Restarting...
╰──────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        let styledSuccess = tiny(successText);
        const photoPath = getRandomPhoto();

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await client.sendMessage(from, {
                image: imageBuffer,
                caption: styledSuccess
            }, { quoted: message });
        } else {
            await reply(styledSuccess);
        }

        setTimeout(() => process.exit(0), 2000);

    } catch (error) {
        console.error("Update error:", error);
        const errorText = `❌ Update failed: ${error.message}\n\nPlease update manually from:\n${config.REPO || "https://github.com/mulaxprime/Tsala_Yame"}`;
        reply(tiny(errorText));
    }
});