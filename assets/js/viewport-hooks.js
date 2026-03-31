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
