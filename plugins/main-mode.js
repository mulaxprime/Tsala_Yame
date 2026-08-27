const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

const configPath = path.join(__dirname, '../config.json');

// Load the config from the JSON file.
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  console.error("Error reading config file:", err);
  config = {};
}

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

cmd(
  {
    pattern: "mode",
    desc: "Toggle the bot's mode (public or private). Only the owner can use this command.",
    category: "main",
    react: "🛡️",
    filename: __filename
  },
  async (conn, mek, m, { args, isOwner, reply, from }) => {
    try {
      // Only allow the owner to change the mode.
      if (!isOwner) {
        return reply("Access denied: You are not allowed to change the mode.");
      }
      
      // Validate the provided mode argument.
      const newMode = args[0] ? args[0].toLowerCase() : null;
      if (!newMode || !['public', 'private'].includes(newMode)) {
        return reply("Usage: .mode [public|private]");
      }
      
      // Update the in-memory config.
      config.MODE = newMode;
      
      // Write the updated config back to the config.json file.
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
      
      const successMessage = `Bot mode updated to: ${newMode}`;
      const photoPath = getRandomPhoto();

      if (photoPath && fs.existsSync(photoPath)) {
          const imageBuffer = fs.readFileSync(photoPath);
          await conn.sendMessage(from, {
              image: imageBuffer,
              caption: successMessage
          }, { quoted: mek });
      } else {
          await reply(successMessage);
      }
    } catch (e) {
      console.error(e);
      reply(`${e}`);
    }
  }
);