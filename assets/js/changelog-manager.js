/**
 * JPAPP Changelog overlay — fetch/load + app version banner localStorage gate.
 */
(function (global) {
    'use strict';

    function createChangelogState(options) {
        const ref = options.ref;
        const APP_VERSION = options.APP_VERSION;
        const fetchFn = typeof options.fetch === 'function'
            ? options.fetch
            : (typeof global.fetch === 'function' ? global.fetch.bind(global) : null);

        const isChangelogOpen = ref(false);
        const changelogData = ref([]);
        const changelogError = ref(false);

        const openChangelog = async () => {
            isChangelogOpen.value = true;
            if (changelogData.value.length > 0 || changelogError.value) return;
            if (!fetchFn) {
                changelogError.value = true;
                return;
            }
            try {
                const res = await fetchFn('assets/data/changelog.json?v=' + encodeURIComponent(String(APP_VERSION)));
                if (!res.ok) {
                    changelogError.value = true;
                    return;
                }
                changelogData.value = await res.json();
                changelogError.value = false;
            } catch (_) {
                changelogError.value = true;
            }
        };

        return { isChangelogOpen, changelogData, changelogError, openChangelog };
    }

    /** First-run stamps version; mismatched versions alert + reload. */
    function applyVersionStoragePolicy(APP_VERSION, localStorageLike) {
        const ls = localStorageLike || global.localStorage;
        const savedVersion = ls.getItem('jpRpgAppVersion');
        if (!savedVersion) {
            ls.setItem('jpRpgAppVersion', APP_VERSION);
        } else if (savedVersion !== APP_VERSION) {
            ls.setItem('jpRpgAppVersion', APP_VERSION);
            global.alert('遊戲已更新，將重新載入最新版');
            global.location.reload(true);
        }
    }

    if (!Array.prototype.random) {
        Array.prototype.random = function() {
            return this[Math.floor(Math.random() * this.length)];
        };
    }

    global.JPAPPChangelogManager = {
        createChangelogState,
        applyVersionStoragePolicy
    };
})(typeof window !== 'undefined' ? window : globalThis);
