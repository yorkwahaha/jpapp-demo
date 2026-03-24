


// ================= [ BATTLE LOG — DOM HELPERS ] =================
const battleLogs = [];

function pushBattleLog(text, type = "info") {

    battleLogs.unshift({ text, type, _isNew: true });

    if (battleLogs.length > 5) {

        battleLogs.pop();

    }

    renderBattleLog();

    flashBattleLog();

}



function renderBattleLog() {

    const container = document.getElementById('battleLog');

    if (!container) return;



    container.innerHTML = '';

    if (battleLogs.length > 0) {

        const log = battleLogs[0];

        const div = document.createElement('div');

        div.className = `log-item type-${log.type}`;

        div.textContent = log.text;



        if (log._isNew) {

            div.style.animation = 'fadeInLog 0.3s ease-out forwards';

            log._isNew = false;

        }



        container.appendChild(div);

    }

}



function flashBattleLog() {

    const el = document.getElementById("battleLog");

    if (!el) return;

    el.classList.remove("flash");

    void el.offsetWidth;

    el.classList.add("flash");

    window.setTimeout(() => el.classList.remove("flash"), 220);

}



function formatBattleMsg({ actor, action, value, extra }) {

    let msg = "";

    if (actor) msg += actor;

    if (action) msg += action;

    if (value) msg += " " + value;

    if (extra) msg += " (" + extra + ")";

    return msg.trim();

}


