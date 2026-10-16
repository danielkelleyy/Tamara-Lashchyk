#!/usr/bin/env python3
"""
Build paste-ready GoHighLevel versions of the pages.

    python3 tools/build-ghl.py

Writes ghl/landing-page.html and ghl/confirmation-page.html. Each file is a
single self-contained snippet (fonts link + scoped CSS + markup + JS, logos
embedded) for a GHL "Custom JS/HTML" element. Re-run after editing index.html,
confirmation.html, assets/css/styles.css or assets/js/main.js.
"""
import base64
import io
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ghl"
SCOPE = "#tl-page"

# Repo photo paths -> keys in TL_CONFIG.images (paste GHL media-library URLs there)
PHOTO_KEYS = {
    "tamara-hero.jpg": "heroPhoto",
    "tamara-about.jpg": "aboutPhoto",
    "tamara-avatar.jpg": "avatarPhoto",
    "client-shelly.jpg": "shellyPhoto",
    "client-nina.jpg": "ninaPhoto",
    "client-erica.jpg": "ericaPhoto",
}


# --------------------------------------------------------------------------
# CSS scoping: prefix every selector with #tl-page so nothing leaks into GHL
# --------------------------------------------------------------------------
def scope_selector(sel):
    sel = sel.strip()
    if sel.startswith("html"):
        return sel  # html.modal-open etc. must stay global
    if sel in (":root", "body"):
        return SCOPE
    if sel.startswith("*"):
        return f"{SCOPE} {sel}"
    return f"{SCOPE} {sel}"


def scope_css(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        brace = css.find("{", i)
        if brace == -1:
            break
        prelude = css[i:brace].strip()
        # find the matching closing brace
        depth, j = 1, brace + 1
        while depth and j < n:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        body = css[brace + 1 : j - 1]
        if prelude.startswith(("@media", "@supports")):
            out.append(f"{prelude}{{{scope_css(body)}}}")
        elif prelude.startswith("@"):
            out.append(f"{prelude}{{{body}}}")  # @keyframes, @font-face
        else:
            sels = ",".join(scope_selector(s) for s in prelude.split(","))
            out.append(f"{sels}{{{body.strip()}}}")
        i = j
    return "\n".join(out)


def minify_css(css):
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
    return css.replace(";}", "}").strip()


EXTRA_CSS = f"""
/* Full-bleed: stretch past GHL's section/row width so colored bands reach the edges */
{SCOPE} {{ width: 100vw; max-width: 100vw; position: relative; left: 50%; margin-left: -50vw; text-align: left; }}
html, body {{ overflow-x: clip; }}
{SCOPE} h1, {SCOPE} h2, {SCOPE} h3, {SCOPE} h4 {{ text-transform: none; }}
{SCOPE} button {{ font-family: inherit; }}
"""


# --------------------------------------------------------------------------
# Logos -> small inline data URIs
# --------------------------------------------------------------------------
def logo_data_uri(path):
    im = Image.open(path).convert("RGBA")
    h = 84  # 2x the largest display height
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    # White logo, 16 alpha levels -> tiny palette PNG with per-entry transparency
    levels = 16
    alpha = im.getchannel("A").point(lambda v: round(v / 255 * (levels - 1)))
    pal = Image.frombytes("P", im.size, alpha.tobytes())
    pal.putpalette([255, 255, 255] * levels)
    buf = io.BytesIO()
    pal.save(
        buf, "PNG", optimize=True,
        transparency=bytes(round(i * 255 / (levels - 1)) for i in range(levels)),
    )
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


# --------------------------------------------------------------------------
# JS: split CONFIG out to the top of the snippet, wrap the rest safely
# --------------------------------------------------------------------------
def split_js(js):
    start = js.index("const CONFIG = {")
    end = js.index("\n};", start) + 3
    config_body = js[start + len("const CONFIG = ") : end - 1]
    rest = js[:start] + "const CONFIG = window.TL_CONFIG || {};" + js[end:]

    # GHL may inject the code after DOMContentLoaded — run immediately if so
    rest = rest.replace(
        'document.addEventListener("DOMContentLoaded", () => {',
        "function tlInit() {\n  mountImages();",
    )
    rest = rest.rstrip()
    assert rest.endswith("});"), "unexpected end of main.js"
    rest = rest[:-3] + """}

function mountImages() {
  const imgs = (CONFIG.images || {});
  $$("img[data-img]").forEach((img) => {
    const url = (imgs[img.getAttribute("data-img")] || "").trim();
    if (url) img.src = url;
    else img.remove(); // no photo yet -> branded placeholder shows
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tlInit);
else tlInit();"""
    # Isolate from GHL's own globals (e.g. jQuery's $)
    rest = "(function () {\n" + rest + "\n})();"
    return config_body, rest


def config_script(config_body, page):
    # Point the preview-form redirect at a placeholder GHL URL
    config_body = config_body.replace(
        'confirmationUrl: "confirmation.html",',
        'confirmationUrl: "PASTE-YOUR-GHL-CONFIRMATION-PAGE-URL",',
    )
    images = """
  // Photos: upload to GHL Media library, copy each file's URL, paste it here.
  // Leave "" to show the branded "TL" placeholder.
  images: {
    heroPhoto: "",   // landscape, ~1600x1000 (landing page hero)
    aboutPhoto: "",  // portrait, ~900x1200 (landing page "Meet your host")
    avatarPhoto: "", // square headshot (confirmation page sign-off)
    shellyPhoto: "", // optional client headshots (written consent needed)
    ninaPhoto: "",
    ericaPhoto: "",
  },
"""
    config_body = config_body.rstrip()[:-1].rstrip() + "\n" + images + "}"
    return (
        "<!-- ============================================================\n"
        f"     TAMARA LASHCHYK — {page.upper()} (GoHighLevel paste-in version)\n"
        "     Paste this whole file into a GHL Custom JS/HTML element.\n"
        "     Edit the settings below; nothing else needs to change.\n"
        "     ============================================================ -->\n"
        "<script>\nwindow.TL_CONFIG = "
        + config_body
        + ";\n</script>\n"
    )


# --------------------------------------------------------------------------
# Page assembly
# --------------------------------------------------------------------------
def build(src_name, out_name, page, css, js_body, config_body, logos):
    html = (ROOT / src_name).read_text()
    fonts = re.search(r'<link href="https://fonts\.googleapis\.com/css2[^>]+>', html).group(0)
    body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    body = re.sub(r'\s*<script src="assets/js/main\.js"></script>\s*', "\n", body)

    # Photos -> data-img keys
    for fname, key in PHOTO_KEYS.items():
        body = body.replace(f'src="assets/images/{fname}"', f'data-img="{key}"')
    body = body.replace(' onerror="this.remove()"', "")

    # Logos -> inline
    for fname, uri in logos.items():
        body = body.replace(f'src="assets/images/press/{fname}"', f'src="{uri}"')

    # Placeholder links that pointed at local files
    body = body.replace('href="confirmation.html"', 'href="#"')

    leftovers = re.findall(r'(?:src|href)="assets/[^"]+"', body)
    assert not leftovers, f"unresolved asset paths in {src_name}: {leftovers}"

    out = (
        config_script(config_body, page)
        + '<link rel="preconnect" href="https://fonts.googleapis.com" />\n'
        + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
        + fonts
        + "\n<style>\n"
        + css
        + "\n</style>\n"
        + '<div id="tl-page">\n'
        + body.strip()
        + "\n</div>\n<script>\n"
        + js_body
        + "\n</script>\n"
    )
    (OUT / out_name).write_text(out)
    return len(out)


def main():
    OUT.mkdir(exist_ok=True)
    css = minify_css(scope_css((ROOT / "assets/css/styles.css").read_text()) + EXTRA_CSS)
    config_body, js_body = split_js((ROOT / "assets/js/main.js").read_text())
    logos = {p.name: logo_data_uri(p) for p in sorted((ROOT / "assets/images/press").glob("*.png"))}
    for src, out, page in [
        ("index.html", "landing-page.html", "Landing page"),
        ("confirmation.html", "confirmation-page.html", "Confirmation page"),
    ]:
        size = build(src, out, page, css, js_body, config_body, logos)
        print(f"ghl/{out}: {size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
