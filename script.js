(function () {
  "use strict";

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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

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

    function reposition(e) {
      var x = e.clientX + offsetX;
      var y = e.clientY + offsetY;
      var cardW = card.offsetWidth;
      var cardH = card.offsetHeight;
      if (x + cardW > window.innerWidth - 12) x = e.clientX - cardW - offsetX;
      if (y + cardH > window.innerHeight - 12) y = window.innerHeight - cardH - 12;
      if (y < 8) y = 8;
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
})();
