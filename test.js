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
const QRCode = require('qrcode')               // for web QR
const util = require('util')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const prefix = '.'

const ownerNumber = ['2347032411938']
let dynamicMode = config.MODE

//===================SESSION-AUTH============================
const authFolder = path.join(__dirname, 'auth_info_baileys')

async function ensureSession() {
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true })
  }

  const credsPath = path.join(authFolder, 'creds.json')

  if (!fs.existsSync(credsPath)) {
    if (!config.SESSION_ID) {
      console.log('Please add your session to SESSION_ID env !!')
      process.exit(1)
    }

    console.log('Downloading session from Mega...')
    const sessdata = config.SESSION_ID.replace("MULAA-X~", '')
    
    return new Promise((resolve, reject) => {
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      filer.download((err, data) => {
        if (err) {
          console.error('Failed to download session:', err)
          return reject(err)
        }
        fs.writeFile(credsPath, data, (err) => {
          if (err) return reject(err)
          console.log("Session downloaded ✅")
          resolve()
        })
      })
    })
  }
}

//=============================================

const express = require("express")
const app = express()
const port = process.env.PORT || 8000

// Store latest QR + status for the web page
let latestQR = null
let connectionStatus = "Starting..."

app.get("/", (req, res) => {
  if (latestQR) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maria-MD QR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #0f0f0f;
            color: white;
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          h1 { margin-bottom: 10px; }
          .status { 
            margin: 15px 0; 
            padding: 10px 20px; 
            background: #1a1a1a; 
            border-radius: 8px;
            font-size: 18px;
          }
          img {
            max-width: 320px;
            width: 100%;
            border: 8px solid white;
            border-radius: 12px;
            background: white;
          }
          .note { margin-top: 20px; color: #aaa; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>Maria-MD Pairing</h1>
        <div class="status">${connectionStatus}</div>
        <img src="${latestQR}" alt="QR Code">
        <div class="note">Scan this QR with WhatsApp → Linked Devices</div>
        <script>
          // Auto refresh every 8 seconds in case QR updates
          setTimeout(() => location.reload(), 8000);
        </script>
      </body>
      </html>
    `)
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maria-MD</title>
        <style>
          body {
            background: #0f0f0f;
            color: white;
            font-family: system-ui;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>Maria-MD</h1>
          <p>${connectionStatus}</p>
          <p>Waiting for QR...</p>
        </div>
      </body>
      </html>
    `)
  }
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
  console.log(`Open that link to scan the QR`)
})

async function connectToWA() {
  try {
    await ensureSession()

    console.log("Connecting Maria-MD...")
    connectionStatus = "Connecting..."

    const { state, saveCreds } = await useMultiFileAuthState(authFolder)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      // printQRInTerminal removed (deprecated)
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: false,
      auth: state,
      version,
      markOnlineOnConnect: true
    })

    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        // Generate QR for web
        latestQR = await QRCode.toDataURL(qr, {
          width: 400,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        })

        connectionStatus = "Scan the QR code now"

        // Also print small version in terminal as backup
        console.log('\nQR available at: http://localhost:' + port)
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
        
        fs.readdirSync("./plugins/").forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() === ".js") {
            require("./plugins/" + plugin)
          }
        })

        const pluginCount = 100
        console.log(`✅ Plugins Loaded: ${pluginCount}`)
        console.log('🟢 Maria-MD connected!')

        let up = `aria-md ᴄᴏɴɴᴇᴄᴛᴇᴅ✅\n\nᴏᴡɴᴇʀ: ${config.OWNER_NAME}\n\nᴜsᴇʀ: ${conn.user?.id || "Unknown"}\n\nᴄᴏᴍᴍᴀɴᴅs: ${pluginCount}\n\nᴘʀᴇғɪx: ${prefix}\n\nCurrent mode: ${dynamicMode}`

        conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
          image: { url: `https://telegra.ph/file/900435c6d3157c98c3c88.jpg` },
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
      const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false

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

// Start
setTimeout(() => {
  connectToWA()
}, 2000)