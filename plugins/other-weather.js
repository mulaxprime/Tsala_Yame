const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');
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

cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // Send reaction explicitly
        await conn.sendMessage(from, { react: { text: '🌤', key: mek.key } });

        if (!q) return reply(tiny("❗ Please provide a city name. Usage: .weather [city name]"));
        
        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        const response = await axios.get(url);
        const data = response.data;

        let weatherLayout = 
            `╭───〔 🌸 *Tsala Weather* 🌸 〕───⬣
│ 🌍 *City:* ${data.name}, ${data.sys.country}
│ 🌡️ *Temp:* ${data.main.temp}°C
│ 🌡️ *Feels Like:* ${data.main.feels_like}°C
│ 🌡️ *Min / Max:* ${data.main.temp_min}°C / ${data.main.temp_max}°C
│ 💧 *Humidity:* ${data.main.humidity}%
│ ☁️ *Condition:* ${data.weather[0].main} (${data.weather[0].description})
│ 💨 *Wind Speed:* ${data.wind.speed} m/s
│ 🔽 *Pressure:* ${data.main.pressure} hPa
╰──────────────────────⬣
> *✨ Tsala Yame | Pᴏᴡᴇʀᴇᴅ ʙʏ Mᴜʟᴀx Pʀɪᴍᴇ*`;

        let styledWeather = tiny(weatherLayout);
        const photoPath = getRandomPhoto();

        if (photoPath && fs.existsSync(photoPath)) {
            const imageBuffer = fs.readFileSync(photoPath);
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: styledWeather
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: styledWeather }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            return reply(tiny("🚫 City not found. Please check the spelling and try again."));
        }
        return reply(tiny("⚠️ An error occurred while fetching the weather information. Please try again later."));
    }
});