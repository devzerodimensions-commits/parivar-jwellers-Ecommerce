import fs from 'fs';

const dir = 'C:/Users/Admin/Desktop/Parivar Jewellers';
const md = fs.readFileSync(dir + '/PARIVAR-JEWELLERS-DOCUMENTATION.md', 'utf8');
const lines = md.split(/\r?\n/);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/_([^_]+?)_/g, '<em>$1</em>');

const out = [];
let i = 0;
let listOpen = false;
const closeList = () => {
  if (listOpen) {
    out.push('</ul>');
    listOpen = false;
  }
};

while (i < lines.length) {
  const t = lines[i].trim();
  if (t === '') { closeList(); i++; continue; }

  if (t.startsWith('|')) {
    closeList();
    const tbl = [];
    while (i < lines.length && lines[i].trim().startsWith('|')) { tbl.push(lines[i].trim()); i++; }
    const row = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    out.push('<table>');
    out.push('<tr>' + row(tbl[0]).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr>');
    for (let r = 2; r < tbl.length; r++) {
      out.push('<tr>' + row(tbl[r]).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
    }
    out.push('</table>');
    continue;
  }
  if (t.startsWith('### ')) { closeList(); out.push(`<h3>${inline(t.slice(4))}</h3>`); i++; continue; }
  if (t.startsWith('## ')) { closeList(); out.push(`<h2>${inline(t.slice(3))}</h2>`); i++; continue; }
  if (t.startsWith('# ')) { closeList(); out.push(`<h1>${inline(t.slice(2))}</h1>`); i++; continue; }
  if (t === '---') { closeList(); out.push('<hr>'); i++; continue; }
  if (t.startsWith('> ')) { closeList(); out.push(`<blockquote>${inline(t.slice(2))}</blockquote>`); i++; continue; }
  if (t.startsWith('- ')) {
    if (!listOpen) { out.push('<ul>'); listOpen = true; }
    out.push(`<li>${inline(t.slice(2))}</li>`);
    i++; continue;
  }
  closeList();
  out.push(`<p>${inline(t)}</p>`);
  i++;
}

const css = `body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#222;line-height:1.5;}
h1{color:#8a6d1a;font-size:22pt;border-bottom:2px solid #c8a34e;padding-bottom:4px;}
h2{color:#8a6d1a;font-size:15pt;margin-top:18px;}
h3{color:#333;font-size:12pt;}
table{border-collapse:collapse;width:100%;margin:8px 0;}
th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:10.5pt;vertical-align:top;}
th{background:#f5eeda;}
code{background:#eee;padding:1px 4px;font-family:Consolas,monospace;}
hr{border:none;border-top:1px solid #ddd;margin:16px 0;}
blockquote{border-left:3px solid #c8a34e;margin:8px 0;padding:4px 12px;color:#555;background:#faf7ef;}
a{color:#8a6d1a;}`;

fs.writeFileSync(
  dir + '/_doc.html',
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${out.join('\n')}</body></html>`,
  'utf8'
);
console.log('HTML written');
