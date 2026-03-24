// ================= [ DEBUG OVERLAY ] =================
(function () {

    'use strict';



    const MAX_LINES = 25;

    const LOG_COLORS = { log: '#7fff7f', warn: '#ffd700', error: '#ff6b6b' };

    const FOCUS_KEYWORDS = ['[BGM]', '[AZURE]', '[PRAISE]'];

    window.__DEBUG_OVERLAY_MODE = 'focus';

    let _lines = [];

    let _el = null;

    let _enabled = false;



    function _ts() {

        const d = new Date();

        return String(d.getMinutes()).padStart(2, '0') + ':' +

            String(d.getSeconds()).padStart(2, '0') + '.' +

            String(d.getMilliseconds()).padStart(3, '0');

    }



    function _createOverlay() {

        if (_el) return;

        _el = document.createElement('div');

        _el.id = 'debugOverlay';

        Object.assign(_el.style, {

            position: 'fixed', top: '8px', right: '8px', zIndex: '9999999',

            background: 'rgba(0,0,0,0.72)', color: '#7fff7f',

            font: '11px/1.45 monospace', padding: '6px 8px', borderRadius: '8px',

            maxHeight: '35vh', width: 'min(90vw, 420px)', overflowY: 'hidden',

            whiteSpace: 'pre-wrap', wordBreak: 'break-all',

            pointerEvents: 'none', display: 'none',

            boxShadow: '0 2px 12px rgba(0,0,0,.5)',

            opacity: '0.92'

        });

        document.body.appendChild(_el);

    }



    function _render() {

        if (!_el) return;

        _el.innerHTML = _lines.slice(-MAX_LINES).join('\n');

        _el.scrollTop = _el.scrollHeight;

    }



    function _push(level, args) {

        if (!_enabled) return;

        const msg = args.map(a => {

            if (typeof a === 'string') return a;

            try { return JSON.stringify(a); } catch { return String(a); }

        }).join(' ');



        if (window.__DEBUG_OVERLAY_MODE === 'focus' && level === 'log') {

            const isFocus = FOCUS_KEYWORDS.some(k => msg.includes(k));

            if (!isFocus) return;

        }



        if (!_el) _createOverlay();

        const color = LOG_COLORS[level] || '#7fff7f';

        const prefix = level === 'warn' ? '⚠ ' : level === 'error' ? '✖ ' : '';

        _lines.push(`<span style="color:${color}">[${_ts()}] ${prefix}${_escHtml(msg)}</span>`);

        if (_lines.length > MAX_LINES * 2) _lines = _lines.slice(-MAX_LINES);

        _render();

    }



    function _escHtml(s) {

        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    }



    const _orig = { log: console.log, warn: console.warn, error: console.error };

    ['log', 'warn', 'error'].forEach(lvl => {

        console[lvl] = function (...args) {

            _orig[lvl].apply(console, args);

            _push(lvl, args);

        };

    });



    function _enable() {

        if (_enabled) return;

        _enabled = true;

        window.__AUDIO_DEBUG = true;

        if (!_el) _createOverlay();

        _el.style.display = 'block';

        console.log('[DebugOverlay] ON — listening');

    }



    function _disable() {

        _enabled = false;

        if (_el) _el.style.display = 'none';

        _orig.log.call(console, '[DebugOverlay] OFF');

    }



    window.__overlayPush = (tag, msg) => {

        if (!_enabled) return;

        if (window.__DEBUG_OVERLAY_MODE === 'focus') {

            const isFocus = FOCUS_KEYWORDS.some(k => tag.includes(k) || msg.includes(k));

            if (!isFocus) return;

        }

        if (!_el) _createOverlay();

        const color = LOG_COLORS['log'] || '#7fff7f';

        _lines.push(`<span style="color:${color}">[${_ts()}] ${_escHtml(tag + ' ' + msg)}</span>`);

        if (_lines.length > MAX_LINES * 2) _lines = _lines.slice(-MAX_LINES);

        _render();

    };



    window.__debugOverlayOn = _enable;

    window.__debugOverlayOff = _disable;

    Object.defineProperty(window, '__DEBUG_OVERLAY', {

        get() { return _enabled; },

        set(v) { v ? _enable() : _disable(); },

        configurable: true

    });



    if (location.hash === '#debug' || new URLSearchParams(location.search).has('debug')) {

        if (document.readyState === 'loading') {

            document.addEventListener('DOMContentLoaded', _enable, { once: true });

        } else {

            _enable();

        }

    }



    let _lpTimer = null;

    let _lpTimer4s = null;

    document.addEventListener('pointerdown', function (e) {

        const t = e.target.closest('#menuBtn, [data-debug-toggle], button');

        if (!t) return;

        const txt = (t.id + ' ' + t.textContent + ' ' + (t.getAttribute('aria-label') || '')).toLowerCase();

        if (!txt.includes('menu') && !txt.includes('系統') && !txt.includes('system') && t.id !== 'menuBtn') return;



        _lpTimer = setTimeout(() => {

            _enabled ? _disable() : _enable();

            t.style.outline = '2px solid #0f0';

            setTimeout(() => { t.style.outline = ''; }, 600);

        }, 2000);



        _lpTimer4s = setTimeout(() => {

            window.__DEBUG_OVERLAY_MODE = window.__DEBUG_OVERLAY_MODE === 'focus' ? 'all' : 'focus';

            t.style.outline = '2px solid #f0f';

            setTimeout(() => { t.style.outline = ''; }, 600);

            _orig.log.call(console, `[Overlay] mode=${window.__DEBUG_OVERLAY_MODE}`);

            _push('log', [`[Overlay] mode=${window.__DEBUG_OVERLAY_MODE}`]);

        }, 4000);

    }, true);



    const _clearLp = () => {

        if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }

        if (_lpTimer4s) { clearTimeout(_lpTimer4s); _lpTimer4s = null; }

    };

    document.addEventListener('pointerup', _clearLp, true);

    document.addEventListener('pointerleave', _clearLp, true);

    document.addEventListener('pointermove', _clearLp, true);

})();
