import sys
import re

with open('src/pages/PatientProfilePage.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(?s)\{logs\.slice\(\)\.reverse\(\)\.slice\(0,5\)\.map\(log=>\(.*?\)\)\}'

replacement = """{(() => {
                const groupedLogs = {};
                logs.forEach(log => {
                  if (!groupedLogs[log.date]) groupedLogs[log.date] = [];
                  groupedLogs[log.date].push(log);
                });
                const sortedDates = Object.keys(groupedLogs).sort((a,b) => new Date(b) - new Date(a)).slice(0,5);
                
                return sortedDates.map(date => {
                  const dateLogs = groupedLogs[date];
                  let uniqueDrugs = new Set();
                  let totalInvest = 0;
                  dateLogs.forEach(l => {
                    if (l.drugs) l.drugs.forEach(d => { if(d.drug) uniqueDrugs.add(d.drug.toLowerCase().trim()); });
                    if (l.investigations) totalInvest += l.investigations.length;
                  });
                  return (
                    <div key={date} 
                      className="clickable-log-item"
                      onClick={() => {
                        setSelectedLogDate(date);
                        setSelectedLogsForPopup(dateLogs);
                      }}
                      style={{ padding:'6px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}
                    >
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>{date}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                          {uniqueDrugs.size} drug(s) - {totalInvest} investigation(s)
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}"""

if re.search(pattern, content):
    new_content = re.sub(pattern, replacement, content)
    with open('src/pages/PatientProfilePage.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Regex replace successful!')
else:
    print('Pattern not found!')
