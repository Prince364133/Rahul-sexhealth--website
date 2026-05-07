import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Cache Key for Instant Loading
const CACHE_KEY = 'pureveda_dynamic_data';

// Initial Load from Cache for Instant Visuals
const cachedData = localStorage.getItem(CACHE_KEY);
if (cachedData) {
    try {
        const data = JSON.parse(cachedData);
        updateDynamicElements(data);
        console.log("⚡ Instant Load: Data hydrated from cache");
    } catch (e) {
        console.error("Cache hydration failed:", e);
    }
}

// Real-time synchronization with background cache update
onSnapshot(doc(db, "app_settings", "general"), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        updateDynamicElements(data);
        console.log("🔄 Real-time Sync: Local data updated");
    }
}, (error) => {
    console.error("Firestore sync error:", error);
});

function updateDynamicElements(settings) {
    if (!settings) return;

    const brandName = settings.business_name || '';
    const heroImage = settings.hero_image_url || '';
    const videoUrl = settings.product_video_url || '';
    const offerPrice = settings.offer_price || '';
    const originalPrice = settings.original_price || '';
    const whatsapp = settings.whatsapp_number || '';

    // 1. Text Elements
    document.querySelectorAll('.dynamic-business-name').forEach(el => {
        el.innerText = brandName;
        el.classList.remove('skeleton', 'skeleton-text');
    });

    // 2. Pricing Elements
    document.querySelectorAll('.dynamic-offer-price').forEach(el => {
        el.innerText = offerPrice ? `₹${offerPrice}` : '';
        el.classList.remove('skeleton', 'skeleton-text');
    });

    document.querySelectorAll('.dynamic-price').forEach(el => {
        el.innerText = originalPrice ? `₹${originalPrice}` : '';
        el.classList.remove('skeleton', 'skeleton-text');
    });

    // 3. Image Elements (Src)
    document.querySelectorAll('.dynamic-hero-image').forEach(img => {
        if (heroImage) {
            img.src = heroImage;
            img.classList.remove('skeleton', 'skeleton-img');
            img.style.opacity = '1';
        } else {
            // Hide if no image provided to fulfill "dont load any default"
            img.style.opacity = '0';
        }
    });

    // 4. Logo Elements
    document.querySelectorAll('.dynamic-logo').forEach(img => {
        if (heroImage) {
            img.src = heroImage;
            img.classList.remove('opacity-20', 'grayscale', 'invert');
            img.style.opacity = '1';
        }
    });

    // 5. Background Images
    document.querySelectorAll('.dynamic-bg-image').forEach(el => {
        if (heroImage) {
            el.style.backgroundImage = `url('${heroImage}')`;
        }
    });

    // 6. Video Logic
    const videoContainer = document.getElementById('dynamic-video-container');
    if (videoContainer) {
        if (videoUrl) {
            videoContainer.style.display = 'block';
            const videoSource = videoContainer.querySelector('source');
            const iframe = videoContainer.querySelector('iframe');

            // Handle YouTube Embed
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
                if (!iframe) {
                    videoContainer.innerHTML = `<iframe class="w-full aspect-video rounded-[2.5rem]" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
            } else if (videoSource && videoSource.src !== videoUrl) {
                // Handle Direct Link
                videoSource.src = videoUrl;
                videoContainer.querySelector('video').load();
            }
        } else {
            videoContainer.style.display = 'none';
        }
    }

    // 7. WhatsApp Links
    document.querySelectorAll('.whatsapp-link').forEach(link => {
        if (whatsapp) {
            link.href = `https://wa.me/${whatsapp}`;
        }
    });

    // 8. Custom Metadata
    if (brandName) {
        document.title = brandName;
    }
}
