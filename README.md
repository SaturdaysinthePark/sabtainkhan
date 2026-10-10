# sabtainkhan.com — personal site

Static, dependency-free site. Five HTML pages plus a shared runtime and effects script; no build step, no package.json, no server code.

## Pages

| File | URL | Contents |
| --- | --- | --- |
| `index.html` | `/` | Home — hero, pipeline panel, selected work index, recent appearances |
| `work.html` | `/work` | Case studies with looping demo videos, personal projects |
| `talks.html` | `/talks` | Speaking list, press mentions |
| `about.html` | `/about` | Bio, quick facts, résumé CTA |
| `resume.html` | `/resume` | One-page printable résumé (Letter, print-ready) |

## Supporting files

- `support.js` — the component runtime the four main pages are written against. Loads React from `vendor/` (unpkg as a fallback) and renders each page's `<x-dc>` template; if React can't load at all, the static markup is shown instead of a blank page. **Required.**
- `vendor/` — self-hosted React 18.3.1 UMD builds, byte-identical to the unpkg files (same SRI hashes).
- `site-fx.js` — shared scroll effects: progress bar, back-to-top, page transitions, headline scramble, decorative parallax. Config is passed per page in `componentDidMount`.
- `image-slot.js`, `doc-page.js` — drag-drop image placeholder and printable-page shell. Only `resume.html` needs `doc-page.js`.
- `uploads/` — portrait PNG, demo `.mp4` clips (720p, CRF 26, faststart) and a first-frame `-poster.webp` for each.
- `404.html` — static not-found page (no runtime). `robots.txt`, `sitemap.xml` — crawler files.
- `.nojekyll` — tells GitHub Pages to serve files as-is.

## Deploy

### GitHub Pages
```bash
git init && git add -A && git commit -m "Initial site"
gh repo create <name> --public --source=. --push
```
Then Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Live at `https://<user>.github.io/<name>/` in a minute or two.

### Netlify / Vercel / Cloudflare Pages
Drag the folder onto the dashboard, or connect the repo. No build command; publish directory is the repo root.

### Custom domain
Add a `CNAME` file containing your domain (e.g. `sabtainkhan.com`), point an `ALIAS`/`CNAME` DNS record at the host, and enable HTTPS in the host's settings.

## Local preview

Open `index.html` directly, or serve it (needed if a browser blocks local video):
```bash
python3 -m http.server 8000
```

## Known trade-offs

- **Runtime transpile.** `support.js` compiles each page in the browser via Babel, so first paint waits on ~140kb of React and a short delay. Fine for a personal site; see `CLAUDE_CODE.md` to port it to a build-time framework instead.
- **Videos** autoplay muted while on screen. New clips: `ffmpeg -i in.mp4 -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart out.mp4`, plus a poster: `ffmpeg -i out.mp4 -frames:v 1 -c:v libwebp -quality 78 out-poster.webp`.
- **Fonts** come from Google Fonts (Anton, Hanken Grotesk, Space Grotesk, IBM Plex Mono). Self-host them if you want zero third-party requests.
