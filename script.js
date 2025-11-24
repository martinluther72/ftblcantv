import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDHymujLbewkzfuOY5oVAfTLj3Db4-PraM",
    authDomain: "ftblcantv.firebaseapp.com",
    projectId: "ftblcantv",
    storageBucket: "ftblcantv.firebasestorage.app",
    messagingSenderId: "843613115388",
    appId: "1:843613115388:web:83cadefcc8df941ac25879"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    initChat();
    initPlayer();
}

function initChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // Reply state
    let replyingTo = null;

    // Generate a unique color for each username
    function getUsernameColor(username) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Predefined vibrant colors for better readability
        const colors = [
            'text-blue-400',
            'text-green-400',
            'text-yellow-400',
            'text-purple-400',
            'text-pink-400',
            'text-indigo-400',
            'text-cyan-400',
            'text-orange-400',
            'text-red-400',
            'text-teal-400',
            'text-lime-400',
            'text-fuchsia-400'
        ];

        return colors[Math.abs(hash) % colors.length];
    }

    // Function to render a message to the UI
    function renderMessage(id, data) {
        // Prevent duplicate messages
        if (document.getElementById(`msg-${id}`)) return;

        const div = document.createElement('div');
        div.id = `msg-${id}`;
        div.className = 'animate-fade-in-up';

        const isSystem = data.username === 'Sistem';
        const text = data.text;
        const username = data.username;
        const color = isSystem ? 'text-gray-500' : getUsernameColor(username);
        const replyTo = data.replyTo;

        if (isSystem) {
            div.innerHTML = `
            <div class="flex items-center gap-2 opacity-75">
                <span class="text-gray-500 text-xs font-bold uppercase">Sistem</span>
                <span class="text-gray-400">${text}</span>
            </div>
        `;
        } else {
            let replyHtml = '';
            if (replyTo) {
                const replyColor = getUsernameColor(replyTo);
                replyHtml = `
                <div class="text-xs ${replyColor} opacity-75 mb-1 ml-1">
                    ↳ ${replyTo} kullanıcısına yanıt
                </div>
            `;
            }

            div.innerHTML = `
            <div class="group hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-colors">
                ${replyHtml}
                <span class="${color} font-bold cursor-pointer hover:underline text-xs md:text-sm username-click" data-username="${username}">${username}:</span>
                <span class="text-gray-200 text-xs md:text-sm break-words ml-1">${text}</span>
            </div>
        `;

            // Add click event for username
            const usernameEl = div.querySelector('.username-click');
            if (usernameEl) {
                usernameEl.addEventListener('click', () => {
                    replyingTo = username;
                    chatInput.placeholder = `${username} kullanıcısına yanıt veriyorsunuz...`;
                    chatInput.focus();
                });
            }
        }

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Listen for real-time updates
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                renderMessage(change.doc.id, change.doc.data());
            }
        });
    });

    // Username Logic
    const usernameOverlay = document.getElementById('username-overlay');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    let currentUsername = localStorage.getItem('chatUsername');

    function checkUsername() {
        if (!currentUsername) {
            usernameOverlay.classList.remove('hidden');
            usernameOverlay.classList.add('flex');
        } else {
            usernameOverlay.classList.add('hidden');
            usernameOverlay.classList.remove('flex');
        }
    }

    // Initialize username check
    checkUsername();

    // Handle username submission
    if (usernameForm) {
        usernameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = usernameInput.value.trim();
            if (name) {
                currentUsername = name;
                localStorage.setItem('chatUsername', name);
                checkUsername();
            }
        });
    }

    // Handle user message submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();

        if (text && currentUsername) {
            try {
                const messageData = {
                    username: currentUsername,
                    text: text,
                    timestamp: serverTimestamp()
                };

                // Add reply info if replying
                if (replyingTo) {
                    messageData.replyTo = replyingTo;
                }

                await addDoc(messagesRef, messageData);
                chatInput.value = '';

                // Reset reply state
                replyingTo = null;
                chatInput.placeholder = 'Bir mesaj yaz...';
            } catch (error) {
                console.error("Error sending message: ", error);
                alert("Mesaj gönderilemedi: " + error.message);
            }
        } else if (!currentUsername) {
            checkUsername(); // Re-show overlay if somehow bypassed
        }
    });

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

    // Real-time Sync with Admin Panel for Chat
    setInterval(() => {
        const chatAction = localStorage.getItem('chatAction');
        if (chatAction && chatAction.startsWith('clear_')) {
            const lastClear = localStorage.getItem('lastClearTime');
            if (chatAction !== lastClear) {
                chatMessages.innerHTML = '<div class="text-center text-gray-500 text-xs py-4">Sohbet yönetici tarafından temizlendi.</div>';
                localStorage.setItem('lastClearTime', chatAction);
            }
        }

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
}

function initPlayer() {
    // HLS Player Logic
    let hls;
    let playerError = false;
    const video = document.getElementById('stream-player');
    const defaultStream = 'https://kralbahis.forum/hls/test.m3u8';

    if (!video) {
        console.error('Video element not found!');
        return;
    }

    console.log('Initializing player with stream:', defaultStream);

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

    function loadPlayer(url) {
        playerError = false;

        if (location.protocol === 'https:' && url.startsWith('http:')) {
            console.warn('Mixed Content Warning: Trying to play HTTP stream on HTTPS site.');
        }

        if (typeof Hls === 'undefined') {
            console.error('HLS.js not loaded!');
            showError('Yükleme Hatası', 'Video oynatıcı yüklenemedi.', 'HLS.js kütüphanesi bulunamadı.');
            return;
        }

        if (Hls.isSupported()) {
            console.log('HLS is supported, loading stream...');
            if (hls) {
                hls.destroy();
            }
            hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            window.hlsInstance = hls; // Make it globally accessible for quality controls
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                console.log('HLS manifest parsed successfully');
                video.muted = true; // Mute for autoplay
                video.play().then(() => {
                    console.log('Video playing');
                }).catch(e => {
                    console.error('Autoplay prevented:', e);
                    // Show play button overlay if autoplay fails
                    video.muted = false;
                });
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('HLS Network Error', data);
                            hls.startLoad();
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
                video.muted = true; // Mute for autoplay
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                    video.muted = false;
                });
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

    const savedSource = localStorage.getItem('streamSource') || defaultStream;
    if (!localStorage.getItem('streamSource')) {
        localStorage.setItem('streamSource', defaultStream);
    }

    localStorage.setItem('isLive', 'true');

    loadPlayer(savedSource);

    // Real-time Sync with Admin Panel
    setInterval(() => {
        const storedTitle = localStorage.getItem('streamTitle');
        if (storedTitle) {
            const titleEl = document.querySelector('h2');
            if (titleEl && titleEl.textContent !== storedTitle) {
                titleEl.textContent = storedTitle;
            }
        }

        const isLive = localStorage.getItem('isLive') === 'true';
        const streamSource = localStorage.getItem('streamSource') || defaultStream;
        const offlineMessage = document.getElementById('header-banner');
        const videoContainer = document.getElementById('video-container');

        if (video && streamSource) {
            const currentSrc = hls ? hls.url : video.src;
            if (currentSrc !== streamSource && !playerError) {
                loadPlayer(streamSource);
            }
        }

        if (isLive) {
            if (offlineMessage && !playerError) {
                offlineMessage.classList.add('hidden');
            }
            if (videoContainer) videoContainer.classList.remove('opacity-50');
        } else {
            if (offlineMessage) {
                offlineMessage.classList.remove('hidden');
                if (playerError || offlineMessage.innerText.includes('Yayın Çevrimdışı') === false) {
                    offlineMessage.innerHTML = `
                    <div class="text-center">
                        <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 15.636 5.636m12.728 12.728L5.636 5.636" />
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
    }, 1000);
}
