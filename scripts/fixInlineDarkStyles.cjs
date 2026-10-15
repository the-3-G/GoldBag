const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

const REPLACEMENTS = [
  [/color:\s*['"]#f8fafc['"]/g, "color: '#0f172a'"],
  [/background:\s*['"]rgba\(26,\s*31,\s*46,\s*0\.6\)['"]/g, "background: '#ffffff'"],
  [/background:\s*['"]rgba\(26,\s*31,\s*46,\s*0\.8\)['"]/g, "background: '#ffffff'"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx|js|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updated++;
    console.log('Updated:', path.relative(SRC, file));
  }
}
console.log(`\nDone. ${updated} JSX/JS files updated.`);
