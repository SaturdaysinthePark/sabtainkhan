# Porting this site with Claude Code

The files in this folder are a **working static site**, not a mockup — you can deploy them as-is (see `README.md`). Use this document only if you want to move to a build-time framework (faster first paint, real routing, MDX/CMS content).

Paste the prompt below into Claude Code from the repo root.

---

## Prompt

> This repo is a working static personal site: `index.html`, `work.html`, `talks.html`, `about.html`, `resume.html`, plus `support.js` (a runtime that renders each page's `<x-dc>` template with React + Babel from CDN) and `site-fx.js` (scroll effects).
>
> Port it to Astro with zero visual change, then delete the runtime.
>
> Requirements:
> 1. **Preserve the design exactly.** Every page is inline-styled. Move those styles verbatim into components — same hex values, same clamp() expressions, same clip-paths, same keyframes. Do not "clean up" spacing, sizes, or colors, and do not introduce Tailwind or a CSS framework unless the values map 1:1.
> 2. **Routes:** `/`, `/work`, `/talks`, `/about`, `/resume`.
> 3. **Shared layout** for the sticky lime nav (with the hover pill indicator), the footer, and the `<head>` (fonts, resets, keyframes).
> 4. **Keep `site-fx.js` as-is**, loaded as a plain script; call `SiteFX.initSiteFx` per page with the same config each page currently passes in its `componentDidMount` (scramble selector + parallax pairs).
> 5. **Port the page-level interactive bits** that currently live in each page's logic class: nav pill hover indicator, the Home hero pipeline stepper, work-card scroll reveals, About's count-up stats. Match timings and easings.
> 6. **Content stays inline** in the components — no CMS.
> 7. Verify each route against the original HTML side by side at 1440px and 390px before finishing.
>
> Deliverable: an Astro project that builds to static output, deployable to GitHub Pages / Netlify, with `support.js` and the `.dc.html`-derived pages removed once parity is confirmed.

---

## Design tokens (for reference during the port)

**Colors**
- Ink `#101012` — text, dark bands, primary buttons
- Lime `#CDF34E` — nav background, accents, primary CTA fill
- Pale lime `#F7FCDF` — soft card background
- White `#FFFFFF` — page background
- Body grey `#444A56`; muted `#5C6470`; light label `#9AA0AB`; hairline `rgba(16,16,18,0.14)`
- On dark: `#EEF0F5` text, `#9CA3B2` muted, `#AEB4C2` links, `#79808E` fine print

**Type**
- Anton — wordmark only, 27px, uppercase, `letter-spacing:.015em`
- Space Grotesk 700 — headlines, `letter-spacing:-.03em` to `-.045em`, `line-height:1.0–1.12`
- Hanken Grotesk 300–700 — body, 15–21px, `line-height:1.5–1.7`
- IBM Plex Mono 400–600 — eyebrows, meta, chips, 11–13px, `letter-spacing:.06–.16em`, uppercase

**Shape**
- Buttons: `clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px))` — cut top-right and bottom-left corners
- Chips and nav pills: `border-radius:100px`
- Media and cards: `border-radius:16–18px`, `border:1.5px solid #101012`, `box-shadow:0 22px 46px -26px rgba(16,16,18,.45)`

**Motion**
- Decorative marks: `decBob` / `decSway` / `decPulse` / `decTwirl` keyframes on an inner `<g>`, 9–44s, staggered negative delays — the inner group is animated so the outer element's transform stays free for parallax
- Parallax depths ±0.05–0.15 of `scrollY`, hero-area elements only
- All motion disabled under `prefers-reduced-motion`
