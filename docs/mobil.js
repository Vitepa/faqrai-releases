/* Úpravy webu pro mobily: rozbalovací menu a tabulky přeskládané do karet (popisky sloupců z hlavičky). */
(function () {
  const top = document.querySelector("header.top .wrap"), nav = top && top.querySelector("nav.main");
  if (nav) {
    const odkazy = [...nav.querySelectorAll("a:not(.btn)")];
    const panel = document.createElement("nav"); panel.className = "menu-panel"; panel.id = "menuPanel"; panel.hidden = true; panel.setAttribute("aria-label", "Nabídka");
    panel.innerHTML = odkazy.map(a => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`).join("") + `<a href="o-mne.html">O mně</a><a href="podpora.html">Podpora</a>`;
    const b = document.createElement("button"); b.type = "button"; b.className = "menu-btn"; b.setAttribute("aria-controls", "menuPanel"); b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Otevřít nabídku");
    b.innerHTML = "<span></span><span></span><span></span>";
    const zavri = () => { panel.hidden = true; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Otevřít nabídku"); };
    b.onclick = () => { const o = panel.hidden; panel.hidden = !o; b.setAttribute("aria-expanded", String(o)); b.setAttribute("aria-label", o ? "Zavřít nabídku" : "Otevřít nabídku"); };
    panel.addEventListener("click", e => { if (e.target.closest("a")) zavri(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { zavri(); b.focus(); } });
    top.appendChild(b); top.parentNode.appendChild(panel);
  }
  const popisky = t => {
    const h = [...t.querySelectorAll("thead th")].map(th => (th.childNodes[0] && th.childNodes[0].nodeType === 3 ? th.childNodes[0].textContent : th.textContent).trim());
    t.querySelectorAll("tbody tr, tfoot tr").forEach(tr => [...tr.children].forEach((c, i) => { if (i > 0 && h[i]) c.setAttribute("data-l", h[i]); }));
    t.classList.add("karty");
  };
  const vse = () => document.querySelectorAll("table.prices, table.compare").forEach(popisky);
  vse(); document.querySelectorAll("table.prices").forEach(t => new MutationObserver(() => { if (!t.classList.contains("karty") || t.querySelector("tbody td:not([data-l])")) popisky(t); }).observe(t, { childList: true }));
})();
