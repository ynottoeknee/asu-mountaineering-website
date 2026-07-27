# Mountaineering Club at ASU Website

Domain: `asumountaineering.org`

## Folder structure

```text
asu-mountaineering-website/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── site.js
├── assets/
│   └── images/
├── documents/
├── _headers
├── _redirects
├── .gitignore
└── README.md
```

## Add the current MCA code

1. Replace `index.html` with the latest complete MCA HTML.
2. Replace `css/styles.css` with the latest complete MCA stylesheet.
3. Replace `js/site.js` with the latest complete MCA JavaScript.
4. Put image files in `assets/images/`.
5. Put PDFs, waivers, constitutions, and downloadable resources in `documents/`.

Keep all filenames and folder names exactly as shown.

Before publishing, check for the placeholder:

```js
const MCA_IDEA_EMAIL = 'your-email@asu.edu';
```

Replace it with the club email address that should receive website inquiries.

## Test locally

Double-click `index.html`, or open the folder in Visual Studio Code and use the Live Server extension.

## Upload to GitHub

Upload everything inside this folder to the root of a repository named:

`asu-mountaineering-website`

The repository root must show `index.html`, `css`, `js`, `assets`, and `documents`.

## Cloudflare Pages settings

- Production branch: `main`
- Framework preset: `None`
- Build command: leave blank or use `exit 0`
- Build output directory: `.`
- Root directory: leave blank

After the temporary `.pages.dev` site works, add these under the Pages project's **Custom domains**:

- `asumountaineering.org`
- `www.asumountaineering.org`

## Past Adventures update

The Past Adventures page is integrated at:

```text
adventures/topographic-index.html
```

The main `index.html` already opens this experience inside the Adventures page. The updated file includes all nine adventures, background line drawings, color transitions, and hover/tap photo flips.

Adventure order:

1. Mount Baldy
2. Grand Canyon
3. Mount Shasta
4. Mount Humphreys
5. Mount Whitney
6. Half Dome
7. Mount Langley
8. Ellingwood & Blanca
9. Great Sand Dunes
