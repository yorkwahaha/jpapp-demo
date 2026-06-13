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
        // Full-screen blazing gold flash
        const gFlash = document.createElement('div');
        gFlash.style.cssText = `position:fixed;inset:0;background:rgba(251,191,36,0.22);pointer-events:none;z-index:9999;`;
        document.body.appendChild(gFlash);
        gFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => gFlash.remove(), 410);
        // 5 staggered gold rings
        [0, 100, 200, 310, 420].forEach((delay, i) => {
            const sz = 100 + i * 40;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:${4 - Math.floor(i / 2)}px solid rgba(251,191,36,${0.92 - i * 0.14});border-radius:50%;` +
                    `box-shadow:0 0 ${18 + i * 6}px rgba(245,158,11,0.68),inset 0 0 ${8 + i * 3}px rgba(253,224,71,0.25);pointer-events:none;`,
                    600 + i * 40,
                    [{ opacity: 1, transform: 'scale(0.18)' }, { opacity: 0, transform: 'scale(2.1)' }],
                    'cubic-bezier(0.1,0.88,0.2,1)');
            }, delay);
        });
        // Large golden bloom
        spawn(
            `position:absolute;width:185px;height:185px;left:${hx - 92.5}px;top:${hy - 92.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(255,255,220,0.95) 0%,rgba(253,224,71,0.62) 30%,rgba(251,191,36,0.28) 60%,transparent 78%);pointer-events:none;`,
            720,
            [{ opacity: 1, transform: 'scale(0.08)' }, { opacity: 0, transform: 'scale(1.9)' }],
            'cubic-bezier(0.04,0.94,0.16,1)');
        // 8 blazing sun rays (upgrade from 2)
        for (let i = 0; i < 8; i++) {
            const baseDeg = i * 45;
            const drift = (i % 2 === 0 ? 1 : -1) * (6 + Math.random() * 5);
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${i % 2 === 0 ? 5 : 3}px;height:${i % 2 === 0 ? 210 : 170}px;` +
                    `left:${hx - (i % 2 === 0 ? 2.5 : 1.5)}px;top:${hy - (i % 2 === 0 ? 105 : 85)}px;` +
                    `background:linear-gradient(to bottom,transparent 4%,rgba(255,255,200,0.98) 30%,rgba(251,191,36,1) 58%,transparent 96%);` +
                    `border-radius:3px;pointer-events:none;transform-origin:center center;` +
                    `box-shadow:0 0 8px rgba(245,158,11,0.5);`,
                    400 + Math.random() * 60,
                    [{ opacity: 1, transform: `rotate(${baseDeg}deg) scaleY(0.05)` },
                     { opacity: 0, transform: `rotate(${baseDeg + drift}deg) scaleY(1.25)` }],
                    'cubic-bezier(0.05,0.9,0.22,1)');
            }, i * 18);
        }
        // 14 gold spark shards bursting outward
        for (let i = 0; i < 14; i++) {
            const ang = (Math.PI * 2 / 14) * i + (Math.random() - 0.5) * 0.3;
            const dist = 70 + Math.random() * 55;
            const isWhite = Math.random() > 0.6;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${5 + Math.random() * 6}px;height:${13 + Math.random() * 10}px;` +
                    `left:${hx - 4}px;top:${hy - 7}px;` +
                    `background:${isWhite ? 'rgba(255,255,220,0.98)' : '#fde047'};` +
                    `box-shadow:0 0 ${isWhite ? 10 : 7}px ${isWhite ? 'rgba(255,255,200,0.9)' : '#f59e0b'};` +
                    `border-radius:3px;pointer-events:none;`,
                    300 + Math.random() * 120,
                    [{ opacity: 1, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,0) scale(1)` },
                     { opacity: 0, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,-${dist}px) scale(0.1)` }]);
            }, Math.random() * 80);
        }
        // Rotating star frame
        spawn(
            `position:absolute;width:130px;height:130px;left:${hx - 65}px;top:${hy - 65}px;` +
            `border:3px solid rgba(253,224,71,0.85);border-radius:8px;` +
            `box-shadow:0 0 24px rgba(245,158,11,0.62),inset 0 0 18px rgba(253,224,71,0.22);pointer-events:none;`,
            640,
            [{ opacity: 1, transform: 'scale(0.06) rotate(-15deg)' }, { opacity: 0, transform: 'scale(1.75) rotate(45deg)' }],
            'cubic-bezier(0.05,0.92,0.18,1)');
        // Bright white inner core burst
        spawn(
            `position:absolute;width:60px;height:60px;left:${hx - 30}px;top:${hy - 30}px;` +
            `background:radial-gradient(circle,rgba(255,255,255,0.98) 0%,rgba(255,255,200,0.8) 40%,transparent 75%);` +
            `border-radius:50%;pointer-events:none;`,
            260,
            [{ opacity: 1, transform: 'scale(0.05)' }, { opacity: 0, transform: 'scale(1.6)' }],
            'ease-out');
        // Sustained blazing gold halo
        spawn(
            `position:absolute;width:138px;height:138px;left:${hx - 69}px;top:${hy - 69}px;` +
            `border-radius:50%;border:2px solid rgba(251,191,36,0.52);` +
            `box-shadow:0 0 28px rgba(245,158,11,0.48),inset 0 0 20px rgba(253,224,71,0.22);pointer-events:none;`,
            1050,
            [{ opacity: 0, transform: 'scale(0.88)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.12)' }],
            'ease-in-out');
    } else if (id === 'MORIMORI') {
        // Full-screen electric flash
        const mFlash = document.createElement('div');
        mFlash.style.cssText = `position:fixed;inset:0;background:rgba(56,189,248,0.14);pointer-events:none;z-index:9999;`;
        document.body.appendChild(mFlash);
        mFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => mFlash.remove(), 320);
        // 7 horizontal speed streaks at varied y-offsets — two waves
        [-28, -12, 4, 18, 32].forEach((oy, i) => {
            const w = 60 + Math.random() * 55;
            const goRight = i % 2 === 0;
            setTimeout(() => {
                spawn(
                    `position:absolute;height:${i === 2 ? 3 : 2}px;width:${w}px;` +
                    `left:${goRight ? hx - 100 : hx + 40}px;top:${hy + oy}px;` +
                    `background:linear-gradient(to right,transparent,rgba(56,189,248,${0.9 - i * 0.08}),rgba(186,230,253,0.6),transparent);` +
                    `border-radius:2px;pointer-events:none;`,
                    200 + i * 15,
                    goRight
                        ? [{ opacity: 1, transform: 'scaleX(0.06) translateX(-60px)' }, { opacity: 0, transform: 'scaleX(1) translateX(80px)' }]
                        : [{ opacity: 1, transform: 'scaleX(0.06) translateX(60px)' }, { opacity: 0, transform: 'scaleX(1) translateX(-80px)' }],
                    'ease-in');
            }, i * 38);
        });
        // 2 staggered ring pulses
        [0, 140].forEach((delay, i) => {
            const sz = 105 + i * 55;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:2px solid rgba(56,189,248,${0.85 - i * 0.25});border-radius:50%;` +
                    `box-shadow:0 0 ${14 + i * 8}px rgba(14,165,233,0.55);pointer-events:none;`,
                    420 + i * 60,
                    [{ opacity: 1, transform: 'scale(0.22)' }, { opacity: 0, transform: 'scale(1.95)' }],
                    'cubic-bezier(0.08,0.88,0.2,1)');
            }, delay);
        });
        // Central electric burst
        spawn(
            `position:absolute;width:145px;height:145px;left:${hx - 72.5}px;top:${hy - 72.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(186,230,253,0.8) 0%,rgba(56,189,248,0.38) 40%,transparent 70%);pointer-events:none;`,
            400,
            [{ opacity: 1, transform: 'scale(0.12)' }, { opacity: 0, transform: 'scale(1.8)' }],
            'cubic-bezier(0.05,0.92,0.18,1)');
        // 10 electric spark particles radiating outward
        for (let i = 0; i < 10; i++) {
            const ang = (Math.PI * 2 / 10) * i + (Math.random() - 0.5) * 0.3;
            const dist = 65 + Math.random() * 45;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:3px;height:${10 + Math.random() * 8}px;left:${hx - 1.5}px;top:${hy - 5}px;` +
                    `background:linear-gradient(to bottom,rgba(186,230,253,0.98),rgba(56,189,248,0.75));` +
                    `border-radius:2px;box-shadow:0 0 6px rgba(14,165,233,0.7);pointer-events:none;`,
                    260 + Math.random() * 100,
                    [{ opacity: 1, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,0) scale(1)` },
                     { opacity: 0, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,-${dist}px) scale(0.1)` }]);
            }, Math.random() * 70);
        }
        // 4 diagonal lightning streaks
        [-45, 45, -135, 135].forEach((deg, i) => {
            setTimeout(() => {
                spawn(
                    `position:absolute;width:2px;height:55px;left:${hx - 1}px;top:${hy - 27.5}px;` +
                    `background:linear-gradient(to bottom,transparent,rgba(186,230,253,0.92),transparent);` +
                    `border-radius:1px;pointer-events:none;transform-origin:center center;`,
                    280,
                    [{ opacity: 1, transform: `rotate(${deg}deg) scaleY(0.05)` }, { opacity: 0, transform: `rotate(${deg}deg) scaleY(1) translateY(-15px)` }],
                    'ease-out');
            }, i * 30 + 20);
        });
        // Sustained electric halo
        spawn(
            `position:absolute;width:128px;height:128px;left:${hx - 64}px;top:${hy - 64}px;` +
            `border-radius:50%;border:2px solid rgba(56,189,248,0.48);` +
            `box-shadow:0 0 22px rgba(14,165,233,0.42),inset 0 0 16px rgba(186,230,253,0.2);pointer-events:none;`,
            950,
            [{ opacity: 0, transform: 'scale(0.88)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }],
            'ease-in-out');
    } else if (id === 'JIWAJIWA') {
        // 5 staggered expanding rings — layered pulse
        [0, 110, 220, 340, 460].forEach((delay, i) => {
            const sz = 80 + i * 32;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:${3 - Math.floor(i / 2)}px solid rgba(74,222,128,${0.88 - i * 0.12});border-radius:50%;` +
                    `box-shadow:0 0 ${14 + i * 5}px rgba(34,197,94,0.55);pointer-events:none;`,
                    680 + i * 35,
                    [{ opacity: 0.92, transform: 'scale(0.28)' }, { opacity: 0, transform: 'scale(2.0)' }],
                    'cubic-bezier(0.1,0.85,0.22,1)');
            }, delay);
        });
        // Large radial bloom
        spawn(
            `position:absolute;width:175px;height:175px;left:${hx - 87.5}px;top:${hy - 87.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(187,247,208,0.78) 0%,rgba(74,222,128,0.38) 42%,transparent 72%);pointer-events:none;`,
            720, [{ opacity: 0.95, transform: 'scale(0.12)' }, { opacity: 0, transform: 'scale(1.65)' }],
            'cubic-bezier(0.05,0.9,0.18,1)');
        // 16 rising healing orbs
        for (let i = 0; i < 16; i++) {
            const ox = (Math.random() - 0.5) * 90;
            const sz = 5 + Math.random() * 8;
            const rise = 75 + Math.random() * 65;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx + ox - sz / 2}px;top:${hy - sz / 2}px;` +
                    `background:radial-gradient(circle,rgba(187,247,208,0.98),rgba(74,222,128,0.72));` +
                    `border-radius:50%;box-shadow:0 0 9px rgba(34,197,94,0.7);pointer-events:none;`,
                    520 + Math.random() * 380,
                    [{ opacity: 0.92, transform: 'translateY(0) scale(1)' },
                     { opacity: 0, transform: `translateY(-${rise}px) scale(0.12)` }]);
            }, Math.random() * 320);
        }
        // Cross-shaped healing beams
        [0, 90, 180, 270].forEach((deg, i) => {
            setTimeout(() => {
                spawn(
                    `position:absolute;width:3px;height:70px;left:${hx - 1.5}px;top:${hy - 35}px;` +
                    `background:linear-gradient(to bottom,transparent,rgba(134,239,172,0.92),transparent);` +
                    `border-radius:2px;pointer-events:none;transform-origin:center center;`,
                    400,
                    [{ opacity: 1, transform: `rotate(${deg}deg) scale(1,0.05)` }, { opacity: 0, transform: `rotate(${deg}deg) scale(1.2,1)` }],
                    'ease-out');
            }, i * 38 + 40);
        });
        // 8 leaf-sparkles radiating outward
        for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 / 8) * i;
            const dist = 50 + Math.random() * 32;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:4px;height:13px;left:${hx - 2}px;top:${hy - 6.5}px;` +
                    `background:linear-gradient(to top,rgba(134,239,172,0.92),rgba(187,247,208,0.55));` +
                    `border-radius:50% 50% 30% 30%;box-shadow:0 0 6px rgba(74,222,128,0.55);pointer-events:none;`,
                    400 + Math.random() * 130,
                    [{ opacity: 1, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,0) scale(1)` },
                     { opacity: 0, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,-${dist}px) scale(0.18)` }]);
            }, i * 42);
        }
        // Sustained hero glow halo
        spawn(
            `position:absolute;width:115px;height:115px;left:${hx - 57.5}px;top:${hy - 57.5}px;` +
            `border-radius:50%;border:2px solid rgba(134,239,172,0.55);` +
            `box-shadow:0 0 22px rgba(34,197,94,0.4),inset 0 0 14px rgba(74,222,128,0.22);pointer-events:none;`,
            950,
            [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08)' }],
            'ease-in-out');
    } else if (id === 'WAKUWAKU') {
        // Full-screen orange energy flash
        const wFlash = document.createElement('div');
        wFlash.style.cssText = `position:fixed;inset:0;background:rgba(251,146,60,0.16);pointer-events:none;z-index:9999;`;
        document.body.appendChild(wFlash);
        wFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => wFlash.remove(), 380);
        // 4 expanding orange energy rings
        [0, 120, 240, 360].forEach((delay, i) => {
            const sz = 95 + i * 38;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:${3 - Math.floor(i / 2)}px solid rgba(251,146,60,${0.9 - i * 0.15});border-radius:50%;` +
                    `box-shadow:0 0 ${16 + i * 6}px rgba(249,115,22,0.65);pointer-events:none;`,
                    560 + i * 50,
                    [{ opacity: 1, transform: 'scale(0.2)' }, { opacity: 0, transform: 'scale(1.9)' }],
                    'cubic-bezier(0.1,0.88,0.2,1)');
            }, delay);
        });
        // Central orange bloom
        spawn(
            `position:absolute;width:165px;height:165px;left:${hx - 82.5}px;top:${hy - 82.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(254,215,170,0.82) 0%,rgba(251,146,60,0.45) 38%,transparent 70%);pointer-events:none;`,
            680,
            [{ opacity: 1, transform: 'scale(0.1)' }, { opacity: 0, transform: 'scale(1.7)' }],
            'cubic-bezier(0.05,0.92,0.18,1)');
        // 8 sunburst rays
        for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 / 8) * i;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:3px;height:68px;left:${hx - 1.5}px;top:${hy - 34}px;` +
                    `background:linear-gradient(to bottom,rgba(254,215,170,0.95),rgba(251,146,60,0.7),transparent);` +
                    `border-radius:2px;pointer-events:none;transform-origin:center bottom;`,
                    380,
                    [{ opacity: 1, transform: `rotate(${ang * 57.3}deg) scaleY(0.05)` },
                     { opacity: 0, transform: `rotate(${ang * 57.3}deg) scaleY(1) translateY(-18px)` }],
                    'ease-out');
            }, i * 22);
        }
        // 16 rising fire sparks
        for (let i = 0; i < 16; i++) {
            const ox = (Math.random() - 0.5) * 80;
            const sz = 5 + Math.random() * 7;
            const rise = 65 + Math.random() * 60;
            const isGold = Math.random() > 0.5;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz * 1.6}px;left:${hx + ox - sz / 2}px;top:${hy - sz / 2}px;` +
                    `background:radial-gradient(circle,${isGold ? 'rgba(253,224,71,0.98),rgba(234,179,8,0.75)' : 'rgba(254,215,170,0.98),rgba(249,115,22,0.72)'});` +
                    `border-radius:50% 50% 35% 35%;box-shadow:0 0 8px rgba(249,115,22,0.7);pointer-events:none;`,
                    450 + Math.random() * 320,
                    [{ opacity: 0.95, transform: 'translateY(0) scale(1)' },
                     { opacity: 0, transform: `translateY(-${rise}px) scale(0.1)` }]);
            }, Math.random() * 280);
        }
        // Rotating diamond frame
        spawn(
            `position:absolute;width:118px;height:118px;left:${hx - 59}px;top:${hy - 59}px;` +
            `border:2px solid rgba(251,146,60,0.82);border-radius:6px;` +
            `box-shadow:0 0 20px rgba(249,115,22,0.55),inset 0 0 14px rgba(253,186,116,0.22);pointer-events:none;`,
            580,
            [{ opacity: 1, transform: 'scale(0.1) rotate(-20deg)' }, { opacity: 0, transform: 'scale(1.65) rotate(45deg)' }],
            'cubic-bezier(0.06,0.9,0.2,1)');
        // Sustained orange halo
        spawn(
            `position:absolute;width:125px;height:125px;left:${hx - 62.5}px;top:${hy - 62.5}px;` +
            `border-radius:50%;border:2px solid rgba(251,146,60,0.48);` +
            `box-shadow:0 0 24px rgba(249,115,22,0.42),inset 0 0 16px rgba(253,186,116,0.2);pointer-events:none;`,
            1000,
            [{ opacity: 0, transform: 'scale(0.88)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }],
            'ease-in-out');
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
        // Full-screen metallic flash
        const flash = document.createElement('div');
        flash.style.cssText = `position:fixed;inset:0;background:rgba(203,213,225,0.2);pointer-events:none;z-index:9999;`;
        document.body.appendChild(flash);
        flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => flash.remove(), 360);
        // 3 expanding shield rings at staggered delays
        [0, 130, 260].forEach((delay, i) => {
            const sz = 115 + i * 48;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:${4 - i}px solid rgba(203,213,225,${0.92 - i * 0.2});border-radius:50%;` +
                    `box-shadow:0 0 ${20 + i * 7}px rgba(148,163,184,0.72),inset 0 0 ${10 + i * 4}px rgba(203,213,225,0.32);pointer-events:none;`,
                    560 + i * 55,
                    [{ opacity: 1, transform: 'scale(0.18)' }, { opacity: 0, transform: 'scale(1.85)' }],
                    'cubic-bezier(0.12,0.88,0.22,1)');
            }, delay);
        });
        // Rotating square frame (armor plate)
        spawn(
            `position:absolute;width:125px;height:125px;left:${hx - 62.5}px;top:${hy - 62.5}px;` +
            `border:3px solid rgba(226,232,240,0.88);border-radius:6px;` +
            `box-shadow:0 0 22px rgba(203,213,225,0.65),inset 0 0 16px rgba(148,163,184,0.28);pointer-events:none;`,
            620,
            [{ opacity: 1, transform: 'scale(0.08) rotate(0deg)' }, { opacity: 0, transform: 'scale(1.7) rotate(45deg)' }],
            'cubic-bezier(0.05,0.92,0.18,1)');
        // 12 metallic shard fragments bursting outward
        for (let i = 0; i < 12; i++) {
            const ang = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.4;
            const dist = 80 + Math.random() * 55;
            const w = 6 + Math.random() * 9, h = 14 + Math.random() * 12;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${w}px;height:${h}px;left:${hx - w / 2}px;top:${hy - h / 2}px;` +
                    `background:linear-gradient(135deg,rgba(241,245,249,0.98),rgba(148,163,184,0.88));` +
                    `border-radius:2px;box-shadow:0 0 9px rgba(203,213,225,0.85);pointer-events:none;`,
                    310 + Math.random() * 130,
                    [{ opacity: 1, transform: `translate(0,0) rotate(${ang * 57.3}deg) scale(1)` },
                     { opacity: 0, transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) rotate(${ang * 57.3 + 210}deg) scale(0.08)` }],
                    'cubic-bezier(0.04,0.82,0.18,1)');
            }, Math.random() * 90);
        }
        // Central crystal burst
        spawn(
            `position:absolute;width:90px;height:90px;left:${hx - 45}px;top:${hy - 45}px;` +
            `background:radial-gradient(circle,rgba(241,245,249,0.95) 0%,rgba(203,213,225,0.62) 38%,transparent 72%);` +
            `border-radius:50%;pointer-events:none;`,
            340,
            [{ opacity: 1, transform: 'scale(0.08)' }, { opacity: 0, transform: 'scale(1.5)' }],
            'ease-out');
        // 4 shockwave arms radiating outward
        [0, 90, 180, 270].forEach((deg, i) => {
            setTimeout(() => {
                spawn(
                    `position:absolute;width:3px;height:60px;left:${hx - 1.5}px;top:${hy - 30}px;` +
                    `background:linear-gradient(to bottom,rgba(241,245,249,0.92),transparent);` +
                    `border-radius:2px;pointer-events:none;transform-origin:center bottom;`,
                    320,
                    [{ opacity: 1, transform: `rotate(${deg}deg) scaleY(0.06)` }, { opacity: 0, transform: `rotate(${deg}deg) scaleY(1) translateY(-20px)` }],
                    'ease-out');
            }, i * 28);
        });
        // Sustained steel-glow halo
        spawn(
            `position:absolute;width:130px;height:130px;left:${hx - 65}px;top:${hy - 65}px;` +
            `border-radius:50%;border:2px solid rgba(203,213,225,0.5);` +
            `box-shadow:0 0 25px rgba(148,163,184,0.45),inset 0 0 18px rgba(203,213,225,0.2);pointer-events:none;`,
            1000,
            [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }],
            'ease-in-out');
    } else if (id === 'SUKKIRI') {
        // Cool blue-white screen flash
        const sFlash = document.createElement('div');
        sFlash.style.cssText = `position:fixed;inset:0;background:rgba(186,230,253,0.18);pointer-events:none;z-index:9999;`;
        document.body.appendChild(sFlash);
        sFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => sFlash.remove(), 340);
        // 4 expanding ripple rings (water surface pulse)
        [0, 110, 220, 340].forEach((delay, i) => {
            const sz = 70 + i * 36;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `border:${2 - Math.floor(i / 2)}px solid rgba(56,189,248,${0.88 - i * 0.16});border-radius:50%;` +
                    `box-shadow:0 0 ${12 + i * 5}px rgba(14,165,233,0.52);pointer-events:none;`,
                    620 + i * 35,
                    [{ opacity: 0.9, transform: 'scale(0.22)' }, { opacity: 0, transform: 'scale(2.05)' }],
                    'cubic-bezier(0.08,0.88,0.2,1)');
            }, delay);
        });
        // Central cool radial bloom
        spawn(
            `position:absolute;width:155px;height:155px;left:${hx - 77.5}px;top:${hy - 77.5}px;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(224,247,255,0.88) 0%,rgba(125,211,252,0.52) 38%,transparent 68%);pointer-events:none;`,
            640, [{ opacity: 1, transform: 'scale(0.08)' }, { opacity: 0, transform: 'scale(1.72)' }],
            'cubic-bezier(0.05,0.9,0.18,1)');
        // 14 water droplets / sparkles bursting outward
        for (let i = 0; i < 14; i++) {
            const ang = Math.random() * Math.PI * 2;
            const dist = 45 + Math.random() * 58;
            const sz = 3.5 + Math.random() * 5.5;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz * 1.45}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `background:radial-gradient(circle,rgba(224,247,255,0.98),rgba(56,189,248,0.72));` +
                    `border-radius:50% 50% 40% 40%;box-shadow:0 0 7px rgba(14,165,233,0.65);pointer-events:none;`,
                    400 + Math.random() * 330,
                    [{ opacity: 0.95, transform: 'translate(0,0) scale(1)' },
                     { opacity: 0, transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist - 18}px) scale(0.1)` }]);
            }, Math.random() * 270);
        }
        // 4 water-beam cross streams
        [0, 90, 180, 270].forEach((deg, i) => {
            setTimeout(() => {
                spawn(
                    `position:absolute;width:3px;height:60px;left:${hx - 1.5}px;top:${hy - 30}px;` +
                    `background:linear-gradient(to bottom,transparent,rgba(125,211,252,0.88),transparent);` +
                    `border-radius:2px;pointer-events:none;transform-origin:center center;`,
                    360,
                    [{ opacity: 1, transform: `rotate(${deg}deg) scale(1,0.04)` }, { opacity: 0, transform: `rotate(${deg}deg) scale(1.1,1)` }],
                    'ease-out');
            }, i * 32 + 40);
        });
        // Sustained refreshing halo
        spawn(
            `position:absolute;width:110px;height:110px;left:${hx - 55}px;top:${hy - 55}px;` +
            `border-radius:50%;border:2px solid rgba(56,189,248,0.52);` +
            `box-shadow:0 0 20px rgba(14,165,233,0.4),inset 0 0 13px rgba(125,211,252,0.2);pointer-events:none;`,
            900,
            [{ opacity: 0, transform: 'scale(0.86)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }],
            'ease-in-out');
    } else if (id === 'PITTARI') {
        // Sharp gold flash — "lock acquired"
        const pFlash = document.createElement('div');
        pFlash.style.cssText = `position:fixed;inset:0;background:rgba(234,179,8,0.18);pointer-events:none;z-index:9999;`;
        document.body.appendChild(pFlash);
        pFlash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => pFlash.remove(), 300);
        // 3 concentric rings contracting inward (targeting lock-on)
        [0, 85, 170].forEach((delay, i) => {
            const startSz = 230 - i * 48;
            const lockScale = 58 / startSz;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${startSz}px;height:${startSz}px;left:${hx - startSz / 2}px;top:${hy - startSz / 2}px;` +
                    `border:2px solid rgba(234,179,8,${0.58 + i * 0.15});border-radius:50%;` +
                    `box-shadow:0 0 ${14 + i * 4}px rgba(234,179,8,0.52);pointer-events:none;`,
                    520,
                    [{ opacity: 0.88, transform: 'scale(1)' }, { opacity: 0.95, transform: `scale(${lockScale})` }, { opacity: 0, transform: `scale(${lockScale * 0.6})` }],
                    'cubic-bezier(0.45,0,0.55,1)');
            }, delay);
        });
        // 8 convergence dashes flying inward from outside
        for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 / 8) * i;
            const dist = 90 + Math.random() * 38;
            const sx = Math.cos(ang) * dist;
            const sy = Math.sin(ang) * dist;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:2px;height:18px;left:${hx + sx - 1}px;top:${hy + sy - 9}px;` +
                    `background:rgba(253,224,71,0.92);border-radius:2px;pointer-events:none;` +
                    `box-shadow:0 0 6px rgba(234,179,8,0.8);`,
                    330,
                    [{ opacity: 1, transform: `rotate(${ang * 57.3 + 90}deg) translate(0,0) scale(1)` },
                     { opacity: 0.5, transform: `rotate(${ang * 57.3 + 90}deg) translate(${-sx * 0.72}px,${-sy * 0.72}px) scale(0.6)` },
                     { opacity: 0, transform: `rotate(${ang * 57.3 + 90}deg) translate(${-sx}px,${-sy}px) scale(0.15)` }],
                    'ease-in');
            }, i * 20 + 45);
        }
        // Central target-acquired burst
        spawn(
            `position:absolute;width:68px;height:68px;left:${hx - 34}px;top:${hy - 34}px;` +
            `background:radial-gradient(circle,rgba(253,224,71,0.98) 0%,rgba(234,179,8,0.72) 32%,transparent 68%);` +
            `border-radius:50%;pointer-events:none;`,
            340, [{ opacity: 1, transform: 'scale(0.06)' }, { opacity: 0, transform: 'scale(1.5)' }],
            'cubic-bezier(0.04,0.9,0.18,1)');
        // Inner precision reticle ring
        spawn(
            `position:absolute;width:54px;height:54px;left:${hx - 27}px;top:${hy - 27}px;` +
            `border:2px solid rgba(253,224,71,0.9);border-radius:50%;` +
            `box-shadow:0 0 14px rgba(234,179,8,0.72),inset 0 0 8px rgba(253,224,71,0.28);pointer-events:none;`,
            720,
            [{ opacity: 1, transform: 'scale(0.08) rotate(-60deg)' }, { opacity: 0.9, transform: 'scale(1) rotate(0deg)' }, { opacity: 0, transform: 'scale(1.3) rotate(30deg)' }],
            'cubic-bezier(0.1,0.88,0.2,1)');
        // Rotating outer diamond frame
        spawn(
            `position:absolute;width:102px;height:102px;left:${hx - 51}px;top:${hy - 51}px;` +
            `border:2px solid rgba(234,179,8,0.75);border-radius:6px;` +
            `box-shadow:0 0 18px rgba(234,179,8,0.5);pointer-events:none;`,
            600,
            [{ opacity: 1, transform: 'scale(0.1) rotate(0deg)' }, { opacity: 0, transform: 'scale(1.58) rotate(45deg)' }],
            'cubic-bezier(0.06,0.9,0.2,1)');
        // 6 gold sparks radiating outward
        for (let i = 0; i < 6; i++) {
            const ang = (Math.PI * 2 / 6) * i;
            const dist = 52 + Math.random() * 28;
            const sz = 4 + Math.random() * 4;
            setTimeout(() => {
                spawn(
                    `position:absolute;width:${sz}px;height:${sz}px;left:${hx - sz / 2}px;top:${hy - sz / 2}px;` +
                    `background:rgba(253,224,71,0.98);border-radius:50%;` +
                    `box-shadow:0 0 8px rgba(234,179,8,0.9);pointer-events:none;`,
                    340 + Math.random() * 160,
                    [{ opacity: 1, transform: 'translate(0,0) scale(1)' },
                     { opacity: 0, transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(0.06)` }]);
            }, i * 30 + 55);
        }
        // Sustained precision halo
        spawn(
            `position:absolute;width:116px;height:116px;left:${hx - 58}px;top:${hy - 58}px;` +
            `border-radius:50%;border:1.5px solid rgba(234,179,8,0.45);` +
            `box-shadow:0 0 22px rgba(234,179,8,0.38),inset 0 0 15px rgba(253,224,71,0.18);pointer-events:none;`,
            1000,
            [{ opacity: 0, transform: 'scale(0.88)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.1)' }],
            'ease-in-out');
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
