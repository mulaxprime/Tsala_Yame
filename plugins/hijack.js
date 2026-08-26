const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const axios = require('axios');

cmd({
    pattern: "hijack",
    alias: ["takeover"],
    desc: "Hijack the group - remove admins and change group info",
    category: "admin",
    react: "⚠️",
    filename: __filename
},
    
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups!");
    if (!isBotAdmins) return reply("❌ I need to be an admin to perform this action!");
    if (!isAdmins) return reply("❌ You need to be an admin to use this command!");

    try {
        // Remove all admins
        const admins = groupAdmins;
        for (const admin of admins) {
            if (admin !== botNumber) { // Don't remove the bot itself
                await conn.groupParticipantsUpdate(from, [admin], "remove");
            }
        }
        await reply("ᴀᴅᴍɪɴs ʀᴇᴍᴏᴠᴇᴅ sᴜᴄᴇssғᴜʟʟʏ✅");

        // Change group name
        await conn.groupUpdateSubject(from, "ʜɪᴊᴀᴄᴋ ʙʏ ᴍᴀʀɪᴀ-ᴍᴅ");

        // Change group description
        await conn.groupUpdateDescription(from, "ᴛʜɪs ɢᴄ ʜᴀs ʙᴇᴇɴ ʜɪᴊᴀᴄᴋᴇᴅ");

        // Change group picture (using a default image URL)
        try {
            const imageUrl = "https://i.imgur.com/example.jpg"; // Replace with your image URL
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            await conn.updateProfilePicture(from, { url: imageUrl });
        } catch (imgErr) {
            console.error("Error changing group picture:", imgErr);
        }

        await reply("ɢᴄ ʜɪᴊᴀᴄᴋᴇᴅ sᴜᴄᴇssғᴜʟʟʏ✅");
    } catch (error) {
        console.error("Hijack error:", error);
        reply("❌ An error occurred during the hijack process!");
    }
});
