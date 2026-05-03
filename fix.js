const fs = require('fs');
let css = fs.readFileSync('assets/css/styles.css', 'utf8');

const broken1 =   gap: clamp(24px, 2.8vw, 36px) !important;\r\n }\r\n\r\n  bottom: calc(env(safe-area-inset-bottom, 0px) + 42px) !important;;
const fixed1 =   gap: clamp(24px, 2.8vw, 36px) !important;\r\n }\r\n\r\n .battle-hud-bars {\r\n  position: fixed !important;\r\n  left: 50% !important;\r\n  bottom: calc(env(safe-area-inset-bottom, 0px) + 46px) !important;\r\n  transform: translateX(-50%) !important;\r\n  width: clamp(168px, 20vw, 224px) !important;\r\n  flex-basis: auto !important;\r\n  max-width: clamp(168px, 20vw, 224px) !important;\r\n  z-index: 55;\r\n }\r\n\r\n .battle-hud-actions {\r\n  position: fixed !important;\r\n  left: calc(50% + 150px) !important;\r\n  bottom: calc(env(safe-area-inset-bottom, 0px) + 42px) !important;;

css = css.replace(broken1, fixed1);
if (!css.includes('.battle-hud-bars')) css = css.replace(broken1.replace(/\r/g, ''), fixed1.replace(/\r/g, ''));

const broken2 =   bottom: clamp(25px, 3.8vw, 44px);\r\n .resonance-wheel > .resonance-slot:nth-child(3):nth-last-child(2) {;
const fixed2 =   bottom: clamp(25px, 3.8vw, 44px);\r\n  height: clamp(108px, 13.5vw, 158px);\r\n  border-bottom: 1px solid rgba(255, 237, 180, 0.28);\r\n  border-radius: 0 0 50% 50%;\r\n  pointer-events: none;\r\n  z-index: 0;\r\n  filter: blur(0.4px);\r\n }\r\n\r\n /* 桌機共鳴輪弧度：單一 layout top 方案；hover/狀態只做微互動 */\r\n .resonance-wheel > .resonance-slot:nth-child(1):nth-last-child(4),\r\n .resonance-wheel > .resonance-slot:nth-child(4):nth-last-child(1) {\r\n  --slot-arc-top: -56px;\r\n  transform: none !important;\r\n }\r\n\r\n .resonance-wheel > .resonance-slot:nth-child(2):nth-last-child(3),\r\n .resonance-wheel > .resonance-slot:nth-child(3):nth-last-child(2) {;

css = css.replace(broken2, fixed2);
if (!css.includes('clamp(108px')) css = css.replace(broken2.replace(/\r/g, ''), fixed2.replace(/\r/g, ''));

if (!css.includes('spirit-breathe')) {
    css += \n/* Spirit Breathing Animation */\n@keyframes spirit-breathe {\n 0%, 100% { transform: translateY(0) scale(1); }\n 50% { transform: translateY(-2px) scale(1.02); }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n .resonance-spirit-icon {\n  animation: spirit-breathe 3s ease-in-out infinite;\n }\n\n .resonance-slot:nth-child(1) .resonance-spirit-icon { animation-delay: 0.0s; }\n .resonance-slot:nth-child(2) .resonance-spirit-icon { animation-delay: -0.7s; }\n .resonance-slot:nth-child(3) .resonance-spirit-icon { animation-delay: -1.4s; }\n .resonance-slot:nth-child(4) .resonance-spirit-icon { animation-delay: -2.1s; }\n\n .resonance-slot.is-active .resonance-spirit-icon,\n .resonance-slot.is-selected .resonance-spirit-icon,\n .resonance-slot.is-correct .resonance-spirit-icon,\n .resonance-slot.is-wrong .resonance-spirit-icon,\n .resonance-slot:active .resonance-spirit-icon,\n .resonance-slot[disabled] .resonance-spirit-icon {\n  animation-play-state: paused;\n }\n}\n;
}

fs.writeFileSync('assets/css/styles.css', css, 'utf8');
console.log('Fixed CSS.');
