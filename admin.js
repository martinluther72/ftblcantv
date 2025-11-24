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

// Load current values
document.getElementById('stream-title').value = localStorage.getItem('streamTitle');
document.getElementById('stream-category').value = localStorage.getItem('streamCategory');
document.getElementById('stream-source').value = localStorage.getItem('streamSource') || '';
updateStatusUI(localStorage.getItem('isLive') === 'true');

// Update Stream Info
function updateStreamInfo() {
    const title = document.getElementById('stream-title').value;
    const category = document.getElementById('stream-category').value;
    const streamSource = document.getElementById('stream-source').value;

    localStorage.setItem('streamTitle', title);
    localStorage.setItem('streamCategory', category);
    localStorage.setItem('streamSource', streamSource);

    // Trigger a custom event or just let the interval pick it up
    alert('Yayın bilgileri güncellendi!');
}

// Toggle Stream Status
function toggleStreamStatus() {
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
function clearChat() {
    localStorage.setItem('chatAction', 'clear_' + Date.now());
    alert('Sohbet temizlendi!');
}
// Ad Settings Logic
function loadAdSettings() {
    const headerActive = localStorage.getItem('headerBannerActive') === 'true';
    const chatActive = localStorage.getItem('chatBannerActive') === 'true';
    const headerLink = localStorage.getItem('headerBannerLink') || '';
    const chatLink = localStorage.getItem('chatBannerLink') || '';

    document.getElementById('header-banner-active').checked = headerActive;
    document.getElementById('chat-banner-active').checked = chatActive;
    document.getElementById('header-banner-link').value = headerLink;
    document.getElementById('chat-banner-link').value = chatLink;
}

function updateAdSettings() {
    const headerActive = document.getElementById('header-banner-active').checked;
    const chatActive = document.getElementById('chat-banner-active').checked;
    const headerLink = document.getElementById('header-banner-link').value;
    const chatLink = document.getElementById('chat-banner-link').value;

    localStorage.setItem('headerBannerActive', headerActive);
    localStorage.setItem('chatBannerActive', chatActive);
    localStorage.setItem('headerBannerLink', headerLink);
    localStorage.setItem('chatBannerLink', chatLink);
}

function handleBannerUpload(type) {
    const inputId = type === 'header' ? 'header-banner-upload' : 'chat-banner-upload';
    const storageKey = type === 'header' ? 'headerBannerUrl' : 'chatBannerUrl';

    const file = document.getElementById(inputId).files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64String = e.target.result;
            localStorage.setItem(storageKey, base64String);
            alert((type === 'header' ? 'Üst' : 'Sohbet Altı') + ' banner görseli güncellendi!');
        };
        reader.readAsDataURL(file);
    }
}

// Initialize
loadAdSettings();

// Utility Functions
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    el.select();
    document.execCommand('copy');
    alert('Kopyalandı: ' + el.value);
}

function toggleVisibility(elementId) {
    const el = document.getElementById(elementId);
    if (el.type === 'password') {
        el.type = 'text';
    } else {
        el.type = 'password';
    }
}
