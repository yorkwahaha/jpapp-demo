(function () {
    const api = window.__JPAPP_VFX || window.JPAPP_VFX || {};

    function spawnFloatingDamage(target, amount, type = 'hp', extras = null) {
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

        const vfxShakeSettings = window.__JPAPP_VFX_HELPER_SETTINGS;
        const allowShake = vfxShakeSettings == null ? true : vfxShakeSettings.screenShake !== false;
        const stageEl = document.getElementById('stage');
        if (stageEl && allowShake) {
            const jitter = () => ({
                dx: (Math.random() - 0.5) * 44,
                dy: (Math.random() - 0.5) * 44
            });
            const pulses = [
                { t: 0, d: 36 },
                { t: 48, d: 34 },
                { t: 98, d: 32 },
                { t: 138, d: 28 }
            ];
            pulses.forEach(({ t, d }) => {
                setTimeout(() => {
                    const j = jitter();
                    stageEl.style.transform = `translate(${j.dx}px,${j.dy}px)`;
                    setTimeout(() => { stageEl.style.transform = ''; }, d);
                }, t);
            });
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

        const tImpact = 52;

        // 前搖：聚光收束（縮短、更亮以便與命中核緊咬）
        spawn(
            `position:absolute;width:128px;height:128px;left:${x - 64}px;top:${y - 64}px;z-index:20;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,254,249,0.72) 0%,rgba(254,243,199,0.5) 36%,rgba(251,191,36,0.34) 56%,transparent 74%);` +
            `box-shadow:0 0 34px rgba(251,191,36,0.48),0 0 52px rgba(255,255,255,0.22),inset 0 0 20px rgba(255,255,255,0.16);`,
            98,
            [
                { opacity: 0.62, transform: 'scale(1.26)' },
                { opacity: 1, transform: 'scale(0.7)' },
                { opacity: 0, transform: 'scale(0.52)' }
            ],
            'cubic-bezier(0.32, 0, 0.15, 1)',
            0
        );
        [[-36, 1], [36, -1]].forEach(([rot, dir]) => {
            spawn(
                `position:absolute;width:3px;height:122px;left:${x - 1.5}px;top:${y - 61}px;z-index:21;pointer-events:none;` +
                `transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(to bottom,transparent 8%,rgba(255,253,246,0.72) 40%,rgba(253,224,71,0.92) 50%,transparent 92%);` +
                `box-shadow:0 0 12px rgba(255,255,255,0.68),0 0 14px rgba(251,191,36,0.45);`,
                102,
                [
                    { opacity: 0.2, transform: `rotate(${rot}deg) scaleY(0.14)` },
                    { opacity: 0.95, transform: `rotate(${rot + dir * 5}deg) scaleY(0.52)` },
                    { opacity: 0, transform: `rotate(${rot + dir * 8}deg) scaleY(0.62)` }
                ],
                'cubic-bezier(0.28, 0.82, 0.32, 1)',
                0
            );
        });

        // 超短白金硬閃（讀取「強化穿刺」第一印象）
        spawn(
            `position:absolute;width:64px;height:64px;left:${x - 32}px;top:${y - 32}px;z-index:31;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(255,250,218,0.55) 45%,transparent 70%);` +
            `box-shadow:0 0 4px #fff,0 0 22px rgba(255,255,255,1),0 0 42px rgba(254,249,195,0.55);`,
            44,
            [
                { opacity: 0, transform: 'scale(0.2)' },
                { opacity: 1, transform: 'scale(0.95)' },
                { opacity: 0, transform: 'scale(1.05)' }
            ],
            'cubic-bezier(0.08, 0.92, 0.2, 1)',
            tImpact
        );

        // 命中核：金白集中爆閃（更亮更大）
        spawn(
            `position:absolute;width:46px;height:46px;left:${x - 23}px;top:${y - 23}px;z-index:26;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,#fff 0%,rgba(255,252,240,0.98) 11%,rgba(253,224,71,0.95) 24%,rgba(251,191,36,0.62) 44%,transparent 72%);` +
            `box-shadow:0 0 2px #fff,0 0 16px rgba(255,255,255,1),0 0 34px rgba(254,249,195,0.72),0 0 52px rgba(251,191,36,0.42);`,
            74,
            [
                { opacity: 0, transform: 'scale(0.24)' },
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0.78, transform: 'scale(1.06)' },
                { opacity: 0, transform: 'scale(1.22)' }
            ],
            'cubic-bezier(0.12, 0.62, 0.2, 1)',
            tImpact
        );
        spawn(
            `position:absolute;width:56px;height:56px;left:${x - 28}px;top:${y - 28}px;z-index:25;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;border:2px solid rgba(255,252,240,1);` +
            `box-shadow:0 0 12px rgba(255,255,255,0.92),0 0 30px rgba(251,191,36,0.72),inset 0 0 8px rgba(255,255,255,0.32);`,
            238,
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
            `position:absolute;width:104px;height:104px;left:${x - 52}px;top:${y - 52}px;z-index:23;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,rgba(255,254,251,0.98) 0%,rgba(253,224,71,0.82) 36%,rgba(251,191,36,0.52) 52%,rgba(251,146,60,0.14) 66%,transparent 78%);` +
            `box-shadow:0 0 40px rgba(254,229,154,0.55),0 0 62px rgba(251,146,60,0.22);`,
            296,
            [{ opacity: 1, transform: 'scale(0.14)' }, { opacity: 0, transform: 'scale(2.72)' }],
            'cubic-bezier(0.05, 0.9, 0.18, 1)',
            tImpact
        );

        [0, 45, 90, 135].forEach((deg) => {
            spawn(
                `position:absolute;width:140px;height:3px;left:${x - 70}px;top:${y - 1.5}px;z-index:30;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(90deg,transparent 4%,rgba(255,255,255,0.97) 44%,rgba(254,249,195,0.98) 50%,rgba(251,191,36,0.85) 56%,transparent 96%);` +
                `box-shadow:0 0 10px rgba(255,255,255,0.95),0 0 18px rgba(251,191,36,0.55);border-radius:2px;`,
                115,
                [
                    { opacity: 0, transform: `rotate(${deg}deg) scaleX(0.08)` },
                    { opacity: 1, transform: `rotate(${deg}deg) scaleX(1)` },
                    { opacity: 0, transform: `rotate(${deg}deg) scaleX(0.56)` }
                ],
                'cubic-bezier(0.12, 0.88, 0.26, 1)',
                tImpact + 6
            );
        });

        // 刺入軸 + 極細短促斬線（高光芯、讀成「切進去」而非光團）
        spawn(
            `position:absolute;width:2px;height:108px;left:${x - 1}px;top:${y - 54}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
            `background:linear-gradient(to bottom,transparent 6%,rgba(255,255,255,1) 44%,#fff 50%,rgba(255,248,218,1) 56%,transparent 94%);` +
            `box-shadow:0 0 10px rgba(255,255,255,1),0 0 6px rgba(253,224,71,0.95);border-radius:1px;`,
            65,
            [
                { opacity: 0, transform: 'scaleY(0.12)' },
                { opacity: 1, transform: 'scaleY(1)' },
                { opacity: 0, transform: 'scaleY(1.06)' }
            ],
            'cubic-bezier(0.18, 0.75, 0.2, 1)',
            tImpact
        );
        [[-11, 1], [11, -1], [-88, 1], [88, -1]].forEach(([rot, dir], si) => {
            spawn(
                `position:absolute;width:1.5px;height:96px;left:${x - 0.75}px;top:${y - 48}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
                `background:linear-gradient(to bottom,transparent 8%,rgba(255,255,255,1) 42%,rgba(254,249,232,0.98) 50%,rgba(253,224,71,0.85) 62%,transparent 92%);` +
                `box-shadow:0 0 8px rgba(255,255,255,0.95),0 0 6px rgba(251,191,36,0.55);border-radius:1px;`,
                78 + si * 6,
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
        for (let i = 0; i < 14; i++) {
            const ang = (Math.PI * 2 / 14) * i + (i % 2 ? 0.07 : -0.05);
            const dist = 26 + Math.random() * 28;
            const len = 6 + Math.random() * 9;
            spawn(
                `position:absolute;width:3.5px;height:${len}px;left:${x - 1.75}px;top:${y - len / 2}px;z-index:27;pointer-events:none;mix-blend-mode:screen;` +
                `border-radius:1px;` +
                `background:linear-gradient(to top,transparent,rgba(255,255,255,0.98),#fff7c2,rgba(251,191,36,0.98));` +
                `box-shadow:0 0 8px rgba(255,255,255,0.88),0 0 8px rgba(251,191,36,0.72);`,
                128 + Math.random() * 48,
                [
                    { opacity: 1, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,0) scaleY(0.35)` },
                    { opacity: 0.9, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist * 0.32}px) scaleY(1)` },
                    { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist}px) scaleY(0.08)` }
                ],
                'cubic-bezier(0.2, 0.82, 0.32, 1)',
                tImpact + Math.floor(Math.random() * 14)
            );
        }
        for (let i = 0; i < 8; i++) {
            const r = i * 45;
            spawn(
                `position:absolute;width:22px;height:2px;left:${x - 11}px;top:${y - 1}px;z-index:28;pointer-events:none;mix-blend-mode:screen;` +
                `border-radius:1px;` +
                `background:linear-gradient(90deg,transparent,rgba(255,255,255,1),rgba(255,250,220,0.96),rgba(251,191,36,0.65),transparent);` +
                `box-shadow:0 0 10px rgba(255,255,255,0.95),0 0 8px rgba(251,191,36,0.55);`,
                112,
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
            `position:absolute;width:112px;height:112px;left:${x - 56}px;top:${y - 56}px;z-index:19;pointer-events:none;` +
            `border-radius:50%;` +
            `background:radial-gradient(circle,transparent 0%,rgba(255,241,210,0.34) 36%,rgba(251,191,36,0.2) 56%,transparent 76%);`,
            125,
            [{ opacity: 0.68, transform: 'scale(0.9)' }, { opacity: 0, transform: 'scale(1.28)' }],
            'ease-out',
            tImpact + 58
        );
    }

    /** GIRAGIRA 爆裂衝擊層（白金色放射、shockwave，角度全為索引決定性，不依 random） */
    function spawnGiraGiraBurstVfx(x, y) {
        const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
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
            const jb = () => ({
                bx: (Math.random() - 0.5) * 52,
                by: (Math.random() - 0.5) * 52
            });
            const b = jb();
            stageBurst.style.transform = `translate(${b.bx}px,${b.by}px)`;
            setTimeout(() => { stageBurst.style.transform = ''; }, 42);
            setTimeout(() => {
                const c = jb();
                stageBurst.style.transform = `translate(${c.bx}px,${c.by}px)`;
                setTimeout(() => { stageBurst.style.transform = ''; }, 32);
            }, 76);
        }

        const t0 = 8;

        // 中心強白光閃（更亮更大）
        spawn(
            `position:absolute;width:152px;height:152px;left:${x - 76}px;top:${y - 76}px;z-index:35;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:50%;background:radial-gradient(circle,#fff 0%,rgba(255,253,246,0.72) 32%,rgba(253,224,71,0.28) 48%,transparent 70%);` +
            `box-shadow:0 0 22px #fff,0 0 64px rgba(255,255,255,1),0 0 96px rgba(254,249,195,0.52);`,
            118,
            [
                { opacity: 0, transform: 'scale(0.04)' },
                { opacity: 1, transform: 'scale(1.02)' },
                { opacity: 0, transform: 'scale(1.12)' }
            ],
            'cubic-bezier(0.06, 0.98, 0.18, 1)',
            t0
        );

        spawn(
            `position:absolute;width:198px;height:198px;left:${x - 99}px;top:${y - 99}px;z-index:34;pointer-events:none;mix-blend-mode:screen;border-radius:50%;` +
            `background:radial-gradient(circle,transparent 26%,rgba(255,253,246,0.78) 38%,rgba(253,224,71,0.42) 50%,rgba(251,191,36,0.16) 62%,transparent 76%);` +
            `box-shadow:0 0 72px rgba(254,229,154,0.58),0 0 112px rgba(255,251,226,0.22);`,
            400,
            [
                { opacity: 0.9, transform: 'scale(0.05)' },
                { opacity: 0.65, transform: 'scale(0.72)' },
                { opacity: 0, transform: 'scale(1.52)' }
            ],
            'cubic-bezier(0.03, 0.88, 0.12, 1)',
            t0 + 10
        );

        // 快速十字斬裂（短促輔助讀取）
        [0, 45].forEach((deg, qi) => {
            spawn(
                `position:absolute;width:168px;height:4px;left:${x - 84}px;top:${y - 2}px;z-index:37;pointer-events:none;mix-blend-mode:screen;border-radius:2px;transform-origin:center center;` +
                `background:linear-gradient(90deg,transparent 2%,rgba(255,255,255,1) 46%,rgba(254,249,195,1) 50%,rgba(251,191,36,0.85) 54%,transparent 98%);` +
                `box-shadow:0 0 14px rgba(255,255,255,0.96),0 0 26px rgba(251,191,36,0.45);`,
                168,
                [
                    { opacity: 0, transform: `rotate(${deg}deg) scaleX(0.06)` },
                    { opacity: 1, transform: `rotate(${deg}deg) scaleX(1)` },
                    { opacity: 0, transform: `rotate(${deg + (qi ? -6 : 6)}deg) scaleX(0.74)` }
                ],
                'cubic-bezier(0.1, 0.93, 0.2, 1)',
                t0 + 16 + qi * 4
            );
        });

        // Shockwave：多環硬邊衝擊波（半徑 +25%〜30%）
        [0, 22, 48].forEach((lag, wi) => {
            const dia = [108, 165, 216][wi];
            const half = dia / 2;
            const borderGrad = wi === 0 ? 'rgba(255,255,255,0.95)' : (wi === 1 ? 'rgba(254,249,195,0.84)' : 'rgba(251,191,36,0.65)');
            spawn(
                `position:absolute;width:${dia}px;height:${dia}px;left:${x - half}px;top:${y - half}px;z-index:${33 + wi};pointer-events:none;mix-blend-mode:screen;border-radius:50%;` +
                `border:${3 + wi}px solid transparent;box-shadow:inset 0 0 ${13 + wi * 5}px rgba(255,255,255,0.52),` +
                `0 0 ${24 + wi * 8}px ${borderGrad},0 0 ${36 + wi * 10}px rgba(255,253,246,${0.38 - wi * 0.08});`,
                [255, 330, 450][wi],
                [
                    { opacity: 0, transform: 'scale(0.16)' },
                    { opacity: 1, transform: `scale(${0.58 + wi * 0.12})` },
                    { opacity: 0, transform: `scale(${1.22 + wi * 0.2})` }
                ],
                'cubic-bezier(0.04, 0.9, 0.15, 1)',
                t0 + lag
            );
        });

        // 放射細碎光線（刀刃感）—數量／長度 +30〜35%
        for (let i = 0; i < 50; i++) {
            const ang = (Math.PI * 2 / 50) * i;
            const len = Math.round((10 + ((i % 5) + 6) * 3) * 1.35);
            const delay = (i % 7) * 4;
            const reach1 = Math.round((54 + ((i % 4) + 8) * 4) * 1.32);
            const reach2 = Math.round((96 + ((i % 5) + 9) * 5) * 1.32);
            spawn(
                `position:absolute;width:3.5px;height:${len}px;left:${x - 1.75}px;top:${y - len / 2}px;z-index:36;pointer-events:none;mix-blend-mode:screen;border-radius:1px;` +
                `background:linear-gradient(to top,transparent,rgba(255,255,255,0.98),#fffcef,rgba(251,191,36,0.98));` +
                `box-shadow:0 0 12px rgba(255,255,255,0.95),0 0 18px rgba(251,191,36,0.62);`,
                238 + (i % 9) * 16,
                [
                    { opacity: 0.98, transform: `rotate(${ang + Math.PI / 2}rad) translateY(0) scaleY(0.16)` },
                    { opacity: 0.84, transform: `rotate(${ang + Math.PI / 2}rad) translateY(-${reach1}px) scaleY(1)` },
                    { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translateY(-${reach2}px) scaleY(0.05)` }
                ],
                'cubic-bezier(0.16, 0.88, 0.22, 1)',
                t0 + delay + 12
            );
        }

        // 快速外擴細圓環
        spawn(
            `position:absolute;width:56px;height:56px;left:${x - 28}px;top:${y - 28}px;z-index:36;pointer-events:none;mix-blend-mode:screen;border-radius:50%;` +
            `border:2px solid rgba(255,251,238,0.95);box-shadow:0 0 12px rgba(255,255,255,0.88),inset 0 0 8px rgba(254,249,195,0.35);`,
            198,
            [
                { opacity: 1, transform: 'scale(0.12)' },
                { opacity: 0.76, transform: 'scale(0.94)' },
                { opacity: 0, transform: 'scale(1.65)' }
            ],
            'cubic-bezier(0.05, 0.93, 0.12, 1)',
            t0 + 6
        );

        // 外側斜向破片亮光 — 數量／長度加碼
        for (let si = 0; si < 22; si++) {
            const r = (si / 22) * 360;
            spawn(
                `position:absolute;width:72px;height:3px;left:${x - 36}px;top:${y - 1.5}px;z-index:35;pointer-events:none;mix-blend-mode:screen;border-radius:1px;` +
                `background:linear-gradient(90deg,transparent,rgba(255,255,255,1),rgba(254,249,195,0.98),rgba(251,191,36,0.55),transparent);` +
                `box-shadow:0 0 16px rgba(255,255,255,0.9),0 0 22px rgba(251,191,36,0.42);`,
                290,
                [
                    { opacity: 0.2, transform: `rotate(${r}deg) scaleX(0.06)` },
                    { opacity: 1, transform: `rotate(${r}deg) scaleX(1)` },
                    { opacity: 0, transform: `rotate(${r + (si % 2 ? 14 : -14)}deg) scaleX(0.86)` }
                ],
                'cubic-bezier(0.12, 0.85, 0.18, 1)',
                t0 + 32 + (si % 6) * 5
            );
        }
    }

    api.spawnFloatingDamage = spawnFloatingDamage;
    api.spawnGiraGiraHitVfx = spawnGiraGiraHitVfx;
    api.spawnGiraGiraBurstVfx = spawnGiraGiraBurstVfx;
    window.__JPAPP_VFX = api;
    window.JPAPP_VFX = api;
}());
// ================= [ VFX HELPERS ] =================
window.__initVfxHelpers = function (settings) {
    window.__JPAPP_VFX_HELPER_SETTINGS = settings;

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
    const spawnTrailParticle = (layer, x, y, extras = null) => {
        const isTrueResonance = !!extras?.trueResonance;
        const p = document.createElement('div');
        const size = isTrueResonance ? (Math.random() * 10 + 8) : (Math.random() * 8 + 6);
        const trailColor = isTrueResonance
            ? (Math.random() > 0.24 ? '#f97316' : (Math.random() > 0.5 ? '#fef3c7' : '#ef4444'))
            : (Math.random() > 0.3 ? '#fde047' : '#ffffff');
        const shadow = isTrueResonance
            ? '0 0 12px #fff7ed, 0 0 24px rgba(249,115,22,0.95), 0 0 38px rgba(220,38,38,0.62)'
            : '0 0 10px #f59e0b';
        p.style.cssText = `
            position: absolute; width: ${size}px; height: ${size}px;
            background: ${trailColor};
            box-shadow: ${shadow}; border-radius: 50%;
            left: ${x - size / 2}px; top: ${y - size / 2}px;
            pointer-events: none; z-index: 10;
        `;
        layer.appendChild(p);
        const dur = isTrueResonance ? (Math.random() * 480 + 280) : (Math.random() * 400 + 200);
        const driftX = (Math.random() - 0.5) * (isTrueResonance ? 44 : 30);
        const driftY = isTrueResonance ? (Math.random() * 34 + 14) : 20;
        p.animate([
            { opacity: isTrueResonance ? 0.95 : 0.8, transform: 'scale(1) translate(0, 0)' },
            { opacity: 0, transform: `scale(0.1) translate(${driftX}px, ${driftY}px)` }
        ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
        setTimeout(() => { if (p.isConnected) p.remove(); }, dur);
    };

    // 2. 擊中爆炸特效 (絕對精準座標)
    const spawnHitVfx = (x, y, extras = null) => {
        const layer = getVfxLayer();
        const isTrueResonance = !!extras?.trueResonance;
        const isBondMaxAttack = !!extras?.bondMaxAttack;
        const dirX = Number.isFinite(extras?.dirX) ? extras.dirX : 0;
        const dirY = Number.isFinite(extras?.dirY) ? extras.dirY : -1;
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
            position: absolute; width: ${isTrueResonance ? 126 : 100}px; height: ${isTrueResonance ? 86 : 100}px;
            border: ${isTrueResonance ? 3 : 4}px solid ${isTrueResonance ? '#f97316' : '#fde047'}; border-radius: 50%;
            left: ${x - (isTrueResonance ? 63 : 50)}px; top: ${y - (isTrueResonance ? 43 : 50)}px;
            box-shadow: ${isTrueResonance ? '0 0 28px #fff7ed, 0 0 50px rgba(249,115,22,0.92), inset 0 0 24px rgba(254,243,199,0.75)' : '0 0 20px #f59e0b, inset 0 0 20px #f59e0b'};
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
                position: absolute; width: ${isBondMaxAttack ? 142 : 78}px; height: ${isBondMaxAttack ? 48 : 28}px;
                left: ${x - (isBondMaxAttack ? 71 : 39)}px; top: ${y - (isBondMaxAttack ? 24 : 14)}px;
                border-radius: 999px; pointer-events: none; z-index: 24; mix-blend-mode: screen;
                background: ${isBondMaxAttack ? 'linear-gradient(90deg, transparent 0%, rgba(255,247,237,0.96) 22%, #fff 46%, #fef3c7 58%, rgba(251,146,60,0.94) 74%, transparent 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(254,242,242,0.92) 30%, #fff 50%, rgba(251,146,60,0.9) 70%, transparent 100%)'};
                box-shadow: ${isBondMaxAttack ? '0 0 24px #fff7ed, 0 0 48px rgba(251,191,36,0.96), 0 0 78px rgba(220,38,38,0.72)' : '0 0 18px #fff7ed, 0 0 34px rgba(249,115,22,0.9), 0 0 56px rgba(220,38,38,0.52)'};
            `;
            layer.appendChild(core);
            core.animate([
                { opacity: 0, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(0.12)` },
                { opacity: 1, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(${isBondMaxAttack ? 1.24 : 1.08})` },
                { opacity: 0, transform: `rotate(${Math.atan2(dirY, dirX)}rad) scaleX(${isBondMaxAttack ? 0.58 : 0.42}) translateX(${isBondMaxAttack ? 28 : 18}px)` }
            ], { duration: isBondMaxAttack ? 430 : 190, easing: 'cubic-bezier(0.08, 0.9, 0.2, 1)', fill: 'forwards' });
            setTimeout(() => { if (core.isConnected) core.remove(); }, isBondMaxAttack ? 460 : 220);

            if (isBondMaxAttack) {
                const shockwave = document.createElement('div');
                shockwave.style.cssText = `
                    position: absolute; width: 236px; height: 236px;
                    left: ${x - 118}px; top: ${y - 118}px;
                    border-radius: 50%; pointer-events: none; z-index: 18; mix-blend-mode: screen;
                    border: 3px solid rgba(252,211,77,0.96);
                    box-shadow: 0 0 34px rgba(255,247,237,0.9), inset 0 0 46px rgba(248,113,113,0.58), 0 0 86px rgba(220,38,38,0.62);
                `;
                layer.appendChild(shockwave);
                shockwave.animate([
                    { opacity: 0.98, transform: 'scale(0.14)' },
                    { opacity: 0.42, transform: 'scale(1.08)' },
                    { opacity: 0, transform: 'scale(1.78)' }
                ], { duration: 680, easing: 'cubic-bezier(0.12, 0.84, 0.24, 1)', fill: 'forwards' });
                setTimeout(() => { if (shockwave.isConnected) shockwave.remove(); }, 700);
            }
        }

        // B. 放射狀火花
        const sparksCount = isBondMaxAttack ? 44 : (isTrueResonance ? 24 : 16);
        for (let i = 0; i < sparksCount; i++) {
            const spark = document.createElement('div');
            const sparkLength = isBondMaxAttack ? (Math.random() * 34 + 36) : (isTrueResonance ? (Math.random() * 18 + 22) : 20);
            const sparkWidth = isBondMaxAttack ? (Math.random() * 3 + 4) : (isTrueResonance ? (Math.random() * 3 + 4) : 6);
            spark.style.cssText = `
                position: absolute; width: ${sparkWidth}px; height: ${sparkLength}px;
                background: ${isBondMaxAttack ? 'linear-gradient(180deg,#fff,#fef3c7 38%,#fb923c 66%,#dc2626)' : (isTrueResonance ? 'linear-gradient(180deg,#fff,#fed7aa 46%,#ef4444)' : '#ffffff')};
                box-shadow: ${isBondMaxAttack ? '0 0 16px #fff7ed, 0 0 32px #fbbf24, 0 0 54px rgba(220,38,38,0.78)' : (isTrueResonance ? '0 0 10px #fff7ed, 0 0 20px #f97316, 0 0 34px rgba(220,38,38,0.58)' : '0 0 8px #fde047, 0 0 15px #f59e0b')};
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
    };

    // 3. 發射彗星本體
    const spawnProjectile = (fromX, fromY, toX, toY, textOpt, extras = null) => {
        const vfxLayer = getVfxLayer();
        const isBondMaxAttack = !!extras?.bondMaxAttack;
        const isTrueResonance = !!extras?.trueResonance || isBondMaxAttack;
        const onHit = typeof extras?.onHit === 'function' ? extras.onHit : null;
        const ttl = isBondMaxAttack ? 520 : (isTrueResonance ? 430 : 400);
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
            position: absolute; left: ${fromX - (isTrueResonance ? 26 : 20)}px; top: ${fromY - (isTrueResonance ? 26 : 20)}px;
            width: ${isTrueResonance ? 52 : 40}px; height: ${isTrueResonance ? 52 : 40}px; display: flex; justify-content: center; align-items: center;
            pointer-events: none; z-index: 99999;
        `;
        let tail = null;
        if (isTrueResonance) {
            tail = document.createElement('div');
            tail.style.cssText = `
                position: absolute; right: 24px; width: ${isBondMaxAttack ? 116 : 88}px; height: ${isBondMaxAttack ? 22 : 18}px; border-radius: 999px;
                background: ${isBondMaxAttack ? 'linear-gradient(90deg, transparent 0%, rgba(127,29,29,0.1) 10%, rgba(220,38,38,0.72) 48%, rgba(251,191,36,0.76) 78%, rgba(255,247,237,0.95) 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.2) 18%, rgba(249,115,22,0.72) 58%, rgba(254,243,199,0.9) 100%)'};
                filter: blur(${isBondMaxAttack ? 1.4 : 1}px); box-shadow: ${isBondMaxAttack ? '0 0 20px rgba(248,113,113,0.9), 0 0 38px rgba(249,115,22,0.68), 0 0 54px rgba(220,38,38,0.34)' : '0 0 18px rgba(249,115,22,0.86), 0 0 34px rgba(220,38,38,0.38)'};
                transform: rotate(${angle}rad); transform-origin: 100% 50%; z-index: 6; mix-blend-mode: screen;
            `;
            projectile.appendChild(tail);
        }
        const core = document.createElement('div');
        core.style.cssText = `
            position: absolute; width: ${isBondMaxAttack ? 38 : (isTrueResonance ? 34 : 28)}px; height: ${isBondMaxAttack ? 38 : (isTrueResonance ? 34 : 28)}px; border-radius: 50%;
            background: ${isBondMaxAttack ? 'radial-gradient(circle,#fff 0%,#fff7ed 24%,#fb7185 48%,#ef4444 70%,#7f1d1d 100%)' : (isTrueResonance ? 'radial-gradient(circle,#fff 0%,#fff7ed 30%,#f97316 62%,#dc2626 100%)' : '#ffffff')};
            box-shadow: ${isBondMaxAttack ? '0 0 18px #fff, 0 0 38px #fb7185, 0 0 70px rgba(220,38,38,0.88), 0 0 96px rgba(251,191,36,0.44)' : (isTrueResonance ? '0 0 18px #fff, 0 0 38px #f97316, 0 0 70px rgba(220,38,38,0.86), 0 0 96px rgba(251,191,36,0.42)' : '0 0 20px #ffffff, 0 0 40px #fde047, 0 0 60px #f59e0b')}; z-index: 10;
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
        const animateTrail = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / ttl, 1);
            if (progress < 1 && projectile.isConnected) {
                const point = getCurvePoint(progress);
                const currentX = point.x;
                const currentY = point.y;
                if (isBondMaxAttack) {
                    projectile.style.transform = `translate(${currentX - fromX}px, ${currentY - fromY}px) scale(${1 - progress * 0.28})`;
                    if (tail) tail.style.transform = `rotate(${point.angle}rad)`;
                }
                const particlesThisFrame = isTrueResonance ? (Math.floor(Math.random() * 4) + 5) : (Math.floor(Math.random() * 3) + 3);
                for (let i = 0; i < particlesThisFrame; i++) {
                    const offsetX = (Math.random() - 0.5) * (isTrueResonance ? 30 : 20);
                    const offsetY = (Math.random() - 0.5) * (isTrueResonance ? 30 : 20);
                    spawnTrailParticle(vfxLayer, currentX + offsetX, currentY + offsetY, extras);
                }
                requestAnimationFrame(animateTrail);
            } else {
                spawnHitVfx(toX, toY, { trueResonance: isTrueResonance, bondMaxAttack: isBondMaxAttack, dirX: dx, dirY: dy });
                if (onHit) onHit();
            }
        };
        requestAnimationFrame(animateTrail);
        if (!isBondMaxAttack) {
            projectile.animate([
                { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(${isTrueResonance ? 0.62 : 0.5})`, opacity: isTrueResonance ? 0.72 : 0.5 }
            ], { duration: ttl, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' });
        }
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
