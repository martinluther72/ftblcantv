// Player Controls Handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerControls);
} else {
    initPlayerControls();
}

function initPlayerControls() {
    const video = document.getElementById('stream-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const muteIcon = document.getElementById('mute-icon');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const qualityBtn = document.getElementById('quality-btn');
    const qualityMenu = document.getElementById('quality-menu');
    const currentQualitySpan = document.getElementById('current-quality');
    const qualityBadge = document.getElementById('quality-badge');
    const qualityOptions = document.querySelectorAll('.quality-option');

    if (!video) return;

    // Disable seeking on video
    video.addEventListener('seeking', function (e) {
        if (video.currentTime !== video.duration) {
            // Prevent seeking by resetting to current playback position
            const currentTime = video.currentTime;
            video.currentTime = currentTime;
        }
    });

    // Disable context menu (right-click)
    video.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // Play/Pause Toggle
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function () {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
    }

    // Update play/pause icon
    video.addEventListener('play', function () {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    });

    video.addEventListener('pause', function () {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    });

    // Mute Toggle
    if (muteBtn) {
        muteBtn.addEventListener('click', function () {
            video.muted = !video.muted;
            if (video.muted) {
                volumeIcon.classList.add('hidden');
                muteIcon.classList.remove('hidden');
            } else {
                volumeIcon.classList.remove('hidden');
                muteIcon.classList.add('hidden');
            }
        });
    }

    // Fullscreen Toggle
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function () {
            const videoContainer = document.getElementById('video-container');
            if (!document.fullscreenElement) {
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });
    }

    // Quality Menu Toggle
    if (qualityBtn && qualityMenu) {
        qualityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            qualityMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!qualityMenu.contains(e.target) && e.target !== qualityBtn) {
                qualityMenu.classList.add('hidden');
            }
        });
    }

    // Quality Selection
    qualityOptions.forEach(option => {
        option.addEventListener('click', function () {
            const quality = this.getAttribute('data-quality');
            const qualityText = this.textContent;

            // Update UI
            currentQualitySpan.textContent = qualityText;
            if (qualityBadge) {
                qualityBadge.textContent = qualityText;
            }

            // Store quality preference
            localStorage.setItem('preferredQuality', quality);

            // Close menu
            qualityMenu.classList.add('hidden');

            // Apply quality if HLS is available
            if (window.hlsInstance && window.hlsInstance.levels) {
                if (quality === 'auto') {
                    window.hlsInstance.currentLevel = -1; // Auto quality
                } else {
                    const qualityHeight = parseInt(quality);
                    const levelIndex = window.hlsInstance.levels.findIndex(level => level.height === qualityHeight);
                    if (levelIndex !== -1) {
                        window.hlsInstance.currentLevel = levelIndex;
                    }
                }
            }

            console.log('Quality changed to:', qualityText);
        });
    });

    // Load saved quality preference
    const savedQuality = localStorage.getItem('preferredQuality');
    if (savedQuality) {
        const savedOption = document.querySelector(`.quality-option[data-quality="${savedQuality}"]`);
        if (savedOption) {
            const qualityText = savedOption.textContent;
            currentQualitySpan.textContent = qualityText;
            if (qualityBadge) {
                qualityBadge.textContent = qualityText;
            }
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Space bar for play/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }

        // M for mute
        if (e.code === 'KeyM') {
            video.muted = !video.muted;
            if (video.muted) {
                volumeIcon.classList.add('hidden');
                muteIcon.classList.remove('hidden');
            } else {
                volumeIcon.classList.remove('hidden');
                muteIcon.classList.add('hidden');
            }
        }

        // F for fullscreen
        if (e.code === 'KeyF') {
            fullscreenBtn.click();
        }
    });
}
