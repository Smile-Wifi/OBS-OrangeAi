// StreamPro Studio - Main Application Logic
class StreamProStudio {
    constructor() {
        this.isStreaming = true;
        this.isRecording = true;
        this.currentScene = 'gaming';
        this.sources = {
            webcam: { visible: true, volume: 75 },
            'game-capture': { visible: true, volume: 85 },
            overlay: { visible: true, volume: 45 }
        };
        this.stats = {
            cpu: 23,
            ram: 4.2,
            bitrate: 4500,
            droppedFrames: 0.2,
            networkUp: 850,
            streamTime: 2723 // in seconds
        };
        this.streamStartTime = Date.now() - 2723000; // 45 minutes ago
        this.recordingStartTime = Date.now() - 2723000;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAnimations();
        this.updateStats();
        this.initializeAudioFaders();
        this.setupDragAndDrop();
        this.animatePageLoad();
    }

    setupEventListeners() {
        // Scene switching
        document.querySelectorAll('.scene-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                this.switchScene(e.target.closest('.scene-thumbnail').dataset.scene);
            });
        });

        // Source visibility toggles
        document.querySelectorAll('.source-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.selectSource(e.target.closest('.source-item').dataset.source);
                }
            });
        });

        // Audio fader controls
        document.querySelectorAll('.fader-handle').forEach(handle => {
            this.setupFaderDrag(handle);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r':
                        e.preventDefault();
                        this.toggleRecording();
                        break;
                    case 's':
                        e.preventDefault();
                        this.toggleStreaming();
                        break;
                }
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
    }

    setupFaderDrag(handle) {
        let isDragging = false;
        let startY = 0;
        let startBottom = 0;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startBottom = parseInt(handle.style.bottom) || 0;
            handle.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaY = startY - e.clientY;
            const faderHeight = handle.parentElement.offsetHeight - handle.offsetHeight;
            let newBottom = Math.max(0, Math.min(faderHeight, startBottom + deltaY));
            
            const percentage = (newBottom / faderHeight) * 100;
            handle.style.bottom = newBottom + 'px';
            
            // Update volume
            const channel = handle.dataset.channel;
            this.updateChannelVolume(channel, percentage);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'pointer';
                document.body.style.cursor = 'default';
            }
        });
    }

    updateChannelVolume(channel, percentage) {
        const volume = Math.round(percentage);
        const vuMeter = handle.parentElement.nextElementSibling.querySelector('.vu-fill');
        
        // Update visual feedback
        if (vuMeter) {
            vuMeter.style.width = volume + '%';
        }
        
        // Update volume display
        const volumeDisplay = handle.parentElement.nextElementSibling.querySelector('.font-mono');
        if (volumeDisplay) {
            const db = Math.round((100 - volume) * -0.6);
            volumeDisplay.textContent = db + 'dB';
        }
    }

    switchScene(sceneName) {
        // Remove active class from all thumbnails
        document.querySelectorAll('.scene-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        
        // Add active class to selected scene
        document.querySelector(`[data-scene="${sceneName}"]`).classList.add('active');
        
        this.currentScene = sceneName;
        
        // Animate scene transition
        anime({
            targets: '#preview-canvas',
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });

        // Update scene info
        this.showNotification(`Switched to ${sceneName.replace('-', ' ')} scene`);
    }

    selectSource(sourceName) {
        // Remove active class from all sources
        document.querySelectorAll('.source-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected source
        document.querySelector(`[data-source="${sourceName}"]`).classList.add('active');
    }

    toggleSourceVisibility(sourceName) {
        this.sources[sourceName].visible = !this.sources[sourceName].visible;
        
        const sourceElement = document.querySelector(`[data-source="${sourceName}"]`);
        const statusElement = sourceElement.querySelector('.text-green-400');
        
        if (this.sources[sourceName].visible) {
            statusElement.textContent = '● Active';
            statusElement.className = 'text-xs text-green-400';
        } else {
            statusElement.textContent = '● Hidden';
            statusElement.className = 'text-xs text-gray-400';
        }
        
        this.showNotification(`${sourceName} ${this.sources[sourceName].visible ? 'shown' : 'hidden'}`);
    }

    toggleStreaming() {
        this.isStreaming = !this.isStreaming;
        const button = document.getElementById('stream-btn-text');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (this.isStreaming) {
            button.textContent = 'Stop Streaming';
            statusIndicator.className = 'status-indicator status-live';
            this.streamStartTime = Date.now();
            this.showNotification('Stream started successfully');
        } else {
            button.textContent = 'Start Streaming';
            statusIndicator.className = 'status-indicator status-error';
            this.showNotification('Stream stopped');
        }
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        const button = document.getElementById('record-btn-text');
        const statusIndicator = document.querySelector('.panel:last-child .status-indicator');
        
        if (this.isRecording) {
            button.textContent = 'Stop Recording';
            statusIndicator.className = 'status-indicator status-warning';
            this.recordingStartTime = Date.now();
            this.showNotification('Recording started');
        } else {
            button.textContent = 'Start Recording';
            statusIndicator.className = 'status-indicator status-error';
            this.showNotification('Recording stopped');
        }
    }

    updateStats() {
        // Simulate real-time statistics updates
        setInterval(() => {
            // Update stream time
            if (this.isStreaming) {
                const elapsed = Math.floor((Date.now() - this.streamStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('stream-time').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }

            // Update other stats with realistic variations
            this.stats.cpu += (Math.random() - 0.5) * 4;
            this.stats.cpu = Math.max(10, Math.min(95, this.stats.cpu));
            
            this.stats.ram += (Math.random() - 0.5) * 0.5;
            this.stats.ram = Math.max(2, Math.min(8, this.stats.ram));
            
            this.stats.bitrate += (Math.random() - 0.5) * 200;
            this.stats.bitrate = Math.max(2000, Math.min(6000, this.stats.bitrate));
            
            this.stats.droppedFrames += (Math.random() - 0.5) * 0.1;
            this.stats.droppedFrames = Math.max(0, Math.min(5, this.stats.droppedFrames));

            // Update DOM elements
            document.getElementById('cpu-usage').textContent = Math.round(this.stats.cpu) + '%';
            document.getElementById('ram-usage').textContent = this.stats.ram.toFixed(1) + 'GB';
            document.getElementById('bitrate').textContent = Math.round(this.stats.bitrate);
            document.getElementById('dropped-frames').textContent = this.stats.droppedFrames.toFixed(1) + '%';
        }, 2000);
    }

    startAnimations() {
        // Animate VU meters
        setInterval(() => {
            document.querySelectorAll('.vu-fill').forEach((fill, index) => {
                const channels = ['mic', 'desktop', 'media'];
                const channel = channels[index];
                const baseVolume = this.sources[channel === 'mic' ? 'webcam' : 
                                           channel === 'desktop' ? 'game-capture' : 'overlay']?.volume || 50;
                
                const variation = Math.random() * 30 - 15;
                const newWidth = Math.max(5, Math.min(100, baseVolume + variation));
                
                anime({
                    targets: fill,
                    width: newWidth + '%',
                    duration: 100,
                    easing: 'easeOutQuad'
                });
            });
        }, 150);

        // Animate stats cards
        setInterval(() => {
            document.querySelectorAll('.stat-card').forEach((card, index) => {
                anime({
                    targets: card,
                    scale: [1, 1.02, 1],
                    duration: 2000,
                    delay: index * 200,
                    easing: 'easeInOutSine'
                });
            });
        }, 5000);
    }

    setupDragAndDrop() {
        // Make sources draggable
        document.querySelectorAll('.source-item').forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.source);
                e.target.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });

        // Make preview canvas a drop zone
        const previewCanvas = document.getElementById('preview-canvas');
        previewCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            previewCanvas.style.borderColor = 'var(--accent-blue)';
        });
        
        previewCanvas.addEventListener('dragleave', () => {
            previewCanvas.style.borderColor = 'var(--border-color)';
        });
        
        previewCanvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const sourceType = e.dataTransfer.getData('text/plain');
            previewCanvas.style.borderColor = 'var(--border-color)';
            
            // Create visual feedback for drop
            const rect = previewCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createDropFeedback(x, y, sourceType);
        });
    }

    createDropFeedback(x, y, sourceType) {
        const feedback = document.createElement('div');
        feedback.className = 'absolute w-4 h-4 bg-blue-500 rounded-full pointer-events-none';
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        feedback.style.transform = 'translate(-50%, -50%)';
        
        document.getElementById('preview-canvas').appendChild(feedback);
        
        anime({
            targets: feedback,
            scale: [0, 2, 0],
            opacity: [1, 0.5, 0],
            duration: 800,
            easing: 'easeOutQuad',
            complete: () => {
                feedback.remove();
            }
        });
    }

    animatePageLoad() {
        // Animate elements on page load
        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutQuad'
        });

        // Animate panels
        anime({
            targets: '.panel',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600,
            delay: anime.stagger(150),
            easing: 'easeOutQuad'
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [400, 0],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        // Animate out after delay
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 400],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    notification.remove();
                }
            });
        }, 3000);
    }

    updateLayout() {
        // Handle responsive layout changes
        if (window.innerWidth < 768) {
            // Mobile layout adjustments
            document.querySelectorAll('.audio-fader').forEach(fader => {
                fader.style.height = '150px';
            });
        } else {
            // Desktop layout
            document.querySelectorAll('.audio-fader').forEach(fader => {
                fader.style.height = '200px';
            });
        }
    }
}

// Global functions for HTML onclick handlers
function toggleStreaming() {
    window.streamPro.toggleStreaming();
}

function toggleRecording() {
    window.streamPro.toggleRecording();
}

function toggleSource(sourceName) {
    window.streamPro.toggleSourceVisibility(sourceName);
}

function selectSource(sourceName) {
    window.streamPro.selectSource(sourceName);
}

function switchScene(sceneName) {
    window.streamPro.switchScene(sceneName);
}

function startQuickStream() {
    window.streamPro.showNotification('Quick stream started!');
    if (!window.streamPro.isStreaming) {
        window.streamPro.toggleStreaming();
    }
}

function openSceneWizard() {
    window.streamPro.showNotification('Scene Wizard opened');
}

function openSceneManager() {
    window.location.href = 'scenes.html';
}

function openAudioSettings() {
    window.location.href = 'audio.html';
}

function openRecordingSettings() {
    window.location.href = 'settings.html';
}

function openFullscreen() {
    const canvas = document.getElementById('preview-canvas');
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    }
}

function addNewSource() {
    window.streamPro.showNotification('Add Source dialog opened');
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.streamPro = new StreamProStudio();
});

// Add some additional utility functions for enhanced interactivity
function initializeAdvancedFeatures() {
    // Audio visualization using Web Audio API (simulated)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create audio analyser for visual effects
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Simulate audio data for visualization
    setInterval(() => {
        for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = Math.random() * 255;
        }
        
        // Update visual effects based on audio data
        updateAudioVisualizations(dataArray);
    }, 50);
}

function updateAudioVisualizations(audioData) {
    // This would normally create audio-reactive visual effects
    // For now, we'll use it to enhance the VU meter animations
    const average = audioData.reduce((a, b) => a + b) / audioData.length;
    const intensity = average / 255;
    
    // Update background effects based on audio intensity
    document.body.style.background = `
        radial-gradient(circle at 20% 80%, rgba(0, 212, 255, ${intensity * 0.1}) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 255, 136, ${intensity * 0.1}) 0%, transparent 50%),
        var(--primary-bg)
    `;
}

// Initialize advanced features when audio context is available
document.addEventListener('DOMContentLoaded', () => {
    if (window.AudioContext || window.webkitAudioContext) {
        initializeAdvancedFeatures();
    }
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // Initialize PWA features
    initializePWAFeatures();
});

// PWA Feature Initialization
function initializePWAFeatures() {
    // Handle app installation
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallNotification();
    });
    
    // Handle app shortcuts
    if ('launchQueue' in window) {
        window.launchQueue.setConsumer(launchParams => {
            if (launchParams.targetURL) {
                const url = new URL(launchParams.targetURL);
                const action = url.searchParams.get('action');
                if (action === 'start-stream') {
                    startQuickStream();
                }
            }
        });
    }
    
    // Handle push notifications
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
                subscribeToPushNotifications();
            }
        });
    }
}

function showInstallNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-6 left-6 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    notification.innerHTML = `
        <div>
            <h4 class="font-medium">Install StreamPro Studio</h4>
            <p class="text-sm opacity-90">Get the best experience with our desktop app</p>
        </div>
        <div class="flex space-x-2">
            <button onclick="installApp()" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">Install</button>
            <button onclick="dismissInstallNotification()" class="text-white hover:text-gray-200 px-2">✕</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-6 left-6 right-6 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    notification.innerHTML = `
        <div>
            <h4 class="font-medium">Update Available</h4>
            <p class="text-sm opacity-90">A new version of StreamPro Studio is ready</p>
        </div>
        <div class="flex space-x-2">
            <button onclick="updateApp()" class="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">Update</button>
            <button onclick="dismissUpdateNotification()" class="text-white hover:text-gray-200 px-2">✕</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
    dismissInstallNotification();
}

function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                registration.waiting.postMessage('SKIP_WAITING');
                window.location.reload();
            }
        });
    }
    dismissUpdateNotification();
}

function dismissInstallNotification() {
    const notification = document.querySelector('.fixed.bottom-6.left-6.right-6.bg-blue-600');
    if (notification) {
        anime({
            targets: notification,
            translateY: [0, 100],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => notification.remove()
        });
    }
}

function dismissUpdateNotification() {
    const notification = document.querySelector('.fixed.bottom-6.left-6.right-6.bg-green-600');
    if (notification) {
        anime({
            targets: notification,
            translateY: [0, 100],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => notification.remove()
        });
    }
}

function subscribeToPushNotifications() {
    // This would typically involve subscribing to a push service
    // For demo purposes, we'll just log it
    console.log('Subscribed to push notifications');
}

// Handle app shortcuts and deep links
function handleAppShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'start-stream') {
        startQuickStream();
    }
}

// Call shortcut handler on load
window.addEventListener('load', handleAppShortcuts);

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamProStudio;
}