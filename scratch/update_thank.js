const fs = require('fs');

const updateFile = (file, replacer) => {
    let content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, replacer(content), 'utf8');
}

console.log("Updating scripts...");
updateFile('offer.html', c => c.replace(/window\.location\.href\s*=\s*["']thank["']/g, 'window.location.href = "thankyou"'));
updateFile('index.html', c => c.replace(/window\.location\.href\s*=\s*["']thank["']/g, 'window.location.href = "thankyou"'));
updateFile('js/dynamic-config.js', c => c.replace(/includes\(['"]thank\.html['"]\)/g, "includes('thankyou')"));

console.log("Updating thankyou.html button...");
updateFile('thankyou.html', c => {
    let res = c.replace(/<a href="index" class="btn-pulse/g, '<button type="button" class="w-full btn-pulse');
    res = res.replace(/Return to Store[\s\S]*?<\/a>/g, 'Return to Store\n             </button>');
    return res;
});
console.log("Done.");
