// Chat Simulation Data
const users = [
    { name: 'Ahmet Yılmaz', color: 'text-blue-400' },
    { name: 'Zeynep K.', color: 'text-pink-400' },
    { name: 'Mehmet_Pro', color: 'text-green-400' },
    { name: 'Ayşe_123', color: 'text-yellow-400' },
    { name: 'Caner', color: 'text-purple-400' },
];

const messages = [
    'Harika yayın!',
    'Selamlar herkese 👋',
    'Bu oyunu çok seviyorum',
    'OBS ayarlarını paylaşır mısın?',
    'Ses biraz kısık sanki',
    'Görüntü kalitesi süper 1080p',
    'Abi arkadaki ışık çok iyi',
    'Hangi sunucudasın?',
    'Moderator alımı var mı?',
    'Takip ettim!',
];

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Function to add a message to the chat
function addMessage(username, text, color = 'text-gray-300', isSystem = false) {
    const div = document.createElement('div');
    div.className = 'animate-fade-in-up';

    if (isSystem) {
        div.innerHTML = `
            <div class="flex items-center gap-2 opacity-75">
                <span class="text-gray-500 text-xs font-bold uppercase">Sistem</span>
                <span class="text-gray-400">${text}</span>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="group hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-colors">
                <span class="${color} font-bold cursor-pointer hover:underline text-xs md:text-sm">${username}:</span>
                <span class="text-gray-200 text-xs md:text-sm break-words ml-1">${text}</span>
            </div>
        `;
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate incoming messages
function simulateChat() {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    addMessage(randomUser.name, randomMessage, randomUser.color);

    // Randomize next message time (between 2s and 6s)
    setTimeout(simulateChat, Math.random() * 4000 + 2000);
}

// Handle user message submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();

    if (text) {
        addMessage('Sen', text, 'text-brand-500'); // User is always brand color
        chatInput.value = '';

        // Simulate bot response for specific keywords
        if (text.toLowerCase().includes('selam')) {
            setTimeout(() => addMessage('StreamBot', 'Hoş geldin! 👋', 'text-red-500', true), 1000);
        }
    }
});

// Start simulation
setTimeout(simulateChat, 1000);

// Add some initial CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Real-time Sync with Admin Panel
// HLS Player Logic
let hls;
const video = document.getElementById('stream-player');
const defaultStream = 'http://46.224.13.123/hls/test.m3u8';

function initPlayer(url) {
    if (Hls.isSupported()) {
        if (hls) {
            hls.destroy();
        }
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(e => console.log('Autoplay prevented:', e));
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(e => console.log('Autoplay prevented:', e));
        });
    }
}

// Initialize with stored or default URL
const savedSource = localStorage.getItem('streamSource') || defaultStream;
// Ensure we save the default if nothing is there, so admin sees it
if (!localStorage.getItem('streamSource')) {
    localStorage.setItem('streamSource', defaultStream);
}
initPlayer(savedSource);


// Real-time Sync with Admin Panel
setInterval(() => {
    // Sync Title
    const storedTitle = localStorage.getItem('streamTitle');
    if (storedTitle) {
        const titleEl = document.querySelector('h2');
        if (titleEl && titleEl.textContent !== storedTitle) {
            titleEl.textContent = storedTitle;
        }
    }

    // Sync Status & Stream Source
    const isLive = localStorage.getItem('isLive') === 'true';
    const streamSource = localStorage.getItem('streamSource') || defaultStream;
    const statusBadge = document.getElementById('live-badge'); // Note: This ID might need to be added to HTML if missing
    const offlineMessage = document.getElementById('header-banner'); // Using the offline overlay div
    const videoContainer = document.getElementById('video-container');

    // Handle Stream Source Updates
    if (video && streamSource) {
        // Check if source changed
        const currentSrc = hls ? hls.url : video.src;
        // Simple check - in real app might need more robust URL comparison
        if (currentSrc !== streamSource) {
            console.log('Stream source changed, reloading player...');
            initPlayer(streamSource);
        }
    }

    if (isLive) {
        if (offlineMessage) offlineMessage.classList.add('hidden');
        if (videoContainer) videoContainer.classList.remove('opacity-50'); // Example visual cue
    } else {
        if (offlineMessage) offlineMessage.classList.remove('hidden');
        if (hls) hls.stopLoad();
        if (video) video.pause();
    }

    // Sync Chat Actions
    const chatAction = localStorage.getItem('chatAction');
    if (chatAction && chatAction.startsWith('clear_')) {
        const lastClear = localStorage.getItem('lastClearTime');
        if (chatAction !== lastClear) {
            chatMessages.innerHTML = '<div class="text-center text-gray-500 text-xs py-4">Sohbet yönetici tarafından temizlendi.</div>';
            localStorage.setItem('lastClearTime', chatAction);
        }
    }

    // Sync Banners
    const headerActive = localStorage.getItem('headerBannerActive') === 'true';
    const headerUrl = localStorage.getItem('headerBannerUrl');
    const headerLink = localStorage.getItem('headerBannerLink') || '#';
    // Note: header-banner ID is used for offline overlay in new layout. 
    // We might need to adjust if "Header Banner" meant a top advertisement.
    // Assuming "Header Banner" in admin meant the offline overlay or a top banner.
    // In the new layout, we have an offline overlay. Let's assume the admin "Header Banner" 
    // was intended for a different purpose or we repurpose it. 
    // For now, let's skip conflicting ID logic or fix it.
    // The previous code used 'header-banner' for ad. 
    // In index.html, 'header-banner' is the offline overlay.
    // Let's comment out ad banner sync for 'header-banner' to avoid conflict with offline overlay
    // until we clarify or rename IDs.

    /*
    const headerBanner = document.getElementById('header-banner');
    if (headerActive && headerUrl && headerBanner) {
        // Conflict: header-banner is now offline overlay. 
        // We should probably rename the ad banner container if we want to support it.
    }
    */

    const chatActive = localStorage.getItem('chatBannerActive') === 'true';
    const chatUrl = localStorage.getItem('chatBannerUrl');
    const chatLink = localStorage.getItem('chatBannerLink') || '#';
    const chatBanner = document.getElementById('chat-banner');
    const chatBannerImg = document.getElementById('chat-banner-img');
    const chatBannerAnchor = document.getElementById('chat-banner-link');

    if (chatBanner && chatBannerImg && chatBannerAnchor) {
        if (chatActive && chatUrl) {
            chatBanner.classList.remove('hidden');
            chatBanner.classList.add('flex');
            if (chatBannerImg.src !== chatUrl) chatBannerImg.src = chatUrl;
            if (chatBannerAnchor.href !== chatLink) chatBannerAnchor.href = chatLink;
        } else {
            chatBanner.classList.add('hidden');
            chatBanner.classList.remove('flex');
        }
    }

}, 1000);
