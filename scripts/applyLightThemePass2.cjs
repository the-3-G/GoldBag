const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const SKIP = new Set(['Home.css']);

const REPLACEMENTS = [
  [/background:\s*rgba\(10,\s*14,\s*26,\s*0\.8\)/g, 'background: rgba(255, 255, 255, 0.95)'],
  [/background:\s*#0a0e1a/g, 'background: #F6F8FC'],
  [/background:\s*rgba\(15,\s*20,\s*35,\s*0\.7\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(16,\s*20,\s*24,\s*0\.7\)/g, 'background: #ffffff'],
  [/background:\s*#0000004d/g, 'background: #f8fafc'],
  [/background:\s*#00000080/g, 'background: rgba(15, 23, 42, 0.3)'],
  [/background:\s*#080a0e/g, 'background: #fafbfc'],
  [/background:\s*#000/g, 'background: #F6F8FC'],
  [/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.2\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'border-bottom: 1px solid rgba(241, 245, 249, 0.9)'],
  [/color:\s*#fff\b/g, 'color: var(--color-text-primary)'],
  [/color:\s*white\b/g, 'color: var(--color-text-primary)'],
  [/border:\s*1px solid #1F2937/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border-bottom:\s*1px solid #1F2937/g, 'border-bottom: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border:\s*1px solid #1e222d/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border:\s*1px solid #2b3139/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
];

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
  if (SKIP.has(path.basename(file))) continue;
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
console.log(`\nPass 2 done. ${updated} files updated.`);
