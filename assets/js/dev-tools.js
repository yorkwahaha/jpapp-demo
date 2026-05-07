(function (global) {
    'use strict';

    const DEV_TOOLS_STORAGE_KEY = 'jpapp_dev_tools';
    const FPS_DEBUG_STORAGE_KEY = 'jpapp_show_fps_debug';

    const readStorageFlag = (key) => {
        try {
            const raw = global.localStorage?.getItem(key);
            return raw === '1' || raw === 'true';
        } catch (_) {
            return false;
        }
    };

    const writeStorageFlag = (key, value) => {
        try {
            global.localStorage?.setItem(key, String(value));
        } catch (_) { }
    };

    const getDevToolsVisibleDefault = () => {
        const h = global.location?.hostname || '';
        const params = new URLSearchParams(global.location?.search || '');
        const isLocalDevHost = global.location?.protocol === 'file:'
            || h === 'localhost'
            || h === '127.0.0.1'
            || h === '0.0.0.0';

        return isLocalDevHost ||
            params.get('debug') === '1' ||
            params.get('dev') === '1' ||
            readStorageFlag(DEV_TOOLS_STORAGE_KEY);
    };

    function createDevToolsState(options = {}) {
        const ref = options.vue?.ref || ((value) => ({ value }));
        const isDevToolsVisible = ref(getDevToolsVisibleDefault());
        const showFpsDebug = ref(isDevToolsVisible.value && readStorageFlag(FPS_DEBUG_STORAGE_KEY));

        const toggleFpsDebug = () => {
            if (!isDevToolsVisible.value) return;
            const newVal = !showFpsDebug.value;
            showFpsDebug.value = newVal;
            writeStorageFlag(FPS_DEBUG_STORAGE_KEY, newVal);
            if (newVal && typeof global.__startFpsLoop === 'function') {
                global.__startFpsLoop();
            }
        };

        return {
            isDevToolsVisible,
            showFpsDebug,
            toggleFpsDebug
        };
    }

    global.JPAPPDevToolsManager = { createDevToolsState };
})(window);
