/* ===== MISSION CONFIG — edit only this ===== */
const CONFIG = {
  CA: "4cDVSYnzoWsSzYRxe1rETA1hfcgs1ktgpQyeRm6Vpump",   // Solana mint address once launched
  X: "https://x.com/soonmoonelon",
  TG: "https://t.me/soonmoonelon"
};
/* =========================================== */
/* launch scene renderer (global so the static fallback can use it) */
window.__setLaunch = (() => {
  const path = document.getElementById("path"), lit = document.getElementById("pathlit");
  const rocket = document.getElementById("rocket"), moon = document.getElementById("moon"), flame = document.getElementById("flame");
  const count = document.getElementById("count"), alt = document.getElementById("alt"), pct = document.getElementById("pct"), bar = document.getElementById("bar");
  const caps = document.querySelectorAll(".cap");
  const L = path.getTotalLength();
  lit.style.strokeDasharray = L; 
  return p => {
    const ign = .3;                       // first 30% = countdown on the pad
    const t = Math.max(0, (p - ign) / (1 - ign));
    const cd = Math.ceil(10 * (1 - Math.min(p / ign, 1)));
    count.textContent = cd > 0 ? `T-${cd}` : (t >= .98 ? "LANDED" : "LIFTOFF");
    const pt = path.getPointAtLength(L * t), pt2 = path.getPointAtLength(Math.min(L, L * t + 1));
    const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
    const shake = p > ign * .7 && t < .05 ? (Math.random() - .5) * 3 : 0;
    rocket.setAttribute("transform", `translate(${pt.x + shake} ${pt.y - 12}) rotate(${t > 0 ? ang : -90})`);
    flame.style.opacity = p > ign * .8 ? 1 : 0;
    lit.style.strokeDashoffset = L * (1 - t);
    moon.setAttribute("transform", `translate(840 110) scale(${.45 + t * 1.1})`);
    alt.textContent = Math.round(t * 384400).toLocaleString("en-US");
    pct.textContent = Math.round(p * 100);
    bar.style.width = p * 100 + "%";
    caps[0].classList.toggle("on", p > .05 && p < .45);
    caps[1].classList.toggle("on", p >= .45 && p < .85);
    caps[2].classList.toggle("on", p >= .85);
  };
})();

(() => {
  const SOL = "So11111111111111111111111111111111111111112";
  const isCA = v => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v || "");
  const isURL = v => /^https:\/\//.test(v || "");
  const live = isCA(CONFIG.CA);
  const ca = live ? CONFIG.CA : "4cDVSYnzoWsSzYRxe1rETA1hfcgs1ktgpQyeRm6Vpump";
  const LINKS = {
    buy: `https://swap.pump.fun/?input=${SOL}&output=${ca}`,
    chart: `https://dexscreener.com/solana/${ca}`,
    embed: `https://dexscreener.com/solana/${ca}?embed=1&theme=dark&trades=0&info=0`
  };
  document.querySelectorAll("[data-link]").forEach(a => { const u = LINKS[a.dataset.link]; if (u) a.href = u; });
  document.querySelectorAll("[data-ca]").forEach(el => { el.textContent = ca; el.title = ca; });

  // socials
  const socials = [["X", "i-x", "X (Twitter)"], ["TG", "i-tg", "Telegram"]];
  document.querySelectorAll("[data-socials]").forEach(box => {
    socials.forEach(([k, ic, label]) => {
      const ok = isURL(CONFIG[k]);
      const a = document.createElement("a");
      a.className = "btn-ghost sm";
      a.innerHTML = `<svg class="ic" aria-hidden="true"><use href="#${ic}"/></svg><span>${ok ? label.split(" ")[0] : "Soon"}</span>`;
      if (ok) { a.href = CONFIG[k]; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", label); }
      else { a.setAttribute("aria-disabled", "true"); a.setAttribute("role", "link"); a.setAttribute("aria-label", `${label} — coming soon`); }
      box.appendChild(a);
    });
  });

  // chart embed
  const frame = document.getElementById("dexframe"), ov = document.getElementById("chartOverlay");
  if (live && frame) { frame.src = LINKS.embed; ov.classList.add("hidden-ov"); }

  // toast + copy
  const toast = document.getElementById("toast"); let tt;
  const say = m => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2200); };
  const fallbackCopy = t => { const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) {} ta.remove(); return ok; };
  const copy = async t => { try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) {} return fallbackCopy(t); };
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    const ok = await copy(ca);
    const lbl = b.querySelector(".copy-label");
    b.classList.add("copied"); if (lbl) lbl.textContent = "Copied";
    setTimeout(() => { b.classList.remove("copied"); if (lbl) lbl.textContent = "Copy"; }, 1800);
    say(!ok ? "Copy failed — select the address manually" : live ? "Copied CA to clipboard" : "Copied: CA is 4cDVSYnzoWsSzYRxe1rETA1hfcgs1ktgpQyeRm6Vpump — launching soon. Only trust this site.");
  }));

  // starfield
  const cv = document.getElementById("stars"), cx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, stars = [], scrollY0 = 0;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; stars = Array.from({ length: Math.round(innerWidth * innerHeight / 3500) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1, t: Math.random() * 6 })); };
  size(); addEventListener("resize", size);
  const draw = time => {
    cx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const y = ((s.y - scrollY0 * s.z * .3) % H + H) % H;
      const a = .35 + .65 * Math.abs(Math.sin(s.t + time / 1400 * s.z));
      cx.fillStyle = `rgba(235,236,240,${a * s.z})`;
      cx.fillRect(s.x, y, s.z * 2, s.z * 2);
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  addEventListener("scroll", () => { scrollY0 = scrollY; if (reduce) requestAnimationFrame(draw); }, { passive: true });

  // nav highlight
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(l => { const s = document.querySelector(l.getAttribute("href")); s && io.observe(s); });

  // ribbons duplicate for seamless loop
  document.querySelectorAll(".track").forEach(t => t.innerHTML += t.innerHTML);

  // countdown-ish T-minus ticker in hero
  const tm = document.getElementById("tm"); const msgs = ["SOON", "SOONER", "VERY SOON", "ANY MINUTE", "SOON™"]; let mi = 0;
  if (!reduce) setInterval(() => { tm.textContent = msgs[++mi % msgs.length]; }, 2200);

  // progress bar (works without GSAP)
  const prog = document.getElementById("progress");
  const setProg = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener("scroll", setProg, { passive: true }); setProg();

  // ===== motion layer =====
  if (reduce || !window.gsap || !window.ScrollTrigger) { setLaunch(1); return; }
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("anim");
  const mobile = matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  const damp = mobile ? .5 : 1;

  if (!mobile && window.Lenis) {
    const lenis = new Lenis({ lerp: .1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const t = document.querySelector(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); } }));
  }

  // letter split masthead (aria-label kept on h1)
  const mast = document.getElementById("mast");
  const txt = mast.textContent; mast.textContent = "";
  mast.classList.add("split");
  txt.split(" ").forEach((w, i) => { if (i) mast.appendChild(document.createTextNode(" ")); const wd = document.createElement("span"); wd.className = "wd"; wd.setAttribute("aria-hidden", "true"); [...w].forEach(c => { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; wd.appendChild(s); }); mast.appendChild(wd); });
  gsap.from(".mast .ch", { yPercent: 110, opacity: 0, rotateX: -80, stagger: .05, duration: 1, ease: "expo.out", delay: .15 });
  gsap.from([".tminus", ".hero .cta", ".hero .ca-box", ".hero [data-socials]"], { y: 20, opacity: 0, stagger: .08, duration: .8, delay: .6, ease: "power3.out" });

  // word split headlines
  document.querySelectorAll(".words").forEach(el => {
    const ws = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = ws.map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
    const inHero = el.closest(".hero");
    gsap.from(el.querySelectorAll(".w"), { yPercent: 60, opacity: 0, stagger: .04, duration: .7, ease: "power3.out", delay: inHero ? .7 : 0, scrollTrigger: inHero ? null : { trigger: el, start: "top 85%" } });
  });

  // hero pinned parallax
  const htl = gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: mobile ? "+=35%" : "+=100%", scrub: true, pin: ".hero-pin", pinSpacing: true } });
  document.querySelectorAll(".hero [data-speed]").forEach(l => {
    const sp = parseFloat(l.dataset.speed);
    htl.to(l, { yPercent: -sp * 60 * damp, ease: "none" }, 0);
  });
  htl.to(".bigword", { xPercent: -50 - 25 * damp, ease: "none" }, 0)
     .to(".hero-content", { y: -60 * damp, opacity: mobile ? 1 : .2, ease: "none" }, 0);

  // banner clip reveal + pan zoom
  gsap.to(".banner-clip", { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: { trigger: ".banner-sec", start: "top 90%", end: "center 55%", scrub: true } });
  gsap.fromTo(".banner-img", { scale: 1.25, xPercent: -4 }, { scale: 1.05, xPercent: 4, ease: "none", scrollTrigger: { trigger: ".banner-sec", start: "top bottom", end: "bottom top", scrub: true } });

  // batch reveals
  ScrollTrigger.batch(".reveal", { start: "top 88%", onEnter: b => gsap.to(b, { opacity: 1, y: 0, stagger: .12, duration: .8, ease: "power3.out", overwrite: true }) });

  // signature launch scene
  ScrollTrigger.create({ trigger: "#launch", start: "top top", end: mobile ? "+=160%" : "+=260%", pin: ".launch-pin", scrub: true, onUpdate: s => setLaunch(s.progress) });
  setLaunch(0);
  addEventListener("load", () => ScrollTrigger.refresh());

  function setLaunch(p) { window.__setLaunch(p); }
})();

