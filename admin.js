import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, deleteDoc, doc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-EXAMPLE-API-KEY", // Replace with your actual config if needed, or keep using the one from script.js
    authDomain: "canli-yayin-projesi.firebaseapp.com",
    projectId: "canli-yayin-projesi",
    storageBucket: "canli-yayin-projesi.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
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
    if (bannerLinkEl) bannerLinkEl.value = localStorage.getItem('bannerLink') || ''; // Unified link for simplicity

    updateStatusUI(localStorage.getItem('isLive') === 'true');
}

// Update Stream Info
window.updateStreamInfo = function () {
    const title = document.getElementById('stream-title').value;
    const category = document.getElementById('stream-category').value;
    const streamSource = document.getElementById('stream-source').value;
    const chatChannelText = document.getElementById('chat-channel-text')?.value || 'Sohbet Kanalı';
    const chatChannelLink = document.getElementById('chat-channel-link')?.value || '#';

    const bannerHeader = document.getElementById('banner-header')?.value;
    const bannerChat = document.getElementById('banner-chat')?.value;
    const bannerLink = document.getElementById('banner-link')?.value;

    localStorage.setItem('streamTitle', title);
    localStorage.setItem('streamCategory', category);
    localStorage.setItem('streamSource', streamSource);
    localStorage.setItem('chatChannelText', chatChannelText);
    localStorage.setItem('chatChannelLink', chatChannelLink);

    if (bannerHeader) localStorage.setItem('headerBannerUrl', bannerHeader);
    if (bannerChat) localStorage.setItem('chatBannerUrl', bannerChat);
    if (bannerLink) {
        localStorage.setItem('headerBannerLink', bannerLink);
        localStorage.setItem('chatBannerLink', bannerLink);
        localStorage.setItem('bannerLink', bannerLink);
    }

    // Also activate banners if URLs are present
    localStorage.setItem('headerBannerActive', !!bannerHeader);
    localStorage.setItem('chatBannerActive', !!bannerChat);

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
window.clearChat = function () {
    if (confirm('Tüm sohbet geçmişini temizlemek istediğinize emin misiniz?')) {
        localStorage.setItem('chatAction', 'clear_' + Date.now());
        alert('Sohbet temizlendi!');
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

            div.innerHTML = `
                <div class="flex-1 min-w-0 mr-2">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-bold text-brand-400 text-xs">${msg.username}</span>
                        <span class="text-gray-500 text-[10px]">${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ''}</span>
                        ${msg.badge ? `<span class="text-xs">${msg.badge}</span>` : ''}
                    </div>
                    <p class="text-gray-300 text-sm break-words">${msg.text}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="deleteMessage('${msgId}')" class="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded" title="Mesajı Sil">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <button onclick="banUser('${msg.username}')" class="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded" title="Kullanıcıyı Banla">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                    </button>
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

// Clear chat button listener
const clearChatBtn = document.getElementById('clear-chat-btn');
if (clearChatBtn) {
    clearChatBtn.addEventListener('click', window.clearChat);
}
