import re

with open('src/components/patients/PatientLogModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

search = r"""    const handleSave = async \(\) => \{
      const nextSessionInvs = nextSessionInvestigations
        \? nextSessionInvestigations\.split\(','\)\.map\(s => s\.trim\(\)\)\.filter\(Boolean\)
        : \[\];
      const activeApptId = sessionStorage\.getItem\('activeAppointmentId'\) \|\| sessionStorage\.getItem\('active_appt_id'\);
  
      const logPayload = \{
        patientId,
        doctorId: user\?\.id,
        doctorName: user\?\.name,
        examination: exam,
        drugs,
        investigations,
        nextSessionInvestigations: nextSessionInvs,
        nextSessionNotes: nextSessionNotes \|\| null,
      \};"""

repl = r"""    const handleSave = async () => {
      const nextSessionInvs = nextSessionInvestigations
        ? nextSessionInvestigations.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const activeApptId = sessionStorage.getItem('activeAppointmentId') || sessionStorage.getItem('active_appt_id');
  
      // Filter out any blank rows left by the user
      const validDrugs = drugs.filter(d => d.drug && d.drug.trim() !== '');
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

content = re.sub(search, repl, content)

with open('src/components/patients/PatientLogModal.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PatientLogModal.js!")
