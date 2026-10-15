const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const SKIP = new Set(['Home.css']);

const REPLACEMENTS = [
  [/background:\s*rgba\(26,\s*31,\s*46,\s*0\.4\)/g, 'background: #f8fafc'],
  [/background:\s*rgba\(26,\s*31,\s*46,\s*0\.6\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(26,\s*31,\s*46,\s*0\.8\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(26,\s*31,\s*46,\s*0\.9\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(15,\s*23,\s*42,\s*0\.6\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(15,\s*23,\s*42,\s*0\.8\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(15,\s*23,\s*42,\s*0\.9\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(15,\s*23,\s*42,\s*0\.98\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(30,\s*34,\s*45,\s*0\.8\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(30,\s*34,\s*45,\s*0\.95\)/g, 'background: #ffffff'],
  [/background:\s*rgba\(30,\s*41,\s*59,\s*0\.6\)/g, 'background: #ffffff'],
  [/background:\s*#0a0e1a/g, 'background: #F6F8FC'],
  [/background:\s*#060a10/g, 'background: #F6F8FC'],
  [/background:\s*#0b0f16/g, 'background: #F6F8FC'],
  [/background:\s*#0B0F14/g, 'background: #F6F8FC'],
  [/background:\s*#050810/g, 'background: #F6F8FC'],
  [/background:\s*#1e222d/g, 'background: #ffffff'],
  [/background:\s*#151b28/g, 'background: #ffffff'],
  [/background:\s*#131927/g, 'background: #ffffff'],
  [/background:\s*#111827/g, 'background: #ffffff'],
  [/background:\s*#1F2937/g, 'background: #f8fafc'],
  [/background:\s*#1e293b/g, 'background: #ffffff'],
  [/background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\)/g, 'background: #f8fafc'],
  [/border:\s*1px solid rgba\(100,\s*116,\s*139,\s*0\.2\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border:\s*1px solid rgba\(100,\s*116,\s*139,\s*0\.1\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border:\s*1px solid rgba\(100,\s*116,\s*139,\s*0\.3\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border-bottom:\s*1px solid rgba\(100,\s*116,\s*139,\s*0\.1\)/g, 'border-bottom: 1px solid rgba(241, 245, 249, 0.9)'],
  [/border-bottom:\s*1px solid rgba\(100,\s*116,\s*139,\s*0\.15\)/g, 'border-bottom: 1px solid rgba(241, 245, 249, 0.9)'],
  [/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'border: 1px solid rgba(226, 232, 240, 0.9)'],
  [/border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'border-bottom: 1px solid rgba(241, 245, 249, 0.9)'],
  [/color:\s*#f8fafc/g, 'color: var(--color-text-primary)'],
  [/color:\s*#cbd5e1/g, 'color: var(--color-text-secondary)'],
  [/color:\s*#e2e8f0/g, 'color: var(--color-text-primary)'],
  [/box-shadow:\s*0 4px 16px rgba\(0,\s*0,\s*0,\s*0\.4\)/g, 'box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06)'],
  [/box-shadow:\s*0 8px 32px rgba\(0,\s*0,\s*0,\s*0\.5\)/g, 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08)'],
  [/box-shadow:\s*0 20px 40px rgba\(0,\s*0,\s*0,\s*0\.4\)/g, 'box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08)'],
  [/box-shadow:\s*0 -10px 40px rgba\(0,\s*0,\s*0,\s*0\.3\)/g, 'box-shadow: 0 -8px 32px rgba(15, 23, 42, 0.06)'],
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
console.log(`\nDone. ${updated} files updated.`);
