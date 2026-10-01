const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
  /investigations: JSON\.parse\(l\.investigations\)/g,
  `investigations: JSON.parse(l.investigations),
        nextSessionInvestigations: l.nextSessionInvestigations ? JSON.parse(l.nextSessionInvestigations) : [],
        nextSessionNotes: l.nextSessionNotes`
);
fs.writeFileSync('server.js', content);
console.log('GET updated');
