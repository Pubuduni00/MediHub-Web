const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf-8');

const s1 = `            prescribedBy: doctorName,
            startDate: startDate,
            endDate: null,
            takenStatus: {},`;
const r1 = `            prescribedBy: doctorName,
            startDate: startDate,
            endDate: calculateEndDate(startDate, drug.duration),
            takenStatus: {},`;

const s2 = `              prescribedBy: log.doctorName,
              startDate: new Date(log.date).getTime(),
              endDate: null,
              takenStatus: {},`;
const r2 = `              prescribedBy: log.doctorName,
              startDate: new Date(log.date).getTime(),
              endDate: calculateEndDate(new Date(log.date).getTime(), drug.duration),
              takenStatus: {},`;

const s3 = `            prescribedBy: log.doctorName,
            startDate: new Date(log.date).getTime(),
            endDate: drug.endDate ? new Date(drug.endDate).getTime() : null,
            takenStatus: {},`;
const r3 = `            prescribedBy: log.doctorName,
            startDate: new Date(log.date).getTime(),
            endDate: drug.endDate ? new Date(drug.endDate).getTime() : calculateEndDate(new Date(log.date).getTime(), drug.duration),
            takenStatus: {},`;

content = content.replace(s1, r1);
content = content.replace(s2, r2);
content = content.replace(s3, r3);

fs.writeFileSync('server.js', content, 'utf-8');
console.log("Updated via Node.js");
