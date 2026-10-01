const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf-8');

content = content.replace(
  /startDate: startDate,\s+endDate: null,\s+takenStatus: \{\},/g,
  `startDate: startDate,\n            endDate: calculateEndDate(startDate, drug.duration),\n            takenStatus: {},`
);

content = content.replace(
  /startDate: new Date\(log\.date\)\.getTime\(\),\s+endDate: null,\s+takenStatus: \{\},/g,
  `startDate: new Date(log.date).getTime(),\n              endDate: calculateEndDate(new Date(log.date).getTime(), drug.duration),\n              takenStatus: {},`
);

content = content.replace(
  /startDate: new Date\(log\.date\)\.getTime\(\),\s+endDate: drug\.endDate \? new Date\(drug\.endDate\)\.getTime\(\) : null,\s+takenStatus: \{\},/g,
  `startDate: new Date(log.date).getTime(),\n            endDate: drug.endDate ? new Date(drug.endDate).getTime() : calculateEndDate(new Date(log.date).getTime(), drug.duration),\n            takenStatus: {},`
);

fs.writeFileSync('server.js', content, 'utf-8');
console.log("Regex replaced via Node!");
