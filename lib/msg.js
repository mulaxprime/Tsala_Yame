const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')

const downloadMediaMessage = async (m, filename) => {
    try {
        let msgType = m.type
        let msgContent = m.msg || m

        if (msgType === 'viewOnceMessage' || msgType === 'viewOnceMessageV2') {
            msgType = msgContent.type || getContentType(msgContent.message || msgContent)
            msgContent = msgContent.msg || msgContent.message?.[msgType] || msgContent
        }

        let mediaType = ''
        let ext = ''

        if (msgType === 'imageMessage') {
            mediaType = 'image'
            ext = '.jpg'
        } else if (msgType === 'videoMessage') {
            mediaType = 'video'
            ext = '.mp4'
        } else if (msgType === 'audioMessage') {
            mediaType = 'audio'
            ext = '.mp3'
        } else if (msgType === 'stickerMessage') {
            mediaType = 'sticker'
            ext = '.webp'
        } else if (msgType === 'documentMessage') {
            mediaType = 'document'
            const originalName = msgContent.fileName || 'file.dat'
            ext = path.extname(originalName) || '.dat'
        } else {
            return null
        }

        const finalFilename = filename ? `${filename}${ext}` : `undefined${ext}`
        const stream = await downloadContentFromMessage(msgContent, mediaType)
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        fs.writeFileSync(finalFilename, buffer)
        return buffer
    } catch (err) {
        console.error("Error downloading media message:", err)
        return null
    }
}

const sms = (conn, m) => {
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe 
            ? (conn.user?.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : '') 
            : m.isGroup ? m.key.participant : m.key.remoteJid
    }

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = (m.type === 'viewOnceMessage' || m.type === 'viewOnceMessageV2') 
            ? m.message[m.type].message[getContentType(m.message[m.type].message)] 
            : m.message[m.type]

        if (m.msg) {
            if (m.type === 'viewOnceMessage' || m.type === 'viewOnceMessageV2') {
                m.msg.type = getContentType(m.message[m.type].message)
            }

            const contextInfo = m.msg.contextInfo || {}
            const quotedMention = contextInfo.participant || ''
            const tagMention = contextInfo.mentionedJid || []
            const mention = typeof tagMention === 'string' ? [tagMention] : tagMention
            if (quotedMention) mention.push(quotedMention)
            m.mentionUser = mention.filter(x => x)

            m.body = (m.type === 'conversation') 
                ? m.msg 
                : (m.type === 'extendedTextMessage') 
                    ? m.msg.text 
                    : (m.type === 'imageMessage' || m.type === 'videoMessage') 
                        ? m.msg.caption || '' 
                        : (m.type === 'templateButtonReplyMessage') 
                            ? m.msg.selectedId || '' 
                            : (m.type === 'buttonsResponseMessage') 
                                ? m.msg.selectedButtonId || '' 
                                : ''

            m.quoted = contextInfo.quotedMessage ? contextInfo.quotedMessage : null

            if (m.quoted) {
                m.quoted.type = getContentType(m.quoted)
                m.quoted.id = contextInfo.stanzaId
                m.quoted.sender = contextInfo.participant
                
                const botId = conn.user?.id ? conn.user.id.split(':')[0] : ''
                m.quoted.fromMe = m.quoted.sender ? m.quoted.sender.split('@')[0].includes(botId) : false
                
                m.quoted.msg = (m.quoted.type === 'viewOnceMessage' || m.quoted.type === 'viewOnceMessageV2') 
                    ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] 
                    : m.quoted[m.quoted.type]

                if (m.quoted.type === 'viewOnceMessage' || m.quoted.type === 'viewOnceMessageV2') {
                    m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)
                }

                const qContext = m.quoted.msg?.contextInfo || {}
                const qQuotedMention = qContext.participant || ''
                const qTagMention = qContext.mentionedJid || []
                const qMention = typeof qTagMention === 'string' ? [qTagMention] : qTagMention
                if (qQuotedMention) qMention.push(qQuotedMention)
                m.quoted.mentionUser = qMention.filter(x => x)

                m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                    key: {
                        remoteJid: m.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    },
                    message: m.quoted
                })

                m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
                m.quoted.delete = () => conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
                m.quoted.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } })
            }
        }
        m.download = (filename) => downloadMediaMessage(m, filename)
    }

    m.reply = (teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { text: teks, contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    m.replyS = (stik, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { sticker: stik, contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    m.replyImg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: img, caption: teks, contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    m.replyVid = (vid, teks, id = m.chat, option = { mentions: [m.sender], gif: false }) => conn.sendMessage(id, { video: vid, caption: teks, gifPlayback: option.gif, contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    m.replyAud = (aud, id = m.chat, option = { mentions: [m.sender], ptt: false }) => conn.sendMessage(id, { audio: aud, ptt: option.ptt, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    m.replyDoc = (doc, id = m.chat, option = { mentions: [m.sender], filename: 'undefined.pdf', mimetype: 'application/pdf' }) => conn.sendMessage(id, { document: doc, mimetype: option.mimetype || 'application/pdf', fileName: option.filename || 'undefined.pdf', contextInfo: { mentionedJid: option.mentions || [m.sender] } }, { quoted: m })
    
    m.replyContact = (name, info, number) => {
        var vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'
        conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m })
    }
    
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    return m
}

module.exports = { sms, downloadMediaMessage }