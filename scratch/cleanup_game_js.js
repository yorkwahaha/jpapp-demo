const fs = require('fs');
const path = 'assets/js/game.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('SPIRITS\n        });  });', 'SPIRITS\n        });');

fs.writeFileSync(path, content);
console.log("Cleaned up game.js");
