import re

with open('src/components/patients/PatientLogModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = r"const logPayload = \{(.*?)\};"

def replacer(match):
    original = match.group(0)
    if "drugs:" not in original:
        return """const validDrugs = drugs.filter(d => d.drug && d.drug.trim() !== '');
      const validInvs = investigations.filter(i => (i.type || i.investigation) && String(i.type || i.investigation).trim() !== '');
      const logPayload = {
        patientId,
        doctorId: user?.id,
        doctorName: user?.name,
        examination: exam,
        drugs: validDrugs,
        investigations: validInvs,
        nextSessionInvestigations: nextSessionInvs,
        nextSessionNotes: nextSessionNotes || null,
      };"""
    return original

content = re.sub(search, replacer, content, flags=re.DOTALL)

with open('src/components/patients/PatientLogModal.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replaced!")
