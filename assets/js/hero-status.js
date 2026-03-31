


function setHeroAvatar(state) {

    const el = document.getElementById('heroAvatar');

    if (!el) return;

    const img = el.querySelector('img');

    if (!img) return;

    el.dataset.state = state;

    if (state === 'neutral') img.src = 'assets/images/hero/hero_neutral.png';

    else if (state === 'hit') img.src = 'assets/images/hero/hero_hit.png';

    else if (state === 'lose') img.src = 'assets/images/hero/hero_lose.png';

    else if (state === 'win') img.src = 'assets/images/hero/hero_win.png';

    else if (state === 'scary') img.src = 'assets/images/hero/hero_scary.png';

    else if (state === 'ase') img.src = 'assets/images/hero/hero_ase.png';

}



function flashHeroHit(hpPct = 1.0, ms = 1000) {

    const el = document.getElementById('heroAvatar');

    if (!el) return;

    if (el.dataset.state === 'lose' || el.dataset.state === 'win') return;

    setHeroAvatar('hit');

    setTimeout(() => {

        if (el && el.dataset.state !== 'lose' && el.dataset.state !== 'win') {

            if (hpPct <= 0.4) {

                setHeroAvatar('scary');

            } else if (hpPct < 0.8) {

                setHeroAvatar('ase');

            } else {

                setHeroAvatar('neutral');

            }

        }

    }, ms);

}



// ================= [ HERO STATUS & BUFFS ] =================
const heroStatusTimers = { speedUntil: 0, evadeUntil: 0 };

const heroBuffs = { enemyAtbMult: 1.0, enemyDmgMult: 1.0, odoodoTurns: 0, gachigachiTurns: 0, giragiraTurns: 0, morimoriTurns: 0, jiwajiwaTurns: 0, wakuwakuTurns: 0, wakuwakuStacks: 0, monsterSleep: false };



function setSpeedStatus(ms) {

    heroStatusTimers.speedUntil = Date.now() + ms;

    showStatusToast('💨 加速・閃避', { bg: 'rgba(56,189,248,0.92)', border: '#7dd3fc', color: '#0c4a6e' });

    updateHeroStatusBar();

    window.setTimeout(updateHeroStatusBar, ms + 50);

}



let _toastTimer = null;

function showStatusToast(label, { bg = 'rgba(251,191,36,0.92)', border = '#fbbf24', color = '#1c1400' } = {}) {

    const existing = document.getElementById('statusToast');

    if (existing) existing.remove();

    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }



    const el = document.createElement('div');

    el.id = 'statusToast';

    el.className = 'status-toast';

    el.style.cssText = `background:${bg}; border:2px solid ${border}; color:${color};`;

    el.textContent = label;

    document.body.appendChild(el);



    _toastTimer = setTimeout(() => {

        if (el.parentNode) {

            el.classList.add('out');

            setTimeout(() => el.remove(), 260);

        }

        _toastTimer = null;

    }, 1200);

}



function clearSpeedStatus() {

    heroStatusTimers.speedUntil = 0;

    updateHeroStatusBar();

}



function getHeroHpRatioBestEffort() {

    try {

        if (typeof heroHP !== "undefined" && typeof heroMaxHP !== "undefined" && heroMaxHP) return heroHP / heroMaxHP;

    } catch { }

    try {

        const hpText = document.querySelector(".hero-hp-text, [data-hero-hp]")?.textContent;

    } catch { }

    return null;

}



function hasSpeedOrEvadeBuffBestEffort() {

    if (Date.now() < heroStatusTimers.speedUntil) return true;

    try {

        if (typeof isEvadeBuff !== "undefined" && isEvadeBuff) return true;

        if (typeof isSpeedBuff !== "undefined" && isSpeedBuff) return true;

        if (typeof speedMultiplier !== "undefined" && speedMultiplier > 1.01) return true;

    } catch { }

    return false;

}



function updateHeroStatusBar() {



    const bar = document.getElementById("heroStatusBar");

    if (bar) {
        const hasSpeed = hasSpeedOrEvadeBuffBestEffort();
        const wantGachigachi = heroBuffs.gachigachiTurns > 0;
        const pillSpeed = bar.querySelector('.pill-speed');
        const pillGachigachi = bar.querySelector('.pill-gachigachi');

        if (hasSpeed && !pillSpeed) {
            const span = document.createElement('span');
            span.className = 'hero-status-pill speed pill-speed';
            span.title = '加速／閃避';
            span.textContent = '速';
            bar.appendChild(span);
        } else if (hasSpeed && pillSpeed) {
            pillSpeed.title = '加速／閃避';
        } else if (!hasSpeed && pillSpeed) {
            pillSpeed.remove();
        }

        if (wantGachigachi && !pillGachigachi) {
            const span = document.createElement('span');
            span.className = 'hero-status-pill speed pill-gachigachi';
            span.title = `硬化／減傷 (${heroBuffs.gachigachiTurns} 回合)`;
            span.textContent = '硬';
            bar.appendChild(span);
        } else if (wantGachigachi && pillGachigachi) {
            pillGachigachi.title = `硬化／減傷 (${heroBuffs.gachigachiTurns} 回合)`;
        } else if (!wantGachigachi && pillGachigachi) {
            pillGachigachi.remove();
        }
    }

    if (window.updateSpUI) window.updateSpUI();

    // --- Battle Buff Overlay (GIRAGIRA visual) ---
    const overlay = document.getElementById('battleBuffOverlay');
    if (overlay) {
        overlay.innerHTML = '';

        if (heroBuffs.giragiraTurns > 0 || heroBuffs.morimoriTurns > 0 || heroBuffs.jiwajiwaTurns > 0 || heroBuffs.wakuwakuTurns > 0 || heroBuffs.gachigachiTurns > 0) {
            // Match hero's exact screen rect so aura + badge align with hero
            const heroEl = document.getElementById('heroAvatar');
            const r = heroEl ? heroEl.getBoundingClientRect() : null;

            if (r && r.width > 0) {
                overlay.style.cssText =
                    'position:fixed!important;' +
                    'left:' + r.left + 'px!important;' +
                    'top:' + r.top + 'px!important;' +
                    'width:' + r.width + 'px!important;' +
                    'height:' + r.height + 'px!important;' +
                    'z-index:47!important;' +
                    'pointer-events:none!important;' +
                    'overflow:visible!important;' +
                    'display:block!important;' +
                    'margin:0!important;padding:0!important;background:none!important;';
            } else {
                overlay.style.cssText =
                    'position:fixed!important;bottom:200px!important;left:4px!important;' +
                    'width:110px!important;height:110px!important;z-index:47!important;' +
                    'pointer-events:none!important;overflow:visible!important;' +
                    'display:block!important;margin:0!important;padding:0!important;background:none!important;';
            }

            let badgesHtml = '';
            
            // GACHIGACHI Badge (硬)
            if (heroBuffs.gachigachiTurns > 0) {
                badgesHtml += 
                    '<div style="display:flex;align-items:center;gap:3px;' +
                    'padding:2px 7px 2px 5px;' +
                    'background:rgba(51,65,85,0.92);border:1.5px solid #94a3b8;border-radius:10px;' +
                    'color:#f1f5f9;font-size:13px;font-weight:900;line-height:1;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,0.65);text-shadow:0 1px 3px rgba(0,0,0,0.8);' +
                    'animation:badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                    '\u786c\u00a0' + heroBuffs.gachigachiTurns + '</div>';
            }

            // GIRAGIRA Badge
            if (heroBuffs.giragiraTurns > 0) {
                badgesHtml += 
                    '<div style="display:flex;align-items:center;gap:3px;' +
                    'padding:2px 7px 2px 5px;' +
                    'background:rgba(146,64,14,0.92);border:1.5px solid #fbbf24;border-radius:10px;' +
                    'color:#fef3c7;font-size:13px;font-weight:900;line-height:1;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,0.65);text-shadow:0 1px 3px rgba(0,0,0,0.8);' +
                    'animation:badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                    '\u92d2\u00a0' + heroBuffs.giragiraTurns + '</div>';
            }

            // MORIMORI Badge
            if (heroBuffs.morimoriTurns > 0) {
                badgesHtml += 
                    '<div style="display:flex;align-items:center;gap:3px;' +
                    'padding:2px 7px 2px 5px;' +
                    'background:rgba(14,116,144,0.92);border:1.5px solid #22d3ee;border-radius:10px;' +
                    'color:#ecfeff;font-size:13px;font-weight:900;line-height:1;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,0.65);text-shadow:0 1px 3px rgba(0,0,0,0.8);' +
                    'animation:badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                    '\u76db\u00a0' + heroBuffs.morimoriTurns + '</div>';
            }

            // JIWAJIWA Badge (癒)
            if (heroBuffs.jiwajiwaTurns > 0) {
                badgesHtml += 
                    '<div style="display:flex;align-items:center;gap:3px;' +
                    'padding:2px 7px 2px 5px;' +
                    'background:rgba(21,128,61,0.92);border:1.5px solid #4ade80;border-radius:10px;' +
                    'color:#f0fdf4;font-size:13px;font-weight:900;line-height:1;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,0.65);text-shadow:0 1px 3px rgba(0,0,0,0.8);' +
                    'animation:badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                    '\u7652\u00a0' + heroBuffs.jiwajiwaTurns + '</div>';
            }

            // WAKUWAKU Badge (迅)
            if (heroBuffs.wakuwakuTurns > 0) {
                badgesHtml += 
                    '<div style="display:flex;align-items:center;gap:3px;' +
                    'padding:2px 7px 2px 5px;' +
                    'background:rgba(8,145,178,0.92);border:1.5px solid #0891b2;border-radius:10px;' +
                    'color:#ecfeff;font-size:13px;font-weight:900;line-height:1;' +
                    'box-shadow:0 2px 8px rgba(0,0,0,0.65);text-shadow:0 1px 3px rgba(0,0,0,0.8);' +
                    'animation:badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);">' +
                    '\u8fc5\u00a0' + heroBuffs.wakuwakuTurns + '</div>';
            }

            overlay.innerHTML =
                // Aura glow ring (only if GIRAGIRA is active)
                (heroBuffs.giragiraTurns > 0 ? 
                '<div style="position:absolute;inset:-10px;border-radius:50%;' +
                'border:2px solid rgba(251,191,36,0.75);' +
                'box-shadow:0 0 14px 4px rgba(251,191,36,0.45),0 0 28px 8px rgba(251,191,36,0.2);' +
                'animation:giragira-aurora 1.5s ease-in-out infinite;' +
                'z-index:0;pointer-events:none;"></div>' : '') +
                
                // Badges container at top-right of hero
                '<div id="heroBadgeContainer" style="position:absolute;top:-14px;right:-10px;' +
                'display:flex;flex-direction:column;align-items:flex-end;gap:4px;z-index:2;">' +
                badgesHtml + '</div>';
        } else {
            overlay.style.cssText = 'display:none!important;';
        }
    }

    // --- Cleanup Legacy Hooks (Safety) ---
    const oldHero = document.getElementById('heroAvatar');
    if (oldHero) {
        oldHero.classList.remove('aura-giragira');
        const oldList = document.getElementById('heroBuffList');
        if (oldList) oldList.remove();
    }
}



function updateMonsterStatusBar() {

    const bar = document.getElementById("monsterStatusBar");

    if (!bar) return;

    const wantOdoodo = heroBuffs.odoodoTurns > 0;
    const pillOdoodo = bar.querySelector('.pill-ododo');

    if (wantOdoodo && !pillOdoodo) {
        const span = document.createElement('span');
        span.className = 'hero-status-pill speed pill-ododo';
        span.title = `緩速 (${heroBuffs.odoodoTurns} 回合)`;
        span.textContent = '遲';
        bar.appendChild(span);
    } else if (wantOdoodo && pillOdoodo) {
        pillOdoodo.title = `緩速 (${heroBuffs.odoodoTurns} 回合)`;
    } else if (!wantOdoodo && pillOdoodo) {
        pillOdoodo.remove();
    }
}
