// StreamPro Studio - Web App Enhanced Features
class StreamProApp {
    constructor() {
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.touchSupport = 'ontouchstart' in window;
        this.init();
    }

    init() {
        this.setupTouchInteractions();
        this.setupMobileOptimizations();
        this.setupGestureSupport();
        this.setupOrientationHandling();
        this.initializeAppFeatures();
    }

    setupTouchInteractions() {
        if (!this.touchSupport) return;

        // Add touch feedback to all interactive elements
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('button, .btn-primary, .btn-secondary, .panel, .scene-thumbnail, .source-item');
            if (target) {
                target.style.transform = 'scale(0.98)';
                target.style.transition = 'transform 0.1s ease';
            }
        });

        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('button, .btn-primary, .btn-secondary, .panel, .scene-thumbnail, .source-item');
            if (target) {
                setTimeout(() => {
                    target.style.transform = '';
                }, 100);
            }
        });

        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('button, .btn-primary, .btn-secondary')) {
                e.preventDefault();
            }
        });
    }

    setupMobileOptimizations() {
        if (!this.isMobile) return;

        // Add mobile-specific styles
        const mobileStyles = `
            /* Mobile optimizations */
            @media (max-width: 768px) {
                /* Larger touch targets */
                button, .btn-primary, .btn-secondary {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                /* Better spacing for mobile */
                .panel {
                    margin-bottom: 12px;
                    padding: 16px;
                }
                
                /* Simplified mobile navigation */
                .glass-nav {
                    padding: 12px 16px;
                }
                
                /* Mobile-friendly scene thumbnails */
                .scene-thumbnail {
                    width: 80px;
                    height: 45px;
                }
                
                /* Mobile audio faders */
                .audio-fader {
                    width: 40px;
                    height: 150px;
                }
                
                /* Mobile VU meters */
                .vu-meter {
                    width: 6px;
                }
                
                /* Better mobile typography */
                .font-display {
                    font-size: 1.5rem;
                }
                
                /* Mobile hero section */
                .hero-section {
                    padding: 24px 16px;
                    margin-bottom: 16px;
                }
                
                /* Mobile grid adjustments */
                .main-grid {
                    gap: 12px;
                }
                
                /* Mobile source items */
                .source-item {
                    padding: 8px;
                    margin-bottom: 6px;
                }
                
                /* Mobile stats cards */
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .stat-card {
                    padding: 12px;
                }
                
                .stat-value {
                    font-size: 20px;
                }
            }
            
            /* Tablet optimizations */
            @media (min-width: 769px) and (max-width: 1024px) {
                .scene-thumbnail {
                    width: 100px;
                    height: 56px;
                }
                
                .audio-fader {
                    width: 50px;
                    height: 180px;
                }
            }
            
            /* Touch-specific improvements */
            @media (hover: none) and (pointer: coarse) {
                /* Better touch feedback */
                * {
                    -webkit-tap-highlight-color: transparent;
                }
                
                /* Prevent text selection on touch */
                button, .btn-primary, .btn-secondary, .panel {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
                
                /* Better touch scrolling */
                .source-library, .layer-list {
                    -webkit-overflow-scrolling: touch;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileStyles;
        document.head.appendChild(styleSheet);

        // Add viewport meta tag if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
    }

    setupGestureSupport() {
        if (!this.touchSupport) return;

        let startX, startY, startTime;
        let isSwipe = false;

        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            isSwipe = false;
        });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            const deltaTime = Date.now() - startTime;

            // Detect swipe gestures
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
                isSwipe = true;
                
                if (deltaX > 0) {
                    // Swipe right
                    this.handleSwipeRight();
                } else {
                    // Swipe left
                    this.handleSwipeLeft();
                }
            }
        });

        document.addEventListener('touchend', () => {
            startX = null;
            startY = null;
            isSwipe = false;
        });
    }

    handleSwipeRight() {
        // Navigate to previous section or show sidebar
        console.log('Swipe right detected');
    }

    handleSwipeLeft() {
        // Navigate to next section or hide sidebar
        console.log('Swipe left detected');
    }

    setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Initial orientation check
        this.handleOrientationChange();
    }

    handleOrientationChange() {
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);

        // Adjust layouts based on orientation
        if (isLandscape) {
            this.optimizeForLandscape();
        } else {
            this.optimizeForPortrait();
        }
    }

    optimizeForLandscape() {
        // Landscape-specific optimizations
        document.documentElement.style.setProperty('--nav-height', '64px');
        
        // Show more content in landscape
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.style.maxHeight = 'calc(100vh - 80px)';
        });
    }

    optimizeForPortrait() {
        // Portrait-specific optimizations
        document.documentElement.style.setProperty('--nav-height', '56px');
        
        // Stack elements vertically in portrait
        const mainGrid = document.querySelector('.main-grid');
        if (mainGrid) {
            mainGrid.style.gridTemplateColumns = '1fr';
        }
    }

    initializeAppFeatures() {
        // Add app-specific features
        this.addPullToRefresh();
        this.addHapticFeedback();
        this.setupAppShortcuts();
        this.initializeAppBadge();
    }

    addPullToRefresh() {
        if (!this.touchSupport) return;

        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let pullDistance = 0;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;

            if (pullDistance > 0 && pullDistance < 100) {
                e.preventDefault();
                
                // Visual feedback for pull-to-refresh
                const refreshIndicator = document.getElementById('refresh-indicator') || this.createRefreshIndicator();
                refreshIndicator.style.transform = `translateY(${Math.min(pullDistance, 60)}px)`;
                refreshIndicator.style.opacity = Math.min(pullDistance / 60, 1);
            }
        });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;

            if (pullDistance > 60) {
                this.triggerRefresh();
            }

            // Reset pull state
            isPulling = false;
            pullDistance = 0;
            
            const refreshIndicator = document.getElementById('refresh-indicator');
            if (refreshIndicator) {
                refreshIndicator.style.transform = '';
                refreshIndicator.style.opacity = '';
            }
        });
    }

    createRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'refresh-indicator';
        indicator.className = 'fixed top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full opacity-0 transition-all duration-300 z-50';
        indicator.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        document.body.appendChild(indicator);
        return indicator;
    }

    triggerRefresh() {
        // Trigger app refresh
        console.log('Pull-to-refresh triggered');
        
        // Show loading state
        this.showNotification('Refreshing app...', 'info');
        
        // Simulate refresh
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    addHapticFeedback() {
        if (!navigator.vibrate) return;

        // Add haptic feedback to important interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn-primary, .btn-secondary')) {
                navigator.vibrate(10); // Light vibration
            }
        });

        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('button, .btn-primary, .btn-secondary')) {
                navigator.vibrate(5); // Very light vibration
            }
        });
    }

    setupAppShortcuts() {
        // Add keyboard shortcuts for app-like experience
        document.addEventListener('keydown', (e) => {
            // Alt + 1-4 for quick navigation
            if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                const pages = ['index.html', 'scenes.html', 'audio.html', 'settings.html'];
                const pageIndex = parseInt(e.key) - 1;
                if (pages[pageIndex]) {
                    window.location.href = pages[pageIndex];
                }
            }

            // Alt + S for quick stream start
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                if (window.streamPro) {
                    startQuickStream();
                }
            }

            // Alt + R for quick recording
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                if (window.streamPro) {
                    toggleRecording();
                }
            }
        });
    }

    initializeAppBadge() {
        // Set app badge for unread notifications or stream status
        if ('setAppBadge' in navigator) {
            // Show badge when streaming
            if (window.streamPro && window.streamPro.isStreaming) {
                navigator.setAppBadge(1);
            } else {
                navigator.clearAppBadge();
            }
        }
    }

    showNotification(message, type = 'success') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-orange-600',
            info: 'bg-blue-600'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        anime({
            targets: notification,
            translateX: [400, 0],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 400],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => notification.remove()
            });
        }, 3000);
    }

    // Public API for other components
    static showToast(message, type = 'success') {
        if (window.streamProApp) {
            window.streamProApp.showNotification(message, type);
        }
    }

    static isMobileDevice() {
        return window.streamProApp && window.streamProApp.isMobile;
    }

    static isStandaloneMode() {
        return window.streamProApp && window.streamProApp.isStandalone;
    }
}

// Initialize the web app
document.addEventListener('DOMContentLoaded', () => {
    window.streamProApp = new StreamProApp();
});

// Handle page visibility changes for app badge updates
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.streamProApp) {
        window.streamProApp.initializeAppBadge();
    }
});

// Handle app installation
window.addEventListener('appinstalled', () => {
    console.log('StreamPro Studio has been installed');
    if (window.streamProApp) {
        window.streamProApp.showNotification('StreamPro Studio installed successfully!', 'success');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamProApp;
}