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

- `support.js` — the component runtime the four main pages are written against. Loads React + Babel from CDN and renders each page's `<x-dc>` template. **Required.**
- `site-fx.js` — shared scroll effects: progress bar, back-to-top, page transitions, headline scramble, decorative parallax. Config is passed per page in `componentDidMount`.
- `image-slot.js`, `doc-page.js` — drag-drop image placeholder and printable-page shell. Only `resume.html` needs `doc-page.js`.
- `uploads/` — one portrait PNG and five demo `.mp4` clips.
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

- **Runtime transpile.** `support.js` compiles each page in the browser via Babel, so first paint carries ~300kb of CDN JS and a short delay. Fine for a personal site; see `CLAUDE_CODE.md` to port it to a build-time framework instead.
- **Videos are unoptimized** and autoplay muted. Compress them (`ffmpeg -crf 28 -vf scale=1280:-2`) or add `poster` images if the page feels heavy on mobile.
- **Fonts** come from Google Fonts (Anton, Hanken Grotesk, Space Grotesk, IBM Plex Mono). Self-host them if you want zero third-party requests.
