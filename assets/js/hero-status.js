
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

const heroBuffs = { enemyAtbMult: 1.0, enemyDmgMult: 1.0, odoodoTurns: 0, gachigachiTurns: 0, monsterSleep: false };



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

    if (!bar) return;



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



    if (window.updateSpUI) window.updateSpUI();

}



function updateMonsterStatusBar() {

    const bar = document.getElementById("monsterStatusBar");

    if (!bar) return;



    const wantOdoodo = heroBuffs.odoodoTurns > 0;

    const wantSleep = !!heroBuffs.monsterSleep;



    const pillOdoodo = bar.querySelector('.pill-ododo');

    const pillSleep = bar.querySelector('.pill-sleep');



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



    if (wantSleep && !pillSleep) {

        const span = document.createElement('span');

        span.className = 'hero-status-pill speed pill-sleep';

        span.title = '睡眠';

        span.textContent = '眠';

        bar.appendChild(span);

    } else if (wantSleep && pillSleep) {

        pillSleep.title = '睡眠';

    } else if (!wantSleep && pillSleep) {

        pillSleep.remove();

    }

}
