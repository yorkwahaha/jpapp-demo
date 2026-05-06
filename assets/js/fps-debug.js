/**
 * JPAPP FPS Debug Overlay
 * Lightweight performance monitor for mobile Safari testing.
 */
(function () {
    'use strict';

    let _el = null;
    let _framesInSecond = 0;
    let _secondStartTime = performance.now();
    let _fps = 0;
    let _avg = 0;
    let _low = 60;
    let _history = [];
    let _resumedTicks = 0; // Number of seconds to show RESUMED
    let _isRunning = false;
    let _rafId = null;
    let _lagTimerId = null;
    let _lastFrameTime = 0;
    let _lastMaxFrameMs = 0;
    let _lastLongFrameCount = 0;
    let _maxFrameMs = 0;
    let _longFrameCount = 0;
    let _lastLoopLagMs = 0;
    let _maxLoopLagMs = 0;
    let _lastResumedAt = 0;
    let _lastSlowEvent = null;
    const PERF_SLOW_THRESHOLD_MS = 16;
    const LONG_FRAME_MS = 50;
    const LOOP_LAG_SAMPLE_MS = 500;

    function _createOverlay() {
        if (_el) return;
        _el = document.createElement('div');
        _el.id = 'fpsDebugOverlay';
        // Positioned at top-left to avoid overlap with Menu/System buttons which are usually top-right or bottom
        Object.assign(_el.style, {
            position: 'fixed',
            top: '4px',
            left: '4px',
            zIndex: '100000',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            font: 'bold 10px monospace',
            padding: '3px 7px',
            borderRadius: '5px',
            pointerEvents: 'none',
            display: 'none',
            backdropFilter: 'none',
            webkitBackdropFilter: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            letterSpacing: '0.02em'
        });
        document.body.appendChild(_el);
    }

    function _render() {
        if (!_el) return;
        let html = `FPS: <span style="color:${_fps < 40 ? '#f87171' : _fps < 55 ? '#fbbf24' : '#4ade80'}">${_fps}</span>`;
        html += ` <span style="opacity:0.6;font-size:9px">(AVG:${_avg} LOW:${_low})</span>`;
        html += ` <span style="opacity:0.72;font-size:9px">MAX:${_lastMaxFrameMs}ms LF:${_lastLongFrameCount} LAG:${_lastLoopLagMs}/${_maxLoopLagMs}ms</span>`;
        if (_lastSlowEvent) {
            html += `<br><span style="color:#fca5a5;font-size:9px">SLOW:${_lastSlowEvent.label} ${_lastSlowEvent.durationMs}ms</span>`;
        }
        
        if (_resumedTicks > 0) {
            const resumedAgo = _lastResumedAt ? Math.max(0, Math.round((performance.now() - _lastResumedAt) / 1000)) : 0;
            html += ` <span style="color:#fbbf24;margin-left:4px;text-shadow:0 0 4px rgba(251,191,36,0.5)">● RES:${resumedAgo}s</span>`;
        }
        
        _el.innerHTML = html;
    }

    function _clearLagProbe() {
        if (_lagTimerId !== null) {
            clearTimeout(_lagTimerId);
            _lagTimerId = null;
        }
    }

    function _scheduleLagProbe() {
        if (_lagTimerId !== null || localStorage.getItem('jpapp_show_fps_debug') !== 'true') return;
        const expectedAt = performance.now() + LOOP_LAG_SAMPLE_MS;
        _lagTimerId = setTimeout(() => {
            _lagTimerId = null;
            if (localStorage.getItem('jpapp_show_fps_debug') !== 'true') return;
            const lagMs = Math.max(0, performance.now() - expectedAt);
            _lastLoopLagMs = Math.round(lagMs);
            _maxLoopLagMs = Math.max(_maxLoopLagMs, _lastLoopLagMs);
            _recordPerf('event-loop-lag', lagMs, expectedAt);
            _scheduleLagProbe();
        }, LOOP_LAG_SAMPLE_MS);
    }

    function _requestLoop() {
        if (_rafId === null) _rafId = requestAnimationFrame(_loop);
    }

    function _resetSamples(now) {
        _framesInSecond = 0;
        _secondStartTime = now;
        _lastFrameTime = 0;
        _lastMaxFrameMs = 0;
        _lastLongFrameCount = 0;
        _maxFrameMs = 0;
        _longFrameCount = 0;
        _lastLoopLagMs = 0;
        _maxLoopLagMs = 0;
    }

    function _isPerfEnabled() {
        try {
            return localStorage.getItem('jpapp_show_fps_debug') === 'true';
        } catch (_) {
            return false;
        }
    }

    function _recordPerf(label, durationMs, startTime) {
        if (!_isPerfEnabled() || !Number.isFinite(durationMs) || durationMs < PERF_SLOW_THRESHOLD_MS) return null;
        const now = performance.now();
        const item = {
            label: String(label || 'unknown'),
            durationMs: Math.round(durationMs),
            timestamp: Math.round(now),
            sinceResumeMs: _lastResumedAt ? Math.round((startTime || now) - _lastResumedAt) : null
        };
        _lastSlowEvent = item;
        _render();
        return item;
    }

    function _loop(now) {
        _rafId = null;
        if (localStorage.getItem('jpapp_show_fps_debug') !== 'true') {
            if (_el) _el.style.display = 'none';
            _isRunning = false;
            _lastFrameTime = 0;
            _clearLagProbe();
            return;
        }

        _isRunning = true;
        if (!_el) _createOverlay();
        _el.style.display = 'block';
        _scheduleLagProbe();

        _framesInSecond++;
        if (_lastFrameTime > 0) {
            const frameMs = now - _lastFrameTime;
            _maxFrameMs = Math.max(_maxFrameMs, frameMs);
            if (frameMs >= LONG_FRAME_MS) _longFrameCount++;
        }
        _lastFrameTime = now;

        if (now >= _secondStartTime + 1000) {
            _fps = Math.round((_framesInSecond * 1000) / (now - _secondStartTime));
            _history.push(_fps);
            if (_history.length > 10) _history.shift();
            
            _avg = Math.round(_history.reduce((a, b) => a + b, 0) / _history.length);
            _low = Math.min(..._history);
            _lastMaxFrameMs = Math.round(_maxFrameMs);
            _lastLongFrameCount = _longFrameCount;
            
            _framesInSecond = 0;
            _secondStartTime = now;
            _maxFrameMs = 0;
            _longFrameCount = 0;
            
            if (_resumedTicks > 0) _resumedTicks--;
            _render();
        }

        _requestLoop();
    }

    // Visibility change detection
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            _resumedTicks = 4; // Show for 4 seconds after return
            _lastResumedAt = performance.now();
            _resetSamples(_lastResumedAt);
            // Clear history on resume to get fresh look at performance
            _history = [];
            _render();
            if (localStorage.getItem('jpapp_show_fps_debug') === 'true') {
                _scheduleLagProbe();
                _requestLoop();
            }
        } else {
            _clearLagProbe();
        }
    });

    // Auto-start if enabled
    if (localStorage.getItem('jpapp_show_fps_debug') === 'true') {
        _requestLoop();
    }

    // Export to global for manual trigger if needed
    window.__startFpsLoop = function() {
        if (!_isRunning && _rafId === null) {
            _resetSamples(performance.now());
            _requestLoop();
        }
    };

    window.__getFpsDebugSnapshot = function() {
        return {
            fps: _fps,
            avg: _avg,
            low: _low,
            maxFrameMs: _lastMaxFrameMs,
            longFrames: _lastLongFrameCount,
            loopLagMs: _lastLoopLagMs,
            maxLoopLagMs: _maxLoopLagMs,
            resumedAgoMs: _lastResumedAt ? Math.round(performance.now() - _lastResumedAt) : null
        };
    };

    console.log('[FPS-Debug] Loaded. Toggle via localStorage "jpapp_show_fps_debug"');
})();
