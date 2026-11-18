/* ===== EDIT THIS BLOCK to change contact details, links and project URLs ===== */
const CONFIG = {
  whatsapp: "254104255178",          // country code + number, no "+" or spaces
  email: "autoalan247@gmail.com",
  location: "Kenya",
  github: "https://github.com/",     // replace with your GitHub profile URL
  formEndpoint: "",                  // optional: Formspree URL, e.g. "https://formspree.io/f/xxxxxxx"
  projectLinks: {                    // add live demo URLs here: "Project Name": "https://..."
    "Business Website": "",
    "School Website": "",
    "Hotel Website": "",
    "Restaurant Website": "",
    "E-Commerce Website": "",
    "Personal Portfolio": ""
  }
};
/* ============================================================================ */

document.documentElement.classList.add("js");
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const waLink = (text = "") => `https://wa.me/${CONFIG.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

/* Fill contact details everywhere */
$$("[data-fill]").forEach(el => {
  const k = el.dataset.fill;
  if (k === "whatsapp-link") { el.href = waLink(); el.target = "_blank"; el.rel = "noopener"; el.textContent = "+" + CONFIG.whatsapp; }
  if (k === "email-link") { el.href = "mailto:" + CONFIG.email; el.textContent = CONFIG.email; }
  if (k === "location") el.textContent = CONFIG.location;
  if (k === "wa-btn") el.href = waLink("Hello AllanTech, I would like to discuss a project.");
  if (k === "github") el.href = CONFIG.github;
});
$("#year").textContent = new Date().getFullYear();

/* Navbar: solid on scroll, back-to-top, active link */
const nav = $("#nav"), topBtn = $("#top"), links = $$(".menu a:not(.btn)");
const onScroll = () => {
  nav.classList.toggle("solid", scrollY > 30);
  topBtn.hidden = scrollY < 600;
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();
topBtn.onclick = () => scrollTo({ top: 0 });

const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => secObs.observe(s));

/* Mobile menu */
const burger = $("#burger"), menu = $("#menu");
const setMenu = open => { menu.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
burger.onclick = () => setMenu(!menu.classList.contains("open"));
menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* Service cards: expand details */
$$(".learn").forEach(b => b.onclick = () => {
  const list = b.previousElementSibling, open = list.hidden;
  list.hidden = !open; b.setAttribute("aria-expanded", open); b.textContent = open ? "Show less" : "Learn more";
});

/* Process tabs */
const steps = $$(".step");
steps.forEach((s, i) => s.onclick = () => {
  steps.forEach(x => { x.classList.remove("on"); x.setAttribute("aria-selected", "false"); });
  s.classList.add("on"); s.setAttribute("aria-selected", "true");
  $("#st").innerHTML = s.dataset.t; $("#sp").textContent = s.dataset.p;
  $("#track").style.width = (i + 1) * 25 + "%";
});

/* Portfolio filter */
$$(".chip").forEach(c => c.onclick = () => {
  $$(".chip").forEach(x => x.classList.remove("on")); c.classList.add("on");
  $$(".proj").forEach(p => p.hidden = c.dataset.f !== "all" && p.dataset.c !== c.dataset.f);
});

/* View Project: open demo URL if set, otherwise start an enquiry about that project type */
$$(".view").forEach(b => b.onclick = () => {
  const name = b.dataset.p, url = CONFIG.projectLinks[name];
  if (url) return window.open(url, "_blank", "noopener");
  $("#type").value = name;
  $("#contact").scrollIntoView({ behavior: "smooth" });
});

/* Missing images: show a labelled placeholder instead of a broken icon */
$$("figure img").forEach(img => {
  const miss = () => img.parentElement.classList.add("missing");
  img.addEventListener("error", miss);
  if (img.complete && img.naturalWidth === 0) miss();
});

/* Reveal on scroll (headings and cards only) */
const rvObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } }), { threshold: .12 });
$$(".sec h2,.card,.proj,.why li,.form").forEach(el => { el.classList.add("rv"); rvObs.observe(el); });

/* Contact form: validate, then send */
const form = $("#form"), status = $("#status");
const rules = {
  name: v => v.trim().length > 1 || "Enter your name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address, like name@example.com.",
  phone: v => /^[+\d][\d\s-]{7,}$/.test(v.trim()) || "Enter a phone number with at least 8 digits.",
  type: v => !!v || "Choose a project type.",
  message: v => v.trim().length > 9 || "Write at least 10 characters about your project."
};
form.addEventListener("submit", async e => {
  e.preventDefault();
  let ok = true;
  Object.keys(rules).forEach(k => {
    const f = form.elements[k], r = rules[k](f.value), lab = f.closest("label");
    lab.classList.toggle("bad", r !== true); $(".err", lab).textContent = r === true ? "" : r;
    if (r !== true) ok = false;
  });
  if (!ok) { status.className = "no"; status.textContent = "Fix the highlighted fields and send again."; return; }
  const d = Object.fromEntries(new FormData(form));
  const text = `Hello AllanTech, I'm ${d.name}${d.business ? " from " + d.business : ""}.\nProject: ${d.type}\nPhone: ${d.phone}\nEmail: ${d.email}\n\n${d.message}`;
  try {
    if (CONFIG.formEndpoint) {
      const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error();
      status.className = "ok"; status.textContent = "Sent. We will reply within one business day."; form.reset();
    } else {
      window.open(waLink(text), "_blank", "noopener");
      status.className = "ok"; status.textContent = "WhatsApp is opening with your project details. Press send there to finish.";
    }
  } catch {
    status.className = "no"; status.textContent = "Could not send. Use the WhatsApp button or email " + CONFIG.email + ".";
  }
});
