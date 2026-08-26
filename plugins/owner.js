const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')
// 1. Shutdown Bot
cmd({ pattern: "shutdown", desc: "Shutdown the bot.", category: "owner", react: "👀", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(" You are not my owner!");
  try {
    await conn.logout();
    reply(" Shutting down...").then(() => process.exit());
  } catch (error) {
    reply(` Error shutting down: ${error.message}`);
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
    if (!isOwner) return reply("😡 you lack access to use this command");
    if (args.length === 0) return reply("📢 Please provide a message to broadcast.");
    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }
    reply("📢 Message broadcasted to all groups.");
});
// 3. Set Profile Picture
cmd({ pattern: "setpp", desc: "Set bot profile picture.", category: "owner", react: "😎", filename: __filename }, async (conn, mek, m, { from, isOwner, quoted, reply }) => {
  if (!isOwner) return reply(" You are not my owner");
  if (!quoted || !quoted.message.imageMessage) return reply(" Please reply to an image.");
  try {
    const media = await conn.downloadMediaMessage(quoted);
    await conn.updateProfilePicture(conn.user.jid, media);
    reply(" Profile picture updated successfully!");
  } catch (error) {
    reply(` Error updating profile picture: ${error.message}`);
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
    if (!isOwner) return reply("❌ 😡 you lack access to use this command");
    if (!quoted) return reply("❌ Please reply to the user you want to block.");
    const user = quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'block');
        reply(`🚫 User ${user} blocked successfully.`);
    } catch (error) {
        reply(`❌ Error blocking user: ${error.message}`);
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
    if (!isOwner) return reply("❌ 😡 you lack access to use this command");
    if (!quoted) return reply("❌ Please reply to the user you want to unblock.");
    const user = quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'unblock');
        reply(`✅ User ${user} unblocked successfully.`);
    } catch (error) {
        reply(`❌ Error unblocking user: ${error.message}`);
    }
});
// 6. Clear All Chats
cmd({ pattern: "clearchats", desc: "Clear all chats from the bot.", category: "owner", react: "😜", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(" 😡 you lack access to use this command");
  try {
    const chats = await conn.getAllChats();
    for (const chat of chats) {
      await conn.deleteChat(chat.jid);
    }
    reply(" All chats cleared successfully!");
  } catch (error) {
    reply(` Error clearing chats: ${error.message}`);
  }
});

cmd({ pattern: "jid", desc: "Get the user's JID.", category: "owner", react: "✨", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(" You are not my owner!");
  reply(` *User JID:* ${from}`);
});
// 8. Group JIDs List
cmd({ pattern: "gjid", desc: "Get the list of JIDs for all groups the bot is part of.", category: "owner", react: "😼", filename: __filename }, async (conn, mek, m, { from, isOwner, reply }) => {
  if (!isOwner) return reply(" 😡 you lack access to use this command");
  try {
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = groups.map(group => group.jid).join('\n');
    reply(` *Group JIDs:*\n\n${groupJids}`);
  } catch (error) {
    reply(` Error: ${error.message}`);
  }
});
                                                                                                                    
