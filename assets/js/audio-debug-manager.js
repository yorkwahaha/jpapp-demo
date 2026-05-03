(function (global) {
    'use strict';

    const fallbackStorage = {
        loadAudioDebugEnabled: () => false,
        loadAudioDebugPosition: () => null,
        saveAudioDebugPosition: () => {}
    };

    function createAudioDebugManager(options = {}) {
        const vue = options.vue || {};
        const {
            ref = (v) => ({ value: v }),
            computed = (getter) => ({ get value() { return getter(); } }),
            watch = () => {},
            onMounted = () => {},
            nextTick = (fn) => fn?.()
        } = vue;
        const storage = options.storageManager || fallbackStorage;
        const formatValue = options.formatAudioDebugValue || ((value) => {
            if (value === null || value === undefined) return '—';
            if (typeof value === 'boolean') return value ? 'yes' : 'no';
            return String(value);
        });
        const getState = options.getAudioDebugState || (() => ({}));
        const getActions = options.getActions || (() => ({}));

        const isAudioDebugEnabled = ref(false);
        try {
            const params = new URLSearchParams(global.location.search);
            isAudioDebugEnabled.value = params.get('audioDebug') === '1' || storage.loadAudioDebugEnabled();
        } catch (_) {}

        const isAudioDebugOpen = ref(isAudioDebugEnabled.value);
        const audioDebugPosition = ref(storage.loadAudioDebugPosition());
        const isAudioDebugDragging = ref(false);
        const audioDebugTick = ref(0);
        let audioDebugDragState = null;

        const refreshAudioDebugState = () => {
            audioDebugTick.value += 1;
        };

        const markAudioDebugEvent = (targetRef, label) => {
            if (!isAudioDebugEnabled.value || !targetRef) return;
            targetRef.value = `${label} @ ${new Date().toLocaleTimeString()}`;
            refreshAudioDebugState();
        };

        const audioDebugOverlayStyle = computed(() => {
            if (!audioDebugPosition.value) return {};
            return {
                left: `${audioDebugPosition.value.left}px`,
                top: `${audioDebugPosition.value.top}px`,
                right: 'auto',
                bottom: 'auto'
            };
        });

        const audioDebugSections = computed(() => {
            const state = getState() || {};
            return Object.entries(state).map(([title, values]) => ({
                title,
                rows: Object.entries(values || {}).map(([key, value]) => ({
                    key,
                    value: formatValue(value)
                }))
            }));
        });

        const getAudioDebugOverlayElement = () => document.querySelector('.audio-debug-overlay');

        const clampAudioDebugPosition = (position = audioDebugPosition.value) => {
            if (!position) return null;
            const overlay = getAudioDebugOverlayElement();
            const rect = overlay?.getBoundingClientRect();
            const width = Math.max(120, rect?.width || (isAudioDebugOpen.value ? 520 : 290));
            const height = Math.max(52, rect?.height || 74);
            const margin = 8;
            const maxLeft = Math.max(margin, global.innerWidth - width - margin);
            const maxTop = Math.max(margin, global.innerHeight - height - margin);
            return {
                left: Math.min(Math.max(margin, Number(position.left) || margin), maxLeft),
                top: Math.min(Math.max(margin, Number(position.top) || margin), maxTop)
            };
        };

        const saveAudioDebugPosition = () => {
            if (!audioDebugPosition.value) return;
            storage.saveAudioDebugPosition(audioDebugPosition.value);
        };

        const setAudioDebugPosition = (position, shouldSave = false) => {
            const clamped = clampAudioDebugPosition(position);
            if (!clamped) return;
            audioDebugPosition.value = clamped;
            if (shouldSave) saveAudioDebugPosition();
        };

        const handleAudioDebugDragMove = (event) => {
            if (!audioDebugDragState) return;
            event.preventDefault();
            setAudioDebugPosition({
                left: audioDebugDragState.startLeft + event.clientX - audioDebugDragState.pointerX,
                top: audioDebugDragState.startTop + event.clientY - audioDebugDragState.pointerY
            });
        };

        const stopAudioDebugDrag = () => {
            if (!audioDebugDragState) return;
            isAudioDebugDragging.value = false;
            audioDebugDragState = null;
            saveAudioDebugPosition();
            global.removeEventListener('pointermove', handleAudioDebugDragMove);
            global.removeEventListener('pointerup', stopAudioDebugDrag);
            global.removeEventListener('pointercancel', stopAudioDebugDrag);
        };

        const startAudioDebugDrag = (event) => {
            if (event?.target?.closest?.('button')) return;
            const overlay = event.currentTarget?.closest?.('.audio-debug-overlay') || getAudioDebugOverlayElement();
            if (!overlay) return;
            const rect = overlay.getBoundingClientRect();
            const currentPosition = clampAudioDebugPosition(audioDebugPosition.value || { left: rect.left, top: rect.top }) || { left: rect.left, top: rect.top };
            audioDebugPosition.value = currentPosition;
            audioDebugDragState = {
                pointerX: event.clientX,
                pointerY: event.clientY,
                startLeft: currentPosition.left,
                startTop: currentPosition.top
            };
            isAudioDebugDragging.value = true;
            event.preventDefault();
            try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch (_) {}
            global.addEventListener('pointermove', handleAudioDebugDragMove, { passive: false });
            global.addEventListener('pointerup', stopAudioDebugDrag);
            global.addEventListener('pointercancel', stopAudioDebugDrag);
        };

        const restoreAudioDebugPositionIntoViewport = () => {
            if (!audioDebugPosition.value) return;
            nextTick(() => setAudioDebugPosition(audioDebugPosition.value, true));
        };

        const runAction = async (actionName) => {
            const actions = getActions() || {};
            const action = actions[actionName];
            if (typeof action === 'function') {
                await action();
            }
            refreshAudioDebugState();
        };

        const debugResumeAudioContext = async () => runAction('debugResumeAudioContext');
        const debugTestSfx = async () => runAction('debugTestSfx');
        const debugTestBgmPlay = async () => runAction('debugTestBgmPlay');
        const debugPauseBgm = async () => runAction('debugPauseBgm');
        const debugTestRawAudio = async () => runAction('debugTestRawAudio');
        const debugEnableHtmlAudioFallback = async () => runAction('debugEnableHtmlAudioFallback');
        const debugDisableHtmlAudioFallback = async () => runAction('debugDisableHtmlAudioFallback');
        const debugEnableFallbackAudioContextV2 = async () => runAction('debugEnableFallbackAudioContextV2');
        const debugDisableFallbackAudioContextV2 = async () => runAction('debugDisableFallbackAudioContextV2');
        const debugResumeFallbackAudioContext = async () => runAction('debugResumeFallbackAudioContext');
        const debugTestFallbackContextBgm = async () => runAction('debugTestFallbackContextBgm');
        const debugTestFallbackBgm = async () => runAction('debugTestFallbackBgm');
        const debugTestFallbackSfx = async () => runAction('debugTestFallbackSfx');
        const debugShowAudioState = async () => runAction('debugShowAudioState');

        let _heartbeatTimer = null;
        if (isAudioDebugEnabled.value) {
            _heartbeatTimer = global.setInterval(() => {
                if (isAudioDebugOpen.value) refreshAudioDebugState();
            }, 1000);

            onMounted(() => {
                restoreAudioDebugPositionIntoViewport();
                global.addEventListener('resize', restoreAudioDebugPositionIntoViewport);
                global.addEventListener('orientationchange', restoreAudioDebugPositionIntoViewport);
            });
        }

        watch(isAudioDebugOpen, () => {
            restoreAudioDebugPositionIntoViewport();
        });

        return {
            isAudioDebugEnabled,
            isAudioDebugOpen,
            isAudioDebugDragging,
            audioDebugOverlayStyle,
            audioDebugSections,
            refreshAudioDebugState,
            startAudioDebugDrag,
            markAudioDebugEvent,
            debugResumeAudioContext,
            debugTestSfx,
            debugTestBgmPlay,
            debugPauseBgm,
            debugTestRawAudio,
            debugEnableHtmlAudioFallback,
            debugDisableHtmlAudioFallback,
            debugEnableFallbackAudioContextV2,
            debugDisableFallbackAudioContextV2,
            debugResumeFallbackAudioContext,
            debugTestFallbackContextBgm,
            debugTestFallbackBgm,
            debugTestFallbackSfx,
            debugShowAudioState,
            _heartbeatTimer
        };
    }

    global.JPAPPAudioDebugManager = { createAudioDebugManager };
})(window);
