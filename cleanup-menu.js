const fs = require('fs');

const filePath = 'c:\\Users\\COMPUTER SERVICES BW\\Tsalayamefinal\\plugins\\main-menu.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find where the duplicate starts
let correctEndLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (i > 150 && lines[i].trim().startsWith('} else {') && correctEndLine === -1) {
        // This is the old duplicate code
        correctEndLine = i;
        break;
    }
}

// If we found old code, remove it
if (correctEndLine > 0) {
    // Find the actual end (look for } catch)
    let catchLine = -1;
    for (let i = correctEndLine; i < lines.length; i++) {
        if (lines[i].trim() === '} catch (e) {') {
            catchLine = i;
            break;
        }
    }
    
    if (catchLine > 0) {
        // Remove lines from correctEndLine to catchLine-1
        lines.splice(correctEndLine, catchLine - correctEndLine);
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('✅ Removed duplicate code');
    }
} else {
    console.log('No duplicate found');
}
