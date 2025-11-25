import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, deleteDoc, doc, setDoc, getDocs, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase Configuration - SAME AS script.js
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

// Login System
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginError = document.getElementById('login-error');

// Check if already logged in
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    showAdminPanel();
}

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Simple authentication (varsayılan: admin / admin123)
        if (username === 'admin' && password === 'admin123') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            loginError.classList.remove('hidden');
            setTimeout(() => {
                loginError.classList.add('hidden');
            }, 3000);
        }
    });
}

function showAdminPanel() {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (adminPanel) adminPanel.classList.remove('hidden');
    initializeAdminPanel();
    initChatModeration();
    initAdminChat();
    initFileUploads();
}

// Admin Panel Logic

// Initialize default values if not present
if (!localStorage.getItem('streamTitle')) {
    localStorage.setItem('streamTitle', 'Gece Yayını & Sohbet - Oyun Gecesi 🎮');
}
if (!localStorage.getItem('streamCategory')) {
    localStorage.setItem('streamCategory', 'Oyun');
}
if (!localStorage.getItem('isLive')) {
    localStorage.setItem('isLive', 'true');
}


// Load current values when admin panel is shown
function initializeAdminPanel() {
    const streamTitleEl = document.getElementById('stream-title');
    const streamCategoryEl = document.getElementById('stream-category');
    const streamSourceEl = document.getElementById('stream-source');
    const chatChannelTextEl = document.getElementById('chat-channel-text');
    const chatChannelLinkEl = document.getElementById('chat-channel-link');
    const bannerHeaderEl = document.getElementById('banner-header');
    const bannerChatEl = document.getElementById('banner-chat');
    const bannerLinkEl = document.getElementById('banner-link');

    if (streamTitleEl) streamTitleEl.value = localStorage.getItem('streamTitle') || '';
    if (streamCategoryEl) streamCategoryEl.value = localStorage.getItem('streamCategory') || 'Oyun';
    if (streamSourceEl) streamSourceEl.value = localStorage.getItem('streamSource') || '';
    if (chatChannelTextEl) chatChannelTextEl.value = localStorage.getItem('chatChannelText') || 'Sohbet Kanalı';
    if (chatChannelLinkEl) chatChannelLinkEl.value = localStorage.getItem('chatChannelLink') || '#';

    if (bannerHeaderEl) bannerHeaderEl.value = localStorage.getItem('headerBannerUrl') || '';
    if (bannerChatEl) bannerChatEl.value = localStorage.getItem('chatBannerUrl') || '';
    if (bannerLinkEl) bannerLinkEl.value = localStorage.getItem('bannerLink') || '';

    updateStatusUI(localStorage.getItem('isLive') === 'true');
}

// File Upload Handler
function initFileUploads() {
    const bannerHeaderFile = document.getElementById('banner-header-file');
    const bannerChatFile = document.getElementById('banner-chat-file');

    if (bannerHeaderFile) {
        bannerHeaderFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    localStorage.setItem('headerBannerUrl', dataUrl);
                    localStorage.setItem('headerBannerActive', 'true');
                    document.getElementById('banner-header').value = 'Dosya yüklendi';
                    alert('Header banner yüklendi ve aktifleştirildi!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (bannerChatFile) {
        bannerChatFile.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    localStorage.setItem('chatBannerUrl', dataUrl);
                    localStorage.setItem('chatBannerActive', 'true');
                    document.getElementById('banner-chat').value = 'Dosya yüklendi';
                    alert('Chat banner yüklendi ve aktifleştirildi!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Admin Chat Message Sender
function initAdminChat() {
    const adminMessageForm = document.getElementById('admin-message-form');
    const adminMessageInput = document.getElementById('admin-message-input');

    if (adminMessageForm) {
        adminMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = adminMessageInput.value.trim();

            if (text) {
                try {
                    await addDoc(messagesRef, {
                        username: 'Admin',
                        text: text,
                        timestamp: serverTimestamp(),
                        badge: '🛡️',
                        isAdminMessage: true
                    });
                    adminMessageInput.value = '';
                    console.log('Admin message sent');
                } catch (error) {
                    console.error('Error sending admin message:', error);
                    alert('Mesaj gönderilemedi: ' + error.message);
                }
            }
        });
    }
}

// Update Stream Info
window.updateStreamInfo = function () {
    const title = document.getElementById('stream-title')?.value;
    const category = document.getElementById('stream-category')?.value;
    const streamSource = document.getElementById('stream-source')?.value;
    const chatChannelText = document.getElementById('chat-channel-text')?.value || 'Sohbet Kanalı';
    const chatChannelLink = document.getElementById('chat-channel-link')?.value || '#';

    const bannerHeader = document.getElementById('banner-header')?.value;
    const bannerChat = document.getElementById('banner-chat')?.value;
    const bannerLink = document.getElementById('banner-link')?.value;

    if (title) localStorage.setItem('streamTitle', title);
    if (category) localStorage.setItem('streamCategory', category);
    if (streamSource) localStorage.setItem('streamSource', streamSource);
    localStorage.setItem('chatChannelText', chatChannelText);
    localStorage.setItem('chatChannelLink', chatChannelLink);

    // Only update if not a file upload (file uploads are handled separately)
    if (bannerHeader && !bannerHeader.includes('Dosya yüklendi')) {
        localStorage.setItem('headerBannerUrl', bannerHeader);
    }
    if (bannerChat && !bannerChat.includes('Dosya yüklendi')) {
        localStorage.setItem('chatBannerUrl', bannerChat);
    }
    if (bannerLink) {
        localStorage.setItem('headerBannerLink', bannerLink);
        localStorage.setItem('chatBannerLink', bannerLink);
        localStorage.setItem('bannerLink', bannerLink);
    }

    // Also activate banners if URLs are present
    const headerUrl = localStorage.getItem('headerBannerUrl');
    const chatUrl = localStorage.getItem('chatBannerUrl');
    localStorage.setItem('headerBannerActive', headerUrl ? 'true' : 'false');
    localStorage.setItem('chatBannerActive', chatUrl ? 'true' : 'false');

    alert('Yayın bilgileri güncellendi!');
}

// Toggle Stream Status
window.toggleStreamStatus = function () {
    const currentStatus = localStorage.getItem('isLive') === 'true';
    const newStatus = !currentStatus;

    localStorage.setItem('isLive', newStatus);
    updateStatusUI(newStatus);
}

function updateStatusUI(isLive) {
    const btn = document.getElementById('toggle-stream-btn');
    const indicator = document.getElementById('status-indicator');

    if (isLive) {
        btn.textContent = 'Yayını Durdur';
        btn.className = 'flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors';
        indicator.innerHTML = '<span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> CANLI';
        indicator.className = 'flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium border border-red-500/20';
    } else {
        btn.textContent = 'Yayını Başlat';
        btn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors';
        indicator.innerHTML = '<span class="w-2 h-2 bg-gray-500 rounded-full"></span> ÇEVRİMDIŞI';
        indicator.className = 'flex items-center gap-2 px-3 py-1 bg-gray-500/10 text-gray-400 rounded-full text-sm font-medium border border-gray-500/20';
    }
}

// Chat Management
window.clearChat = async function () {
    if (confirm('Tüm sohbet geçmişini temizlemek istediğinize emin misiniz?')) {
        try {
            // Delete all messages from Firestore
            const q = query(messagesRef);
            const snapshot = await getDocs(q);

            const deletePromises = [];
            snapshot.forEach((docSnap) => {
                deletePromises.push(deleteDoc(docSnap.ref));
            });

            await Promise.all(deletePromises);

            // Also set the local storage action for client-side clearing
            localStorage.setItem('chatAction', 'clear_' + Date.now());
            alert('Sohbet temizlendi!');
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Sohbet temizlenirken hata oluştu: ' + error.message);
        }
    }
}

// Show Banned Users
window.showBannedUsers = function () {
    const bannedList = document.getElementById('banned-users-list');
    if (bannedList.classList.contains('hidden')) {
        bannedList.classList.remove('hidden');
        // TODO: Fetch and display banned users from Firestore
        bannedList.innerHTML = '<p class="text-gray-400 text-sm">Yasaklı kullanıcı listesi yükleniyor...</p>';
    } else {
        bannedList.classList.add('hidden');
    }
}

// Chat Moderation Logic
function initChatModeration() {
    const adminChatMessages = document.getElementById('admin-chat-messages');
    if (!adminChatMessages) return;

    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));

    onSnapshot(q, (snapshot) => {
        adminChatMessages.innerHTML = ''; // Clear current list

        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            const msgId = docSnap.id;

            const div = document.createElement('div');
            div.className = 'flex items-start justify-between bg-gray-800 p-2 rounded border border-gray-700 hover:bg-gray-700 transition-colors';

            // Highlight admin messages
            if (msg.isAdminMessage) {
                div.className += ' border-brand-500/50 bg-brand-900/20';
            }

            div.innerHTML = `
                <div class="flex-1 min-w-0 mr-2">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-bold ${msg.isAdminMessage ? 'text-brand-400' : 'text-purple-400'} text-xs">${msg.username}</span>
                        <span class="text-gray-500 text-[10px]">${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}</span>
                        ${msg.badge ? `<span class="text-xs">${msg.badge}</span>` : ''}
                    </div>
                    <p class="text-gray-300 text-sm break-words">${msg.text}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="deleteMessage('${msgId}')" class="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded" title="Mesajı Sil">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    ${!msg.isAdminMessage ? `<button onclick="banUser('${msg.username}')" class="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded" title="Kullanıcıyı Banla">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                    </button>` : ''}
                </div>
            `;

            adminChatMessages.appendChild(div);
        });
    });
}

// Expose moderation functions to window
window.deleteMessage = async function (messageId) {
    if (confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
        try {
            await deleteDoc(doc(db, "messages", messageId));
            console.log('Message deleted:', messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Mesaj silinirken hata oluştu.');
        }
    }
}

window.banUser = async function (username) {
    if (confirm(`${username} kullanıcısını banlamak istediğinize emin misiniz?`)) {
        try {
            const userRef = doc(db, "users", username);
            await setDoc(userRef, {
                isBanned: true,
                bannedAt: serverTimestamp()
            }, { merge: true });
            alert(`${username} banlandı.`);
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Kullanıcı banlanırken hata oluştu.');
        }
    }
}
