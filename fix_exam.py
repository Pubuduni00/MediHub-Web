import re

with open('src/pages/PatientProfilePage.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = r"""                    let uniqueDrugs = new Set\(\);
                    let totalInvest = 0;
                    dateLogs\.forEach\(l => \{
                      if \(l\.drugs\) l\.drugs\.forEach\(d => \{ if\(d\.drug\) uniqueDrugs\.add\(d\.drug\.toLowerCase\(\)\.trim\(\)\); \}\);
                      if \(l\.investigations\) \{
                        totalInvest \+= l\.investigations\.filter\(i => \(i\.type \|\| i\.investigation\) && String\(i\.type \|\| i\.investigation\)\.trim\(\) !== ''\)\.length;
                        \}
                    \}\);
                    return \(
                      <div key=\{date\} 
                        className="clickable-log-item"
                        onClick=\{\(\) => \{
                          setSelectedLogDate\(date\);
                          setSelectedLogsForPopup\(dateLogs\);
                        \}\}
                        style=\{\{ padding:'6px 10px', borderRadius:'var\(--radius-md\)', border:'1px solid var\(--border\)', background:'var\(--bg-base\)' \}\}
                      >
                        <div style=\{\{ display:'flex', alignItems:'center', justifyContent:'space-between' \}\}>
                          <span style=\{\{ fontWeight:600, fontSize:13, color:'var\(--text-primary\)' \}\}>\{date\}</span>
                          <span style=\{\{ fontSize:12, color:'var\(--text-muted\)' \}\}>
                            \{uniqueDrugs\.size\} drug\(s\) - \{totalInvest\} investigation\(s\)
                          </span>
                        </div>
                      </div>
                    \);"""

repl = r"""                    let uniqueDrugs = new Set();
                    let totalInvest = 0;
                    let mainDiagnosis = '';
                    dateLogs.forEach(l => {
                      if (l.drugs) l.drugs.forEach(d => { if(d.drug) uniqueDrugs.add(d.drug.toLowerCase().trim()); });
                      if (l.investigations) {
                        totalInvest += l.investigations.filter(i => (i.type || i.investigation) && String(i.type || i.investigation).trim() !== '').length;
                      }
                      if (l.examination) {
                        if (l.examination.diagnosis && !mainDiagnosis) mainDiagnosis = l.examination.diagnosis;
                        else if (l.examination.chiefComplaint && !mainDiagnosis) mainDiagnosis = l.examination.chiefComplaint;
                      }
                    });
                    return (
                      <div key={date} 
                        className="clickable-log-item"
                        onClick={() => {
                          setSelectedLogDate(date);
                          setSelectedLogsForPopup(dateLogs);
                        }}
                        style={{ padding:'8px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}
                      >
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                            <span style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>{date}</span>
                            {mainDiagnosis && <span style={{ fontSize:11.5, color:'var(--text-secondary)' }}>{mainDiagnosis}</span>}
                          </div>
                          <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                            {uniqueDrugs.size} drug(s) - {totalInvest} investigation(s)
                          </span>
                        </div>
                      </div>
                    );"""

content = re.sub(search, repl, content)

with open('src/pages/PatientProfilePage.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated examination details!")
