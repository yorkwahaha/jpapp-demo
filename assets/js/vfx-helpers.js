(function () {
    const api = window.__JPAPP_VFX || window.JPAPP_VFX || {};

    function spawnFloatingDamage(target, amount, type = 'hp') {
        const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
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
            // Red color for hero damage
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

        // Display value
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
        const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
        if (!vfxLayer) return;

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

        const tImpact = 82;

        // 前搖：聚光收束（與主爆分開，讀感更像「斬落前一瞬」）
        spawn(
            `position:absolute;width:118px;height:118px;left:${x - 59}px;top:${y - 59}px;z-index:20;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,252,245,0.58) 0%,rgba(254,243,199,0.38) 38%,rgba(251,191,36,0.24) 58%,transparent 74%);` +
            `box-shadow:0 0 26px rgba(251,191,36,0.38),0 0 40px rgba(255,255,255,0.1),inset 0 0 16px rgba(255,255,255,0.08);`,
            110,
            [
                { opacity: 0.55, transform: 'scale(1.22)' },
                { opacity: 1, transform: 'scale(0.74)' },
                { opacity: 0, transform: 'scale(0.58)' }
            ],
            'cubic-bezier(0.32, 0, 0.15, 1)',
            0
        );
        [[-31, 1], [31, -1]].forEach(([rot, dir]) => {
            spawn(
                `position:absolute;width:2px;height:108px;left:${x - 1}px;top:${y - 54}px;z-index:21;pointer-events:none;` +
                `transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(to bottom,transparent 10%,rgba(255,250,230,0.55) 42%,rgba(253,224,71,0.75) 52%,transparent 90%);` +
                `box-shadow:0 0 8px rgba(255,255,255,0.45);`,
                105,
                [
                    { opacity: 0.2, transform: `rotate(${rot}deg) scaleY(0.14)` },
                    { opacity: 0.95, transform: `rotate(${rot + dir * 5}deg) scaleY(0.52)` },
                    { opacity: 0, transform: `rotate(${rot + dir * 8}deg) scaleY(0.62)` }
                ],
                'cubic-bezier(0.28, 0.82, 0.32, 1)',
                0
            );
        });

        // 命中核：金白集中爆閃（輪廓收緊、減少中心霧白，亮度仍高）
        spawn(
            `position:absolute;width:38px;height:38px;left:${x - 19}px;top:${y - 19}px;z-index:26;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(255,252,240,0.94) 9%,rgba(253,224,71,0.88) 26%,rgba(251,191,36,0.55) 46%,transparent 72%);` +
            `box-shadow:0 0 1px #fff,0 0 10px rgba(255,255,255,0.82),0 0 24px rgba(254,240,138,0.58),0 0 36px rgba(251,191,36,0.32);`,
            62,
            [
                { opacity: 0, transform: 'scale(0.28)' },
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0.72, transform: 'scale(1.04)' },
                { opacity: 0, transform: 'scale(1.16)' }
            ],
            'cubic-bezier(0.12, 0.62, 0.2, 1)',
            tImpact
        );
        spawn(
            `position:absolute;width:50px;height:50px;left:${x - 25}px;top:${y - 25}px;z-index:25;pointer-events:none;` +
            `border-radius:50%;border:1.5px solid rgba(255,248,230,0.95);` +
            `box-shadow:0 0 8px rgba(255,255,255,0.72),0 0 22px rgba(251,191,36,0.58),inset 0 0 6px rgba(255,255,255,0.22);`,
            205,
            [
                { opacity: 0, transform: 'scale(0.18)' },
                { opacity: 1, transform: 'scale(0.52)' },
                { opacity: 0.38, transform: 'scale(1.12)' },
                { opacity: 0, transform: 'scale(1.92)' }
            ],
            'cubic-bezier(0.06, 0.88, 0.22, 1)',
            tImpact
        );
        spawn(
            `position:absolute;width:92px;height:92px;left:${x - 46}px;top:${y - 46}px;z-index:23;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,253,245,0.9) 0%,rgba(253,224,71,0.7) 38%,rgba(251,191,36,0.46) 54%,rgba(234,88,12,0.1) 68%,transparent 78%);` +
            `box-shadow:0 0 32px rgba(254,215,102,0.42),0 0 48px rgba(251,146,60,0.16);`,
            275,
            [{ opacity: 1, transform: 'scale(0.14)' }, { opacity: 0, transform: 'scale(2.72)' }],
            'cubic-bezier(0.05, 0.9, 0.18, 1)',
            tImpact
        );

        // 刺入軸 + 極細短促斬線（高光芯、讀成「切進去」而非光團）
        spawn(
            `position:absolute;width:1.5px;height:96px;left:${x - 0.75}px;top:${y - 48}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
            `background:linear-gradient(to bottom,transparent 6%,rgba(255,255,255,0.98) 44%,rgba(255,255,255,1) 50%,rgba(255,250,220,0.95) 56%,transparent 94%);` +
            `box-shadow:0 0 6px rgba(255,255,255,0.95),0 0 3px rgba(253,224,71,0.9);border-radius:1px;`,
            58,
            [
                { opacity: 0, transform: 'scaleY(0.12)' },
                { opacity: 1, transform: 'scaleY(1)' },
                { opacity: 0, transform: 'scaleY(1.06)' }
            ],
            'cubic-bezier(0.18, 0.75, 0.2, 1)',
            tImpact
        );
        [[-9, 1], [9, -1], [-83, 1], [83, -1]].forEach(([rot, dir], si) => {
            spawn(
                `position:absolute;width:1px;height:84px;left:${x - 0.5}px;top:${y - 42}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(to bottom,transparent 8%,rgba(255,255,255,1) 42%,rgba(254,249,232,0.98) 50%,rgba(253,224,71,0.75) 62%,transparent 92%);` +
                `box-shadow:0 0 5px rgba(255,255,255,0.88);border-radius:1px;`,
                72 + si * 6,
                [
                    { opacity: 0, transform: `rotate(${rot}deg) scaleY(0.08)` },
                    { opacity: 1, transform: `rotate(${rot + dir * 6}deg) scaleY(1)` },
                    { opacity: 0, transform: `rotate(${rot + dir * 10}deg) scaleY(1.12)` }
                ],
                'cubic-bezier(0.12, 0.88, 0.22, 1)',
                tImpact + 2
            );
        });

        // 斬擊刃：兩主兩副交叉（略收體積、刃緣更硬）
        const slashes = [
            [-54, 1, 4.5, 198, 0],
            [54, -1, 4.5, 198, 0],
            [-17, -1, 2.8, 158, 14],
            [17, 1, 2.8, 158, 14]
        ];
        slashes.forEach(([rot, dir, sw, sh, extraDelay]) => {
            const halfW = sw / 2;
            const halfH = sh / 2;
            spawn(
                `position:absolute;width:${sw}px;height:${sh}px;left:${x - halfW}px;top:${y - halfH}px;z-index:28;pointer-events:none;` +
                `transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(to bottom,transparent 2%,rgba(255,255,255,0.98) 24%,rgba(255,248,220,0.96) 46%,rgba(251,191,36,1) 56%,rgba(249,115,22,0.5) 66%,transparent 97%);` +
                `border-radius:1px;box-shadow:0 0 8px rgba(255,255,255,0.68),0 0 6px rgba(251,191,36,0.75);`,
                242,
                [
                    { opacity: 1, transform: `rotate(${rot}deg) scaleY(0.05)` },
                    { opacity: 1, transform: `rotate(${rot + dir * 12}deg) scaleY(1.32)` },
                    { opacity: 0, transform: `rotate(${rot + dir * 19}deg) scaleY(1.48)` }
                ],
                'cubic-bezier(0.05, 0.93, 0.16, 1)',
                tImpact + extraDelay
            );
        });

        // 星芒火花：貼近命中點的崩裂碎光（非外向煙火）
        for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 / 8) * i + (i % 2 ? 0.07 : -0.05);
            const dist = 22 + Math.random() * 20;
            const len = 5 + Math.random() * 7;
            spawn(
                `position:absolute;width:3px;height:${len}px;left:${x - 1.5}px;top:${y - len / 2}px;z-index:27;pointer-events:none;mix-blend-mode:screen;` +
                `border-radius:1px;` +
                `background:linear-gradient(to top,transparent,rgba(255,255,255,0.96),#fef08a,rgba(251,191,36,0.92));` +
                `box-shadow:0 0 6px rgba(255,255,255,0.75),0 0 5px rgba(251,191,36,0.65);`,
                118 + Math.random() * 42,
                [
                    { opacity: 1, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,0) scaleY(0.35)` },
                    { opacity: 0.9, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist * 0.32}px) scaleY(1)` },
                    { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist}px) scaleY(0.08)` }
                ],
                'cubic-bezier(0.2, 0.82, 0.32, 1)',
                tImpact + Math.floor(Math.random() * 14)
            );
        }
        for (let i = 0; i < 4; i++) {
            const r = i * 45;
            spawn(
                `position:absolute;width:16px;height:1.5px;left:${x - 8}px;top:${y - 0.75}px;z-index:28;pointer-events:none;mix-blend-mode:screen;` +
                `border-radius:1px;` +
                `background:linear-gradient(90deg,transparent,rgba(255,255,255,1),rgba(255,250,220,0.92),transparent);` +
                `box-shadow:0 0 6px rgba(255,255,255,0.88),0 0 3px rgba(251,191,36,0.65);`,
                98,
                [
                    { opacity: 0, transform: `rotate(${r}deg) scaleX(0.12)` },
                    { opacity: 1, transform: `rotate(${r}deg) scaleX(1)` },
                    { opacity: 0, transform: `rotate(${r}deg) scaleX(0.42)` }
                ],
                'ease-out',
                tImpact + 5 + i * 6
            );
        }

        // 極短殘光：斬過一瞬熱痕
        spawn(
            `position:absolute;width:98px;height:98px;left:${x - 49}px;top:${y - 49}px;z-index:19;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,transparent 0%,rgba(255,237,200,0.2) 38%,rgba(251,191,36,0.12) 58%,transparent 76%);`,
            108,
            [{ opacity: 0.55, transform: 'scale(0.92)' }, { opacity: 0, transform: 'scale(1.22)' }],
            'ease-out',
            tImpact + 68
        );
    }

    api.spawnFloatingDamage = spawnFloatingDamage;
    api.spawnGiraGiraHitVfx = spawnGiraGiraHitVfx;
    window.__JPAPP_VFX = api;
    window.JPAPP_VFX = api;
}());
// ================= [ VFX HELPERS ] =================
window.__initVfxHelpers = function (settings) {

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

    // 0. 建立全域特效畫布 (解決炸歪與閃爍問題)
    const getVfxLayer = () => {
        let layer = document.getElementById('global-vfx-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'global-vfx-layer';
            document.body.appendChild(layer);
        }
        // 強制釘死在螢幕左上角，座標 100% 絕對吻合
        layer.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:999999; overflow:hidden; margin:0; padding:0;';
        return layer;
    };

    // 1. 純 JS 拖尾星屑特效
    const spawnTrailParticle = (layer, x, y) => {
        const p = document.createElement('div');
        const size = Math.random() * 8 + 6;
        p.style.cssText = `
            position: absolute; width: ${size}px; height: ${size}px;
            background: ${Math.random() > 0.3 ? '#fde047' : '#ffffff'};
            box-shadow: 0 0 10px #f59e0b; border-radius: 50%;
            left: ${x - size / 2}px; top: ${y - size / 2}px;
            pointer-events: none; z-index: 10;
        `;
        layer.appendChild(p);
        const dur = Math.random() * 400 + 200;
        const driftX = (Math.random() - 0.5) * 30;
        p.animate([
            { opacity: 0.8, transform: 'scale(1) translate(0, 0)' },
            { opacity: 0, transform: `scale(0.1) translate(${driftX}px, 20px)` }
        ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (p.isConnected) p.remove(); }, dur);
    };

    // 2. 擊中爆炸特效 (絕對精準座標)
    const spawnHitVfx = (x, y) => {
        const layer = getVfxLayer();
        // 螢幕震動
        const stage = document.getElementById('stage');
        if (stage && settings.screenShake !== false) {
            stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`;
            setTimeout(() => { stage.style.transform = ''; }, 50);
            setTimeout(() => { stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`; }, 100);
            setTimeout(() => { stage.style.transform = ''; }, 150);
        }
        // A. 擴散爆破光圈
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute; width: 100px; height: 100px;
            border: 4px solid #fde047; border-radius: 50%;
            left: ${x - 50}px; top: ${y - 50}px;
            box-shadow: 0 0 20px #f59e0b, inset 0 0 20px #f59e0b;
            pointer-events: none; z-index: 15;
        `;
        layer.appendChild(ring);
        ring.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1.5)', opacity: 0 }
        ], { duration: 350, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (ring.isConnected) ring.remove(); }, 350);
        // B. 放射狀火花
        const sparksCount = 16;
        for (let i = 0; i < sparksCount; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: absolute; width: 6px; height: 20px;
                background: #ffffff; box-shadow: 0 0 8px #fde047, 0 0 15px #f59e0b;
                border-radius: 4px; left: ${x - 3}px; top: ${y - 10}px;
                pointer-events: none; z-index: 20;
            `;
            layer.appendChild(spark);
            const angle = (Math.PI * 2 / sparksCount) * i + (Math.random() - 0.5);
            const dist = Math.random() * 80 + 40;
            const dur = Math.random() * 250 + 150;
            spark.animate([
                { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, 0) scale(1)`, opacity: 1 },
                { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, -${dist}px) scale(0.2)`, opacity: 0 }
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => { if (spark.isConnected) spark.remove(); }, dur);
        }
    };

    // 3. 發射彗星本體
    const spawnProjectile = (fromX, fromY, toX, toY, textOpt) => {
        const vfxLayer = getVfxLayer();
        const ttl = 400;
        const projectile = document.createElement('div');
        projectile.style.cssText = `
            position: absolute; left: ${fromX - 20}px; top: ${fromY - 20}px;
            width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;
            pointer-events: none; z-index: 99999;
        `;
        const core = document.createElement('div');
        core.style.cssText = `
            position: absolute; width: 28px; height: 28px; border-radius: 50%;
            background: #ffffff; box-shadow: 0 0 20px #ffffff, 0 0 40px #fde047, 0 0 60px #f59e0b; z-index: 10;
        `;
        projectile.appendChild(core);
        vfxLayer.appendChild(projectile);
        const dx = toX - fromX;
        const dy = toY - fromY;
        let startTime = null;
        const animateTrail = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / ttl, 1);
            if (progress < 1 && projectile.isConnected) {
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentX = fromX + dx * easeProgress;
                const currentY = fromY + dy * easeProgress;
                const particlesThisFrame = Math.floor(Math.random() * 3) + 3;
                for (let i = 0; i < particlesThisFrame; i++) {
                    const offsetX = (Math.random() - 0.5) * 20;
                    const offsetY = (Math.random() - 0.5) * 20;
                    spawnTrailParticle(vfxLayer, currentX + offsetX, currentY + offsetY);
                }
                requestAnimationFrame(animateTrail);
            } else {
                spawnHitVfx(toX, toY);
            }
        };
        requestAnimationFrame(animateTrail);
        projectile.animate([
            { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.5 }
        ], { duration: ttl, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' });
        setTimeout(() => { if (projectile.isConnected) projectile.remove(); }, ttl + 50);
    };

    window.rectCenter = rectCenter;
    window.safeNum = safeNum;
    window.getCenterOrFallback = getCenterOrFallback;
    window.getVfxLayer = getVfxLayer;
    window.spawnTrailParticle = spawnTrailParticle;
    window.spawnHitVfx = spawnHitVfx;
    window.spawnProjectile = spawnProjectile;
};
