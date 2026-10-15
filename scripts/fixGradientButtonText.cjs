const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.css')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(
    /(background:\s*linear-gradient\([^;]+\);)\s*color:\s*var\(--color-text-primary\)/g,
    '$1\n  color: #ffffff'
  );
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updated++;
    console.log('Fixed:', path.relative(SRC, file));
  }
}
console.log(`\nDone. ${updated} files fixed.`);
