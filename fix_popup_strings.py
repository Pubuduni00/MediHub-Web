import re

with open('src/components/patients/LogViewPopup.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the data processing logic
search1 = r"""              if \(log\.nextSessionInvestigations\) \{
                log\.nextSessionInvestigations\.forEach\(i => \{
                   const key = \(i\.type \|\| i\.investigation \|\| ''\)\.toLowerCase\(\)\.trim\(\);
                   if\(key\) nextInvestMap\.set\(key, i\);
                \}\);
              \}"""
repl1 = r"""              if (log.nextSessionInvestigations) {
                log.nextSessionInvestigations.forEach(i => {
                   // It might be a string or an object depending on legacy code
                   const invStr = typeof i === 'string' ? i : (i.type || i.investigation || '');
                   const key = invStr.toLowerCase().trim();
                   if(key) nextInvestMap.set(key, invStr);
                });
              }"""
content = re.sub(search1, repl1, content)

# Replace the rendering logic
search2 = r"""                        \{mergedNextInvestigations\.map\(\(inv, idx\) => \(
                          <li key=\{idx\}>\{inv\.type \|\| inv\.investigation\}</li>
                        \)\)\}"""
repl2 = r"""                        {mergedNextInvestigations.map((inv, idx) => (
                          <li key={idx}>{typeof inv === 'string' ? inv : (inv.type || inv.investigation)}</li>
                        ))}"""
content = re.sub(search2, repl2, content)

with open('src/components/patients/LogViewPopup.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed LogViewPopup string parsing!')
