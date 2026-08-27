const { cmd } = require('../command');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const { tiny } = require("../lib/fancy_font/fancy");
const config = require('../config');

// Function to get a random photo safely
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

// Helper function to build and send the Tsala Yame card for group commands
async function sendTsalaGroupCard(conn, mek, from, sender, title, content) {
    const infoText = 
`│ 👥 *${title}*
│
│ ${content}`;

    const cardContent = 
        `╭───〔 🌸 *Tsala Group* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

    const styledText = tiny(cardContent);
    const photoPath = getRandomPhoto();

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
            title: `✧ Tsala Group - ${title} ✧`,
            body: "Powered By Mulax Prime",
            thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
            sourceUrl: "https://github.com/mulaxprime/Tsala_Yame",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };

    if (photoPath && fs.existsSync(photoPath)) {
        const imageBuffer = fs.readFileSync(photoPath);
        await conn.sendMessage(from, { image: imageBuffer, caption: styledText, contextInfo }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: styledText, contextInfo }, { quoted: mek });
    }
}

// 1. Admins
cmd({
    pattern: "admins",
    desc: "Get a list of group admins.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        const groupMetadata = await conn.groupMetadata(from);
        const admins = groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(admin => `@${admin.id.split('@')[0]}`)
            .join('\n');

        const mentionsList = groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(admin => admin.id);

        const infoText = `│ 👥 *Group Admins:*\n│\n│ ${admins}`;
        const cardContent = `╭───〔 🌸 *Tsala Group* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;
        const styledText = tiny(cardContent);
        const photoPath = getRandomPhoto();

        const contextInfo = {
            mentionedJid: mentionsList,
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: '120363420003990090@newsletter', newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤' },
            externalAdReply: { title: "✧ Tsala Group - Admins ✧", body: "Powered By Mulax Prime", thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg", sourceUrl: "https://github.com/mulaxprime/Tsala_Yame", mediaType: 1, renderLargerThumbnail: true }
        };

        if (photoPath && fs.existsSync(photoPath)) {
            await conn.sendMessage(from, { image: fs.readFileSync(photoPath), caption: styledText, contextInfo }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: styledText, contextInfo }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e.message}`));
    }
});

// 2. Group Description
cmd({
    pattern: "gdesc",
    desc: "Change the group description.",
    use: '.groupdesc <New Description>',
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isAdmins) return reply(tiny("You Must Be Admin For Use This Command"));
        if (args.length === 0) return reply(tiny('Please provide a new group description.'));

        const newDesc = args.join(' ');
        await conn.groupUpdateDescription(from, newDesc);
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Description Updated", `New Description:\n${newDesc}`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e.message}`));
    }
});

// 3. Group Info
cmd({
    pattern: "ginfo",
    desc: "Get information about the group.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        const groupMetadata = await conn.groupMetadata(from);
        const groupInfo = 
`Group Name: ${groupMetadata.subject}
Description: ${groupMetadata.desc || 'No Description'}
Members: ${groupMetadata.participants.length}
Created On: ${new Date(groupMetadata.creation * 1000).toLocaleString()}`;

        await sendTsalaGroupCard(conn, mek, from, sender, "Group Information", groupInfo);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e.message}`));
    }
});

// 4. Group Invite Link
cmd({
    pattern: "glink",
    desc: "Get the group's invite link.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        const inviteLink = await conn.groupInviteCode(from);
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Invite Link", `https://chat.whatsapp.com/${inviteLink}`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e.message}`));
    }
});

// 5. Change Group Name (gname / setsubject)
cmd({
    pattern: "gname",
    desc: "Change the group name",
    use: ".gname <New Group Name>",
    react: "✏️",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, groupMetadata, args, reply }) => {
    if (!isGroup) return reply(tiny("This command can only be used in groups."));
    const botNumber = conn.user.jid;
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) return reply(tiny("I'm not an admin in this group."));
    const newName = args.join(" ");
    if (!newName) return reply(tiny("Please provide a new group name."));

    try {
        await conn.groupUpdateSubject(from, newName);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Name Changed", `New Name: ${newName}`);
    } catch (error) {
        console.error('Error changing group name:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(tiny("Failed to change the group name. Please try again later."));
    }
});

cmd({
    pattern: "setsubject",
    desc: "Change the group subject.",
    use: '.setsubject <New Subject>',
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isAdmins) return reply(tiny("You Must Be Admin For Use This Command"));
        if (args.length === 0) return reply(tiny('Please provide a new group subject.'));

        const newSubject = args.join(' ');
        await conn.groupUpdateSubject(from, newSubject);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Subject Updated", `New Subject: ${newSubject}`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e.message}`));
    }
});

// 6. Tagall
cmd({
    pattern: "tagall",
    desc: "Mention all group members.",
    react: "👥",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isAdmins) return reply(tiny("You Must Be Admin For Use This Command"));
        
        const groupMetadata = await conn.groupMetadata(from);
        const members = groupMetadata.participants.map(participant => `@${participant.id.split('@')[0]}`).join('\n');
        const mentions = groupMetadata.participants.map(p => p.id);

        const infoText = `│ 👥 *Mentioning Everyone:*\n│\n│ ${members}`;
        const cardContent = `╭───〔 🌸 *Tsala Group* 🌸 〕───⬣\n${infoText}\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;
        const styledText = tiny(cardContent);
        const photoPath = getRandomPhoto();

        const contextInfo = {
            mentionedJid: mentions,
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: '120363420003990090@newsletter', newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤' },
            externalAdReply: { title: "✧ Tsala Group - Tagall ✧", body: "Powered By Mulax Prime", thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg", sourceUrl: "https://github.com/mulaxprime/Tsala_Yame", mediaType: 1, renderLargerThumbnail: true }
        };

        if (photoPath && fs.existsSync(photoPath)) {
            await conn.sendMessage(from, { image: fs.readFileSync(photoPath), caption: styledText, contextInfo }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: styledText, contextInfo }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(tiny(`Error: ${e.message}`));
    }
});

// 7. Join Requests Management (Requests, Accept, Reject)
cmd({
    pattern: "requests",
    desc: "View pending join requests",
    use: ".requests",
    react: "📝",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply }) => {
    if (!isGroup) return reply(tiny("This command can only be used in groups."));
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) return reply(tiny("I'm not an admin in this group."));

    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) return reply(tiny("No pending join requests."));

        let msg = "";
        requests.forEach((request, index) => {
            msg += `${index + 1}. @${request.jid.split("@")[0]}\n`;
        });
        
        await sendTsalaGroupCard(conn, mek, from, sender, "Pending Join Requests", msg);
    } catch (error) {
        console.error('Error retrieving join requests:', error);
        return reply(tiny("Failed to retrieve join requests. Please try again later."));
    }
});

cmd({
    pattern: "accept",
    desc: "Accept group join request(s)",
    use: ".accept <request numbers>",
    react: "✔️",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, match }) => {
    if (!isGroup) return reply(tiny("This command can only be used in groups."));
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) return reply(tiny("_I'm not an admin in this group._"));
    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) return reply(tiny("No pending join requests."));
        if (!match) return reply(tiny("_Provide the number(s) of the request(s) to accept, separated by commas._"));
        
        const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
        const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);
        if (validIndexes.length === 0) return reply(tiny("_Invalid request number(s)._"));
        
        for (let index of validIndexes) {
            await conn.groupRequestParticipantsUpdate(from, [requests[index].jid], "accept");
        }
        await sendTsalaGroupCard(conn, mek, from, sender, "Requests Accepted", `Successfully accepted ${validIndexes.length} join request(s).`);
    } catch (error) {
        console.error('Error accepting join requests:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(tiny("Failed to accept join requests. Please try again later."));
    }
});

cmd({
    pattern: "reject",
    desc: "Reject group join request(s)",
    use: ".reject <request numbers>",
    react: "❌",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, match }) => {
    if (!isGroup) return reply(tiny("This command can only be used in groups."));
    const botNumber = conn.user.jid;
    const groupMetadata = await conn.groupMetadata(from);
    const isBotAdmin = groupMetadata.participants.some(participant => participant.jid === botNumber && participant.admin);

    if (!isBotAdmin) return reply(tiny("I'm not an admin in this group."));

    try {
        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) return reply(tiny("No pending join requests."));
        if (!match) return reply(tiny("Provide the number(s) of the request(s) to reject, separated by commas."));

        const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
        const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);

        if (validIndexes.length === 0) return reply(tiny("_Invalid request number(s)._"));
        for (let index of validIndexes) {
            await conn.groupRequestParticipantsUpdate(from, [requests[index].jid], "reject");
        }

        await sendTsalaGroupCard(conn, mek, from, sender, "Requests Rejected", `Rejected ${validIndexes.length} join request(s).`);
    } catch (error) {
        console.error('Error rejecting join requests:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(tiny("Failed to reject join requests. Please try again later."));
    }
});

// 8. Kick
cmd({
    pattern: "kick",
    desc: "Kicks replied/quoted user from group.",
    react: "👥",
    category: "group",
    filename: __filename,
    use: '<quote|reply>',
}, async (conn, mek, m, { from, sender, quoted, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny('This command is only for groups.'));
        if (!isBotAdmins) return reply(tiny("I can't do that. Please make me a group admin."));
        if (!isAdmins) return reply(tiny("You must be an admin to use this command."));

        const user = quoted ? quoted.sender : null;
        if (!user) return reply(tiny('Please reply to a user to kick them.'));

        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        await sendTsalaGroupCard(conn, mek, from, sender, "User Kicked", `@${user.split('@')[0]} has been removed from the group!`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny('Error occurred while trying to kick the user.'));
    }
});

// 9. Unlock & Lock Group
cmd({
    pattern: "unlock",
    desc: "Allow all participants to modify the group's settings",
    react: "🔓",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isBotAdmins) return reply(tiny("I need to be a group admin to perform this action."));
        if (!isAdmins) return reply(tiny("You must be an admin to use this command."));

        await conn.groupSettingUpdate(mek.key.remoteJid, 'unlocked');
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Unlocked", "All participants can now modify group settings.");
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e}`));
    }
});

cmd({
    pattern: "lock",
    desc: "Only allow admins to modify the group's settings",
    react: "🔒",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isBotAdmins) return reply(tiny("I need to be a group admin to perform this action."));
        if (!isAdmins) return reply(tiny("You must be an admin to use this command."));

        await conn.groupSettingUpdate(mek.key.remoteJid, 'locked');
        await sendTsalaGroupCard(conn, mek, from, sender, "Group Locked", "Only admins can now modify group settings.");
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e}`));
    }
});

// 10. Approve Specific Country Members
cmd({
    pattern: "approve",
    desc: "Automatically approve Specific Country users in the waiting list",
    react: "✅",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply(tiny("This command is only for groups."));
        if (!isBotAdmins) return reply(tiny("I need to be a group admin to perform this action."));
        if (!isAdmins) return reply(tiny("You must be an admin to use this command."));

        const groupJid = mek.key.remoteJid;
        const response = await conn.groupRequestParticipantsList(groupJid);

        if (response.length === 0) return reply(tiny("No participants are in the waiting list."));
        
        const countryCode = config.AUTO_ADD_Country_Code || "+263";
        const toAddUsers = response.filter(user => user.jid.startsWith(countryCode.replace("+", "")));

        if (toAddUsers.length === 0) return reply(tiny(`No users from code ${countryCode} found in the waiting list.`));

        const userJids = toAddUsers.map(user => user.jid);
        await conn.groupRequestParticipantsUpdate(groupJid, userJids, "approve");

        await sendTsalaGroupCard(conn, mek, from, sender, "Auto Approved", `Approved users:\n${userJids.map(j => '@' + j.split('@')[0]).join('\n')}`);
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(tiny(`Error: ${e}`));
    }
});

// 11. Poll
cmd({
    pattern: "poll",
    desc: "Create a poll",
    use: ".poll <Question> | <Option1> | <Option2> | ...",
    react: "📊",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, match }) => {
    if (!isGroup) return reply(tiny("This command can only be used in groups."));
    const [question, ...options] = match.split("|").map(item => item.trim());
    if (!question || options.length < 2) return reply(tiny("Usage: .poll <Question> | <Option1> | <Option2> | ..."));

    const poll = {
        name: question,
        values: options,
        selectableCount: 1,
    };

    try {
        await conn.sendMessage(from, { poll });
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (error) {
        console.error('Error creating poll:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(tiny("Failed to create poll. Please try again later."));
    }
});

// 12. Get Profile Picture
cmd({
    pattern: "getpic",
    desc: "Get the group profile picture.",
    category: "group",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply(tiny('This command can only be used in a group.'));

        const groupPic = await conn.getProfilePicture(from);
        const cardContent = `╭───〔 🌸 *Tsala Group Pic* 🌸 〕───⬣\n│ 🖼️ *Group Profile Picture*\n╰──────────────────────⬣\n> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;
        const styledText = tiny(cardContent);

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: { newsletterJid: '120363420003990090@newsletter', newsletterName: '⏤͟͟͞͞Tsala Yame  ͟͞͞⏤' },
            externalAdReply: { title: "✧ Tsala Group Picture ✧", body: "Powered By Mulax Prime", thumbnailUrl: groupPic, sourceUrl: "https://github.com/mulaxprime/Tsala_Yame", mediaType: 1, renderLargerThumbnail: true }
        };

        await conn.sendMessage(from, { image: { url: groupPic }, caption: styledText, contextInfo }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(tiny(`Error: Profile picture could not be fetched or group has no picture.`));
    }
});