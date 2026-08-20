// Layout verifier for resume.html (run: node resume-check.mjs)
// Rules: role/project header lines stay on ONE line; body/bullet lines wrap to
// at most TWO lines; all content fits inside the fixed 8.5x11in page frame.
// Requires playwright-core and a Chromium at /opt/pw-browsers/chromium (or set
// CHROMIUM env). Note: the page's body font is local Helvetica Neue, so exact
// wrapping varies slightly per machine — the second, narrower pass adds margin.
import { chromium } from 'playwright-core';

const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
let failed = false;
for (const w of [850, 816]) {
  const p = await b.newPage({ viewport: { width: w, height: 1200 } });
  await p.goto(new URL('resume.html', import.meta.url).href);
  await p.evaluate(() => document.fonts.ready);
  const rep = await p.evaluate(() => {
    const out = [];
    const lines = (el, lh) => Math.round(el.getBoundingClientRect().height / lh);
    // role/title rows: bold 12.5px flex rows inside the page
    for (const el of document.querySelectorAll('.page div[style*="font-weight:700"][style*="12.5px"]')) {
      if (lines(el, 12.5 * 1.45) > 1) out.push(['HEADER>1', el.textContent.trim().slice(0, 70)]);
    }
    // bullets / body rows: 11.5px line-height 1.5 divs
    for (const el of document.querySelectorAll('.page div[style*="font-size:11.5px"]')) {
      if (lines(el, 11.5 * 1.5) > 2) out.push(['BULLET>2', el.textContent.trim().slice(0, 70)]);
    }
    // overflow: fixed-height page must contain its content
    const page = document.querySelector('.page');
    if (page.scrollHeight > page.clientHeight + 1)
      out.push(['OVERFLOW', `content ${page.scrollHeight}px > page ${page.clientHeight}px`]);
    return out;
  });
  console.log(`--- width ${w}px: ${rep.length ? 'FAIL' : 'ALL PASS'}`);
  rep.forEach(r => console.log('  ', r[0], '|', r[1]));
  if (rep.length) failed = true;
  await p.close();
}
await b.close();
process.exit(failed ? 1 : 0);
