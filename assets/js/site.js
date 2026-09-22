(function () {
  "use strict";
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* BibTeX toggles */
  function setBib(btn, open) {
    btn.setAttribute("aria-expanded", String(open));
    document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
  }
  $$("[data-bib]").forEach(function (btn) {
    btn.addEventListener("click", function () { setBib(btn, btn.getAttribute("aria-expanded") !== "true"); });
  });
  $$(".bib .copy").forEach(function (btn) {
    var text = btn.parentNode.querySelector("pre").textContent, timer;
    function done(ok) {
      btn.textContent = ok ? "Copied" : "Select and copy";
      clearTimeout(timer);
      timer = setTimeout(function () { btn.textContent = "Copy"; }, 1600);
    }
    function fallback() {
      var ta = document.createElement("textarea"), ok = false;
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      btn.focus();
      done(ok);
    }
    btn.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
      else fallback();
    });
  });
  function openFromHash() { /* a link such as /#bib-datafarm opens that entry */
    if (!/^#bib-[\w-]+$/.test(location.hash)) return;
    var btn = document.querySelector("[aria-controls='" + location.hash.slice(1) + "']");
    if (!btn) return;
    setBib(btn, true);
    /* scroll after load: the browser's own jump to the fragment would override an earlier scroll */
    var go = function () { btn.closest(".pub").scrollIntoView({ block: "start" }); };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", function () { setTimeout(go, 0); }, { once: true });
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* Clips play while on screen, like figures that move; never with reduced motion or Save-Data */
  var videos = $$(".thumb video");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var saveData = navigator.connection && navigator.connection.saveData;
  if (!videos.length || !("IntersectionObserver" in window) || saveData) return;
  var visible = new Set();
  function play(v) {
    if (reduce && reduce.matches) return;
    v.muted = true;
    var r = v.play();
    if (r && r.catch) r.catch(function () {});
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { visible.add(e.target); play(e.target); }
      else { visible.delete(e.target); e.target.pause(); }
    });
  }, { threshold: 0.25 });
  videos.forEach(function (v) { io.observe(v); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) videos.forEach(function (v) { v.pause(); });
    else visible.forEach(play);
  });
  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (reduce.matches) videos.forEach(function (v) { v.pause(); }); else visible.forEach(play);
    });
  }
})();
