const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/lztgy3.png",
    ALIVE_MSG: process.env.ALIVE_MSG || "Hey there, I'm alive",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "26775462914",
    MODE: process.env.MODE || "public",
    PREFIX: process.env.PREFIX || ".",
    BOT_NAME: process.env.BOT_NAME || "Tsala_Yame",
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "False",
    OWNER_NAME: process.env.OWNER_NAME || "MULAX PRIME",
    AUTO_CHATBOT: process.env.AUTO_CHATBOT || "True", // Add this line
};