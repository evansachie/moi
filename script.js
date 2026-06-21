(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Accra",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  }

  function updateFooterTime() {
    var el = document.getElementById("footerTime");
    if (el) el.textContent = formatTime(new Date());
  }

  updateFooterTime();
  if (document.getElementById("footerTime")) {
    setInterval(updateFooterTime, 1000);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  });

  (function () {
    var items = document.querySelectorAll(".main > *");
    if (!items.length) return;

    if (prefersReducedMotion || !window.IntersectionObserver) {
      return;
    }

    document.documentElement.classList.add("reveal-enabled");

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 40, 200) + "ms";
      observer.observe(el);
    });
  })();

  (function () {
    var el = document.querySelector(".emphasis");
    if (!el) return;

    var fullText = el.textContent.trim();
    if (prefersReducedMotion) {
      el.textContent = fullText;
      return;
    }

    el.textContent = "";
    el.classList.add("is-typing");

    var started = false;

    function startTyping() {
      if (started) return;
      started = true;
      var i = 0;
      function type() {
        if (i < fullText.length) {
          el.textContent = fullText.slice(0, ++i);
          setTimeout(type, 48);
        } else {
          setTimeout(function () {
            el.classList.remove("is-typing");
          }, 1000);
        }
      }
      setTimeout(type, 80);
    }

    var parent = el.closest(".main > *");
    if (parent && document.documentElement.classList.contains("reveal-enabled")) {
      parent.addEventListener("transitionend", startTyping, { once: true });
    } else {
      setTimeout(startTyping, 700);
    }
  })();

  (function () {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    window.addEventListener("scroll", function () {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
    }, { passive: true });
  })();

  (function () {
    var rows = document.querySelectorAll(".work-row--preview");
    if (!rows.length) return;

    var isTouchDevice = window.matchMedia("(hover: none)").matches;

    if (isTouchDevice) {
      rows.forEach(function (row) {
        row.addEventListener("click", function (e) {
          if (e.target.closest("a")) return;
          row.classList.toggle("is-expanded");
        });
      });
      return;
    }

    var card = document.createElement("div");
    card.className = "project-float-card";
    var cardImg = document.createElement("img");
    card.appendChild(cardImg);
    document.body.appendChild(card);

    var offsetX = 24;
    var offsetY = -20;
    var pad = 12;

    function reposition(e) {
      var cardW = card.offsetWidth;
      var cardH = card.offsetHeight;
      var x = e.clientX + offsetX;
      var y = e.clientY + offsetY;
      if (x + cardW > window.innerWidth - pad) {
        x = e.clientX - cardW - offsetX;
      }
      x = Math.max(pad, Math.min(x, window.innerWidth - cardW - pad));
      y = Math.max(pad, Math.min(y, window.innerHeight - cardH - pad));
      card.style.left = x + "px";
      card.style.top = y + "px";
    }

    rows.forEach(function (row) {
      var img = row.querySelector(".project-preview img");
      if (!img) return;

      row.addEventListener("mouseenter", function (e) {
        cardImg.src = img.src;
        cardImg.alt = img.alt;
        reposition(e);
        card.classList.add("is-visible");
      });

      row.addEventListener("mousemove", reposition);

      row.addEventListener("mouseleave", function () {
        card.classList.remove("is-visible");
      });
    });

    cardImg.addEventListener("error", function () {
      card.classList.remove("is-visible");
    });
  })();

  (function () {
    if (prefersReducedMotion) return;
    if ("startViewTransition" in document) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) === "#" || a.target === "_blank" || href.indexOf("://") !== -1 || href.indexOf("mailto:") !== -1) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        var dest = href;
        setTimeout(function () { window.location.href = dest; }, 210);
      });
    });
  })();
})();
