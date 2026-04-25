// ================= [ VIEWPORT HOOKS ] =================
window.__initViewportHooks = function (watch, showLevelSelect) {

            const isMobileOrIOS = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

            let scrollYPos = 0;

            let touchStartY = 0;



            const handleTouchStart = (e) => {

                touchStartY = e.touches[0].clientY;

            };



            const handleTouchMove = (e) => {

                if (!document.body.classList.contains('lock-scroll') || e.touches.length > 1) return;

                const currentY = e.touches[0].clientY;

                if (!e.target.closest('#flickLayer')) {

                    return;

                }

                if (currentY - touchStartY > 0 && e.cancelable) {

                    e.preventDefault();

                }

            };



            const lockPageScroll = () => {

                if (document.body.classList.contains('lock-scroll')) return;

                scrollYPos = window.scrollY;

                document.body.style.top = `-${scrollYPos}px`;

                document.body.classList.add('lock-scroll');



                document.addEventListener('touchstart', handleTouchStart, { passive: false });

                document.addEventListener('touchmove', handleTouchMove, { passive: false });

            };

            const unlockPageScroll = () => {

                if (!document.body.classList.contains('lock-scroll')) return;

                document.body.classList.remove('lock-scroll');

                document.body.style.top = '';

                window.scrollTo(0, scrollYPos);



                document.removeEventListener('touchstart', handleTouchStart);

                document.removeEventListener('touchmove', handleTouchMove);

            };



            if (isMobileOrIOS) {

                watch(showLevelSelect, (showLvl) => {

                    if (showLvl) {

                        unlockPageScroll();

                    } else {

                        lockPageScroll();

                    }

                }, { immediate: true });

            }



            let meta = document.querySelector('meta[name="viewport"]');

            if (!meta) {

                meta = document.createElement('meta');

                meta.name = "viewport";

                document.head.appendChild(meta);

            }

            meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";



            let lastTouchEnd = 0;

            document.addEventListener('touchend', (e) => {

                const now = Date.now();

                if (now - lastTouchEnd <= 300) {

                    if (e.target.closest('button') || e.target.closest('.action-btn')) {

                        if (e.target.closest('#flickLayer')) {

                            e.preventDefault();

                        }

                    }

                }

                lastTouchEnd = now;

            }, { passive: false });

};

// ── Map Visible Width Helper ──────────────────────────────────────────────────
// Sets --map-visible-width on .map-page-container so .map-hud-bottom can use it.
// Strategy: min(mapNodesContainer.getBoundingClientRect().width, window.innerWidth)
// Fires on: mount, resize, orientationchange, and whenever map-page-container
// enters or leaves the DOM (via MutationObserver).
// No impact on battle screen — observer targets only .map-page-container.
(function () {
    'use strict';

    let _mapRO = null;           // ResizeObserver for map-nodes-container
    let _mapDomObserver = null;  // MutationObserver watching #app for map lifecycle
    let _currentMapContainer = null;
    let _currentNodesContainer = null;

    function updateMapVisibleWidth() {
        const container = _currentMapContainer || document.querySelector('.map-page-container');
        const nodes     = _currentNodesContainer || document.querySelector('.map-nodes-container');
        if (!container) return;

        let mapW = window.innerWidth; // fallback: full viewport
        if (nodes) {
            const img = container.querySelector('.map-base-img');
            if (img) {
                // Force nodes container to exactly match the image's rendered width
                // This fixes Safari iOS bugs where width: max-content evaluates to intrinsic image width instead of scaled width
                const imgRect = img.getBoundingClientRect();
                if (imgRect.width > 0) {
                    nodes.style.setProperty('width', Math.round(imgRect.width) + 'px', 'important');
                }
            }

            const rect = nodes.getBoundingClientRect();
            if (rect.width > 0) {
                mapW = Math.min(Math.round(rect.width), window.innerWidth);
            }
        }
        container.style.setProperty('--map-visible-width', mapW + 'px');
    }

    function attachToMapContainer(container) {
        if (!container || container === _currentMapContainer) return;

        // Clean up any previous observer
        if (_mapRO) { _mapRO.disconnect(); _mapRO = null; }
        _currentMapContainer = container;

        const nodes = container.querySelector('.map-nodes-container');
        _currentNodesContainer = nodes || null;

        // Observe the nodes container (its width changes when image loads or viewport resizes)
        _mapRO = new ResizeObserver(() => {
            // Re-fetch in case Vue swapped the element
            _currentNodesContainer = _currentMapContainer.querySelector('.map-nodes-container');
            updateMapVisibleWidth();
        });

        // Observe map-page-container itself as fallback
        _mapRO.observe(container);
        if (nodes) _mapRO.observe(nodes);

        // Run once immediately (image may already be loaded)
        updateMapVisibleWidth();
    }

    function detachFromMapContainer() {
        if (_mapRO) { _mapRO.disconnect(); _mapRO = null; }
        _currentMapContainer = null;
        _currentNodesContainer = null;
    }

    function scanForMapContainer() {
        const el = document.querySelector('.map-page-container');
        if (el) {
            attachToMapContainer(el);
        } else {
            detachFromMapContainer();
        }
    }

    // Watch for map-page-container entering / leaving DOM
    _mapDomObserver = new MutationObserver(scanForMapContainer);
    _mapDomObserver.observe(document.getElementById('app') || document.body, {
        childList: true,
        subtree: true
    });

    // Also respond to resize / orientation changes
    window.addEventListener('resize', updateMapVisibleWidth, { passive: true });
    window.addEventListener('orientationchange', () => {
        // orientationchange fires before the new dimensions settle — wait one frame
        requestAnimationFrame(updateMapVisibleWidth);
    }, { passive: true });

    // Initial scan (map may already be mounted)
    scanForMapContainer();
}());

