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
async (conn, mek, m, { from, isGroup, sender, botNumber, isOwner, groupAdmins, isBotAdmins, isAdmins, reply }) => {

    if (!isGroup) return reply("❌ This command can only be used in groups!");
    if (!isBotAdmins) return reply("❌ I need to be an admin to perform this action!");
    if (!isOwner && !isAdmins) return reply("❌ Only the owner or group admins can use this command!");

    try {
        // Remove all other admins
        for (const admin of groupAdmins) {
            const normalizedAdmin = admin.replace(/:.*@/, '@') // basic normalize
            const normalizedBot = botNumber.replace(/:.*@/, '@')

            if (normalizedAdmin !== normalizedBot) {
                await conn.groupParticipantsUpdate(from, [admin], "remove")
            }
        }

        await reply("ᴀᴅᴍɪɴs ʀᴇᴍᴏᴠᴇᴅ sᴜᴄᴇssғᴜʟʟʏ✅");

        // Change group name
        await conn.groupUpdateSubject(from, "ʜɪᴊᴀᴄᴋ ʙʏ ᴍᴀʀɪᴀ-ᴍᴅ");

        // Change group description
        await conn.groupUpdateDescription(from, "ᴛʜɪs ɢᴄ ʜᴀs ʙᴇᴇɴ ʜɪᴊᴀᴄᴋᴇᴅ");

        await reply("ɢᴄ ʜɪᴊᴀᴄᴋᴇᴅ sᴜᴄᴇssғᴜʟʟʏ✅");

    } catch (error) {
        console.error("Hijack error:", error);
        reply("❌ An error occurred during the hijack process!");
    }
});