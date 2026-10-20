# Tamara Lashchyk — Masterclass Funnel

Landing page and confirmation page for Tamara's free live masterclass,
**"How Executive Women Earning $150K–$300K Add $30K–$70K By Year End."**

Built by Beacon Media. The layout follows the Dow Janes reference pages, the section-by-section
conversion elements come from Tobi's pages, and the palette is Tamara's brand (Deep Teal, Sage,
Linen, Sage Mist) softened with blush and rose. All copy comes from Tamara's intake document and
masterclass script, in her voice.

```
ghl/                  ⭐ Paste-ready GoHighLevel versions of both pages
index.html            Landing / registration page
confirmation.html     Thank-you / "You're in" page
assets/css/styles.css Shared styles (all colors are CSS variables at the top)
assets/js/main.js     Shared behavior + the CONFIG block you edit
assets/images/        Drop Tamara's photos here (see below)
tools/build-ghl.py    Regenerates the ghl/ files from the source pages
```

## Go-live checklist

Everything you need to change lives in the `CONFIG` block at the top of `assets/js/main.js`.

1. **Masterclass date and time.** Set to **Sunday, November 1, 2026 at 3:00 PM ET** (`startISO` =
   `"2026-11-01T15:00:00-05:00"`; daylight saving ends that morning, so it's EST). Every date on both pages,
   the countdown and the calendar invites update automatically from this one value.
2. **GHL registration form.** Connected: `https://link.tamaralashchyk.com/widget/form/y7vKTaUARmq03P0S6yWQ`
   (`ghlFormDomain` + `ghlFormId`). It opens in the **pop-up** from every "Save my free seat" button. Linking to
   `index.html#register` opens the pop-up straight away (handy for ads and emails).
   - In the GHL form settings, set **On submit → Redirect to URL** to the confirmation page, and add
     `?first_name={{contact.first_name}}` so the page says "You're in, Jane!"
   - GHL's embed script resizes the form to fit; `ghlFormHeight` is only the starting height.
3. **Photos.** In `assets/images/`; any missing slot shows a branded "TL" placeholder.
   - `tamara-hero.jpg`: ✅ seated photo (white top, coral necklace), cropped 4:3. The countdown card sits across its bottom edge.
   - `tamara-about.jpg`: ✅ standing photo in the orange top, cropped 4:5, for "Meet your host"
   - `tamara-avatar.jpg`: square headshot for the confirmation sign-off
   - `client-shelly.jpg`, `client-nina.jpg`, `client-erica.jpg`: optional square client headshots
     (written consent needed)
   - `og-image.jpg`: 1200×630 social share image
4. **"As featured in" logos.** Done: Forbes, Business Insider, BBC and HuffPost, converted to white
   on transparent backgrounds in `assets/images/press/`. To add another, drop a white, transparent PNG there
   and copy one of the `featured__logo` lines in `index.html`.
5. **Welcome video.** The confirmation page has a video placeholder next to "You're in!". Put a YouTube, Vimeo or
   Loom *embed* URL in `welcomeVideoEmbedUrl` and the real video replaces it automatically.
6. **Footer links.** Done: Privacy Policy (https://policies.tamaralashchyk.com/privacy) and Terms
   (https://policies.tamaralashchyk.com/terms), opening in a new tab.
7. **Compliance.** Have the short results disclaimer under the client-results cards reviewed. Add a source for
   the "more than 60% of women have never negotiated" claim, or remove it.

## Putting the pages into GoHighLevel

Use the two paste-ready files in the `ghl/` folder. Each one is self-contained, with styles, scripts and logos
built in:

- `ghl/landing-page.html` → your GHL landing/opt-in page
- `ghl/confirmation-page.html` → your GHL thank-you page

**Steps (do this for each page):**

1. In GHL, create the funnel step and open the page builder.
2. Add a full-width section with one row and one column, and set the section/row padding to 0.
3. Drag in a **Custom JS/HTML** element, open the file on GitHub, click **Raw**, select all, copy, and paste it in.
4. At the very top of the pasted code is a `window.TL_CONFIG` settings block. Fill in:
   - `ghlFormId` / `ghlFormDomain`: already set to Tamara's registration form (landing page pop-up).
   - `confirmationUrl`: the URL of your GHL confirmation page. Also set the GHL form's
     **On submit → Redirect to URL** to that page with `?first_name={{contact.first_name}}` on the end.
   - `images`: the hero and host photos are pre-filled and load from this repo through jsDelivr, a free CDN for
     public GitHub files. For long-term hosting (or if the repo is ever made private), upload them to the GHL Media
     library and paste those URLs instead.
   - `welcomeVideoEmbedUrl` (confirmation page): Tamara's welcome video. Until it's set, a video placeholder shows.
5. Save and preview. Set the page title and social share image in GHL's page settings.

**After editing the source files** (`index.html`, `confirmation.html`, `assets/…`), regenerate the GHL files with
`python3 tools/build-ghl.py` (needs Python 3 with Pillow). If you add or change a photo, commit and push it first,
then rebuild, so its jsDelivr link points at the pushed version.

## Other hosting

The source pages are plain static HTML/CSS/JS, so they also work on:

- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / root.
- **Netlify / Vercel:** drag and drop the folder.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
