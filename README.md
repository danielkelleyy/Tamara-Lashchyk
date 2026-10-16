# Tamara Lashchyk — Masterclass Funnel

Landing page and confirmation page for Tamara's free live masterclass,
**"How Women Executives Are Negotiating An Additional $30K–$70K In Compensation."**

Built by Beacon Media. The layout follows the Dow Janes reference pages, the section-by-section
conversion elements come from Tobi's pages, and the palette is Tamara's brand (Deep Teal, Sage,
Linen, Sage Mist) softened with blush and rose. All copy comes from Tamara's intake document and
masterclass script, in her voice.

```
index.html            Landing / registration page
confirmation.html     Thank-you / "You're in" page
assets/css/styles.css Shared styles (all colors are CSS variables at the top)
assets/js/main.js     Shared behavior + the CONFIG block you edit
assets/images/        Drop Tamara's photos here (see below)
```

## Go-live checklist

Everything you need to change lives in the `CONFIG` block at the top of `assets/js/main.js`.

1. **Masterclass date and time.** Set to **Sunday, November 1, 2026 at 3:00 PM ET** (`startISO` =
   `"2026-11-01T15:00:00-05:00"`; daylight saving ends that morning, so it's EST). Every date on both pages,
   the countdown and the calendar invites update automatically from this one value.
2. **GHL registration form.** Build the form in GoHighLevel with First Name, Last Name, Email and Phone, then
   paste its ID into `ghlFormId`. The form lives in a **pop-up** that opens from every "Save my free seat"
   button. Linking to `index.html#register` opens the pop-up straight away (handy for ads and emails). The ID is the last part of the embed URL
   `https://api.leadconnectorhq.com/widget/form/<ID>`. Until it's set, the page shows a styled preview form
   with the same four fields, which redirects to the confirmation page for testing.
   - In the GHL form settings, set **On submit → Redirect to URL** to the confirmation page, and add
     `?first_name={{contact.first_name}}` so the page says "You're in, Jane!"
   - Adjust `ghlFormHeight` if the form is taller or shorter than 460px once styled in GHL.
3. **Photos.** Add these to `assets/images/`. Until they exist, each slot shows a branded "TL" placeholder.
   - `tamara-hero.jpg`: **landscape** photo for the centered hero, about 1600×1000, with her face in the upper two-thirds (the countdown sits over the bottom)
   - `tamara-about.jpg`: portrait for "Meet your host," about 900×1200
   - `tamara-avatar.jpg`: square headshot for the confirmation sign-off
   - `client-shelly.jpg`, `client-nina.jpg`, `client-erica.jpg`: optional square client headshots
     (written consent needed)
   - `og-image.jpg`: 1200×630 social share image
4. **"As featured in" logos.** Done: Forbes, Business Insider, BBC and HuffPost, converted to white
   on transparent backgrounds in `assets/images/press/`. To add another, drop a white, transparent PNG there
   and copy one of the `featured__logo` lines in `index.html`.
5. **Welcome video (optional).** Put a YouTube, Vimeo or Loom *embed* URL in `welcomeVideoEmbedUrl`. Without it,
   the confirmation page shows a short note from Tamara in that spot.
6. **Pre-class questions (optional).** The confirmation page asks 5 quick questions. To capture the answers, create
   a GHL workflow with an **Inbound Webhook** trigger and paste its URL into `quizWebhookUrl`. The answers are sent
   along with any URL parameters (name, email) that GHL passed through the redirect.
7. **Footer links.** Point Privacy Policy, Terms and Disclaimer (`href="#"`) at Tamara's real pages.
8. **Compliance.** Have the results disclaimer and the SMS consent line under the form reviewed. Add a source for
   the "more than 60% of women have never negotiated" claim, or remove it.

## Hosting

The pages are plain static HTML/CSS/JS, so you can use any of these:

- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / root.
- **GHL funnel:** paste each page's `<body>` content into a Custom HTML/JS element, with `styles.css` in a
  `<style>` tag and `main.js` in a `<script>` tag (or host the assets elsewhere and link to them).
- **Netlify / Vercel:** drag and drop the folder.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
