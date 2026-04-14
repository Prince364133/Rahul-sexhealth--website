const fs = require('fs');
const { JSDOM } = require('jsdom');
const translate = require('@vitalets/google-translate-api').translate;

async function run() {
    const files = fs.readdirSync(__dirname + '/..').filter(f => f.endsWith('.html'));
    const strings = new Set();
    
    // Extract
    for (let f of files) {
        const html = fs.readFileSync(__dirname + '/../' + f, 'utf8');
        const dom = new JSDOM(html);
        
        const walker = dom.window.document.createTreeWalker(
            dom.window.document.body,
            dom.window.NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while ((node = walker.nextNode())) {
            // skip script/style
            if (node.parentNode && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.tagName)) continue;
            
            const text = node.textContent.trim();
            if (text && text.length > 1 && /[A-Za-z]/.test(text)) {
                strings.add(text);
            }
        }
        
        // Also extract placeholders and values
        const inputs = dom.window.document.querySelectorAll('input, textarea');
        inputs.forEach(i => {
            if (i.placeholder && i.placeholder.trim().length > 1 && /[A-Za-z]/.test(i.placeholder.trim())) strings.add(i.placeholder.trim());
            if (i.value && i.type === 'submit' && i.value.trim().length > 1 && /[A-Za-z]/.test(i.value.trim())) strings.add(i.value.trim());
        });
    }
    
    // Convert to Array
    const arr = Array.from(strings);
    console.log(`Found ${arr.length} unique strings to translate.`);
    
    const dict = {};
    const batchSize = 10;
    
    for (let i = 0; i < arr.length; i += batchSize) {
        const batch = arr.slice(i, i + batchSize);
        console.log(`Translating batch ${i} to ${i+batchSize}...`);
        
        try {
            // Unfortunately @vitalets/google-translate-api translates single strings, we must do them inside loop
            await Promise.all(batch.map(async (str) => {
                try {
                    const res = await translate(str, { to: 'hi' });
                    dict[str] = res.text;
                } catch(e) {
                    console.error("Failed on:", str, e.message);
                }
            }));
            // sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 500));
        } catch(e) {
            console.error('Batch failed:', e);
        }
    }
    
    fs.writeFileSync(__dirname + '/../js/hi.json', JSON.stringify(dict, null, 2), 'utf8');
    console.log(`Saved ${Object.keys(dict).length} translations to hi.json`);
}

run();
