import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix GET /api/patient-logs
content = content.replace("l.nextSessionInvestigations ? JSON.parse(l.nextSessionInvestigations) : []", 
                          "l.nextsessioninvestigations ? JSON.parse(l.nextsessioninvestigations) : []")
content = content.replace("nextSessionNotes: l.nextSessionNotes", 
                          "nextSessionNotes: l.nextsessionnotes")

# Fix POST /api/appointments
content = content.replace("if (lastLog && lastLog.investigationsAttached === 0 && lastLog.nextSessionInvestigations)", 
                          "if (lastLog && lastLog.investigationsattached === 0 && lastLog.nextsessioninvestigations)")
content = content.replace("finalInvs = JSON.parse(lastLog.nextSessionInvestigations);", 
                          "finalInvs = JSON.parse(lastLog.nextsessioninvestigations);")
content = content.replace("finalInvNotes = lastLog.nextSessionNotes;", 
                          "finalInvNotes = lastLog.nextsessionnotes;")

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed server.js casing!')
