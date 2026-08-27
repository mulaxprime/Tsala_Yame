 const config = require('../config')
const {cmd , commands} = require('../command')
const fs = require('fs');
const path = require('path');

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
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    react: "👋",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    const photoPath = getRandomPhoto();
    let imageSource;

    if (photoPath && fs.existsSync(photoPath)) {
        imageSource = fs.readFileSync(photoPath);
    } else {
        imageSource = { url: config.ALIVE_IMG };
    }

    return await conn.sendMessage(from, {
        image: imageSource, 
        caption: config.ALIVE_MSG
    }, { quoted: mek })
}catch(e){
    console.log(e)
    reply(`${e}`)
}
})