with open('src/pages/PatientProfilePage.js', 'r', encoding='utf-8') as f:
    content = f.read()

s = """                    let totalInvest = 0;
                    dateLogs.forEach(l => {
                      if (l.drugs) l.drugs.forEach(d => { if(d.drug) uniqueDrugs.add(d.drug.toLowerCase().trim()); });
                      if (l.investigations) totalInvest += l.investigations.length;
                    });"""

r = """                    let totalInvest = 0;
                    dateLogs.forEach(l => {
                      if (l.drugs) l.drugs.forEach(d => { if(d.drug) uniqueDrugs.add(d.drug.toLowerCase().trim()); });
                      if (l.investigations) {
                          totalInvest += l.investigations.filter(i => (i.type || i.investigation) && String(i.type || i.investigation).trim() !== '').length;
                      }
                    });"""

if s in content:
    content = content.replace(s, r)
    with open('src/pages/PatientProfilePage.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found!")
