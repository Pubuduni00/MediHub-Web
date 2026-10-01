const fs = require('fs');
let content = fs.readFileSync('src/components/patients/LogViewPopup.js', 'utf8');

const search = '<div style={{ overflowY:\\'auto\\', padding:20, display:\\'flex\\', flexDirection:\\'column\\', gap:20 }}>';
const repl = '<div style={{ flex: 1, minHeight: 0, overflowY:\\'auto\\', padding:20, display:\\'flex\\', flexDirection:\\'column\\', gap:20 }}>';

if (content.includes(search)) {
  content = content.replace(search, repl);
  fs.writeFileSync('src/components/patients/LogViewPopup.js', content);
  console.log('Replaced successfully');
} else {
  console.log('Not found');
}
