const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const fs = require('fs')
const path = require('path')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const QRCode = require('qrcode')
const util = require('util')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const prefix = config.PREFIX || '.'

const ownerNumber = [config.OWNER_NUMBER || '26775462914']
let dynamicMode = config.MODE || 'public'

//===================SESSION-AUTH============================
const authFolder = path.join(__dirname, 'auth_info_baileys')

async function ensureSession() {
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true })
  }

  const credsPath = path.join(authFolder, 'creds.json')

  if (fs.existsSync(credsPath)) {
    console.log("Local session found ✅")
    return
  }

  if (!config.SESSION_ID) {
    console.log("No SESSION_ID found. Will generate QR code...")
    return
  }

  console.log('Downloading session from Mega...')
  const sessdata = config.SESSION_ID.replace("Tsala-X~", '')

  return new Promise((resolve) => {
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.download((err, data) => {
      if (err) {
        console.error('Failed to download session:', err)
        console.log("Falling back to QR...")
        return resolve()
      }
      fs.writeFile(credsPath, data, (err) => {
        if (err) {
          console.error('Failed to save session:', err)
          console.log("Falling back to QR...")
          return resolve()
        }
        console.log("Session downloaded ✅")
        resolve()
      })
    })
  })
}

//=============================================

const express = require("express")
const app = express()
const port = process.env.PORT || 8000

let latestQR = null
let connectionStatus = "Starting..."

app.get("/", (req, res) => {
  const isConnected = connectionStatus.includes("Connected");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tsala Yame - Control Center</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
          background: #09090b;
          background-image: radial-gradient(circle at 50% 0%, #1a1528 0%, #09090b 70%);
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .card {
          background: rgba(18, 18, 24, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 36px 28px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(168, 85, 247, 0.1);
          color: #c084fc;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(168, 85, 247, 0.2);
        }
        .pulse {
          width: 8px;
          height: 8px;
          background: ${isConnected ? '#22c55e' : '#eab308'};
          border-radius: 50%;
          box-shadow: 0 0 10px ${isConnected ? '#22c55e' : '#eab308'};
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
        .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
        .status-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          color: #e2e8f0;
        }
        .qr-container {
          background: #ffffff;
          padding: 16px;
          border-radius: 16px;
          display: inline-block;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        img { width: 100%; max-width: 260px; display: block; border-radius: 8px; }
        .footer-note { color: #64748b; font-size: 13px; line-height: 1.5; }
      </style>
      ${!isConnected && latestQR ? '<script>setTimeout(() => location.reload(), 8000);</script>' : ''}
    </head>
    <body>
      <div class="card">
        <div class="badge">
          <div class="pulse"></div>
          Tsala Yame Core
        </div>
        <h1>Connection Center</h1>
        <p class="subtitle">Powered By Mulax Prime</p>
        
        <div class="status-box">${connectionStatus}</div>

        ${latestQR && !isConnected ? `
          <div class="qr-container">
            <img src="${latestQR}" alt="WhatsApp Pairing QR">
          </div>
          <div class="footer-note">Scan this QR code using WhatsApp on your phone:<br><strong>Settings &gt; Linked Devices &gt; Link a Device</strong></div>
        ` : `
          <div class="footer-note">${isConnected ? 'Bot is online, running smoothly and ready for action! ✨' : 'Waiting for system initialization and QR generation...'}</div>
        `}
      </div>
    </body>
    </html>
  `)
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
  console.log(`Open that link to view the stunning control dashboard`)
})

async function connectToWA() {
  try {
    await ensureSession()

    console.log("Connecting Tsala Yame...");
    connectionStatus = "Connecting..."

    const { state, saveCreds } = await useMultiFileAuthState(authFolder)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: false,
      auth: state,
      version,
      markOnlineOnConnect: true
    })

    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        latestQR = await QRCode.toDataURL(qr, {
          width: 400,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        })

        connectionStatus = "Scan the QR code now"

        console.log('\nQR available at → http://localhost:' + port)
        qrcode.generate(qr, { small: true })
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        connectionStatus = `Closed (${statusCode}) - Reconnecting...`

        console.log("────────────────────────────────")
        console.log("Connection closed")
        console.log("Status Code :", statusCode)
        console.log("Should reconnect :", shouldReconnect)
        console.log("Error :", lastDisconnect?.error?.message || lastDisconnect?.error)
        console.log("────────────────────────────────")

        if (shouldReconnect) {
          console.log("Reconnecting in 6 seconds...")
          setTimeout(() => connectToWA(), 6000)
        } else {
          connectionStatus = "Logged out. Delete auth_info_baileys folder."
          console.log("Logged out. Delete the auth_info_baileys folder and start again.")
        }
      } 
      else if (connection === 'open') {
        latestQR = null
        connectionStatus = "Connected ✅"

        console.log('😼 Installing plugins...')
        
        let loadedPluginsCount = 0;
        if (fs.existsSync("./plugins/")) {
          fs.readdirSync("./plugins/").forEach((plugin) => {
            if (path.extname(plugin).toLowerCase() === ".js") {
              try {
                require("./plugins/" + plugin);
                loadedPluginsCount++;
              } catch (pluginErr) {
                console.error(`Failed to load plugin ${plugin}:`, pluginErr);
              }
            }
          })
        }

        console.log(`✅ Plugins Loaded: ${loadedPluginsCount}`)
        console.log('🜢 Tsala Yame connected!');

        // Random image pool (defaults to config.ALIVE_IMG if provided, mixed with aesthetic/tech wallpapers)
        const randomImagePool = [
          config.ALIVE_IMG,
          'https://files.catbox.moe/lztgy3.png',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
          'https://picsum.photos/800/800'
        ].filter(Boolean); // removes undefined/null entries

        const selectedAliveImg = randomImagePool[Math.floor(Math.random() * randomImagePool.length)];

        let up = `🌸 *ᴛsᴀʟᴀ ʏᴀᴍᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ* 🌸\n\n> *ʙᴏᴛ ɴᴀᴍᴇ:* ${config.BOT_NAME || "Tsala_Yame"}\n> *ᴏᴡɴᴇʀ:* ${config.OWNER_NAME || "MULAX PRIME"}\n> *ᴜsᴇʀ ᴊɪᴅ:* ${conn.user?.id || "Unknown"}\n> *ᴘʟᴜɢɪɴs:* ${loadedPluginsCount}\n> *ᴘʀᴇғɪx:* ${prefix}\n> *ᴍᴏᴅᴇ:* ${dynamicMode}\n\n*Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`

        conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
          image: { url: selectedAliveImg },
          caption: up
        }).catch(err => console.log("Failed to send startup message:", err))
      }
    })

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('messages.upsert', async (mek) => {
      mek = mek.messages[0]
      if (!mek.message) return

      mek.message = (getContentType(mek.message) === 'ephemeralMessage')
        ? mek.message.ephemeralMessage.message
        : mek.message

      if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
        await conn.readMessages([mek.key])
      }

      const m = sms(conn, mek)
      const type = getContentType(mek.message)
      const from = mek.key.remoteJid
      const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null
        ? mek.message.extendedTextMessage.contextInfo.quotedMessage || []
        : []
      const body = (type === 'conversation')
        ? mek.message.conversation
        : (type === 'extendedTextMessage')
          ? mek.message.extendedTextMessage.text
          : (type == 'imageMessage') && mek.message.imageMessage.caption
            ? mek.message.imageMessage.caption
            : (type == 'videoMessage') && mek.message.videoMessage.caption
              ? mek.message.videoMessage.caption
              : ''
      const isCmd = body.startsWith(prefix)
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
      const args = body.trim().split(/ +/).slice(1)
      const q = args.join(' ')
      const isGroup = from.endsWith('@g.us')
      const sender = mek.key.fromMe
        ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id)
        : (mek.key.participant || mek.key.remoteJid)
      const senderNumber = sender.split('@')[0]
      const botNumber = conn.user.id.split(':')[0]
      const pushname = mek.pushName || 'Sin Nombre'
      const isMe = botNumber.includes(senderNumber)
      const isOwner = ownerNumber.includes(senderNumber) || isMe
      const botNumber2 = await jidNormalizedUser(conn.user.id)
      const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const participants = isGroup ? await groupMetadata.participants : ''
      const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
      const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
      const isAdmins = isGroup ? groupAdmins.includes(sender) : false

      const reply = (teks) => {
        conn.sendMessage(from, { text: teks }, { quoted: mek })
      }

      conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = ''
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
          return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
        }
        if (mime === "application/pdf") {
          return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "image") {
          return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "video") {
          return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
        }
        if (mime.split("/")[0] === "audio") {
          return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
        }
      }

      if (isCmd && dynamicMode === 'private' && ![botNumber, ...ownerNumber].includes(senderNumber)) {
        return conn.sendMessage(from, {
          text: 'Sorry, this bot is running in private mode and you are not authorized to use commands.'
        }, { quoted: mek })
      }

      if (isCmd && command === 'mode') {
        if (![botNumber, ...ownerNumber].includes(senderNumber)) {
          return reply('Sorry, only the owner can change the mode.')
        }
        if (args.length === 0) {
          return reply(`Current mode is: ${dynamicMode}\nUsage: ${prefix}mode <public|private>`)
        }
        let newMode = args[0].toLowerCase()
        if (newMode !== 'public' && newMode !== 'private') {
          return reply('Invalid mode. Please use "public" or "private".')
        }
        dynamicMode = newMode
        return reply(`Bot mode updated to: ${dynamicMode}`)
      }

      const events = require('./command')
      const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false

      if (isCmd) {
        const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) ||
                    events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
        if (cmd) {
          if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })
          try {
            cmd.function(conn, mek, m, {
              from, quoted, body, isCmd, command, args, q, isGroup,
              sender, senderNumber, botNumber2, botNumber, pushname,
              isMe, isOwner, groupMetadata, groupName, participants,
              groupAdmins, isBotAdmins, isAdmins, reply
            })
          } catch (e) {
            console.error("[PLUGIN ERROR] " + e)
          }
        }
      }

      events.commands.map(async (command) => {
        if (body && command.on === "body") {
          command.function(conn, mek, m, {
            from, quoted, body, isCmd, command, args, q, isGroup,
            sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants,
            groupAdmins, isBotAdmins, isAdmins, reply
          })
        } else if (mek.q && command.on === "text") {
          command.function(conn, mek, m, {
            from, quoted, body, isCmd, command, args, q, isGroup,
            sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants,
            groupAdmins, isBotAdmins, isAdmins, reply
          })
        } else if (
          (command.on === "image" || command.on === "photo") &&
          mek.type === "imageMessage"
        ) {
          command.function(conn, mek, m, {
            from, quoted, body, isCmd, command, args, q, isGroup,
            sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants,
            groupAdmins, isBotAdmins, isAdmins, reply
          })
        } else if (
          command.on === "sticker" &&
          mek.type === "stickerMessage"
        ) {
          command.function(conn, mek, m, {
            from, quoted, body, isCmd, command, args, q, isGroup,
            sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants,
            groupAdmins, isBotAdmins, isAdmins, reply
          })
        }
      })
    })

  } catch (err) {
    console.error("Failed to start connection:", err)
    connectionStatus = "Error - Retrying..."
    console.log("Retrying in 10 seconds...")
    setTimeout(() => connectToWA(), 10000)
  }
}

setTimeout(() => {
  connectToWA()
}, 2000)