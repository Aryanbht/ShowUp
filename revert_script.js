const fs = require('fs');
const path = 'D:/ShowUp/showup/components/landing/LandingClient.jsx';
let content = fs.readFileSync(path, 'utf8');

// Reverse Color
content = content.replace(/#b8ff57/gi, '#FFC629');

// Reverse Fonts
content = content.replace(/var\(--font-plex\)/g, `'Space Grotesk', sans-serif`);
content = content.replace(/var\(--font-bebas\)/g, `'Playfair Display', serif`);

// Reverse .serif styling
content = content.replace(/\.serif \{\n\s*font-family: 'Playfair Display', serif;\n\s*font-weight: 400;\n\s*\}/g, `.serif {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 400;
  }`);

// Reverse SHOWUP. to ShowUp.
content = content.replace(/SHOWUP\./g, 'ShowUp.');

// Reverse Button Border
content = content.replace(/border: 1.5px solid rgba\(255,255,255,0.5\);/g, 'border: 2px solid #fff;');

fs.writeFileSync(path, content);
console.log('Reversion applied.');
