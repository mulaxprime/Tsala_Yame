<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,12,23,28,30&height=200&section=header&text=TSALA%20YAME%20BOT&fontSize=42&fontColor=ffffff&fontFamily=Plus+Jakarta+Sans&animation=fadeIn&desc=Next-Gen%20Multi-Device%20WhatsApp%20Automation&descSize=15&descColor=c084fc" width="100%"/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Baileys-MultiDevice-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-WebApp-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-cyan?style=for-the-badge" />
</p>

</div>

---

<p align="center">
  <img src="https://files.catbox.moe/lztgy3.png" alt="Tsala Yame Preview" width="85%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

---

## ⚡ About Tsala Yame

**Tsala Yame** is a lightning-fast, highly customizable multi-device WhatsApp automation engine. Engineered for fluid group management, seamless media handling, and rich plugin integration, it comes equipped with a gorgeous built-in cyberpunk web control center and dynamic live pairing capabilities.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **🌐 Web Control Center** | Built-in Express dashboard with live glowing pulse indicators and QR code rendering. |
| **📱 Multi-Device Ready** | Full compatibility with Baileys socket session management and auto-reconnect logic. |
| **🔌 Dynamic Plugins** | Effortless modular plugin architecture with automatic directory loading and counting. |
| **🛡️ Smart Moderation** | Anti-link protection, admin verification tools, and strict dynamic command gating. |
| **⚡ Media & Utilities** | Advanced file handlers, HD image/video routers, and interactive command triggers. |

---

## 🚀 Quick Deployment & Installation

### 1. Fork & Star
Fork this repository to your GitHub account and give it a star ⭐ to support future updates.

### 2. Configure Environment Variables
Set up your configuration variables in your hosting provider panel:
* `SESSION_ID` — Your Mega session string (optional; falls back to live web QR scan if omitted).
* `PREFIX` — Command prefix (default is `.`).
* `OWNER_NUMBER` — Your primary WhatsApp number with country code.
* `MODE` — Bot operation mode (`public` or `private`).

### 3. Deploy & Connect

#### Local Deployment
Deploy on a local VPS or server:
1. SSH into your server
2. Clone the repository
3. Run `npm install && npm start`
4. Watch console for pairing code prompt
5. Enter your phone number when asked
6. Scan the code with WhatsApp

#### Hosting Platforms (KataBump, Railway, Render, Koyeb)
Deploy on any Node.js hosting platform:
1. Connect your GitHub repository
2. Set environment variables if needed
3. Deploy/start the application
4. **Watch the Live Logs for the pairing code**
5. Scan the code using WhatsApp > Settings > Linked Devices > Link a Device

The code will display in your hosting platform's **Console/Logs** section automatically.

---

## 📱 Getting Your Pairing Code

### On Local Machine (Terminal/VPS)
```
📱 Enter your WhatsApp phone number (with country code e.g., 26775462914): 26775462914
════════════════════════════════════════
✅ YOUR PAIRING CODE (Valid for 1 minute):
📌 CODE: 123456
════════════════════════════════════════
```

### On Hosting Platforms

The bot detects hosting environments and displays:

```
════════════════════════════════════════
🌐 DEPLOYED ON HOSTING PLATFORM DETECTED
════════════════════════════════════════
📱 Your pairing code will appear here when ready.
📲 On your phone:
   WhatsApp > Settings > Linked Devices > Link a Device
   Keep this console open and watch for the code.
════════════════════════════════════════

🔐 YOUR PAIRING CODE (Valid for 1 minute):
📌 CODE: 654321
════════════════════════════════════════
```

**Where to Find It:**
- **KataBump**: Console tab (Live Logs)
- **Railway**: Deployments → Logs
- **Render**: Logs tab
- **Koyeb**: Logs section
- **AWS/Azure/GCP**: CloudWatch/Logs viewer

### Finding the Code in Logs

1. Look for `"PAIRING CODE"` in the logs
2. Find the 6-8 digit code next to `CODE:`
3. Use it immediately (valid for 60 seconds)
4. If it expires, a new one will be generated

### Pairing Steps

Once you have the code:
1. Open WhatsApp on your phone
2. Tap **Settings** (gear icon)
3. Select **Linked Devices**
4. Tap **Link a Device**
5. Enter the 6-8 digit code
6. Select your phone model/name
7. Confirm on your phone

Watch the console - it will show `✅ Connected` when successful!

---

## �️ Random Image Configuration

The bot displays random images when it connects successfully. Customize this feature by editing the image pool.

### How It Works

When your bot connects to WhatsApp, it sends a startup message with a randomly selected image from the configured pool. This adds visual appeal to your bot notifications!

### Customizing Your Images

Edit `index.js` and locate the `randomImagePool` section (around line 310):

```javascript
const randomImagePool = [
  config.ALIVE_IMG,
  'https://files.catbox.moe/lztgy3.png',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
  'https://picsum.photos/800/800'
].filter(Boolean);
```

### Adding Your Own Images

#### Option 1: Using Config File (⭐ Recommended)
Set `ALIVE_IMG` in your `config.js`:
```javascript
module.exports = {
  BOT_NAME: "Tsala_Yame",
  OWNER_NUMBER: "26775462914",
  MODE: "public",
  ALIVE_IMG: "https://your-custom-image.com/image.jpg",
  // ... other config
}
```

#### Option 2: Add Direct URLs to Pool
Modify the `randomImagePool` array directly in `index.js`:
```javascript
const randomImagePool = [
  config.ALIVE_IMG,
  'https://your-first-image.com/image1.jpg',
  'https://your-second-image.com/image2.jpg',
  'https://your-third-image.com/image3.jpg',
  'https://picsum.photos/800/800'
].filter(Boolean);
```

### Recommended Image Hosts

| Service | Link | Features |
|---------|------|----------|
| **Catbox** | https://catbox.moe/ | Free, no account needed, 200MB limit |
| **Imgur** | https://imgur.com/ | Free with account, easy sharing |
| **Imgbb** | https://imgbb.com/ | Free registration, 32MB per image |
| **Unsplash** | https://unsplash.com/ | Free high-quality stock photos |
| **Pexels** | https://www.pexels.com/ | Free stock photography |

### Image Specifications

| Aspect | Recommendation |
|--------|-----------------|
| **Dimensions** | 800x800px or 400x400px (Square) |
| **Format** | JPG, PNG, or GIF |
| **File Size** | < 500KB for best performance |
| **URL Type** | HTTPS recommended for security |
| **Accessibility** | Must be publicly accessible |

### How to Get Image URLs

#### From Catbox (Recommended for Quick Setup)
1. Visit https://catbox.moe/
2. Drag and drop your image
3. Copy the generated link
4. Add to `randomImagePool` or `ALIVE_IMG`

#### From Unsplash
1. Find a photo at https://unsplash.com/
2. Click the photo
3. Right-click and select "Copy image link"
4. Use the link in your config

### Example Setup

**config.js:**
```javascript
module.exports = {
  BOT_NAME: "Tsala_Yame",
  OWNER_NAME: "MULAX PRIME",
  OWNER_NUMBER: "26775462914",
  PREFIX: ".",
  MODE: "public",
  AUTO_READ_STATUS: "true",
  ALIVE_IMG: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
  SESSION_ID: ""
}
```

**index.js (randomImagePool):**
```javascript
const randomImagePool = [
  config.ALIVE_IMG,
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  'https://picsum.photos/800/800'
].filter(Boolean);
```

### Troubleshooting Images

**Images not showing?**
- ✅ Verify URLs are publicly accessible (test in browser)
- ✅ Ensure HTTPS protocol (not HTTP)
- ✅ Check file format is supported (JPG, PNG, GIF)
- ✅ Confirm image size is under 10MB

**Slow image loading?**
- ✅ Use compressed/optimized images
- ✅ Try CDN-hosted images
- ✅ Use smaller dimensions (800x800px max)

---

## �🛠️ Built With

* **[Node.js](https://nodejs.org/)** — JavaScript runtime environment
* **[@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)** — WhatsApp Web API wrapper
* **[Express](https://expressjs.com/)** — Web server framework for the control center

---

## ⚠️ Disclaimer

> *This project is not affiliated with, endorsed by, or connected to WhatsApp Inc. or Meta. Use this software at your own risk. Unofficial automation bots can result in temporary or permanent account restrictions. The creator accepts no liability for any consequence resulting from its use.*

---

<p align="center">
  <b>Designed with 💻 by <a href="https://github.com/MulaxPrime">Mulax Prime</a></b>
</p>