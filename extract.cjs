const fs = require('fs');
const content = fs.readFileSync('src/i18n.js', 'utf8');

const match = content.match(/const resources = (\{[\s\S]*?\});\n\ni18n/);
if (match) {
    const resString = match[1];
    try {
        const resObj = eval('(' + resString + ')');
        const enTranslation = resObj.en.translation;
        
        fs.mkdirSync('src/locales', { recursive: true });
        fs.writeFileSync('src/locales/en.json', JSON.stringify(enTranslation, null, 2));
        console.log('Successfully extracted src/locales/en.json');
    } catch(e) {
        console.error('Eval error:', e);
    }
} else {
    console.log('Could not match resources object');
}
