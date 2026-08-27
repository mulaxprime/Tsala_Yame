const { cmd, commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const { sleep } = require('../lib/functions');
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

// Helper function to send styled card messages with optional random photo
async function sendCardMessage(conn, from, mek, titleText, contentText) {
    const cardContent = 
        `╭───〔 🌸 *Tsala ${titleText}* 🌸 〕───⬣
${contentText}
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀ𝙴ᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

    const styledText = tiny(cardContent);
    const photoPath = getRandomPhoto();

    if (photoPath && fs.existsSync(photoPath)) {
        const imageBuffer = fs.readFileSync(photoPath);
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: styledText
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: styledText }, { quoted: mek });
    }
}

// 1. Shutdown Bot
cmd({ pattern: "shutdown", desc: "Shutdown the bot.", category: "owner", react: "👀", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(tiny("❌ You are not my owner!"));
  try {
    await conn.sendMessage(from, { react: { text: '👀', key: mek.key } });
    await sendCardMessage(conn, from, mek, "Shutdown", "│ 💤 *Status:* Shutting down bot...");
    await conn.logout();
    process.exit();
  } catch (error) {
    reply(tiny(`❌ Error shutting down: ${error.message}`));
  }
});

// 2. Broadcast Message to All Groups
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply(tiny("❌ You lack access to use this command"));
    if (args.length === 0) return reply(tiny("📢 Please provide a message to broadcast."));
    
    await conn.sendMessage(from, { react: { text: '📢', key: mek.key } });
    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    
    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }
    
    await sendCardMessage(conn, from, mek, "Broadcast", `│ 📢 *Status:* Message broadcasted successfully to ${groups.length} groups.`);
});

// 3. Set Profile Picture
cmd({ pattern: "setpp", desc: "Set bot profile picture.", category: "owner", react: "😎", filename: __filename }, async (conn, mek, m, { from, isOwner, quoted, reply }) => {
  if (!isOwner) return reply(tiny("❌ You are not my owner"));
  if (!quoted || !quoted.message.imageMessage) return reply(tiny("❌ Please reply to an image."));
  try {
    await conn.sendMessage(from, { react: { text: '😎', key: mek.key } });
    const media = await conn.downloadMediaMessage(quoted);
    await conn.updateProfilePicture(conn.user.jid, media);
    await sendCardMessage(conn, from, mek, "Profile", "│ 🖼️ *Status:* Profile picture updated successfully!");
  } catch (error) {
    reply(tiny(`❌ Error updating profile picture: ${error.message}`));
  }
});

// 4. Block User
cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply(tiny("❌ You lack access to use this command"));
    if (!quoted) return reply(tiny("❌ Please reply to the user you want to block."));
    const user = quoted.sender;
    try {
        await conn.sendMessage(from, { react: { text: '🚫', key: mek.key } });
        await conn.updateBlockStatus(user, 'block');
        await sendCardMessage(conn, from, mek, "Block", `│ 🚫 *User:* ${user}\n│ ⚡ *Status:* Blocked successfully.`);
    } catch (error) {
        reply(tiny(`❌ Error blocking user: ${error.message}`));
    }
});

// 5. Unblock User
cmd({
    pattern: "unblock",
    desc: "Unblock a user.",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply(tiny("❌ You lack access to use this command"));
    if (!quoted) return reply(tiny("❌ Please reply to the user you want to unblock."));
    const user = quoted.sender;
    try {
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await conn.updateBlockStatus(user, 'unblock');
        await sendCardMessage(conn, from, mek, "Unblock", `│ ✅ *User:* ${user}\n│ ⚡ *Status:* Unblocked successfully.`);
    } catch (error) {
        reply(tiny(`❌ Error unblocking user: ${error.message}`));
    }
});

// 6. Clear All Chats
cmd({ pattern: "clearchats", desc: "Clear all chats from the bot.", category: "owner", react: "😜", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(tiny("❌ You lack access to use this command"));
  try {
    await conn.sendMessage(from, { react: { text: '😜', key: mek.key } });
    const chats = await conn.getAllChats();
    for (const chat of chats) {
      await conn.deleteChat(chat.jid);
    }
    await sendCardMessage(conn, from, mek, "Clear Chats", "│ 🧹 *Status:* All chats cleared successfully!");
  } catch (error) {
    reply(tiny(`❌ Error clearing chats: ${error.message}`));
  }
});

// 7. Get User JID
cmd({ pattern: "jid", desc: "Get the user's JID.", category: "owner", react: "✨", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(tiny("❌ You are not my owner!"));
  await conn.sendMessage(from, { react: { text: '✨', key: mek.key } });
  await sendCardMessage(conn, from, mek, "User JID", `│ 📌 *JID:* ${from}`);
});

// 8. Group JIDs List
cmd({ pattern: "gjid", desc: "Get the list of JIDs for all groups the bot is part of.", category: "owner", react: "😼", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(tiny("❌ You lack access to use this command"));
  try {
    await conn.sendMessage(from, { react: { text: '😼', key: mek.key } });
    const groups = await conn.groupFetchAllParticipating();
    const groupEntries = Object.values(groups);
    const groupJids = groupEntries.map(group => group.id).join('\n│ 🔹 ');
    
    await sendCardMessage(conn, from, mek, "Group JIDs", `│ 🔹 ${groupJids}`);
  } catch (error) {
    reply(tiny(`❌ Error: ${error.message}`));
  }
});