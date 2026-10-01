with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

s = "investigations: JSON.parse(l.investigations)"
r = "investigations: JSON.parse(l.investigations),\n        nextSessionInvestigations: l.nextsessioninvestigations ? JSON.parse(l.nextsessioninvestigations) : [],\n        nextSessionNotes: l.nextsessionnotes || null"

if s in content:
    content = content.replace(s, r)
    with open('server.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found!")
