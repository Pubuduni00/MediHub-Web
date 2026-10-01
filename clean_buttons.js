const fs = require('fs');
let content = fs.readFileSync('src/pages/PatientProfilePage.js', 'utf-8');

// 1. Remove stopSession function
const stopSessionRegex = /const stopSession = async \(\) => \{[\s\S]*?\};\n\n/g;
content = content.replace(stopSessionRegex, '');

// 2. Remove the hasActiveSession button JSX
const stopSessionBtnRegex = /\{hasActiveSession && \([\s\S]*?<Square size=\{13\} fill="currentColor"\/> Stop Session\s*<\/button>\s*\)\}\s*/g;
content = content.replace(stopSessionBtnRegex, '');

// 3. Update handleEndSession to remove all keys
const oldHandleEnd = /sessionStorage\.removeItem\('active_appt_id'\);/g;
const newHandleEnd = `sessionStorage.removeItem('active_appt_id');
      sessionStorage.removeItem('activeAppointmentId');
      sessionStorage.removeItem('activePatientId');`;
content = content.replace(oldHandleEnd, newHandleEnd);

fs.writeFileSync('src/pages/PatientProfilePage.js', content, 'utf-8');
console.log("Cleaned up buttons!");
