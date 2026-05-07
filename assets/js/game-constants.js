(function () {
    window.JPAPP_CONSTANTS = window.JPAPP_CONSTANTS || {};

    Object.assign(window.JPAPP_CONSTANTS, {
        PARTICLE_TO_ICON_MAP: {
            'は': 'wa',
            'が': 'ga',
            'を': 'wo',
            'に': 'ni',
            'で': 'de',
            'と': 'to',
            'も': 'mo',
            'へ': 'he',
            'の': 'no',
            'から': 'kara',
            'まで': 'made',
            'より': 'yori',
            'や': 'ya'
        },

        MENTOR_EMOTION_IMAGE_PATHS: {
            gentle: 'assets/images/mentor/selene_gentle.webp',
            explain: 'assets/images/mentor/selene_explain.webp',
            encourage: 'assets/images/mentor/selene_encourage.webp',
            happy: 'assets/images/mentor/selene_happy.webp',
            concerned: 'assets/images/mentor/selene_concerned.webp',
            surprised: 'assets/images/mentor/selene_surprised.webp',
            proud: 'assets/images/mentor/selene_proud.webp',
            blessing: 'assets/images/mentor/selene_blessing.webp'
        },

        PRELOAD_SFX_PATHS: {
            hit: 'assets/audio/sfx/sfx_hit.mp3',
            fullBondHit: 'assets/audio/sfx/sfx_hit2.mp3',
            miss: 'assets/audio/sfx/sfx_miss.mp3',
            potion: 'assets/audio/sfx/sfx_potion.mp3',
            click: 'assets/audio/sfx/sfx_click.mp3',
            damage: 'assets/audio/sfx/damage.mp3',
            fanfare: 'assets/audio/sfx/fanfare.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            uiPop: 'assets/audio/sfx/pop.mp3',
            battlePop: 'assets/audio/sfx/pop2.mp3',
            win: 'assets/audio/sfx/win.mp3',
            gameover: 'assets/audio/sfx/sfx_gameover.mp3'
        },

        SHORT_SFX_PATHS: {
            hit: 'assets/audio/sfx/sfx_hit.mp3',
            fullBondHit: 'assets/audio/sfx/sfx_hit2.mp3',
            miss: 'assets/audio/sfx/sfx_miss.mp3',
            potion: 'assets/audio/sfx/sfx_potion.mp3',
            click: 'assets/audio/sfx/sfx_click.mp3',
            damage: 'assets/audio/sfx/damage.mp3',
            damage1: 'assets/audio/sfx/damage1.mp3',
            damage2: 'assets/audio/sfx/damage2.mp3',
            damage3: 'assets/audio/sfx/damage3.mp3',
            damage4: 'assets/audio/sfx/damage4.mp3',
            damage5: 'assets/audio/sfx/damage5.mp3',
            damage6: 'assets/audio/sfx/damage6.mp3',
            damage7: 'assets/audio/sfx/damage7.mp3',
            damage8: 'assets/audio/sfx/damage8.mp3',
            fanfare: 'assets/audio/sfx/fanfare.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            pop: 'assets/audio/sfx/pop.mp3',
            win: 'assets/audio/sfx/win.mp3',
            gameover: 'assets/audio/sfx/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3'
        },

        UI_SFX_SRC_MAP: {
            hit: 'assets/audio/sfx/sfx_hit.mp3',
            giragiraHit: 'assets/audio/sfx/sfx_hit3.mp3',
            fullBondHit: 'assets/audio/sfx/sfx_hit2.mp3',
            miss: 'assets/audio/sfx/sfx_miss.mp3',
            potion: 'assets/audio/sfx/sfx_potion.mp3',
            click: 'assets/audio/sfx/sfx_click.mp3',
            damage: 'assets/audio/sfx/damage.mp3',
            damage1: 'assets/audio/sfx/damage1.mp3',
            damage2: 'assets/audio/sfx/damage2.mp3',
            damage3: 'assets/audio/sfx/damage3.mp3',
            damage4: 'assets/audio/sfx/damage4.mp3',
            damage5: 'assets/audio/sfx/damage5.mp3',
            damage6: 'assets/audio/sfx/damage6.mp3',
            damage7: 'assets/audio/sfx/damage7.mp3',
            damage8: 'assets/audio/sfx/damage8.mp3',
            fanfare: 'assets/audio/sfx/fanfare.mp3',
            bossClear: '',
            monsterDeathCry: 'assets/audio/sfx/monster_death_cry.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            uiPop: 'assets/audio/sfx/pop.mp3',
            battlePop: 'assets/audio/sfx/pop2.mp3',
            win: 'assets/audio/sfx/win.mp3',
            gameover: 'assets/audio/sfx/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3',
            escape: 'assets/audio/sfx/sfx_escape.mp3'
        },

        SFX_SCALES: {
            fanfare: 0.6,
            bossClear: 0.6,
            monsterDeathCry: 0.78,
            bossDeathCry: 0.82,
            bossExplosion: 0.72,
            win: 0.7,
            gameover: 0.8,
            skillget: 0.8,
            uiPop: 1.0,
            battlePop: 0.9,
            hit: 0.9,
            giragiraHit: 0.9,
            fullBondHit: 0.86,
            damage: 0.95
        },

        SPIRIT_IMAGE_PLACEHOLDER: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="g" cx="50%" cy="38%" r="58%"><stop offset="0%" stop-color="#fef3c7" stop-opacity=".9"/><stop offset="50%" stop-color="#fbbf24" stop-opacity=".38"/><stop offset="100%" stop-color="#1e1b4b" stop-opacity=".05"/></radialGradient></defs><rect width="512" height="512" rx="96" fill="#161225"/><circle cx="256" cy="246" r="162" fill="url(#g)"/><path d="M256 116c58 0 105 49 105 110 0 76-63 130-105 170-42-40-105-94-105-170 0-61 47-110 105-110Z" fill="#fbbf24" opacity=".36"/><circle cx="256" cy="224" r="46" fill="#fff7ed" opacity=".48"/><path d="M170 391c45 28 127 28 172 0" fill="none" stroke="#fde68a" stroke-width="18" stroke-linecap="round" opacity=".48"/></svg>`),

        MASTERY_PARTICLES: ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'],

        HERO_VISUAL_CONFIG: {
            battle: {
                marginBottom: '150px',
                width: 'clamp(110px, 7vw, 160px)',
                height: 'clamp(110px, 7vw, 160px)',
                leftMobile: '1rem',
                leftDesktop: '50%',
                desktopOffsetX: '-180px'
            },
            map: {
                src: 'assets/images/hero/hero_001.png'
            },
            thresholds: [
                { hpPct: 0.8, expression: 'neutral' },
                { hpPct: 0.4, expression: 'ase' },
                { hpPct: 0.0, expression: 'lose' }
            ]
        },

        SPIRIT_ICON_BASE_PATH: 'assets/images/spirits/icons/',

        SCENE_IMAGE_PATHS: {
            prologueBg: '',
            prologueFallbackBg: 'assets/images/bg_home_painterly.webp',
            mainEndingBg: 'assets/images/levels/bg_lv1.webp'
        },

        DEFAULT_IMAGE_PATHS: {
            battleBg: 'assets/images/bg_01.jpg',
            mapFallback: 'assets/images/maps/chapter1.png',
            monsterSprite: 'assets/images/monsters/slime.png'
        },

        SKILL_TYPE_LABELS: {
            debuff: '弱化敵方',
            buff: '強化自身',
            heal: '恢復狀態',
            attackBuff: '攻擊強化'
        },

        VALID_TTS_VOICES: ['ja-JP-Standard-A', 'ja-JP-Wavenet-A', 'ja-JP-Neural2-B', 'ja-JP-Wavenet-D'],

        ONEESAN_PRAISES: ['せいかい！', 'ナイス！', 'いいね！', 'すごい！', 'かっこいい！', 'まじか！', 'さいこう！'],

        COMBO_FEEDBACK_MILESTONES: {
            3: 'combo-good',
            6: 'combo-great',
            9: 'combo-amazing',
            12: 'combo-max',
            15: 'combo-perfect',
        },

        FEEDBACK_VOICE_PATHS: {
            'combo-good': ['combo-good-01.m4a', 'combo-good-02.m4a'],
            'combo-great': ['combo-great-01.m4a', 'combo-great-02.m4a'],
            'combo-amazing': ['combo-amazing-01.m4a', 'combo-amazing-02.m4a'],
            'combo-max': ['combo-max-01.m4a', 'combo-max-02.m4a'],
            'combo-perfect': ['combo-perfect-01.m4a', 'combo-perfect-02.m4a'],
            correct: ['correct-01.m4a', 'correct-02.m4a'],
            wrong: ['wrong-01.m4a'],
            'low-hp': ['low-hp-01.m4a'],
            victory: ['victory-01.m4a']
        },

        GRADE_RANK: { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, '-': 0 }
    });
})();
