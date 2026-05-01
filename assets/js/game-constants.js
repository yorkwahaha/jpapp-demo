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
            hit: 'assets/audio/sfx_hit.mp3',
            miss: 'assets/audio/mmiss.mp3',
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            uiPop: 'assets/audio/pop.mp3',
            battlePop: 'assets/audio/pop2.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3'
        },

        SHORT_SFX_PATHS: {
            hit: 'assets/audio/sfx_hit.mp3',
            miss: 'assets/audio/mmiss.mp3',
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            damage1: 'assets/audio/damage1.mp3',
            damage2: 'assets/audio/damage2.mp3',
            damage3: 'assets/audio/damage3.mp3',
            damage4: 'assets/audio/damage4.mp3',
            damage5: 'assets/audio/damage5.mp3',
            damage6: 'assets/audio/damage6.mp3',
            damage7: 'assets/audio/damage7.mp3',
            damage8: 'assets/audio/damage8.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            pop: 'assets/audio/pop.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3'
        },

        UI_SFX_SRC_MAP: {
            hit: 'assets/audio/sfx_hit.mp3',
            hit2: 'assets/audio/sfx_hit2.mp3',
            miss: 'assets/audio/sfx_miss.mp3',
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            damage1: 'assets/audio/damage1.mp3',
            damage2: 'assets/audio/damage2.mp3',
            damage3: 'assets/audio/damage3.mp3',
            damage4: 'assets/audio/damage4.mp3',
            damage5: 'assets/audio/damage5.mp3',
            damage6: 'assets/audio/damage6.mp3',
            damage7: 'assets/audio/damage7.mp3',
            damage8: 'assets/audio/damage8.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            bossClear: '',
            monsterDeathCry: 'assets/audio/sfx/monster_death_cry.mp3',
            bossDeathCry: 'assets/audio/sfx/boss_death_cry.mp3',
            bossExplosion: 'assets/audio/sfx/boss_explosion.mp3',
            uiPop: 'assets/audio/pop.mp3',
            battlePop: 'assets/audio/pop2.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3',
            cardFlip: 'assets/audio/sfx/card-flip.mp3',
            escape: 'assets/audio/sfx_escape.mp3'
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
            hit2: 0.9,
            damage: 0.95
        }
    });
})();
