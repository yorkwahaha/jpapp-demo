(function () {
    console.log('[VFX] vfx-helpers.js loaded — version: 26061305 (purple EM cannon hit explosion)');
    const api = window.__JPAPP_VFX || window.JPAPP_VFX || {};

    function getComboTier(combo) {
        if (combo >= 20) return 'max';
        if (combo >= 10) return 'amazing';
        if (combo >= 5) return 'great';
        return 'good';
    }

    function getRandomComboPopupPosition() {
        const isPhonePortrait =
            typeof window !== 'undefined'
            && window.matchMedia?.('(max-width: 640px) and (orientation: portrait)').matches;

        const leftSide = Math.random() < 0.5;
        const rnd = (a, b) => a + Math.random() * (b - a);
        const leftPct = leftSide ? rnd(25, 38) : rnd(62, 75);
        const topPct = isPhonePortrait ? rnd(44, 62) : rnd(42, 58);
        return { leftPct, topPct };
    }

    function createComboPopupState(combo, key = Date.now()) {
        const { leftPct, topPct } = getRandomComboPopupPosition();
        return {
            show: true,
            value: combo,
            tier: getComboTier(combo),
            key,
            leftPct,
            topPct,
        };
    }

    function rectCenter(el) {
        if (!el || !el.getBoundingClientRect) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    const safeNum = (n, fallback) => Number.isFinite(n) ? n : fallback;

    const getCenterOrFallback = (originEl, fallbackX, fallbackY) => {
        const center = rectCenter(originEl);
        if (center) {
            return { x: safeNum(center.x, fallbackX), y: safeNum(center.y, fallbackY) };
        }
        return { x: fallbackX, y: fallbackY };
    };

    const getVfxLayer = () => {
        let layer = document.getElementById('global-vfx-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'global-vfx-layer';
            document.body.appendChild(layer);
        }
        layer.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:999999; overflow:hidden; margin:0; padding:0;';
        return layer;
    };

    function spawnFloatingDamage(target, amount, type = 'hp', extras = null) {
        const vfxLayer = getVfxLayer();
        if (!vfxLayer) return;

        let targetEl;
        if (target === 'player') {
            targetEl = document.querySelector('#playerStatusBar') || document.querySelector('.hero-avatar') || document.querySelector('.hud-bg');
        } else {
            targetEl = document.querySelector('#monsterStatusBar') || document.querySelector('.monster-img-boss') || document.querySelector('.monster-img-normal') || document.querySelector('.monster-breath');
        }

        let x, y;
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            if (target === 'monster') {
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height * 0.65;
            } else {
                x = rect.left + rect.width * 0.85;
                y = rect.top - 10;
            }
        } else {
            x = window.innerWidth / 2;
            y = target === 'player' ? window.innerHeight - 150 : window.innerHeight / 2 - 50;
        }

        const el = document.createElement('div');
        el.className = `floating-dmg-ui floating-dmg-${target}`;
        if (target === 'monster' && extras && extras.giraStrike) {
            el.classList.add('floating-dmg-giragira-strike');
        }

        // Type-based styling
        if (type === 'sp') {
            el.classList.add('floating-dmg-sp');
            el.style.color = '#60a5fa'; // Blue-400
            el.style.textShadow = '0 0 15px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0,0,0,0.8)';
        } else if (amount < 0) {
            el.classList.add('floating-dmg-heal');
            el.style.color = '#4ade80'; // Emerald-400
            el.style.textShadow = '0 0 15px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.8)';
        } else if (target === 'player') {
            el.style.color = '#ef4444'; // Red-500
            el.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.5), 0 2px 4px rgba(0,0,0,0.8)';
        }

        let fontSize = 14 + (Math.abs(amount) * 0.9);
        if (type === 'sp' || amount < 0) fontSize = Math.max(fontSize, 28);
        fontSize = Math.min(Math.max(fontSize, 14), 48);

        const dir = Math.random() > 0.5 ? 1 : -1;
        const dx = (Math.random() * 45 + 35) * dir;
        const dy = (Math.random() * -15 - 5);
        const bounce1 = Math.random() * 15 + 10;
        const rot = (Math.random() * 20 - 10);

        el.style.setProperty('--dx', `${dx}px`);
        el.style.setProperty('--dy', `${dy}px`);
        el.style.setProperty('--bounce1', `${bounce1}px`);
        el.style.setProperty('--rot', `${rot}deg`);

        let ox = (Math.random() - 0.5) * 20;
        const oy = (Math.random() - 0.5) * 10;
        if (type === 'sp') ox = 22;
        else if (amount < 0) ox = -22;

        el.style.left = `${x + ox}px`;
        el.style.top = `${y + oy}px`;
        el.style.fontSize = `${fontSize}px`;

        if (type === 'sp') {
            el.innerHTML = `+${Math.abs(amount)}`;
        } else if (amount < 0) {
            el.innerHTML = `+${Math.abs(amount)}`;
        } else {
            el.innerHTML = `-${amount}`;
        }

        vfxLayer.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
    }

    function spawnGiraGiraHitVfx(x, y) {
        const vfxLayer = getVfxLayer();
        if (!vfxLayer) return;

        const vfxShakeSettings = window.__JPAPP_VFX_HELPER_SETTINGS;
        const allowShake = vfxShakeSettings == null ? true : vfxShakeSettings.screenShake !== false;
        const stageEl = document.getElementById('stage');
        if (stageEl && allowShake) {
            stageEl.style.transform = `translate(${(Math.random() - 0.5) * 92}px,${(Math.random() - 0.5) * 56}px)`;
            setTimeout(() => { stageEl.style.transform = ''; }, 22);
            setTimeout(() => {
                stageEl.style.transform = `translate(${(Math.random() - 0.5) * 58}px,${(Math.random() - 0.5) * 34}px)`;
                setTimeout(() => { stageEl.style.transform = ''; }, 18);
            }, 44);
            setTimeout(() => {
                stageEl.style.transform = `translate(${(Math.random() - 0.5) * 36}px,${(Math.random() - 0.5) * 20}px)`;
                setTimeout(() => { stageEl.style.transform = ''; }, 16);
            }, 68);
        }

        const spawn = (css, dur, frames, easing, delayMs = 0) => {
            const run = () => {
                const el = document.createElement('div');
                el.style.cssText = css;
                vfxLayer.appendChild(el);
                el.animate(frames, { duration: dur, easing: easing || 'ease-out', fill: 'forwards' });
                setTimeout(() => { if (el.isConnected) el.remove(); }, dur + 100);
            };
            if (delayMs > 0) setTimeout(run, delayMs);
            else run();
        };

        // Full-screen purple impact flash
        const impactFlash = document.createElement('div');
        impactFlash.style.cssText = `position:fixed;inset:0;background:rgba(139,92,246,0.42);pointer-events:none;z-index:9999;`;
        document.body.appendChild(impactFlash);
        impactFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 95, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (impactFlash.isConnected) impactFlash.remove(); }, 120);

        // White-purple core explosion (120px, instant expand)
        spawn(
            `position:absolute;width:120px;height:120px;left:${x - 60}px;top:${y - 60}px;z-index:42;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;background:radial-gradient(circle,#fff 0%,rgba(243,232,255,0.97) 20%,rgba(196,181,253,0.78) 46%,rgba(139,92,246,0.38) 72%,transparent 100%);` +
            `box-shadow:0 0 14px #fff,0 0 32px rgba(216,180,254,0.98),0 0 64px rgba(139,92,246,0.88),0 0 100px rgba(109,40,217,0.65);`,
            85,
            [{ opacity: 1, transform: 'scale(0.06)' }, { opacity: 0, transform: 'scale(2.0)' }],
            'cubic-bezier(0.03,0.96,0.06,1)'
        );

        // 3 expanding shockwave rings
        [
            { sz: 160, dur: 170, delay:  0, alpha: 0.94, bw: 4 },
            { sz: 300, dur: 260, delay: 28, alpha: 0.74, bw: 3 },
            { sz: 460, dur: 380, delay: 56, alpha: 0.50, bw: 2 }
        ].forEach(({ sz, dur, delay, alpha, bw }) => {
            const half = sz / 2;
            spawn(
                `position:absolute;width:${sz}px;height:${sz}px;left:${x - half}px;top:${y - half}px;` +
                `z-index:35;pointer-events:none;border-radius:50%;border:${bw}px solid rgba(196,181,253,${alpha});` +
                `box-shadow:0 0 24px rgba(167,139,250,0.85),0 0 48px rgba(109,40,217,0.52);`,
                dur,
                [{ opacity: alpha, transform: 'scale(0.04)' }, { opacity: 0, transform: 'scale(1)' }],
                'cubic-bezier(0.02,0.9,0.08,1)',
                delay
            );
        });

        // 8 electric slash marks radiating outward
        [
            { deg: -75, w: 5, len: 210, alpha: 0.92, delay:  0 },
            { deg: -45, w: 8, len: 270, alpha: 1.00, delay:  4 },
            { deg: -18, w: 5, len: 240, alpha: 0.88, delay:  9 },
            { deg:   8, w: 9, len: 290, alpha: 1.00, delay:  3 },
            { deg:  32, w: 5, len: 225, alpha: 0.86, delay: 13 },
            { deg:  58, w: 4, len: 195, alpha: 0.78, delay: 18 },
            { deg: -96, w: 3, len: 175, alpha: 0.68, delay:  7 },
            { deg:  84, w: 3, len: 160, alpha: 0.60, delay: 22 }
        ].forEach(({ deg, w, len, alpha, delay }) => {
            spawn(
                `position:absolute;width:${len}px;height:${w}px;left:${x - len / 2}px;top:${y - w / 2}px;` +
                `z-index:38;pointer-events:none;mix-blend-mode:screen;border-radius:${w / 2}px;` +
                `background:linear-gradient(90deg,transparent 2%,rgba(109,40,217,${(alpha * 0.22).toFixed(2)}) 16%,rgba(196,181,253,${alpha}) 46%,rgba(139,92,246,${(alpha * 0.32).toFixed(2)}) 78%,transparent 97%);` +
                `box-shadow:0 0 ${Math.round(w * 2.5)}px rgba(167,139,250,0.9),0 0 ${Math.round(w * 5)}px rgba(109,40,217,0.58);`,
                115 + delay * 2,
                [{ opacity: alpha, transform: `rotate(${deg}deg) scaleX(0.02)` }, { opacity: 0, transform: `rotate(${deg}deg) scaleX(1)` }],
                'cubic-bezier(0.02,0.94,0.08,1)',
                delay
            );
        });

        // Purple debris burst — 22 particles
        for (let i = 0; i < 22; i++) {
            const ang = (Math.PI * 2 / 22) * i + (Math.random() - 0.5) * 0.38;
            const dist = 55 + Math.random() * 80;
            const sz = 3 + Math.random() * 7;
            spawn(
                `position:absolute;width:${sz}px;height:${sz}px;left:${x - sz / 2}px;top:${y - sz / 2}px;` +
                `z-index:36;pointer-events:none;border-radius:50%;mix-blend-mode:screen;` +
                `background:rgba(216,180,254,0.96);box-shadow:0 0 10px rgba(167,139,250,0.92),0 0 22px rgba(109,40,217,0.65);`,
                145 + Math.random() * 115,
                [{ opacity: 0.96, transform: 'translate(0,0) scale(1)' },
                 { opacity: 0, transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(0.06)` }],
                'cubic-bezier(0.04,0.88,0.14,1)',
                i * 5
            );
        }
    }

    function spawnGiraGiraBurstVfx(x, y) {
        const vfxLayer = getVfxLayer();
        if (!vfxLayer) return;

        const spawn = (css, dur, frames, easing, delayMs = 0) => {
            const run = () => {
                const el = document.createElement('div');
                el.style.cssText = css;
                vfxLayer.appendChild(el);
                el.animate(frames, { duration: dur, easing: easing || 'ease-out', fill: 'forwards' });
                setTimeout(() => { if (el.isConnected) el.remove(); }, dur + 120);
            };
            if (delayMs > 0) setTimeout(run, delayMs);
            else run();
        };

        const vfxShakeSettingsBurst = window.__JPAPP_VFX_HELPER_SETTINGS;
        const allowBurstShake = vfxShakeSettingsBurst == null ? true : vfxShakeSettingsBurst.screenShake !== false;
        const stageBurst = document.getElementById('stage');
        if (stageBurst && allowBurstShake) {
            const bx = (Math.random() - 0.5) * 66, by = (Math.random() - 0.5) * 38;
            stageBurst.style.transform = `translate(${bx}px,${by}px)`;
            setTimeout(() => { stageBurst.style.transform = ''; }, 30);
        }

        // 3 purple shockwave rings (delayed cascade)
        [0, 70, 140].forEach((delay, i) => {
            const sz = 210 + i * 96;
            const half = sz / 2;
            spawn(
                `position:absolute;width:${sz}px;height:${sz}px;left:${x - half}px;top:${y - half}px;` +
                `z-index:33;pointer-events:none;border-radius:50%;border:${3 - Math.floor(i * 0.9)}px solid rgba(167,139,250,${0.88 - i * 0.24});` +
                `box-shadow:0 0 ${28 + i * 14}px rgba(139,92,246,0.72),0 0 ${54 + i * 18}px rgba(109,40,217,0.38);`,
                330 + i * 88,
                [{ opacity: 0.94, transform: 'scale(0.04)' }, { opacity: 0, transform: 'scale(1.65)' }],
                'cubic-bezier(0.02,0.88,0.1,1)',
                delay
            );
        });

        // Large purple radial bloom
        spawn(
            `position:absolute;width:340px;height:340px;left:${x - 170}px;top:${y - 170}px;` +
            `z-index:31;pointer-events:none;mix-blend-mode:screen;border-radius:50%;` +
            `background:radial-gradient(circle,rgba(243,232,255,0.35) 0%,rgba(167,139,250,0.20) 30%,rgba(109,40,217,0.08) 60%,transparent 80%);`,
            440,
            [{ opacity: 1, transform: 'scale(0.05)' }, { opacity: 0, transform: 'scale(1.6)' }],
            'cubic-bezier(0.04,0.88,0.14,1)'
        );

        // 24 electric lightning rays (dense radial burst)
        for (let i = 0; i < 24; i++) {
            const ang = (Math.PI * 2 / 24) * i + (Math.random() - 0.5) * 0.15;
            const dist = 68 + Math.random() * 82;
            const len = 10 + Math.random() * 20;
            spawn(
                `position:absolute;width:3px;height:${len}px;left:${x - 1.5}px;top:${y - len / 2}px;` +
                `z-index:36;pointer-events:none;mix-blend-mode:screen;border-radius:2px;` +
                `background:linear-gradient(to top,transparent,rgba(216,180,254,0.98),rgba(167,139,250,0.92));` +
                `box-shadow:0 0 12px rgba(196,181,253,0.9),0 0 24px rgba(139,92,246,0.65);`,
                148 + Math.random() * 80,
                [{ opacity: 0.98, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,0) scaleY(0.1)` },
                 { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist}px) scaleY(0.04)` }],
                'cubic-bezier(0.04,0.9,0.16,1)',
                i * 7 + 5
            );
        }
    }

    const spawnTrailParticle = (layer, x, y, extras = null) => {
        const isTrueResonance = !!extras?.trueResonance;
        const isBondMaxAttack = !!extras?.bondMaxAttack;
        const isGiraAttack = !!extras?.giraAttack;
        const p = document.createElement('div');
        const size = isGiraAttack
            ? (Math.random() * 5 + 3)
            : (isBondMaxAttack ? (Math.random() * 9 + 7) : (isTrueResonance ? (Math.random() * 10 + 8) : (Math.random() * 8 + 6)));
        const trailColor = isGiraAttack
            ? (Math.random() > 0.38 ? '#e9d5ff' : (Math.random() > 0.5 ? '#a78bfa' : '#c4b5fd'))
            : (isTrueResonance
                ? (isBondMaxAttack
                    ? (Math.random() > 0.42 ? '#dc2626' : (Math.random() > 0.5 ? '#ef4444' : '#fff7ed'))
                    : (Math.random() > 0.24 ? '#f97316' : (Math.random() > 0.5 ? '#fef3c7' : '#ef4444')))
                : (Math.random() > 0.3 ? '#fde047' : '#ffffff'));
        const shadow = isGiraAttack
            ? '0 0 7px #e9d5ff, 0 0 16px rgba(167,139,250,0.9), 0 0 28px rgba(109,40,217,0.65)'
            : (isTrueResonance
                ? (isBondMaxAttack
                    ? '0 0 12px rgba(255,247,237,0.94), 0 0 28px rgba(239,68,68,0.84), 0 0 46px rgba(220,38,38,0.58)'
                    : '0 0 12px #fff7ed, 0 0 24px rgba(249,115,22,0.95), 0 0 38px rgba(220,38,38,0.62)')
                : '0 0 10px #f59e0b');
        p.style.cssText = `
            position: absolute; width: ${size}px; height: ${size}px;
            background: ${trailColor};
            box-shadow: ${shadow}; border-radius: 50%;
            left: ${x - size / 2}px; top: ${y - size / 2}px;
            pointer-events: none; z-index: 10;
        `;
        layer.appendChild(p);
        const dur = isGiraAttack
            ? (Math.random() * 120 + 80)
            : (isBondMaxAttack ? (Math.random() * 540 + 340) : (isTrueResonance ? (Math.random() * 480 + 280) : (Math.random() * 400 + 200)));
        const driftX = (Math.random() - 0.5) * (isGiraAttack ? 10 : (isBondMaxAttack ? 76 : (isTrueResonance ? 44 : 30)));
        const driftY = isGiraAttack
            ? ((Math.random() - 0.5) * 10)
            : (isBondMaxAttack ? ((Math.random() - 0.15) * 46) : (isTrueResonance ? (Math.random() * 34 + 14) : 20));
        p.animate([
            { opacity: isGiraAttack ? 0.9 : (isTrueResonance ? 0.95 : 0.8), transform: `scale(${isBondMaxAttack ? 1.12 : 1}) translate(0, 0)` },
            { opacity: 0, transform: `scale(0.1) translate(${driftX}px, ${driftY}px)` }
        ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (p.isConnected) p.remove(); }, dur);
    };

    const spawnHitVfx = (x, y, extras = null) => {
        const layer = getVfxLayer();
        const isTrueResonance = !!extras?.trueResonance;
        const isBondMaxAttack = !!extras?.bondMaxAttack;
        const dirX = Number.isFinite(extras?.dirX) ? extras.dirX : 0;
        const dirY = Number.isFinite(extras?.dirY) ? extras.dirY : -1;

        const stage = document.getElementById('stage');
        const vfxShakeSettings = window.__JPAPP_VFX_HELPER_SETTINGS;
        if (stage && (vfxShakeSettings == null || vfxShakeSettings.screenShake !== false)) {
            stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`;
            setTimeout(() => { stage.style.transform = ''; }, 50);
            setTimeout(() => { stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`; }, 100);
            setTimeout(() => { stage.style.transform = ''; }, 150);
        }

        const ring = document.createElement('div');
            ring.style.cssText = `
            position: absolute; width: ${isTrueResonance ? 126 : 100}px; height: ${isTrueResonance ? 86 : 100}px;
            border: ${isTrueResonance ? 3 : 4}px solid ${isBondMaxAttack ? '#ef4444' : (isTrueResonance ? '#f97316' : '#fde047')}; border-radius: 50%;
            left: ${x - (isTrueResonance ? 63 : 50)}px; top: ${y - (isTrueResonance ? 43 : 50)}px;
            box-shadow: ${isBondMaxAttack ? '0 0 26px rgba(255,247,237,0.86), 0 0 52px rgba(239,68,68,0.72), inset 0 0 28px rgba(248,113,113,0.48)' : (isTrueResonance ? '0 0 28px #fff7ed, 0 0 50px rgba(249,115,22,0.92), inset 0 0 24px rgba(254,243,199,0.75)' : '0 0 20px #f59e0b, inset 0 0 20px #f59e0b')};
            pointer-events: none; z-index: 15; mix-blend-mode: screen;
        `;
        layer.appendChild(ring);
        ring.animate([
            { transform: `rotate(${Math.atan2(dirY, dirX)}rad) scale(0.08, 0.18)`, opacity: 1 },
            { transform: `rotate(${Math.atan2(dirY, dirX)}rad) scale(${isTrueResonance ? '1.45, 0.72' : '1.5'})`, opacity: 0 }
        ], { duration: isTrueResonance ? 310 : 350, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (ring.isConnected) ring.remove(); }, isTrueResonance ? 310 : 350);

        if (isTrueResonance) {
            const core = document.createElement('div');
            core.style.cssText = `
                position: absolute; width: ${isBondMaxAttack ? 170 : 78}px; height: ${isBondMaxAttack ? 58 : 28}px;
                left: ${x - (isBondMaxAttack ? 85 : 39)}px; top: ${y - (isBondMaxAttack ? 29 : 14)}px;
                border-radius: 999px; pointer-events: none; z-index: 24; mix-blend-mode: screen;
                background: ${isBondMaxAttack ? 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.18) 12%, rgba(255,247,237,0.92) 34%, #fff 48%, rgba(248,113,113,0.9) 62%, rgba(220,38,38,0.68) 80%, transparent 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(254,242,242,0.92) 30%, #fff 50%, rgba(251,146,60,0.9) 70%, transparent 100%)'};
                box-shadow: ${isBondMaxAttack ? '0 0 26px rgba(255,247,237,0.95), 0 0 52px rgba(239,68,68,0.78), 0 0 78px rgba(220,38,38,0.48)' : '0 0 18px #fff7ed, 0 0 34px rgba(249,115,22,0.9), 0 0 56px rgba(220,38,38,0.52)'};
            `;
            layer.appendChild(core);
            core.animate([
                { opacity: 0, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(0.12)` },
                { opacity: 1, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(${isBondMaxAttack ? 1.24 : 1.08})` },
                { opacity: 0, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(${isBondMaxAttack ? 0.58 : 0.42}) translateX(${isBondMaxAttack ? 28 : 18}px)` }
            ], { duration: isBondMaxAttack ? 430 : 190, easing: 'cubic-bezier(0.08, 0.9, 0.2, 1)', fill: 'forwards' });
            setTimeout(() => { if (core.isConnected) core.remove(); }, isBondMaxAttack ? 460 : 220);

            if (isBondMaxAttack) {
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: absolute; width: 96px; height: 96px;
                    left: ${x - 48}px; top: ${y - 48}px;
                    border-radius: 50%; pointer-events: none; z-index: 28; mix-blend-mode: screen;
                    background: radial-gradient(circle, #fff 0%, rgba(255,247,237,0.96) 24%, rgba(248,113,113,0.72) 46%, rgba(220,38,38,0.22) 74%, transparent 100%);
                    box-shadow: 0 0 26px rgba(255,247,237,0.96), 0 0 58px rgba(239,68,68,0.72), 0 0 82px rgba(220,38,38,0.46);
                `;
                layer.appendChild(flash);
                flash.animate([
                    { opacity: 0, transform: 'scale(0.28)' },
                    { opacity: 1, transform: 'scale(1.05)' },
                    { opacity: 0, transform: 'scale(1.72)' }
                ], { duration: 360, easing: 'cubic-bezier(0.1, 0.86, 0.18, 1)', fill: 'forwards' });
                setTimeout(() => { if (flash.isConnected) flash.remove(); }, 380);

                const shockwave = document.createElement('div');
                shockwave.style.cssText = `
                    position: absolute; width: 252px; height: 252px;
                    left: ${x - 126}px; top: ${y - 126}px;
                    border-radius: 50%; pointer-events: none; z-index: 18; mix-blend-mode: screen;
                    border: 3px solid rgba(244,63,94,0.88);
                    box-shadow: 0 0 42px rgba(255,247,237,0.78), inset 0 0 54px rgba(248,113,113,0.48), 0 0 86px rgba(220,38,38,0.46);
                `;
                layer.appendChild(shockwave);
                shockwave.animate([
                    { opacity: 0.98, transform: 'scale(0.14)' },
                    { opacity: 0.42, transform: 'scale(1.08)' },
                    { opacity: 0, transform: 'scale(1.66)' }
                ], { duration: 680, easing: 'cubic-bezier(0.12, 0.84, 0.24, 1)', fill: 'forwards' });
                setTimeout(() => { if (shockwave.isConnected) shockwave.remove(); }, 700);

                const outerShockwave = document.createElement('div');
                outerShockwave.style.cssText = `
                    position: absolute; width: 320px; height: 320px;
                    left: ${x - 160}px; top: ${y - 160}px;
                    border-radius: 50%; pointer-events: none; z-index: 16; mix-blend-mode: screen;
                    border: 2px solid rgba(255,228,230,0.72);
                    box-shadow: 0 0 48px rgba(248,113,113,0.38), inset 0 0 38px rgba(255,245,210,0.22);
                `;
                layer.appendChild(outerShockwave);
                outerShockwave.animate([
                    { opacity: 0, transform: 'scale(0.12)' },
                    { opacity: 0.74, transform: 'scale(0.76)' },
                    { opacity: 0, transform: 'scale(1.22)' }
                ], { duration: 620, easing: 'cubic-bezier(0.1, 0.78, 0.2, 1)', fill: 'forwards' });
                setTimeout(() => { if (outerShockwave.isConnected) outerShockwave.remove(); }, 640);
            }
        }

        const sparksCount = isBondMaxAttack ? 56 : (isTrueResonance ? 24 : 16);
        for (let i = 0; i < sparksCount; i++) {
            const spark = document.createElement('div');
            const sparkLength = isBondMaxAttack ? (Math.random() * 42 + 40) : (isTrueResonance ? (Math.random() * 18 + 22) : 20);
            const sparkWidth = isBondMaxAttack ? (Math.random() * 3 + 4) : (isTrueResonance ? (Math.random() * 3 + 4) : 6);
            spark.style.cssText = `
                position: absolute; width: ${sparkWidth}px; height: ${sparkLength}px;
                background: ${isBondMaxAttack ? 'linear-gradient(180deg,#fff,#fff7ed 26%,#fca5a5 42%,#ef4444 68%,#b91c1c)' : (isTrueResonance ? 'linear-gradient(180deg,#fff,#fed7aa 46%,#ef4444)' : '#ffffff')};
                box-shadow: ${isBondMaxAttack ? '0 0 14px rgba(255,247,237,0.9), 0 0 28px rgba(239,68,68,0.72), 0 0 44px rgba(220,38,38,0.46)' : (isTrueResonance ? '0 0 10px #fff7ed, 0 0 20px #f97316, 0 0 34px rgba(220,38,38,0.58)' : '0 0 8px #fde047, 0 0 15px #f59e0b')};
                border-radius: 4px; left: ${x - sparkWidth / 2}px; top: ${y - sparkLength / 2}px;
                pointer-events: none; z-index: 20;
            `;
            layer.appendChild(spark);
            const angle = (Math.PI * 2 / sparksCount) * i + (Math.random() - 0.5);
            const dist = isBondMaxAttack ? (Math.random() * 158 + 102) : (isTrueResonance ? (Math.random() * 92 + 54) : (Math.random() * 80 + 40));
            const dur = isBondMaxAttack ? (Math.random() * 310 + 380) : (isTrueResonance ? (Math.random() * 230 + 120) : (Math.random() * 250 + 150));
            spark.animate([
                { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, 0) scale(1)`, opacity: 1 },
                { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, -${dist}px) scale(${isBondMaxAttack ? 0.28 : 0.2})`, opacity: 0 }
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => { if (spark.isConnected) spark.remove(); }, dur);
        }

        if (isBondMaxAttack) {
            for (let i = 0; i < 12; i++) {
                const star = document.createElement('div');
                const size = Math.random() * 8 + 9;
                star.style.cssText = `
                    position: absolute; width: ${size}px; height: ${size}px;
                    left: ${x - size / 2}px; top: ${y - size / 2}px;
                    pointer-events: none; z-index: 26; mix-blend-mode: screen;
                    background: #fff7ed;
                    clip-path: polygon(50% 0%, 61% 34%, 98% 35%, 68% 56%, 79% 91%, 50% 70%, 21% 91%, 32% 56%, 2% 35%, 39% 34%);
                    filter: drop-shadow(0 0 8px rgba(255,247,237,0.95)) drop-shadow(0 0 16px rgba(239,68,68,0.66));
                `;
                layer.appendChild(star);
                const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.4;
                const dist = Math.random() * 98 + 78;
                const dur = Math.random() * 220 + 420;
                star.animate([
                    { opacity: 0, transform: `rotate(${angle}rad) translate(0, 0) scale(0.3)` },
                    { opacity: 1, transform: `rotate(${angle + 0.8}rad) translate(0, -${dist * 0.42}px) scale(1)` },
                    { opacity: 0, transform: `rotate(${angle + 1.6}rad) translate(0, -${dist}px) scale(0.18)` }
                ], { duration: dur, easing: 'cubic-bezier(0.12, 0.82, 0.18, 1)', fill: 'forwards' });
                setTimeout(() => { if (star.isConnected) star.remove(); }, dur);
            }
        }
    };

    const spawnProjectile = (fromX, fromY, toX, toY, textOpt, extras = null) => {
        const vfxLayer = getVfxLayer();
        const isBondMaxAttack = !!extras?.bondMaxAttack;
        const isTrueResonance = !!extras?.trueResonance || isBondMaxAttack;
        const isGiraAttack = !!extras?.giraAttack;
        const onHit = typeof extras?.onHit === 'function' ? extras.onHit : null;
        const ttl = isGiraAttack ? 280 : (isBondMaxAttack ? 520 : (isTrueResonance ? 430 : 400));
        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.hypot(dx, dy) || 1;
        const leadMag = Math.hypot(Number(extras?.curveLeadX) || 0, Number(extras?.curveLeadY) || 0);
        const leadX = leadMag > 0 ? (Number(extras?.curveLeadX) || 0) / leadMag : dx / dist;
        const leadY = leadMag > 0 ? (Number(extras?.curveLeadY) || 0) / leadMag : dy / dist;
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const curveSide = ((leadX * dy) - (leadY * dx)) >= 0 ? 1 : -1;
        const hasCurveLead = leadMag > 0;
        const controlLead = isBondMaxAttack
            ? (hasCurveLead ? Math.min(460, Math.max(210, dist * 0.86)) : Math.min(240, Math.max(98, dist * 0.46)))
            : Math.min(148, Math.max(58, dist * 0.28));
        const controlBend = isBondMaxAttack
            ? (hasCurveLead ? Math.min(110, Math.max(36, dist * 0.16)) : Math.min(100, Math.max(30, dist * 0.14)))
            : Math.min(86, Math.max(26, dist * 0.12));
        const controlX = fromX + leadX * controlLead + perpX * controlBend * curveSide;
        const controlY = fromY + leadY * controlLead + perpY * controlBend * curveSide;
        const apexDx = controlX - fromX;
        const apexDy = controlY - fromY;
        const apexDist = Math.hypot(apexDx, apexDy) || 1;
        const apexDirX = apexDx / apexDist;
        const apexDirY = apexDy / apexDist;
        const homingStartT = hasCurveLead ? 0.55 : 0.5;
        const returnLead = isBondMaxAttack
            ? (hasCurveLead ? Math.min(250, Math.max(86, dist * 0.34)) : Math.min(150, Math.max(56, dist * 0.22)))
            : 0;
        const returnControlX = controlX + apexDirX * returnLead;
        const returnControlY = controlY + apexDirY * returnLead;
        const angle = Math.atan2(dy, dx);
        const projectile = document.createElement('div');
        projectile.style.cssText = `
            position: absolute; left: ${fromX - (isGiraAttack ? 34 : (isTrueResonance ? 26 : 20))}px; top: ${fromY - (isGiraAttack ? 34 : (isTrueResonance ? 26 : 20))}px;
            width: ${isGiraAttack ? 68 : (isTrueResonance ? 52 : 40)}px; height: ${isGiraAttack ? 68 : (isTrueResonance ? 52 : 40)}px; display: flex; justify-content: center; align-items: center;
            pointer-events: none; z-index: 99999;
        `;
        let tail = null;
        if (isGiraAttack) {
            tail = document.createElement('div');
            tail.style.cssText = `
                position: absolute; right: 28px; width: 148px; height: 28px; border-radius: 999px;
                background: linear-gradient(90deg, transparent, rgba(88,28,135,0.18) 10%, rgba(109,40,217,0.48) 32%, rgba(139,92,246,0.72) 58%, rgba(196,181,253,0.90) 80%, rgba(233,213,255,0.98) 100%);
                filter: blur(5px);
                box-shadow: 0 0 18px rgba(167,139,250,0.92), 0 0 38px rgba(109,40,217,0.75), 0 0 66px rgba(88,28,135,0.5);
                transform: rotate(${angle}rad); transform-origin: 100% 50%; z-index: 6; mix-blend-mode: screen;
            `;
            projectile.appendChild(tail);
        } else if (isTrueResonance) {
            tail = document.createElement('div');
            tail.style.cssText = `
                position: absolute; right: 22px; width: ${isBondMaxAttack ? 46 : 88}px; height: ${isBondMaxAttack ? 34 : 18}px; border-radius: 999px;
                background: ${isBondMaxAttack ? 'radial-gradient(ellipse at 72% 50%, rgba(255,247,237,0.78) 0%, rgba(248,113,113,0.42) 32%, rgba(220,38,38,0.18) 58%, transparent 78%)' : 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.2) 18%, rgba(249,115,22,0.72) 58%, rgba(254,243,199,0.9) 100%)'};
                filter: blur(${isBondMaxAttack ? 5.5 : 1}px); box-shadow: ${isBondMaxAttack ? '0 0 16px rgba(255,247,237,0.34), 0 0 30px rgba(239,68,68,0.28)' : '0 0 18px rgba(249,115,22,0.86), 0 0 34px rgba(220,38,38,0.38)'};
                transform: rotate(${angle}rad); transform-origin: 100% 50%; z-index: 6; mix-blend-mode: screen;
            `;
            projectile.appendChild(tail);
        }
        let wake = null;
        const core = document.createElement('div');
        core.style.cssText = `
            position: absolute; width: ${isGiraAttack ? 56 : (isBondMaxAttack ? 46 : (isTrueResonance ? 34 : 28))}px; height: ${isGiraAttack ? 56 : (isBondMaxAttack ? 46 : (isTrueResonance ? 34 : 28))}px; border-radius: 50%;
            background: ${isGiraAttack ? 'radial-gradient(circle,#fff 0%,rgba(243,232,255,0.98) 16%,rgba(196,181,253,0.94) 36%,rgba(139,92,246,0.82) 58%,rgba(109,40,217,0.58) 78%,rgba(76,29,149,0.28) 100%)' : (isBondMaxAttack ? 'radial-gradient(circle,#fff 0%,#fff7ed 18%,#fca5a5 38%,#ef4444 64%,#b91c1c 100%)' : (isTrueResonance ? 'radial-gradient(circle,#fff 0%,#fff7ed 30%,#f97316 62%,#dc2626 100%)' : '#ffffff'))};
            box-shadow: ${isGiraAttack ? '0 0 18px #fff,0 0 38px rgba(216,180,254,0.98),0 0 68px rgba(167,139,250,0.92),0 0 100px rgba(139,92,246,0.78),0 0 150px rgba(109,40,217,0.55),0 0 200px rgba(88,28,135,0.35)' : (isBondMaxAttack ? '0 0 22px rgba(255,247,237,0.98), 0 0 50px rgba(248,113,113,0.84), 0 0 82px rgba(239,68,68,0.76), 0 0 112px rgba(220,38,38,0.5)' : (isTrueResonance ? '0 0 18px #fff, 0 0 38px #f97316, 0 0 70px rgba(220,38,38,0.86), 0 0 96px rgba(251,191,36,0.42)' : '0 0 20px #ffffff, 0 0 40px #fde047, 0 0 60px #f59e0b'))}; z-index: 10;
        `;
        projectile.appendChild(core);
        vfxLayer.appendChild(projectile);
        const getCurvePoint = (t) => {
            if (!isBondMaxAttack) {
                const easeProgress = 1 - Math.pow(1 - t, 3);
                return {
                    x: fromX + dx * easeProgress,
                    y: fromY + dy * easeProgress,
                    angle: Math.atan2(dy, dx)
                };
            }
            if (t < homingStartT) {
                const leadT = t / homingStartT;
                return {
                    x: fromX + (controlX - fromX) * leadT,
                    y: fromY + (controlY - fromY) * leadT,
                    angle: Math.atan2(controlY - fromY, controlX - fromX)
                };
            }
            const arcT = (t - homingStartT) / (1 - homingStartT);
            const curveT = arcT * arcT * (3 - 2 * arcT);
            const inv = 1 - curveT;
            const x = inv * inv * controlX + 2 * inv * curveT * returnControlX + curveT * curveT * toX;
            const y = inv * inv * controlY + 2 * inv * curveT * returnControlY + curveT * curveT * toY;
            const tx = 2 * inv * (returnControlX - controlX) + 2 * curveT * (toX - returnControlX);
            const ty = 2 * inv * (returnControlY - controlY) + 2 * curveT * (toY - returnControlY);
            return { x, y, angle: Math.atan2(ty, tx) };
        };
        let startTime = null;
        let lastProjectileX = fromX;
        let lastProjectileY = fromY;
        let lastProjectileAngle = angle;
        let preImpactFlashed = false;
        const animateTrail = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / ttl, 1);
            if (progress < 1 && projectile.isConnected) {
                const point = getCurvePoint(progress);
                const currentX = point.x;
                const currentY = point.y;
                const stepDx = currentX - lastProjectileX;
                const stepDy = currentY - lastProjectileY;
                const movementAngle = Math.hypot(stepDx, stepDy) > 0.4 ? Math.atan2(stepDy, stepDx) : lastProjectileAngle;
                lastProjectileX = currentX;
                lastProjectileY = currentY;
                lastProjectileAngle = movementAngle;
                if (isBondMaxAttack) {
                    const surge = progress > 0.72 ? (1 + (progress - 0.72) * 0.42) : 1;
                    projectile.style.transform = `translate(${currentX - fromX}px, ${currentY - fromY}px) scale(${(1 - progress * 0.22) * surge})`;
                    if (tail) tail.style.transform = `rotate(${movementAngle}rad)`;
                    if (wake) wake.style.transform = `rotate(${movementAngle}rad) scale(${1 + progress * 0.22}, ${1 + Math.sin(progress * Math.PI) * 0.18})`;
                    if (Math.random() < 0.68) {
                        const after = document.createElement('div');
                        const afterW = Math.random() * 54 + 48;
                        const afterH = Math.random() * 10 + 8;
                        after.style.cssText = `
                            position: absolute; width: ${afterW}px; height: ${afterH}px;
                            left: ${currentX - afterW * 0.78}px; top: ${currentY - afterH / 2}px;
                            border-radius: 999px 55% 55% 999px; pointer-events: none; z-index: 9; mix-blend-mode: screen;
                            background: linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.16) 20%, rgba(239,68,68,0.48) 62%, rgba(255,247,237,0.74) 100%);
                            filter: blur(${Math.random() * 2.2 + 1.8}px);
                            box-shadow: 0 0 18px rgba(239,68,68,0.42), 0 0 34px rgba(255,247,237,0.28);
                        `;
                        vfxLayer.appendChild(after);
                        const wobble = (Math.random() - 0.5) * 18;
                        after.animate([
                            { opacity: 0.54, transform: `rotate(${movementAngle + wobble * 0.01}rad) scale(1, 1)` },
                            { opacity: 0, transform: `rotate(${movementAngle + wobble * 0.01}rad) translate(${-18 - Math.random() * 22}px, ${(Math.random() - 0.5) * 18}px) scale(0.42, 1.7)` }
                        ], { duration: Math.random() * 170 + 190, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (after.isConnected) after.remove(); }, 380);
                    }
                    if (!preImpactFlashed && progress > 0.78) {
                        preImpactFlashed = true;
                        const flash = document.createElement('div');
                        flash.style.cssText = `
                            position: absolute; width: 70px; height: 70px; left: ${currentX - 35}px; top: ${currentY - 35}px;
                            border-radius: 50%; pointer-events: none; z-index: 17; mix-blend-mode: screen;
                            background: radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,247,237,0.82) 30%, rgba(239,68,68,0.28) 66%, transparent 100%);
                            box-shadow: 0 0 28px rgba(255,247,237,0.86), 0 0 54px rgba(239,68,68,0.56);
                        `;
                        vfxLayer.appendChild(flash);
                        flash.animate([
                            { opacity: 0, transform: 'scale(0.42)' },
                            { opacity: 0.92, transform: 'scale(1.1)' },
                            { opacity: 0, transform: 'scale(1.7)' }
                        ], { duration: 220, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (flash.isConnected) flash.remove(); }, 240);
                    }
                }
                if (isGiraAttack) {
                    // Thick plasma trail (main body, very wide)
                    if (Math.random() < 0.82) {
                        const sk = document.createElement('div');
                        const skLen = 70 + Math.random() * 60;
                        const skW = 18 + Math.random() * 14;
                        sk.style.cssText = `position:absolute;width:${skLen}px;height:${skW}px;left:${currentX - skLen * 0.94}px;top:${currentY - skW / 2}px;border-radius:${skW}px;pointer-events:none;z-index:9;mix-blend-mode:screen;transform:rotate(${movementAngle}rad);transform-origin:100% 50%;background:linear-gradient(90deg,transparent,rgba(88,28,135,${(0.12 + Math.random() * 0.18).toFixed(2)}) 16%,rgba(109,40,217,${(0.38 + Math.random() * 0.32).toFixed(2)}) 44%,rgba(139,92,246,${(0.62 + Math.random() * 0.28).toFixed(2)}) 72%,rgba(196,181,253,${(0.75 + Math.random() * 0.22).toFixed(2)}) 100%);filter:blur(4px);box-shadow:0 0 ${Math.round(skW * 1.5)}px rgba(167,139,250,0.8),0 0 ${Math.round(skW * 3)}px rgba(109,40,217,0.55);`;
                        vfxLayer.appendChild(sk);
                        sk.animate([{ opacity: 0.92 }, { opacity: 0 }], { duration: 72 + Math.random() * 48, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (sk.isConnected) sk.remove(); }, 140);
                    }
                    // Electric arc discharge — perpendicular (both sides)
                    if (Math.random() < 0.62) {
                        const arcLen = 22 + Math.random() * 36;
                        const arcW = 2 + Math.random() * 2;
                        const arcSide = Math.random() > 0.5 ? 1 : -1;
                        const perpAngle = movementAngle + Math.PI / 2 * arcSide;
                        const arc = document.createElement('div');
                        arc.style.cssText = `position:absolute;width:${arcLen}px;height:${arcW}px;left:${currentX}px;top:${currentY - arcW / 2}px;border-radius:${arcW}px;pointer-events:none;z-index:11;mix-blend-mode:screen;transform:rotate(${perpAngle}rad);transform-origin:0% 50%;background:linear-gradient(90deg,rgba(243,232,255,0.98),rgba(167,139,250,0.7),transparent);box-shadow:0 0 8px rgba(216,180,254,0.92),0 0 18px rgba(139,92,246,0.6);`;
                        vfxLayer.appendChild(arc);
                        arc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 42 + Math.random() * 32, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (arc.isConnected) arc.remove(); }, 90);
                    }
                    // Radial corona sparks (around the ball itself)
                    if (Math.random() < 0.48) {
                        const coronaAng = Math.random() * Math.PI * 2;
                        const coronaLen = 16 + Math.random() * 26;
                        const coronaW = 2;
                        const corona = document.createElement('div');
                        corona.style.cssText = `position:absolute;width:${coronaLen}px;height:${coronaW}px;left:${currentX}px;top:${currentY - coronaW / 2}px;border-radius:${coronaW}px;pointer-events:none;z-index:12;mix-blend-mode:screen;transform:rotate(${coronaAng}rad);transform-origin:0% 50%;background:linear-gradient(90deg,rgba(255,255,255,0.95),rgba(216,180,254,0.8),transparent);box-shadow:0 0 6px rgba(233,213,255,0.9);`;
                        vfxLayer.appendChild(corona);
                        corona.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 30 + Math.random() * 24, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (corona.isConnected) corona.remove(); }, 65);
                    }
                    // Pre-impact megaflash (large purple burst as projectile approaches)
                    if (!preImpactFlashed && progress > 0.68) {
                        preImpactFlashed = true;
                        const pf = document.createElement('div');
                        pf.style.cssText = `position:absolute;width:90px;height:90px;left:${currentX - 45}px;top:${currentY - 45}px;border-radius:50%;pointer-events:none;z-index:17;mix-blend-mode:screen;background:radial-gradient(circle,rgba(255,255,255,0.96) 0%,rgba(243,232,255,0.88) 24%,rgba(167,139,250,0.45) 56%,transparent 100%);box-shadow:0 0 28px rgba(216,180,254,0.95),0 0 60px rgba(139,92,246,0.75),0 0 100px rgba(109,40,217,0.45);`;
                        vfxLayer.appendChild(pf);
                        pf.animate([{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1.2)' }, { opacity: 0, transform: 'scale(2.2)' }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
                        setTimeout(() => { if (pf.isConnected) pf.remove(); }, 260);
                    }
                }
                const particlesThisFrame = isGiraAttack ? (Math.floor(Math.random() * 2) + 2) : (isBondMaxAttack ? (Math.floor(Math.random() * 5) + 7) : (isTrueResonance ? (Math.floor(Math.random() * 4) + 5) : (Math.floor(Math.random() * 3) + 3)));
                for (let i = 0; i < particlesThisFrame; i++) {
                    const offsetX = (Math.random() - 0.5) * (isGiraAttack ? 8 : (isBondMaxAttack ? 42 : (isTrueResonance ? 30 : 20)));
                    const offsetY = (Math.random() - 0.5) * (isGiraAttack ? 8 : (isBondMaxAttack ? 42 : (isTrueResonance ? 30 : 20)));
                    spawnTrailParticle(vfxLayer, currentX + offsetX, currentY + offsetY, extras);
                }
                requestAnimationFrame(animateTrail);
            } else {
                if (!extras?.skipHitVfx) {
                    spawnHitVfx(toX, toY, { trueResonance: isTrueResonance, bondMaxAttack: isBondMaxAttack, dirX: dx, dirY: dy });
                }
                if (onHit) onHit();
            }
        };
        requestAnimationFrame(animateTrail);
        if (!isBondMaxAttack) {
            projectile.animate([
                { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(${isGiraAttack ? 1.05 : (isTrueResonance ? 0.62 : 0.5)})`, opacity: isGiraAttack ? 1 : (isTrueResonance ? 0.72 : 0.5) }
            ], { duration: ttl, easing: isGiraAttack ? 'cubic-bezier(0.08, 0.95, 0.18, 1)' : 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' });
        }
        setTimeout(() => { if (projectile.isConnected) projectile.remove(); }, ttl + 50);
    };

    api.spawnFloatingDamage = spawnFloatingDamage;
    api.spawnGiraGiraHitVfx = spawnGiraGiraHitVfx;
    api.spawnGiraGiraBurstVfx = spawnGiraGiraBurstVfx;
    api.getComboTier = getComboTier;
    api.getRandomComboPopupPosition = getRandomComboPopupPosition;
    api.createComboPopupState = createComboPopupState;
    api.rectCenter = rectCenter;
    api.getCenterOrFallback = getCenterOrFallback;
    api.getVfxLayer = getVfxLayer;
    api.spawnTrailParticle = spawnTrailParticle;
    api.spawnHitVfx = spawnHitVfx;
    api.spawnProjectile = spawnProjectile;

    window.rectCenter = rectCenter;
    window.getCenterOrFallback = getCenterOrFallback;
    window.getVfxLayer = getVfxLayer;
    window.spawnProjectile = spawnProjectile;
    window.spawnFloatingDamage = spawnFloatingDamage;
    window.spawnGiraGiraHitVfx = spawnGiraGiraHitVfx;
    window.spawnGiraGiraBurstVfx = spawnGiraGiraBurstVfx;

    window.__JPAPP_VFX = api;
    window.JPAPP_VFX = api;
    window.JPAPPVfxHelpers = api;

    window.__initVfxHelpers = function (settings) {
        window.__JPAPP_VFX_HELPER_SETTINGS = settings;
    };
}());
