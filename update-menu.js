const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'plugins', 'main-menu.js');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to find and replace
const pattern = /let kenu = tiny\(madeMenu\);[\s\S]*?{ quoted: voltage }\s*\);/;

if (pattern.test(content)) {
    const replacement = `let kenu = tiny(madeMenu);
        
        const photoPath = getRandomPhoto();
        if (fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(
                from,
                {
                    image: imageBuffer,
                    caption: kenu,
                    contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 9999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363420003990090@newsletter',
                                newsletterName: '⏤͟͟͟͟͞͞͞͞MULAA-MD⏤'
                            }
                    }
                },
                { quoted: voltage }
            );
        } else {
            await conn.sendMessage(
                from,
                {
                    text: kenu,
                    contextInfo: {
                            mentionedJid: [sender],
                            forwardingScore: 9999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363420003990090@newsletter',
                                newsletterName: '⏤͟͟͟͟͞͞͞͞MULAA-MD⏤'
                            },
                        externalAdReply: {
                           showAdAttribution: false,
                            containsAutoReply: true,
                            title: "✧ MULAA MD - COMMANDS PANEL✧",
                            body: "POWERED BY MULAX PRIME",
                            thumbnailUrl: "https://files.catbox.moe/bt7a3x.jpeg",
                            sourceUrl: "https://whatsapp.com/channel/0029Vb5Tm5E6rsQnV4DIRO3z",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: voltage }
            );
        }`;
    
    content = content.replace(pattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Menu file updated successfully!');
} else {
    console.log('❌ Pattern not found');
    // Try simpler pattern
    if (content.includes('await conn.sendMessage(')) {
        console.log('✓ Found sendMessage but pattern difficult to match');
    }
}
