import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = r"""        investigations: JSON\.parse\(l\.investigations\)
      \}\)\);"""

repl = r"""        investigations: JSON.parse(l.investigations),
        nextSessionInvestigations: l.nextsessioninvestigations ? JSON.parse(l.nextsessioninvestigations) : [],
        nextSessionNotes: l.nextsessionnotes || null
      }));"""

content = re.sub(search, repl, content)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed GET api!')
