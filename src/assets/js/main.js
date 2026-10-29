(function () {
  "use strict";
  // Signals to the inline <head> safety net that motion JS is running.
  window.__motionReady = true;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll progress bar (cheap, always on).
  var bar = document.querySelector(".scroll-progress");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Header condenses + elevates once you scroll past the top.
  var header = document.querySelector(".site-header");
  if (header) {
    var onHeader = function () {
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onHeader, { passive: true });
    onHeader();
  }

  // Honor reduced-motion: no reveal or count-up animations.
  if (reduce) return;

  var revealSel = ".reveal, .card, .project, .job-card, .feed-item";
  var targets = document.querySelectorAll(revealSel);

  if ("IntersectionObserver" in window && targets.length) {
    // Small per-group stagger based on position among siblings.
    targets.forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(idx, 6) * 60 + "ms";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  // Count-up for stat numbers that carry a data-count.
  var nums = document.querySelectorAll(".num[data-count]");
  if ("IntersectionObserver" in window && nums.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          cio.unobserve(el);
          var target = parseFloat(el.getAttribute("data-count")) || 0;
          var suffix = el.getAttribute("data-suffix") || "";
          var start = null;
          var dur = 1200;
          var step = function (ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 0.5 - Math.cos(p * Math.PI) / 2; // ease-in-out
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach(function (el) { cio.observe(el); });
  }
})();
