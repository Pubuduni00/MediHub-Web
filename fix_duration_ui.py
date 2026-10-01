import re

with open('src/components/patients/PatientLogModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update EMPTY_DRUG
content = content.replace("duration:''", "duration:'Ongoing'")

# 2. Update the input to select
search_input = r"""<input className="form-control" style=\{\{ padding:'5px 8px', fontSize:13 \}\} value=\{d\.duration\} onChange=\{e=>updateDrug\(i,'duration',e\.target\.value\)\} placeholder="e\.g\. 30 days"/>"""

repl_input = r"""<select className="form-control" style={{ padding:'5px 8px', fontSize:13 }} value={d.duration || 'Ongoing'} onChange={e=>updateDrug(i,'duration',e.target.value)}>
                              {['Ongoing', '3 days', '5 days', '7 days', '14 days', '30 days'].map(m=><option key={m}>{m}</option>)}
                            </select>"""

if search_input in content:
    content = content.replace(search_input, repl_input)
else:
    content = re.sub(search_input, repl_input, content)

with open('src/components/patients/PatientLogModal.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PatientLogModal.js")
