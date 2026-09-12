const config = require('../config');
const { cmd } = require('../command');
const { tiny } = require('../lib/fancy_font/fancy');

const emojiMap = {
  heart: '❤️', love: '❤️', hearts: '❤️',
  like: '👍', thumbs: '👍', good: '👍',
  haha: '😂', laugh: '😂', happy: '😂',
  fire: '🔥', hot: '🔥',
  wow: '😮', shocked: '😮',
  party: '🎉', clap: '👏',
  star: '⭐', favorite: '⭐',
  cool: '😎', rich: '😎',
  sad: '😢', cry: '😢',
  angry: '😠', rage: '😠',
  pray: '🙏', respect: '🙏',
  money: '💰', cash: '💰',
  skull: '☠️', dead: '☠️',
  check: '✅', done: '✅',
  smile: '😊',
  kiss: '💋',
  rocket: '🚀',
  mind: '🤯',
  clap2: '👏',
  brain: '🧠'
};

function parseChannelLink(link) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);

    if (!parts.length) return null;

    let messageId = parts[parts.length - 1];
    let inviteCode = parts[parts.length - 2] || parts[0];

    if (parts[0] === 'channel' && parts.length >= 3) {
      inviteCode = parts[1];
      messageId = parts[2];
    }

    if (!inviteCode || !messageId || isNaN(Number(messageId))) {
      return null;
    }

    return {
      inviteCode,
      messageId: Number(messageId)
    };
  } catch {
    return null;
  }
}

function normalizeEmoji(input) {
  if (!input) return '❤️';
  const text = String(input).trim().toLowerCase();
  if (emojiMap[text]) return emojiMap[text];
  const first = text.charAt(0);
  return /^[\u{1F300}-\u{1FAFF}]$/u.test(first) || first.length > 0 ? first : '❤️';
}

function parseCount(input, fallback = 5) {
  const raw = Number(input);
  if (!Number.isFinite(raw) || raw <= 0) return fallback;
  return Math.min(raw, 10);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

cmd({
  pattern: 'channelreact',
  alias: ['creact', 'channel-react', 'react'],
  react: '💬',
  desc: 'React to a WhatsApp channel post with emojis.',
  category: 'channel',
  use: '.react <channel-link> <emoji> [count]',
  filename: __filename
}, async (conn, mek, m, { from, q, isOwner, reply }) => {
  try {
    if (!isOwner) return reply(tiny('❌ Owner only command'));
    if (!q) return reply(tiny('❌ Usage:\n.react https://whatsapp.com/channel/ID/123 heart 5'));

    const parts = q.trim().split(/\s+/);
    const link = parts[0];
    const emojiInput = parts[1] || 'heart';
    const countInput = parts[2] || '5';

    const parsedLink = parseChannelLink(link);
    if (!parsedLink) {
      return reply(tiny('❌ Invalid channel link format'));
    }

    const selectedEmoji = normalizeEmoji(emojiInput);
    const totalReacts = parseCount(countInput, 5);

    const channelJid = `${parsedLink.inviteCode}@newsletter`;
    console.log(`[REACT] Channel: ${channelJid}, Post: ${parsedLink.messageId}, Emoji: ${selectedEmoji}, Count: ${totalReacts}`);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalReacts; i++) {
      try {
        if (typeof conn.newsletterReactMessage === 'function') {
          await conn.newsletterReactMessage(channelJid, parsedLink.messageId, selectedEmoji);
          successCount++;
          console.log(`[REACT] Sent ${i + 1}/${totalReacts}`);
        } else {
          console.log(`[REACT] newsletterReactMessage not available`);
          failedCount++;
        }
        
        if (i < totalReacts - 1) {
          await wait(2000);
        }
      } catch (err) {
        console.error(`[REACT] Error on iteration ${i + 1}:`, err.message);
        failedCount++;
      }
    }

    const result = `✅ Success: ${successCount}\n❌ Failed: ${failedCount}`;
    return reply(tiny(`╭───〔 🌸 *Channel React* 🌸 〕───⬣\n${result}\n╰──────────────────────⬣`));

  } catch (error) {
    console.error('Channel React Error:', error);
    return reply(tiny(`❎ Error: ${error.message}`));
  }
});