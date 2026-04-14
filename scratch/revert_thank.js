const fs = require('fs');

const updateFile = (file, replacer) => {
    let content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, replacer(content), 'utf8');
}

updateFile('offer.html', c => c.replace(/window\.location\.href\s*=\s*"/g, 'window.location.href = "').replace(/"thankyou"/g, '"thank"'));
updateFile('index.html', c => c.replace(/window\.location\.href\s*=\s*"/g, 'window.location.href = "').replace(/"thankyou"/g, '"thank"'));
updateFile('js/dynamic-config.js', c => c.replace(/includes\('thankyou'\)/g, "includes('thank.html')"));
