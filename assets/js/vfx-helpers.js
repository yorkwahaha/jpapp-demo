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
