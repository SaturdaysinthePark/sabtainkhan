import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
// widths: true Letter print width, and a 94% stress width to simulate wider real-world fonts
for (const w of [816, 767]) {
  const p = await b.newPage({ viewport: { width: w, height: 1056 } });
  await p.emulateMedia({ media: 'print' });
  await p.goto('file:///home/user/sabtainkhan/resume.html');
  const rep = await p.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll('.entry-title')) {
      const lh = parseFloat(getComputedStyle(t).fontSize) * 1.4;
      const lines = Math.round(t.getBoundingClientRect().height / lh);
      if (lines > 1) out.push(['HEADER>1', t.textContent.trim().slice(0, 60)]);
    }
    for (const li of document.querySelectorAll('.entry li, .entry .oneline')) {
      const lh = parseFloat(getComputedStyle(li).fontSize) * 1.5;
      const lines = Math.round(li.getBoundingClientRect().height / lh);
      if (lines > 2) out.push([`BULLET=${lines}`, li.textContent.trim().slice(0, 60)]);
    }
    return out;
  });
  console.log(`--- width ${w}px:`, rep.length ? '' : 'ALL PASS');
  rep.forEach(r => console.log('  ', r[0], '|', r[1]));
  await p.close();
}
await b.close();
