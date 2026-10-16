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

1. **Masterclass date and time.** Set `startISO` (e.g. `"2026-11-12T19:00:00-05:00"`). Every date on both
   pages, the countdown and the calendar invites update automatically. **Confirm the real date with Tamara.
   The current date is a placeholder.**
2. **GHL registration form.** Build the form in GoHighLevel with First Name, Last Name, Email and Phone, then
   paste its ID into `ghlFormId`. The ID is the last part of the embed URL
   `https://api.leadconnectorhq.com/widget/form/<ID>`. Until it's set, the page shows a styled preview form
   with the same four fields, which redirects to the confirmation page for testing.
   - In the GHL form settings, set **On submit → Redirect to URL** to the confirmation page, and add
     `?first_name={{contact.first_name}}` so the page says "You're in, Jane!"
   - Adjust `ghlFormHeight` if the form is taller or shorter than 460px once styled in GHL.
3. **Photos.** Add these to `assets/images/`. Until they exist, each slot shows a branded "TL" placeholder.
   - `tamara-hero.jpg`: portrait for the hero, about 1000×1150, with the countdown overlaid at the bottom
   - `tamara-about.jpg`: portrait for "Meet your host," about 900×1200
   - `tamara-avatar.jpg`: square headshot for the confirmation sign-off
   - `client-shelly.jpg`, `client-nina.jpg`, `client-erica.jpg`: optional square client headshots
     (written consent needed)
   - `og-image.jpg`: 1200×630 social share image
4. **Welcome video (optional).** Put a YouTube, Vimeo or Loom *embed* URL in `welcomeVideoEmbedUrl`. Without it,
   the confirmation page shows a short note from Tamara in that spot.
5. **Pre-class questions (optional).** The confirmation page asks 5 quick questions. To capture the answers, create
   a GHL workflow with an **Inbound Webhook** trigger and paste its URL into `quizWebhookUrl`. The answers are sent
   along with any URL parameters (name, email) that GHL passed through the redirect.
6. **Footer links.** Point Privacy Policy, Terms and Disclaimer (`href="#"`) at Tamara's real pages.
7. **Compliance.** Have the results disclaimer and the SMS consent line under the form reviewed. Add a source for
   the "more than 60% of women have never negotiated" claim, or remove it.

## Hosting

The pages are plain static HTML/CSS/JS, so you can use any of these:

- **GitHub Pages:** Settings → Pages → Deploy from branch `main` / root.
- **GHL funnel:** paste each page's `<body>` content into a Custom HTML/JS element, with `styles.css` in a
  `<style>` tag and `main.js` in a `<script>` tag (or host the assets elsewhere and link to them).
- **Netlify / Vercel:** drag and drop the folder.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
