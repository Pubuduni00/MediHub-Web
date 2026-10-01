import re

with open('src/pages/PatientProfilePage.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = r"if \(l\.investigations\) totalInvest \+= l\.investigations\.length;"
repl = r"""if (l.investigations) {
                        totalInvest += l.investigations.filter(i => (i.type || i.investigation) && String(i.type || i.investigation).trim() !== '').length;
                      }"""

content = re.sub(search, repl, content)

with open('src/pages/PatientProfilePage.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replaced!")
