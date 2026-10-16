/* ==========================================================================
   SITE CONFIG — edit these values, nothing else needs to change.
   ========================================================================== */
const CONFIG = {
  // Masterclass start time, written with its UTC offset (EST = -05:00, EDT = -04:00).
  // Sunday, November 1, 2026 at 3:00 PM Eastern (EST — daylight saving ends that morning).
  startISO: "2026-11-01T15:00:00-05:00",
  durationMinutes: 75,

  title: "Free Live Masterclass with Tamara Lashchyk",
  calendarDetails:
    "How Executive Women Are Negotiating an Additional $30K–$70K in Annual Earnings.\n\n" +
    "Your private join link is in your confirmation email from Tamara Lashchyk.\n" +
    "Bring a notebook and the conversation you've been putting off.",
  // Where the event happens. Leave as-is if the join link only goes out by email.
  location: "Online — join link in your confirmation email",

  // GoHighLevel registration form (landing page pop-up).
  // Form link: https://link.tamaralashchyk.com/widget/form/y7vKTaUARmq03P0S6yWQ
  // ghlFormDomain = the part before /widget/form/, ghlFormId = the part after it.
  // If ghlFormId is empty, a styled preview form (first, last, email, phone) is shown instead.
  ghlFormDomain: "https://link.tamaralashchyk.com",
  ghlFormId: "y7vKTaUARmq03P0S6yWQ",
  ghlFormHeight: 460, // starting height; GHL's embed script resizes it to fit the form

  // Where the preview form sends people (the real GHL form should redirect here too).
  confirmationUrl: "confirmation.html",

  // Confirmation page welcome video (YouTube/Vimeo/Loom *embed* URL). Empty = note card.
  welcomeVideoEmbedUrl: "",

  // Optional: GHL inbound-webhook URL that receives the 5 pre-class question answers.
  // (Automation → Workflow → Trigger: Inbound Webhook.) Empty = answers are not sent.
  quizWebhookUrl: "",
};

/* ==========================================================================
   Helpers
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const start = new Date(CONFIG.startISO);
const end = new Date(start.getTime() + CONFIG.durationMinutes * 60000);

function fmt(date, opts, tz) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(date);
}

function eventLabels() {
  const day = fmt(start, { weekday: "long", month: "long", day: "numeric" }, "America/New_York");
  const et = fmt(start, { hour: "numeric", minute: "2-digit" }, "America/New_York");
  const pt = fmt(start, { hour: "numeric", minute: "2-digit" }, "America/Los_Angeles");
  return {
    day,
    et: `${et} ET`,
    pt: `${pt} PT`,
    short: `${day} · ${et} ET`,
    full: `${day} at ${et} ET / ${pt} PT`,
  };
}

/* ==========================================================================
   Date text
   ========================================================================== */
function fillDates() {
  const l = eventLabels();
  $$("[data-event]").forEach((el) => {
    const key = el.getAttribute("data-event");
    if (l[key]) el.textContent = l[key];
  });
}

/* ==========================================================================
   Countdown
   ========================================================================== */
function startCountdowns() {
  const boxes = $$("[data-countdown]");
  if (!boxes.length) return;
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    let diff = Math.max(0, start.getTime() - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    boxes.forEach((box) => {
      $("[data-d]", box).textContent = pad(d);
      $("[data-h]", box).textContent = pad(h);
      $("[data-m]", box).textContent = pad(m);
      $("[data-s]", box).textContent = pad(s);
    });
    if (start.getTime() - Date.now() <= 0) {
      $$("[data-countdown-label]").forEach((el) => (el.textContent = "We're live"));
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ==========================================================================
   GHL form embed (or preview form)
   ========================================================================== */
function mountForms() {
  const slots = $$("[data-ghl-form]");
  if (!slots.length) return;

  if (CONFIG.ghlFormId) {
    const id = CONFIG.ghlFormId;
    const domain = (CONFIG.ghlFormDomain || "https://api.leadconnectorhq.com").replace(/\/+$/, "");
    slots.forEach((slot, i) => {
      const frameId = `inline-${id}${i ? "-" + i : ""}`;
      slot.innerHTML = `
        <div class="ghl-embed">
          <iframe
            src="${domain}/widget/form/${id}"
            style="height:${CONFIG.ghlFormHeight}px"
            id="${frameId}"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Masterclass Registration"
            data-height="${CONFIG.ghlFormHeight}"
            data-layout-iframe-id="${frameId}"
            data-form-id="${id}"
            title="Masterclass Registration"></iframe>
        </div>`;
    });
    const s = document.createElement("script");
    s.src = `${domain}/js/form_embed.js`;
    s.async = true;
    document.body.appendChild(s);
    return;
  }

  // Preview form — mirrors the GHL fields so the design reads correctly.
  const tpl = $("#preview-form-tpl");
  slots.forEach((slot) => {
    slot.appendChild(tpl.content.cloneNode(true));
    const form = $("form", slot);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new URLSearchParams(new FormData(form));
      window.location.href = `${CONFIG.confirmationUrl}?${data.toString()}`;
    });
  });
}

/* ==========================================================================
   Add to calendar (Google + .ics for Apple/Outlook)
   ========================================================================== */
function toICSDate(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function googleCalUrl() {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: CONFIG.title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details: CONFIG.calendarDetails,
    location: CONFIG.location,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function outlookCalUrl() {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: CONFIG.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: CONFIG.calendarDetails,
    location: CONFIG.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

function downloadICS() {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tamara Lashchyk//Masterclass//EN",
    "BEGIN:VEVENT",
    `UID:masterclass-${toICSDate(start)}@tamaralashchyk.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${esc(CONFIG.title)}`,
    `DESCRIPTION:${esc(CONFIG.calendarDetails)}`,
    `LOCATION:${esc(CONFIG.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Masterclass with Tamara starts in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tamara-lashchyk-masterclass.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function wireCalendar() {
  $$("[data-cal='google']").forEach((a) => {
    a.href = googleCalUrl();
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-cal='outlook']").forEach((a) => {
    a.href = outlookCalUrl();
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-cal='ics']").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); downloadICS(); }));
}

/* ==========================================================================
   Welcome video
   ========================================================================== */
function mountVideo() {
  const box = $("[data-welcome-video]");
  if (!box || !CONFIG.welcomeVideoEmbedUrl) return;
  box.innerHTML = `<iframe src="${CONFIG.welcomeVideoEmbedUrl}" title="A welcome from Tamara"
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
}

/* ==========================================================================
   First-name personalization (GHL can redirect with ?first_name=…)
   ========================================================================== */
function personalize() {
  const q = new URLSearchParams(location.search);
  const first = (q.get("first_name") || q.get("firstName") || q.get("name") || "").trim().split(" ")[0];
  if (!first) return;
  const safe = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  $$("[data-first-name]").forEach((el) => {
    el.textContent = `, ${safe}`;
  });
}

/* ==========================================================================
   Pre-class questions (confirmation page)
   ========================================================================== */
function wireQuiz() {
  const quiz = $("[data-quiz]");
  if (!quiz) return;
  const steps = $$(".quiz__step", quiz);
  const bar = $(".quiz__bar span", quiz);
  const back = $(".quiz__back", quiz);
  const next = $(".quiz__next", quiz);
  const nav = $(".quiz__nav", quiz);
  const done = $(".quiz__done", quiz);
  let i = 0;

  const answered = () => {
    const step = steps[i];
    const ta = $("textarea", step);
    if (ta) return true; // free-text question is optional
    return !!$("input:checked", step);
  };

  function render() {
    steps.forEach((s, n) => s.classList.toggle("is-active", n === i));
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    back.disabled = i === 0;
    next.disabled = !answered();
    next.textContent = i === steps.length - 1 ? "Send my answers" : "Next →";
  }

  quiz.addEventListener("change", () => (next.disabled = !answered()));
  back.addEventListener("click", () => { if (i > 0) { i--; render(); } });
  next.addEventListener("click", () => {
    if (!answered()) return;
    if (i < steps.length - 1) { i++; render(); return; }
    submitQuiz();
  });

  function submitQuiz() {
    const answers = {};
    steps.forEach((s) => {
      const q = $(".quiz__q", s).textContent.trim();
      const checked = $("input:checked", s);
      const ta = $("textarea", s);
      answers[q] = checked ? checked.value : ta ? ta.value.trim() : "";
    });
    const params = Object.fromEntries(new URLSearchParams(location.search));
    if (CONFIG.quizWebhookUrl) {
      fetch(CONFIG.quizWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, answers, submitted_at: new Date().toISOString() }),
      }).catch(() => {});
    }
    steps.forEach((s) => s.classList.remove("is-active"));
    nav.hidden = true;
    bar.style.width = "100%";
    done.hidden = false;
  }

  render();
}

/* ==========================================================================
   Registration pop-up — every "Save my seat" button opens it
   ========================================================================== */
function wireModal() {
  const modal = $("dialog#register");
  if (!modal) return;

  const open = (e) => {
    if (e) e.preventDefault();
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.documentElement.classList.add("modal-open");
    const first = $("input", modal);
    if (first) setTimeout(() => first.focus(), 50);
  };
  const close = () => {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  };

  $$("a[href='#register']").forEach((a) => a.addEventListener("click", open));
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", close));
  // Click on the dimmed backdrop (outside the card) closes it
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.addEventListener("close", () => document.documentElement.classList.remove("modal-open"));
  // Shareable link that opens the pop-up directly: page.html#register
  if (location.hash === "#register") open();
}

function reveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  fillDates();
  startCountdowns();
  mountForms();
  wireCalendar();
  mountVideo();
  personalize();
  wireQuiz();
  wireModal();
  reveal();
  const y = $("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
});
