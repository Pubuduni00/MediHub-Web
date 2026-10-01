import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Inject helper function
helper = """// Helper to sync patient data to Firestore"""
new_helper = """// Helper to calculate end date from duration dropdown
function calculateEndDate(startDateMs, durationStr) {
  if (!durationStr || durationStr === 'Ongoing') return null;
  const daysMatch = durationStr.match(/(\d+)/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return startDateMs + (days * 24 * 60 * 60 * 1000);
  }
  return null;
}

// Helper to sync patient data to Firestore"""

content = content.replace(helper, new_helper)

# Replace newDrugs sync
search1 = r"""            prescribedBy: doctorName,
            startDate: startDate,
            endDate: null,
            takenStatus: \{\},"""
repl1 = r"""            prescribedBy: doctorName,
            startDate: startDate,
            endDate: calculateEndDate(startDate, drug.duration),
            takenStatus: {},"""
content = re.sub(search1, repl1, content)

# Replace full sync (auto-sync 1)
search2 = r"""              prescribedBy: log\.doctorName,
              startDate: new Date\(log\.date\)\.getTime\(\),
              endDate: null,
              takenStatus: \{\},"""
repl2 = r"""              prescribedBy: log.doctorName,
              startDate: new Date(log.date).getTime(),
              endDate: calculateEndDate(new Date(log.date).getTime(), drug.duration),
              takenStatus: {},"""
content = re.sub(search2, repl2, content)

# Replace full sync 2
search3 = r"""            prescribedBy: log\.doctorName,
            startDate: new Date\(log\.date\)\.getTime\(\),
            endDate: drug\.endDate \? new Date\(drug\.endDate\)\.getTime\(\) : null,
            takenStatus: \{\},"""
repl3 = r"""            prescribedBy: log.doctorName,
            startDate: new Date(log.date).getTime(),
            endDate: drug.endDate ? new Date(drug.endDate).getTime() : calculateEndDate(new Date(log.date).getTime(), drug.duration),
            takenStatus: {},"""
content = re.sub(search3, repl3, content)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated server.js")
