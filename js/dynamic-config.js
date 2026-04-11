import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY_TN3to4yAqk7IJNqVSKFS-fSuynXwOw",
  authDomain: "teste-erhij8.firebaseapp.com",
  projectId: "teste-erhij8",
  storageBucket: "teste-erhij8.firebasestorage.app",
  messagingSenderId: "744778225564",
  appId: "1:744778225564:web:f5d6b73e501495b3dfda59",
  measurementId: "G-JRQJXP4531"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_BRAND = "Hammer of Thor";
const DEFAULT_PRICE = "1499";

function updateDynamicElements(data) {
  const brandName = data.business_name || DEFAULT_BRAND;
  const offerPrice = data.offer_price || DEFAULT_PRICE;
  const originalPrice = data.original_price || "2999";
  const waNumber = data.whatsapp_number || "";
  const heroImageUrl = data.hero_image_url || "";

  // Update hero image if URL is provided
  if (heroImageUrl) {
    document.querySelectorAll('.dynamic-hero-image').forEach(el => {
      el.src = heroImageUrl;
    });
  }

  // Update brand name in text
  document.querySelectorAll('.dynamic-business-name').forEach(el => {
    el.textContent = brandName;
  });

  // Update brand name in titles if it contains "Hammer of Thor" or similar
  if (document.title.includes("Hammer of Thor") || document.title.includes("Pureveda") || document.title.includes("Inquiry Received")) {
      document.title = document.title.replace(/Hammer of Thor|Pureveda|Shakti Power Up/g, brandName);
  }

  // Update prices
  document.querySelectorAll('.dynamic-offer-price').forEach(el => {
    el.textContent = offerPrice;
  });
  document.querySelectorAll('.dynamic-original-price').forEach(el => {
    el.textContent = originalPrice;
  });

  // Update WhatsApp links
  if (waNumber) {
    const cleanWA = waNumber.replace(/\D/g, '');
    document.querySelectorAll('[data-wa-link]').forEach(el => {
      el.href = `https://wa.me/${cleanWA}?text=${encodeURIComponent(`नमस्ते, मुझे ${brandName} के बारे में और जानकारी चाहिए।`)}`;
      el.style.display = 'flex';
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
});

// Run once on load for pixels
injectPixels();

export { db, app };
