(async function () {
  "use strict";

  var user = "evansachie";
  var wrap = document.getElementById("gh-heatmap-wrap");
  if (!wrap) return;

  var WEEKS = 53;
  var CELL = 11;
  var GAP = 3;
  var COLS = WEEKS;
  var ROWS = 7;
  var LEFT_PAD = 34;
  var W = LEFT_PAD + COLS * (CELL + GAP) - GAP;
  var H = ROWS * (CELL + GAP) - GAP;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var tooltipHideTimer = null;

  var colors = ["#161b22", "rgba(107, 155, 209, 0.22)", "rgba(107, 155, 209, 0.44)", "rgba(107, 155, 209, 0.68)", "#6b9bd1"];

  function getColor(count) {
    if (count === 0) return colors[0];
    if (count <= 2) return colors[1];
    if (count <= 5) return colors[2];
    if (count <= 10) return colors[3];
    return colors[4];
  }

  function formatDateLabel(dateStr) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr + "T00:00:00"));
  }

  function formatTooltipText(dateStr, count) {
    var day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(dateStr + "T00:00:00"));
    var label = day + ", " + formatDateLabel(dateStr);
    if (count === 0) return "No contributions · " + label;
    return count.toLocaleString() + " contribution" + (count === 1 ? "" : "s") + " · " + label;
  }

  function positionTooltip(tooltipEl, clientX, clientY) {
    var x = clientX + 8;
    var y = clientY + 12;

    tooltipEl.style.left = x + "px";
    tooltipEl.style.top = y + "px";

    var rect = tooltipEl.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) x -= rect.right - (window.innerWidth - 8);
    if (rect.bottom > window.innerHeight - 8) y -= rect.bottom - (window.innerHeight - 8);
    if (rect.left < 8) x += 8 - rect.left;
    if (rect.top < 8) y += 8 - rect.top;

    tooltipEl.style.left = x + "px";
    tooltipEl.style.top = y + "px";
  }

  function showTooltip(tooltipEl, text, clientX, clientY) {
    tooltipEl.innerHTML = text + '<span class="gh-heatmap-tooltip-sub">↗ github.com/' + user + '</span>';
    tooltipEl.classList.add("is-visible");
    positionTooltip(tooltipEl, clientX, clientY);
  }

  function hideTooltip(tooltipEl) {
    tooltipEl.classList.remove("is-visible");
  }

  function bindCellTooltip(cell, text, tooltipEl) {
    function clearHideTimer() {
      if (tooltipHideTimer) {
        clearTimeout(tooltipHideTimer);
        tooltipHideTimer = null;
      }
    }

    cell.addEventListener("mouseenter", function (e) {
      clearHideTimer();
      showTooltip(tooltipEl, text, e.clientX, e.clientY);
    });

    cell.addEventListener("mousemove", function (e) {
      positionTooltip(tooltipEl, e.clientX, e.clientY);
    });

    cell.addEventListener("mouseleave", function () {
      hideTooltip(tooltipEl);
    });

    cell.addEventListener("focus", function (e) {
      var rect = e.target.getBoundingClientRect();
      showTooltip(tooltipEl, text, rect.left + rect.width / 2, rect.top);
    });

    cell.addEventListener("blur", function () {
      hideTooltip(tooltipEl);
    });

    cell.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      clearHideTimer();
      var rect = e.target.getBoundingClientRect();
      showTooltip(tooltipEl, text, rect.left + rect.width / 2, rect.top);
      tooltipHideTimer = setTimeout(function () {
        hideTooltip(tooltipEl);
      }, 1300);
    });
  }

  function normalizeDays(data) {
    var out = [];
    var contributions = data && data.contributions;
    if (!Array.isArray(contributions)) return out;

    if (contributions.length > 0 && contributions[0] && contributions[0].date) {
      contributions.forEach(function (d) {
        out.push({
          date: d.date,
          contributionCount: Number(d.count || d.contributionCount || 0),
        });
      });
      return out;
    }

    if (contributions.length > 0 && contributions[0] && Array.isArray(contributions[0].contributionDays)) {
      contributions.forEach(function (w) {
        w.contributionDays.forEach(function (d) {
          out.push({
            date: d.date,
            contributionCount: Number(d.contributionCount || d.count || 0),
          });
        });
      });
    }

    return out;
  }

  function buildGrid(days, tooltipEl) {
    var total = 0;
    var msDay = 86400000;
    var byDate = {};

    days.forEach(function (d) {
      byDate[d.date] = d.contributionCount;
    });

    var now = new Date();
    now.setHours(23, 59, 59, 999);

    var start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 -20 " + W + " " + (H + 28));
    svg.style.cssText = "width:100%;height:auto;overflow:visible;";

    var lastMonth = -1;
    for (var wi = 0; wi < WEEKS; wi++) {
      var weekStart = new Date(start.getTime() + wi * 7 * msDay);
      var d = new Date(weekStart);
      var m = d.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", LEFT_PAD + wi * (CELL + GAP));
        text.setAttribute("y", -6);
        text.setAttribute("font-size", "9");
        text.setAttribute("fill", "currentColor");
        text.setAttribute("opacity", "0.45");
        text.textContent = MONTHS[m];
        svg.appendChild(text);
      }
    }

    [1, 3, 5].forEach(function (rowIndex) {
      var dayText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      dayText.setAttribute("x", 0);
      dayText.setAttribute("y", rowIndex * (CELL + GAP) + Math.floor(CELL / 2));
      dayText.setAttribute("font-size", "9");
      dayText.setAttribute("fill", "currentColor");
      dayText.setAttribute("opacity", "0.55");
      dayText.setAttribute("dominant-baseline", "middle");
      dayText.textContent = rowIndex === 1 ? "Mon" : rowIndex === 3 ? "Wed" : "Fri";
      svg.appendChild(dayText);
    });

    for (wi = 0; wi < WEEKS; wi++) {
      for (var di = 0; di < ROWS; di++) {
        var dayDate = new Date(start.getTime() + (wi * 7 + di) * msDay);
        var dateStr = dayDate.toISOString().slice(0, 10);
        var count = byDate[dateStr] || 0;
        total += count;

        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", LEFT_PAD + wi * (CELL + GAP));
        rect.setAttribute("y", di * (CELL + GAP));
        rect.setAttribute("width", CELL);
        rect.setAttribute("height", CELL);
        rect.setAttribute("rx", 2);
        rect.setAttribute("fill", getColor(count));
        rect.setAttribute("tabindex", "0");
        rect.setAttribute("focusable", "true");

        var tooltipText = formatTooltipText(dateStr, count);
        rect.setAttribute("aria-label", tooltipText);
        bindCellTooltip(rect, tooltipText, tooltipEl);

        svg.appendChild(rect);
      }
    }

    return { svg: svg, total: total };
  }

  function buildLegend() {
    var legend = document.createElement("div");
    legend.className = "gh-heatmap-legend";

    var less = document.createElement("span");
    less.className = "gh-heatmap-legend-text";
    less.textContent = "Less";
    legend.appendChild(less);

    colors.forEach(function (color) {
      var swatch = document.createElement("span");
      swatch.className = "gh-heatmap-legend-swatch";
      swatch.style.backgroundColor = color;
      legend.appendChild(swatch);
    });

    var more = document.createElement("span");
    more.className = "gh-heatmap-legend-text";
    more.textContent = "More";
    legend.appendChild(more);

    return legend;
  }

  async function fetchJson(url) {
    var res = await fetch(url);
    if (!res.ok) throw new Error("Request failed: " + res.status);
    return res.json();
  }

  async function fetchContributions(userName) {
    var urls = [
      "https://github-contributions-api.jogruber.de/v4/" + userName + "?y=last",
      "https://github-contributions.vercel.app/api/v1/" + userName + "?y=last",
    ];

    var lastError = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        return await fetchJson(urls[i]);
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("No contribution API available");
  }

  try {
    var data = await fetchContributions(user);
    var tooltipEl = document.createElement("div");
    tooltipEl.className = "gh-heatmap-tooltip";

    var built = buildGrid(normalizeDays(data), tooltipEl);

    var meta = document.createElement("p");
    meta.className = "work-meta gh-heatmap-total";
    meta.textContent = built.total.toLocaleString() + " contributions in the last year";

    var link = document.createElement("a");
    link.href = "https://github.com/" + user;
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "gh-heatmap-link";
    link.appendChild(built.svg);

    var foot = document.createElement("div");
    foot.className = "gh-heatmap-foot";
    foot.appendChild(buildLegend());

    wrap.replaceChildren(meta, link, foot);
    document.body.appendChild(tooltipEl);
  } catch (e) {
    wrap.innerHTML = "<p class=\"work-meta\">Could not load activity.</p>";
  }
})();
