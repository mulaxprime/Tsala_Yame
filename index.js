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
require('dotenv').config()
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

  const envSession = process.env.SESSION_ID || config.SESSION_ID

  if (!envSession) {
    console.log("No SESSION_ID found in environment or config. Will generate pairing code...")
    return
  }

  if (envSession.trim().startsWith('{')) {
    console.log('Detected raw JSON session from env, saving to creds.json...')
    try {
      fs.writeFileSync(credsPath, envSession.trim())
      console.log("Session saved from JSON ✅")
      return
    } catch (err) {
      console.error('Failed to save session from JSON:', err)
      return
    }
  }

  if (envSession.includes('mega.nz') || envSession.startsWith('Tsala-X~')) {
    console.log('Downloading session from Mega...')
    const sessdata = envSession.replace("Tsala-X~", '').trim()
    const megaUrl = sessdata.startsWith('http') ? sessdata : `https://mega.nz/file/${sessdata}`

    return new Promise((resolve) => {
      const filer = File.fromURL(megaUrl)
      filer.download((err, data) => {
        if (err) {
          console.error('Failed to download session:', err)
          console.log("Falling back to pairing code...")
          return resolve()
        }
        fs.writeFile(credsPath, data, (err) => {
          if (err) {
            console.error('Failed to save session:', err)
            console.log("Falling back to pairing code...")
            return resolve()
          }
          console.log("Session downloaded ✅")
          resolve()
        })
      })
    })
  }

  try {
    fs.writeFileSync(credsPath, envSession.trim())
    console.log("Session saved from env string ✅")
  } catch (err) {
    console.error('Failed to write env session string:', err)
  }
}

//=============================================

const express = require("express")
const app = express()
const port = process.env.PORT || 8000

let connectionStatus = "Starting..."
let lastPairingCodeTime = 0
let pairingCodeGenerated = false
let readlineActive = false

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
        .footer-note { color: #64748b; font-size: 13px; line-height: 1.5; }
      </style>
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

        <div class="footer-note">${isConnected ? 'Bot is online, running smoothly and ready for action! 🚀' : 'Check console for pairing code instructions'}</div>
      </div>
    </body>
    </html>
  `)
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

let cachedGroupJid = null

const GROUP_INVITE = "J0zDV4UQBEx2VOAdq0uZQN"
const GC_LINK = `https://chat.whatsapp.com/${GROUP_INVITE}`
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbDiwEo1XquPafRGOd0B"

async function isUserInGroup(conn, senderJid) {
  try {
    if (!cachedGroupJid) {
      const groupInfo = await conn.groupGetInviteInfo(GROUP_INVITE)
      cachedGroupJid = groupInfo.id
    }
    const metadata = await conn.groupMetadata(cachedGroupJid)
    const participants = metadata.participants || []
    const normalizedSender = jidNormalizedUser(senderJid)
    return participants.some(p => jidNormalizedUser(p.id) === normalizedSender)
  } catch (err) {
    console.error("Membership check error:", err)
    return false
  }
}

async function tryAutoJoinGroup(conn, senderJid) {
  try {
    if (!cachedGroupJid) {
      const groupInfo = await conn.groupGetInviteInfo(GROUP_INVITE)
      cachedGroupJid = groupInfo.id
    }
    await conn.groupParticipantsUpdate(cachedGroupJid, [senderJid], "add")
    return true
  } catch (err) {
    console.log("Auto-join failed (normal):", err.message || err)
    return false
  }
}

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
      markOnlineOnConnect: true,
      printQRInTerminal: false
    })

    conn.ev.on("creds.update", saveCreds)

    const pluginsDir = path.join(__dirname, 'plugins')
    if (fs.existsSync(pluginsDir)) {
      fs.readdirSync(pluginsDir).forEach((file) => {
        if (path.extname(file).toLowerCase() === '.js') {
          try {
            require(path.join(pluginsDir, file))
          } catch (e) {
            console.error(`Failed to load plugin ${file}:`, e)
          }
        }
      })
      console.log("Plugins installed successfully ✅")
    }

    conn.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === "open") {
        console.log("Tsala Yame connected successfully! ✅")
        connectionStatus = "Connected ✅"
        pairingCodeGenerated = false

        try {
          const ownerJid = ownerNumber[0] + "@s.whatsapp.net"
          await conn.sendMessage(ownerJid, { 
            text: "🤖 *Tsala Yame is now Connected & Online!* 🚀\n\n_System fully operational._" 
          })
        } catch (e) {
          console.error("Failed to send connection alert to owner:", e)
        }

      } else if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        console.log(`Connection closed, reconnecting...`)
        connectionStatus = "Disconnected, reconnecting..."
        
        if (statusCode === DisconnectReason.loggedOut) {
          console.log("Device logged out. Please provide a valid session.")
        } else {
          setTimeout(() => connectToWA(), 5000)
        }
      }

      if (!pairingCodeGenerated && !conn.user && !conn.authState.creds.registered && !readlineActive) {
        const now = Date.now()
        if (now - lastPairingCodeTime < 60000) {
          const waitTime = Math.ceil((60000 - (now - lastPairingCodeTime)) / 1000)
          console.log(`⏳ Please wait ${waitTime} seconds before requesting another pairing code...`)
        } else {
          readlineActive = true
          const readline = require('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          
          rl.question('\n📱 Enter your WhatsApp phone number (with country code e.g., 26775462914): ', async (phone) => {
            rl.close()
            readlineActive = false
            pairingCodeGenerated = true
            lastPairingCodeTime = Date.now()
            
            try {
              phone = phone.replace(/[^0-9]/g, '')
              const code = await conn.requestPairingCode(phone)
              console.log('\n========================================')
              console.log('✅ YOUR PAIRING CODE (Valid for 1 minute):')
              console.log(`📌 CODE: ${code}`)
              console.log('========================================')
              console.log('📲 On your phone:')
              console.log('   WhatsApp > Settings > Linked Devices > Link a Device')
            } catch (err) {
              console.error('Failed to request pairing code:', err)
              pairingCodeGenerated = false
            }
          })
        }
      }
    })

    conn.ev.on('messages.upsert', async (mek) => {
      try {
        const events = require('./command')
        const mekData = mek.messages[0]
        if (!mekData.message) return
        if (mekData.key && mekData.key.remoteJid === 'status@broadcast') {
          if (config.AUTO_READ_STATUS === 'True') {
            await conn.readMessages([mekData.key])
          }
          return
        }
        
        const m = sms(conn, mekData)
        const type = getContentType(mekData.message)
        const body = m.body || ''
        const from = m.chat
        const isGroup = m.isGroup
        const sender = m.sender
        const senderNumber = sender ? sender.split('@')[0] : ''
        const botNumber = conn.user?.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : ''
        const botNumber2 = conn.user?.id || ''
        const pushname = mekData.pushName || 'User'
        const isMe = m.fromMe || sender === botNumber
        const isOwner = ownerNumber.includes(senderNumber) || isMe

        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')

        // Mode check
        const mode = config.MODE || 'public'
        if (mode === 'private' && !isOwner && !m.fromMe) return

        // ===== AUTO JOIN + ACCESS CONTROL =====
        if (isCmd && !isOwner && !m.fromMe) {
          const inGroup = await isUserInGroup(conn, sender)

          if (!inGroup) {
            const added = await tryAutoJoinGroup(conn, sender)

            if (added) {
              await m.reply(`✅ You have been automatically added to the official group!\n\nPlease also follow the channel:\n${CHANNEL_LINK}`)
            } else {
              return await m.reply(
                `❌ *Access Denied!*\n\n` +
                `You must join our official support group and follow our channel before using commands.\n\n` +
                `📌 *Join Official Group:*\n${GC_LINK}\n\n` +
                `📢 *Follow WhatsApp Channel:*\n${CHANNEL_LINK}\n\n` +
                `_After joining, try the command again._`
              )
            }
          }
        }

        // ===== FULL CONTEXT (FIXED) =====
        let groupMetadata = {}
        let groupName = ''
        let participants = []
        let groupAdmins = []
        let isBotAdmins = false
        let isAdmins = false

        if (isGroup) {
          try {
            groupMetadata = await conn.groupMetadata(from)
            groupName = groupMetadata.subject || ''
            participants = groupMetadata.participants || []
            groupAdmins = await getGroupAdmins(participants)
            
            const normalizedBot = jidNormalizedUser(botNumber)
            const normalizedBot2 = jidNormalizedUser(botNumber2)
            const normalizedSender = jidNormalizedUser(sender)

            isBotAdmins = groupAdmins.some(admin => 
              jidNormalizedUser(admin) === normalizedBot || 
              jidNormalizedUser(admin) === normalizedBot2
            )
            isAdmins = groupAdmins.some(admin => jidNormalizedUser(admin) === normalizedSender) || isOwner
          } catch (err) {
            console.error("Failed to get group metadata:", err)
          }
        }

        const eventsList = events.commands || []
        for (let cmd of eventsList) {
          if (cmd.pattern === command || (cmd.alias && cmd.alias.includes(command))) {
            try {
              if (cmd.react) {
                await conn.sendMessage(from, {
                  react: {
                    text: cmd.react,
                    key: mekData.key
                  }
                })
              }

              await cmd.function(conn, mekData, m, {
                from,
                quoted: m.quoted,
                body,
                isCmd,
                command,
                args,
                q,
                isGroup,
                sender,
                senderNumber,
                botNumber2,
                botNumber,
                pushname,
                isMe,
                isOwner,
                groupMetadata,
                groupName,
                participants,
                groupAdmins,
                isBotAdmins,
                isAdmins,
                reply: async (text) => await m.reply(text)
              })
            } catch (e) {
              console.error(`Error executing command ${command}:`, e)
            }
          }
        }
      } catch (err) {
        console.error('Error in messages.upsert:', err)
      }
    })

  } catch (err) {
    console.error(err)
  }
}

connectToWA()