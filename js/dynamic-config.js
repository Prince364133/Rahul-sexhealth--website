import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnD0LImABR235yBki1bb76omAprp9TMnM",
  authDomain: "pureveda-website.firebaseapp.com",
  projectId: "pureveda-website",
  storageBucket: "pureveda-website.firebasestorage.app",
  messagingSenderId: "896734665834",
  appId: "1:896734665834:web:be60231617e9ba56a67e13",
  measurementId: "G-MEXRQ6W6G6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_BRAND = "Hammer of Thor";
const DEFAULT_PRICE = "1499";

/**
 * Resolves common image hosting viewer links to direct image URLs
 * @param {string} url 
 * @returns {string} resolved URL
 */
function resolveImageUrl(url) {
  if (!url) return "";
  
  // Clean the URL
  url = url.trim();

  // Handle Google Drive
  // https://drive.google.com/file/d/ID/view -> https://drive.google.com/uc?id=ID
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([^\/\?#]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?id=${match[1]}`;
    }
  }

  // Handle Dropbox
  // https://www.dropbox.com/s/ID/name.png?dl=0 -> https://www.dropbox.com/s/ID/name.png?raw=1
  if (url.includes('dropbox.com')) {
    return url.replace(/\?(dl|st)=\d/g, '?raw=1');
  }

  return url;
}

function updateDynamicElements(data) {
  const brandName = data.business_name || DEFAULT_BRAND;
  const offerPrice = data.offer_price || DEFAULT_PRICE;
  const originalPrice = data.original_price || "2999";
  const waNumber = data.whatsapp_number || "";
  const heroImageUrl = data.hero_image_url || "";

  // Update hero images with robust handling
  const resolvedUrl = resolveImageUrl(heroImageUrl);
  const heroElements = document.querySelectorAll('.dynamic-hero-image');
  
  if (resolvedUrl && heroElements.length > 0) {
    heroElements.forEach(el => {
      // Store original source for fallback
      if (!el.dataset.originalSrc) {
        if (el.tagName === 'IMG') {
          el.dataset.originalSrc = el.getAttribute('src') || "";
        } else {
          const bg = el.style.backgroundImage;
          el.dataset.originalSrc = bg ? bg.slice(5, -2) : "";
        }
      }

      if (el.tagName === 'IMG') {
        // Only trigger update if URL changed
        if (el.src !== resolvedUrl) {
          el.onload = () => el.classList.remove('skeleton', 'skeleton-img');
          el.onerror = () => {
            console.warn("Custom image failed to load, reverting to fallback:", resolvedUrl);
            if (el.dataset.originalSrc) el.src = el.dataset.originalSrc;
            el.classList.remove('skeleton', 'skeleton-img');
          };
          el.src = resolvedUrl;
        } else {
          el.classList.remove('skeleton', 'skeleton-img');
        }
      } else {
        // Handle background images via preloading image object
        const tempImg = new Image();
        tempImg.onload = () => {
          el.style.backgroundImage = `url('${resolvedUrl}')`;
          el.classList.remove('skeleton', 'skeleton-img');
        };
        tempImg.onerror = () => {
          el.classList.remove('skeleton', 'skeleton-img');
        };
        tempImg.src = resolvedUrl;
      }
    });
  } else {
    // Clean up skeletons if no image is provided or elements missing
    heroElements.forEach(el => el.classList.remove('skeleton', 'skeleton-img'));
  }

  // Update brand name in text
  document.querySelectorAll('.dynamic-business-name').forEach(el => {
    el.textContent = brandName;
    el.classList.remove('skeleton', 'skeleton-text');
  });

  // Update brand name in titles if it contains "Hammer of Thor" or similar
  if (document.title.includes("Hammer of Thor") || document.title.includes("Pureveda") || document.title.includes("Inquiry Received")) {
      document.title = document.title.replace(/Hammer of Thor|Pureveda|Shakti Power Up/g, brandName);
  }

  // Update prices
  document.querySelectorAll('.dynamic-offer-price').forEach(el => {
    el.textContent = offerPrice;
    el.classList.remove('skeleton', 'skeleton-text');
  });
  document.querySelectorAll('.dynamic-original-price').forEach(el => {
    el.textContent = originalPrice;
    el.classList.remove('skeleton', 'skeleton-text');
  });

  // Update WhatsApp links
  if (waNumber) {
    const cleanWA = waNumber.replace(/\D/g, '');
    document.querySelectorAll('[data-wa-link]').forEach(el => {
      el.href = `https://wa.me/${cleanWA}?text=${encodeURIComponent(`नमस्ते, मुझे ${brandName} के बारे में और जानकारी चाहिए।`)}`;
      el.style.display = 'flex';
      el.classList.remove('skeleton');
    });
  } else {
    document.querySelectorAll('[data-wa-link]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// Global pixel injection logic
async function injectPixels() {
    // Only inject on thank.html if needed, OR on all pages if requested
    // The user specifically asked for "pixel-injection system on the thank-you page"
    if (window.location.pathname.includes('thank.html')) {
        try {
            const querySnapshot = await getDocs(collection(db, "pixels"));
            querySnapshot.forEach((doc) => {
                const p = doc.data();
                if (p.pixelCode) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = p.pixelCode;
                    
                    Array.from(tempDiv.querySelectorAll('script')).forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        document.head.appendChild(newScript);
                    });
                    
                    Array.from(tempDiv.childNodes).forEach(node => {
                        if (node.nodeName !== 'SCRIPT') {
                            document.head.appendChild(node.cloneNode(true));
                        }
                    });
                }
            });
        } catch (e) {
            console.error("Pixel injection failed:", e);
        }
    }
}

// Start real-time sync
onSnapshot(doc(db, "app_settings", "general"), (docSnap) => {
  if (docSnap.exists()) {
    updateDynamicElements(docSnap.data());
  } else {
    updateDynamicElements({});
  }
  
  // Dispatch event for other potential listeners
  document.dispatchEvent(new CustomEvent('dynamicDataReady'));
});

// Run once on load for pixels
injectPixels();

export { db, app };
