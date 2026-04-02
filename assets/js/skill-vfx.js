/**
 * skill-vfx.js
 * 技能啟動特效模組
 *
 * 負責所有 "castAbility" / 技能發動時的視覺特效派發。
 * 純 DOM Side-effect，不讀取任何 Vue State。
 *
 * 外部依賴：
 *   - window.getVfxLayer()  (由 vfx-helpers.js 提供)
 *   - DOM: #heroAvatar, img[alt="monster"], .monster-img-*
 *
 * 掛載於 window.spawnSkillActivationVfx，保持與 game.js 既有呼叫方式一致。
 */

window.spawnSkillActivationVfx = function (id) {
    const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
    if (!vfxLayer) return;

    const heroEl = document.getElementById('heroAvatar');
    const hr = heroEl ? heroEl.getBoundingClientRect() : null;
    const hx = hr ? hr.left + hr.width / 2 : window.innerWidth * 0.2;
    const hy = hr ? hr.top + hr.height / 2 : window.innerHeight * 0.75;

    const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.monster-img-normal') || document.querySelector('.monster-img-boss');
    const mr = monsterEl ? monsterEl.getBoundingClientRect() : null;
    const mx = mr ? mr.left + mr.width / 2 : window.innerWidth * 0.65;
    const my = mr ? mr.top + mr.height / 2 : window.innerHeight * 0.35;

    const spawn = (css, dur, frames, easing) => {
        const el = document.createElement('div');
        el.style.cssText = css;
        vfxLayer.appendChild(el);
        el.animate(frames, { duration: dur, easing: easing || 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (el.isConnected) el.remove(); }, dur + 50);
    };

    if (id === 'GIRAGIRA') {
        spawn(
            `position:absolute;width:150px;height:150px;left:${hx - 75}px;top:${hy - 75}px;border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,255,220,0.92) 0%,rgba(251,191,36,0.55) 45%,transparent 75%);pointer-events:none;`,
            420, [{ opacity: 0.95, transform: 'scale(0.25)' }, { opacity: 0, transform: 'scale(2)' }]);
        [[-38, 1], [38, -1]].forEach(([rot, dir]) => {
            spawn(
                `position:absolute;width:4px;height:190px;left:${hx - 2}px;top:${hy - 95}px;` +
                `background:linear-gradient(to bottom,transparent 5%,rgba(255,255,200,0.95) 35%,rgba(251,191,36,1) 60%,transparent 95%);` +
                `border-radius:2px;pointer-events:none;transform-origin:center center;`,
                360,
                [{ opacity: 1, transform: `rotate(${rot}deg) scaleY(0.08)` }, { opacity: 0, transform: `rotate(${rot + dir * 9}deg) scaleY(1.2)` }],
                'cubic-bezier(0.05,0.9,0.25,1)');
        });
        for (let i = 0; i < 6; i++) {
            const ang = (Math.PI * 2 / 6) * i;
            const dist = 55 + Math.random() * 25;
            spawn(
                `position:absolute;width:5px;height:15px;left:${hx - 2.5}px;top:${hy - 7.5}px;` +
                `background:#fde047;box-shadow:0 0 6px #f59e0b;border-radius:3px;pointer-events:none;`,
                280 + Math.random() * 80,
                [{ opacity: 1, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,0) scale(1)` }, { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist}px) scale(0.15)` }]);
        }
    } else if (id === 'MORIMORI') {
        spawn(
            `position:absolute;width:110px;height:110px;left:${hx - 55}px;top:${hy - 55}px;` +
            `border:3px solid rgba(96,165,250,0.88);border-radius:50%;` +
            `box-shadow:0 0 14px rgba(59,130,246,0.65),inset 0 0 8px rgba(59,130,246,0.25);pointer-events:none;`,
            520, [{ opacity: 1, transform: 'scale(0.35)' }, { opacity: 0, transform: 'scale(1.9)' }]);
        for (let i = 0; i < 8; i++) {
            const ox = (Math.random() - 0.5) * 65, oy = Math.random() * 22;
            spawn(
                `position:absolute;width:8px;height:8px;left:${hx + ox - 4}px;top:${hy + oy - 4}px;` +
                `background:rgba(96,165,250,0.9);border-radius:50%;box-shadow:0 0 8px #60a5fa;pointer-events:none;`,
                380 + Math.random() * 200,
                [{ opacity: 0.9, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: `translateY(-${50 + Math.random() * 30}px) scale(0.25)` }]);
        }
    } else if (id === 'JIWAJIWA') {
        [0, 160].forEach((delay, i) => {
            const sz = 90 + i * 35;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:2px solid rgba(74,222,128,0.72);border-radius:50%;` +
                    `box-shadow:0 0 10px rgba(34,197,94,0.45);pointer-events:none;`,
                    620, [{ opacity: 0.8, transform: 'scale(0.45)' }, { opacity: 0, transform: 'scale(1.7)' }]);
            }, delay);
        });
        spawn(
            `position:absolute;width:85px;height:85px;left:${hx - 42.5}px;top:${hy - 42.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(167,243,208,0.72) 0%,transparent 70%);pointer-events:none;`,
            520, [{ opacity: 0.8, transform: 'scale(0.35)' }, { opacity: 0, transform: 'scale(1.5)' }]);
    } else if (id === 'WAKUWAKU') {
        [-18, 2, 22].forEach((oy, i) => {
            const w = 55 + Math.random() * 45;
            setTimeout(() => {
                spawn(
                    `position:absolute;height:3px;width:${w}px;left:${hx - 85}px;top:${hy + oy}px;` +
                    `background:linear-gradient(to right,transparent,rgba(56,189,248,0.88),transparent);` +
                    `border-radius:2px;pointer-events:none;`,
                    220,
                    [{ opacity: 1, transform: 'scaleX(0.08) translateX(-50px)' }, { opacity: 0, transform: 'scaleX(1) translateX(70px)' }],
                    'ease-in');
            }, i * 45);
        });
        spawn(
            `position:absolute;width:115px;height:115px;left:${hx - 57.5}px;top:${hy - 57.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(186,230,253,0.65) 0%,transparent 70%);pointer-events:none;`,
            350, [{ opacity: 0.85, transform: 'scale(0.28)' }, { opacity: 0, transform: 'scale(1.9)' }]);
    } else if (id === 'ODOODO') {
        [0, 110].forEach((delay, i) => {
            const sz = 80 + i * 45;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${mx - sz / 2}px;top:${my - sz / 2}px;` +
                    `border:2px solid rgba(134,239,172,0.68);border-radius:50%;` +
                    `box-shadow:0 0 10px rgba(74,222,128,0.38);pointer-events:none;`,
                    520, [{ opacity: 0.75, transform: 'scale(0.38)' }, { opacity: 0, transform: 'scale(2.1)' }]);
            }, delay);
        });
        spawn(
            `position:absolute;width:120px;height:120px;left:${mx - 60}px;top:${my - 60}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,0.32) 0%,transparent 70%);pointer-events:none;`,
            400, [{ opacity: 0.8 }, { opacity: 0 }]);
    } else if (id === 'GACHIGACHI') {
        spawn(
            `position:absolute;width:105px;height:105px;left:${hx - 52.5}px;top:${hy - 52.5}px;` +
            `border:4px solid rgba(148,163,184,0.88);border-radius:50%;` +
            `box-shadow:0 0 16px rgba(203,213,225,0.55),inset 0 0 8px rgba(148,163,184,0.28);pointer-events:none;`,
            480, [{ opacity: 1, transform: 'scale(0.28)' }, { opacity: 0, transform: 'scale(1.65)' }]);
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy], i) => {
            const sx = hx + dx * 68, sy = hy + dy * 68;
            spawn(
                `position:absolute;width:13px;height:13px;left:${sx - 6.5}px;top:${sy - 6.5}px;` +
                `background:rgba(203,213,225,0.88);border-radius:2px;` +
                `box-shadow:0 0 6px rgba(148,163,184,0.75);pointer-events:none;`,
                360,
                [{ opacity: 1, transform: `translate(0,0) rotate(${i * 45}deg) scale(1)` }, { opacity: 0, transform: `translate(${-dx * 68}px,${-dy * 68}px) rotate(${i * 45 + 180}deg) scale(0.15)` }],
                'cubic-bezier(0.25,0,0.15,1)');
        });
    } else if (id === 'UTOUTO') {
        for (let i = 0; i < 3; i++) {
            const sz = 14 + i * 8, ox = (i - 1) * 30;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx + ox - sz / 2}px;top:${hy - sz / 2}px;` +
                    `background:rgba(167,139,250,0.62);border-radius:50%;` +
                    `border:1.5px solid rgba(196,181,253,0.68);` +
                    `box-shadow:0 0 8px rgba(139,92,246,0.48);pointer-events:none;`,
                    680 + i * 80,
                    [{ opacity: 0.8, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: `translateY(-${65 + i * 22}px) scale(0.25)` }]);
            }, i * 130);
        }
        spawn(
            `position:absolute;width:120px;height:120px;left:${mx - 60}px;top:${my - 60}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,0.38) 0%,transparent 70%);pointer-events:none;`,
            620, [{ opacity: 0.7, transform: 'scale(0.48)' }, { opacity: 0, transform: 'scale(1.55)' }]);
    }
};
