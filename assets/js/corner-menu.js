// ================= [ CORNER MENU ] =================
window.__initCornerMenu = function (watch, showLevelSelect, isFinished) {

    if (!document.getElementById('cornerMenu')) {

        const cornerMenu = document.createElement('div');

        cornerMenu.id = 'cornerMenu';

        cornerMenu.innerHTML = `

                    <div class="corner-menu-items">

                        <button class="corner-menu-btn" data-target="技能"><span style="font-size:18px;">📖</span><span>技能</span></button>

                        <button class="corner-menu-btn" data-target="回復藥水"><span style="font-size:18px;">🧪</span><span>道具</span></button>

                        <button class="corner-menu-btn" data-target="系統"><span style="font-size:18px;">⚙️</span><span>系統</span></button>

                    </div>

                    <button id="cornerMenuToggle" class="corner-menu-toggle">☰</button>

                `;

        document.body.appendChild(cornerMenu);



        const toggleBtn = cornerMenu.querySelector('#cornerMenuToggle');

        toggleBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            cornerMenu.classList.toggle('open');

            toggleBtn.innerHTML = cornerMenu.classList.contains('open') ? '▼' : '☰';

        });



        const btns = cornerMenu.querySelectorAll('.corner-menu-items button');

        btns.forEach(btn => {

            btn.addEventListener('click', (e) => {

                e.stopPropagation();

                const targetTitle = btn.dataset.target;

                const originalBtn = document.querySelector(`.left-actionbar button[title="${targetTitle}"]`);

                if (originalBtn && !originalBtn.disabled) originalBtn.click();

                cornerMenu.classList.remove('open');

                toggleBtn.innerHTML = '☰';

            });

        });



        document.addEventListener('click', (e) => {

            if (cornerMenu.classList.contains('open') && !cornerMenu.contains(e.target)) {

                cornerMenu.classList.remove('open');

                toggleBtn.innerHTML = '☰';

            }

        });



        // 根據戰鬥狀態控制顯示隱藏

        watch([showLevelSelect, isFinished], ([showLvl, finished]) => {

            if (!showLvl && !finished) {

                cornerMenu.classList.add('is-in-battle');

            } else {

                cornerMenu.classList.remove('is-in-battle');

                cornerMenu.classList.remove('open');

                toggleBtn.innerHTML = '☰';

            }

        }, { immediate: true });

    }

};
