(async function initStaticTranslator() {
    let dict = {};
    let isHindi = true;
    const cache = []; // nodes cache

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    // Determine current language state
    const savedLang = getCookie("preflang");
    if (savedLang === "en") {
        isHindi = false;
    } else {
        isHindi = true; // default Hindi
        setCookie("preflang", "hi", 30);
    }

    // Load dictionary
    try {
        const res = await fetch('js/hi.json');
        if (res.ok) {
            dict = await res.json();
            walkDOM(document.body);
            // Apply translation immediately if default is Hindi
            if (isHindi) updateTexts();
        }
    } catch(e) { console.error("Translation dict load failed", e); }

    function walkDOM(node) {
        if (node.nodeType === 3) {
            const text = node.nodeValue.trim();
            if (text && dict[text]) {
                cache.push({ node: node, orig: text, hindi: dict[text] });
            }
        } else if (node.nodeType === 1) {
            // Ignore scripts and style
            if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;

            // Also check inputs
            if (['INPUT', 'TEXTAREA'].includes(node.tagName)) {
                if (node.placeholder && dict[node.placeholder.trim()]) {
                    cache.push({ node: node, prop: 'placeholder', orig: node.placeholder.trim(), hindi: dict[node.placeholder.trim()] });
                }
                if (node.type === 'submit' && node.value && dict[node.value.trim()]) {
                    cache.push({ node: node, prop: 'value', orig: node.value.trim(), hindi: dict[node.value.trim()] });
                }
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                walkDOM(node.childNodes[i]);
            }
        }
    }

    function updateTexts() {
        cache.forEach(item => {
            const targetVal = isHindi ? item.hindi : item.orig;
            if (item.prop) {
                // It's an input attribute
                item.node[item.prop] = targetVal;
            } else {
                // It's a text node
                // Preserve leading/trailing whitespace
                const wsMatch = item.node.nodeValue.match(/(^\s*).*?(\s*$)/);
                item.node.nodeValue = (wsMatch ? wsMatch[1] : '') + targetVal + (wsMatch ? wsMatch[2] : '');
            }
        });
        updateToggleUI();
    }

    function updateToggleUI() {
        const btnHi = document.getElementById('lang-hi');
        const btnEn = document.getElementById('lang-en');
        if(btnHi && btnEn) {
            if (isHindi) {
                btnHi.classList.add('bg-slate-900', 'text-white');
                btnHi.classList.remove('text-slate-500');
                btnEn.classList.remove('bg-slate-900', 'text-white');
                btnEn.classList.add('text-slate-500');
            } else {
                btnEn.classList.add('bg-slate-900', 'text-white');
                btnEn.classList.remove('text-slate-500');
                btnHi.classList.remove('bg-slate-900', 'text-white');
                btnHi.classList.add('text-slate-500');
            }
        }
    }

    // Inject toggle into header
    function injectToggle() {
        const headerFlex = document.querySelector('header div.flex');
        if (headerFlex && !document.getElementById('custom-lang-toggle')) {
            const toggleHTML = `
                <div id="custom-lang-toggle" class="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
                    <button id="lang-hi" class="text-xs font-black px-3 py-1.5 rounded-full transition-all tracking-wider ${isHindi ? 'bg-slate-900 text-white' : 'text-slate-500'}">HIN</button>
                    <button id="lang-en" class="text-xs font-black px-3 py-1.5 rounded-full transition-all tracking-wider ${!isHindi ? 'bg-slate-900 text-white' : 'text-slate-500'}">ENG</button>
                </div>
            `;
            // Ensure header has space for it
            headerFlex.classList.add('justify-between');
            headerFlex.insertAdjacentHTML('beforeend', toggleHTML);
            
            document.getElementById('lang-hi').addEventListener('click', () => {
                if(!isHindi) {
                    isHindi = true;
                    setCookie("preflang", "hi", 30);
                    updateTexts();
                }
            });
            document.getElementById('lang-en').addEventListener('click', () => {
                if(isHindi) {
                    isHindi = false;
                    setCookie("preflang", "en", 30);
                    updateTexts();
                }
            });
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectToggle);
    } else {
        injectToggle();
    }
})();
