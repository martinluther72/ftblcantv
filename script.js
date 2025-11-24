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

// HLS Player Logic
let hls;
let playerError = false; // Flag to track errors
const video = document.getElementById('stream-player');
const defaultStream = 'http://46.224.13.123/hls/test.m3u8';

function showError(title, message, detail) {
    playerError = true;
    const offlineBanner = document.getElementById('header-banner');
    if (offlineBanner) {
        offlineBanner.classList.remove('hidden');
        offlineBanner.innerHTML = `
            <div class="text-center p-4 max-w-md mx-auto">
                <div class="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
                <p class="text-gray-300 text-sm mb-4">${message}</p>
                <p class="text-gray-500 text-xs break-all">${detail || ''}</p>
            </div>
        `;
    }
}

function initPlayer(url) {
    playerError = false; // Reset error on new init

    // Mixed Content Check (Logging only, not blocking)
    if (location.protocol === 'https:' && url.startsWith('http:')) {
        console.warn('Mixed Content Warning: Trying to play HTTP stream on HTTPS site.');
    }

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

        // HLS Error Handling
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('HLS Network Error', data);
                        hls.startLoad(); // Try to recover
                        if (data.details === 'manifestLoadError') {
                            showError(
                                'Yayın Yüklenemedi',
                                'Yayın sunucusuna erişilemiyor veya yayın aktif değil.',
                                'Hata: ' + data.details
                            );
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('HLS Media Error', data);
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error('HLS Fatal Error', data);
                        hls.destroy();
                        showError(
                            'Oynatma Hatası',
                            'Beklenmedik bir hata oluştu.',
                            'Hata: ' + data.type
                        );
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(e => console.log('Autoplay prevented:', e));
        });
        video.addEventListener('error', function (e) {
            showError(
                'Oynatma Hatası',
                'Video yüklenirken bir sorun oluştu.',
                'Tarayıcı desteklemiyor veya ağ hatası.'
            );
        });
    }
}

// Initialize with stored or default URL
// Initialize with stored or default URL
const savedSource = localStorage.getItem('streamSource') || defaultStream;
// Ensure we save the default if nothing is there, so admin sees it
if (!localStorage.getItem('streamSource')) {
    localStorage.setItem('streamSource', defaultStream);
}

// Initialize isLive default
if (localStorage.getItem('isLive') === null) {
    localStorage.setItem('isLive', 'true');
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
    const statusBadge = document.getElementById('live-badge');
    const offlineMessage = document.getElementById('header-banner');
    const videoContainer = document.getElementById('video-container');

    // Handle Stream Source Updates
    if (video && streamSource) {
        // Check if source changed
        const currentSrc = hls ? hls.url : video.src;
        if (currentSrc !== streamSource && !playerError) {
            console.log('Stream source changed, reloading player...');
            initPlayer(streamSource);
        }
    }

    if (isLive) {
        // Only hide the banner if there is NO error
        if (offlineMessage && !playerError) {
            offlineMessage.classList.add('hidden');
        }
        if (videoContainer) videoContainer.classList.remove('opacity-50');
    } else {
        // If not live, show offline message
        if (offlineMessage) {
            offlineMessage.classList.remove('hidden');
            // Restore offline message if it was overwritten by error
            if (playerError || offlineMessage.innerText.includes('Yayın Çevrimdışı') === false) {
                offlineMessage.innerHTML = `
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <p class="text-gray-400 font-medium">Yayın Çevrimdışı</p>
                    </div>
                 `;
                playerError = false;
            }
        }
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
