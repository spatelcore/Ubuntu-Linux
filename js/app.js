// Main app: tab routing, rendering, quiz engine, progress (localStorage).
(function () {
  "use strict";

  var STORE = "linuxterm_progress_v1";
  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(STORE, JSON.stringify(p)); }
  var progress = load();
  progress.read = progress.read || {};        // topic id -> true
  progress.quizzes = progress.quizzes || [];   // [{date, score, total}]
  progress.cards = progress.cards || {};        // "s-idx" -> "known"|"review"

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- Tab routing ----------
  function showTab(name) {
    $$(".tab").forEach(function (t) { t.classList.toggle("active", t.dataset.tab === name); });
    $$(".panel").forEach(function (p) { p.classList.toggle("active", p.id === "panel-" + name); });
    if (name === "practice") window.initTerminal();
    if (name === "home") renderHome();
    location.hash = name;
  }
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { showTab(t.dataset.tab); });
  });

  // ---------- Study ----------
  function renderStudy() {
    var wrap = $("#study-list");
    var sections = {};
    window.TOPICS.forEach(function (t) { (sections[t.section] = sections[t.section] || []).push(t); });
    var html = "";
    Object.keys(sections).forEach(function (sec) {
      html += '<h3 class="sec-head">' + sec + "</h3>";
      sections[sec].forEach(function (t) {
        var done = progress.read[t.id] ? " done" : "";
        html += '<div class="topic-card' + done + '" data-id="' + t.id + '">' +
          '<div class="topic-head">' +
          '<div><div class="topic-title">' + t.title + "</div>" +
          '<div class="topic-blurb">' + t.blurb + "</div></div>" +
          '<span class="chev">▸</span></div>' +
          '<div class="topic-body">' + t.body +
          '<button class="mark-btn" data-id="' + t.id + '">' +
          (progress.read[t.id] ? "✓ Marked as read" : "Mark as read") + "</button></div></div>";
      });
    });
    wrap.innerHTML = html;
    $$(".topic-head", wrap).forEach(function (h) {
      h.addEventListener("click", function () { h.parentElement.classList.toggle("open"); });
    });
    $$(".mark-btn", wrap).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.dataset.id;
        progress.read[id] = !progress.read[id];
        save(progress); renderStudy(); renderHome();
      });
    });
  }

  // ---------- Cheatsheet ----------
  function renderCheat(filter) {
    filter = (filter || "").toLowerCase();
    var wrap = $("#cheat-list");
    var html = "";
    window.COMMANDS.forEach(function (g) {
      var items = g.items.filter(function (it) {
        return !filter || it.cmd.toLowerCase().indexOf(filter) !== -1 || it.desc.toLowerCase().indexOf(filter) !== -1;
      });
      if (!items.length) return;
      html += '<div class="cheat-group"><h4>' + g.group + "</h4><table>";
      items.forEach(function (it) {
        html += "<tr><td><code>" + escapeHtml(it.cmd) + "</code></td><td>" + escapeHtml(it.desc) + "</td></tr>";
      });
      html += "</table></div>";
    });
    wrap.innerHTML = html || '<p class="muted">No commands match “' + escapeHtml(filter) + "”.</p>";
  }

  // ---------- Flashcards ----------
  var fcIndex = 0, fcDeck = [];
  function buildDeck(sec) {
    fcDeck = window.FLASHCARDS.filter(function (c) { return sec === "all" || c.section === +sec; });
    fcIndex = 0; renderCard();
  }
  function cardKey(c) { return c.section + "-" + window.FLASHCARDS.indexOf(c); }
  function renderCard() {
    var el = $("#flashcard");
    if (!fcDeck.length) { el.innerHTML = "<div class='fc-front'>No cards.</div>"; return; }
    var c = fcDeck[fcIndex];
    el.classList.remove("flipped");
    el.querySelector(".fc-front").textContent = c.front;
    el.querySelector(".fc-back").textContent = c.back.replace(/\\n/g, "\n");
    $("#fc-progress").textContent = (fcIndex + 1) + " / " + fcDeck.length;
    var status = progress.cards[cardKey(c)];
    $("#fc-status").textContent = status ? (status === "known" ? "✓ Known" : "↻ Review") : "";
  }
  function fcNav(d) { fcIndex = (fcIndex + d + fcDeck.length) % fcDeck.length; renderCard(); }
  function fcMark(status) {
    if (!fcDeck.length) return;
    progress.cards[cardKey(fcDeck[fcIndex])] = status; save(progress);
    renderHome(); fcNav(1);
  }

  // ---------- Quiz ----------
  var quizState = null;
  function startQuiz(sec, count) {
    var pool = window.QUIZ.filter(function (q) { return sec === "all" || q.section === +sec; });
    pool = shuffle(pool.slice()).slice(0, count || pool.length);
    quizState = { pool: pool, i: 0, answered: [], score: 0 };
    renderQuestion();
  }
  function renderQuestion() {
    var q = quizState.pool[quizState.i];
    var wrap = $("#quiz-body");
    wrap.innerHTML =
      '<div class="quiz-meta">Question ' + (quizState.i + 1) + " of " + quizState.pool.length +
      '  ·  Section ' + q.section + '  ·  Score: ' + quizState.score + "</div>" +
      '<div class="quiz-q">' + escapeHtml(q.q) + "</div>" +
      '<div class="quiz-opts">' + q.options.map(function (o, idx) {
        return '<button class="opt" data-idx="' + idx + '">' + escapeHtml(o) + "</button>";
      }).join("") + "</div>" +
      '<div class="quiz-explain" id="quiz-explain"></div>' +
      '<div class="quiz-nav"><button id="quiz-next" class="btn" disabled>Next →</button></div>';
    $$(".opt", wrap).forEach(function (b) {
      b.addEventListener("click", function () { answer(+b.dataset.idx, b); });
    });
    $("#quiz-next").addEventListener("click", next);
  }
  function answer(idx, btn) {
    var q = quizState.pool[quizState.i];
    if (btn.parentElement.dataset.done) return;
    btn.parentElement.dataset.done = "1";
    $$(".opt").forEach(function (b, i) {
      b.disabled = true;
      if (i === q.answer) b.classList.add("correct");
      if (i === idx && idx !== q.answer) b.classList.add("wrong");
    });
    if (idx === q.answer) quizState.score++;
    $("#quiz-explain").innerHTML = (idx === q.answer ? "✓ Correct. " : "✗ Not quite. ") + escapeHtml(q.explain);
    $("#quiz-explain").classList.add("show");
    $("#quiz-next").disabled = false;
  }
  function next() {
    quizState.i++;
    if (quizState.i >= quizState.pool.length) return finishQuiz();
    renderQuestion();
  }
  function finishQuiz() {
    var pct = Math.round(quizState.score / quizState.pool.length * 100);
    progress.quizzes.push({ date: new Date().toISOString().slice(0, 10), score: quizState.score, total: quizState.pool.length });
    save(progress); renderHome();
    $("#quiz-body").innerHTML =
      '<div class="quiz-result"><div class="big">' + pct + "%</div>" +
      "<p>You scored " + quizState.score + " / " + quizState.pool.length + ".</p>" +
      (pct >= 80 ? "<p class='good'>Great — that's a passing range. Keep it up!</p>"
                 : "<p class='warn'>Below 80%. Review the sections you missed and retry.</p>") +
      '<button class="btn" id="quiz-again">Take another</button></div>';
    $("#quiz-again").addEventListener("click", function () { $("#quiz-setup").scrollIntoView(); resetQuizUI(); });
  }
  function resetQuizUI() { $("#quiz-body").innerHTML = '<p class="muted">Choose a section and length above, then press Start.</p>'; }

  // ---------- Home / dashboard ----------
  function renderHome() {
    var totalTopics = window.TOPICS.length;
    var readCount = Object.keys(progress.read).filter(function (k) { return progress.read[k]; }).length;
    var totalCards = window.FLASHCARDS.length;
    var knownCards = Object.keys(progress.cards).filter(function (k) { return progress.cards[k] === "known"; }).length;
    var quizzes = progress.quizzes.length;
    var best = progress.quizzes.reduce(function (m, q) { return Math.max(m, Math.round(q.score / q.total * 100)); }, 0);

    $("#stat-read").textContent = readCount + " / " + totalTopics;
    $("#stat-read-bar").style.width = (readCount / totalTopics * 100) + "%";
    $("#stat-cards").textContent = knownCards + " / " + totalCards;
    $("#stat-cards-bar").style.width = (knownCards / totalCards * 100) + "%";
    $("#stat-quiz").textContent = quizzes ? best + "%" : "—";
    $("#stat-quiz-sub").textContent = quizzes + " quiz" + (quizzes === 1 ? "" : "zes") + " taken";

    var recent = progress.quizzes.slice(-5).reverse();
    $("#recent-quizzes").innerHTML = recent.length ?
      recent.map(function (q) {
        return "<li>" + q.date + " — " + q.score + "/" + q.total +
          " (" + Math.round(q.score / q.total * 100) + "%)</li>";
      }).join("") : '<li class="muted">No quizzes yet.</li>';
  }

  // ---------- utils ----------
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- wire controls ----------
  document.addEventListener("DOMContentLoaded", function () {
    renderStudy(); renderCheat(""); renderHome(); buildDeck("all"); resetQuizUI();

    $("#cheat-search").addEventListener("input", function (e) { renderCheat(e.target.value); });

    $("#fc-prev").addEventListener("click", function () { fcNav(-1); });
    $("#fc-next").addEventListener("click", function () { fcNav(1); });
    $("#flashcard").addEventListener("click", function () { this.classList.toggle("flipped"); });
    $("#fc-known").addEventListener("click", function () { fcMark("known"); });
    $("#fc-review").addEventListener("click", function () { fcMark("review"); });
    $("#fc-section").addEventListener("change", function (e) { buildDeck(e.target.value); });

    $("#quiz-start").addEventListener("click", function () {
      var sec = $("#quiz-section").value;
      var count = parseInt($("#quiz-count").value, 10) || 0;
      startQuiz(sec, count);
    });

    $("#reset-progress").addEventListener("click", function () {
      if (confirm("Reset all progress (read topics, flashcards, quiz history)?")) {
        localStorage.removeItem(STORE); progress = load();
        progress.read = {}; progress.quizzes = []; progress.cards = {};
        renderStudy(); renderHome(); buildDeck($("#fc-section").value);
      }
    });

    var initial = (location.hash || "#home").slice(1);
    showTab(["home", "study", "cheatsheet", "flashcards", "quiz", "practice", "exam"].indexOf(initial) !== -1 ? initial : "home");
  });
})();
