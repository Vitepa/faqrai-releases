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
  /* ceník na telefonu: místo všech tarifů pod sebou přepínač – ukáže se jen vybraný sloupec */
  const prepinac = t => {
    if (!t.classList.contains("prices")) return;
    const hl = [...t.querySelectorAll("thead th")].slice(1).map(th => (th.childNodes[0] && th.childNodes[0].nodeType === 3 ? th.childNodes[0].textContent : th.textContent).trim());
    if (hl.length < 2) return;
    let p = t.previousElementSibling && t.previousElementSibling.classList.contains("tarify") ? t.previousElementSibling : null;
    if (!p) { p = document.createElement("div"); p.className = "tarify"; p.setAttribute("role", "group"); p.setAttribute("aria-label", "Vyberte tarif"); (t.parentNode.classList.contains("tab-obal") ? t.parentNode : t).insertAdjacentElement("beforebegin", p); }
    const vyber = Math.min(+(t.dataset.vyber || 1), hl.length);
    p.innerHTML = hl.map((h, i) => `<button type="button" aria-pressed="${i + 1 === vyber}" data-i="${i + 1}">${h}</button>`).join("");
    t.querySelectorAll("tr").forEach(tr => [...tr.children].forEach((c, i) => c.classList.toggle("mimo", i > 0 && i !== vyber)));
    t.classList.add("vyber");
    const sel = p.querySelector("[aria-pressed=true]"); if (sel) p.scrollLeft = Math.max(0, sel.offsetLeft - 8);
    p.onclick = e => { const x = e.target.closest("button[data-i]"); if (!x) return; t.dataset.vyber = x.dataset.i; prepinac(t); };
  };
  window.faqraiTarif = i => document.querySelectorAll("table.prices").forEach(t => { t.dataset.vyber = i; prepinac(t); });
  const vse = () => document.querySelectorAll("table.prices, table.compare").forEach(t => { popisky(t); prepinac(t); });
  vse(); document.querySelectorAll("table.prices").forEach(t => new MutationObserver(() => { if (!t.classList.contains("karty") || t.querySelector("tbody td:not([data-l])")) { popisky(t); prepinac(t); } }).observe(t, { childList: true }));
  // kontaktní e-maily z config.js (podpora, fakturace)
  const C = window.FAQRAI_CFG || {};
  for (const [atr, mail] of [["data-email-podpora", C.supportEmail], ["data-email-fakturace", C.orderEmail]]) document.querySelectorAll("[" + atr + "]").forEach(e => { if (!mail) return; e.textContent = mail; if (e.tagName === "A") e.href = "mailto:" + mail; });
  // do zahájení prodeje (C.prodejOd) jen beta test: odkazy na objednávku vedou na beta.html, stránka objednávky nabídne beta test
  if (C.prodejOd && Date.now() < Date.parse(C.prodejOd)) {
    const den = new Date(C.prodejOd).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
    const prepis = () => document.querySelectorAll('a[href^="objednavka.html"]:not([data-beta])').forEach(a => {
      a.setAttribute("data-beta", "1");
      const inline = !a.classList.contains("btn") && !a.closest("nav, footer");
      if (inline) { a.replaceWith(document.createTextNode(a.textContent.replace(/^(koupit|prodloužit|přidat).*/i, "beta test"))); return; }
      a.href = "beta.html"; a.textContent = a.closest("footer") ? "Beta test" : "Beta test zdarma";
    });
    prepis(); new MutationObserver(prepis).observe(document.body, { childList: true, subtree: true });
    const ceny = document.getElementById("prices");
    if (ceny && !document.getElementById("betaCeny")) ceny.closest("div, section").insertAdjacentHTML("beforebegin", `<div class="notice" id="betaCeny" style="margin:0 0 16px">Prodej licencí začne <b>${den}</b>. Do té doby si program vyzkoušejte v <a href="beta.html">beta testu</a> – licence je zdarma.</div>`);
    if (/objednavka\.html$/.test(location.pathname)) {
      const m = document.querySelector("main") || document.querySelector("section .wrap") || document.body;
      m.innerHTML = `<section><div class="wrap" style="max-width:720px;padding:48px 24px"><h1 style="font-size:clamp(34px,6vw,52px)">Prodej začne <span style="white-space:nowrap">${den}</span></h1><p>Licence FaqrAi a FaqrAi Simple půjde koupit od ${den}. Do té doby se můžete zapojit do beta testu – licenci dostanete zdarma a vaše data zůstanou i po koupi.</p><p><span style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="beta.html">Přihlásit se do beta testu</a><a class="btn" href="stahnout.html">Stáhnout na zkoušku</a></span></p></div></section>`;
    }
  }
  // předvolby cookies: lišta při první návštěvě a odkaz „Nastavení cookies“ v patičce
  const ulozVolbu = pref => { try { localStorage.setItem("faqrai-cookies", JSON.stringify({ v: 1, preferencni: pref, kdy: new Date().toISOString() })); if (!pref) localStorage.removeItem("faqrai-stazeni"); } catch (e) {} };
  const lista = document.createElement("div"); lista.className = "cookies-lista"; lista.setAttribute("role", "region"); lista.setAttribute("aria-label", "Cookies");
  const vykresli = nastaveni => {
    const pref = window.faqraiPreferencni && faqraiPreferencni();
    lista.innerHTML = nastaveni ? `<div class="wrap"><b>Nastavení cookies a úložiště prohlížeče</b>
        <label class="cl-r"><input type="checkbox" checked disabled> <span><b>Nezbytné</b> – jen záznam této volby. Bez nich web nefunguje, proto je nelze vypnout.</span></label>
        <label class="cl-r"><input type="checkbox" id="clPref" ${pref ? "checked" : ""}> <span><b>Preferenční</b> – web si zapamatuje IČO a název z formuláře před stažením, abyste ho nemuseli vyplňovat znovu.</span></label>
        <label class="cl-r"><input type="checkbox" disabled> <span><b>Analytické a reklamní</b> – nepoužíváme.</span></label>
        <div class="cl-b"><button class="btn primary" id="clUloz" type="button">Uložit volbu</button><a href="ochrana-udaju.html#cookies">Podrobnosti</a></div></div>`
      : `<div class="wrap"><p>Nepoužíváme sledovací ani reklamní cookies. Se souhlasem si web zapamatuje údaje z formuláře před stažením, abyste je nemuseli vyplňovat znovu. <a href="ochrana-udaju.html#cookies">Podrobnosti</a></p>
        <div class="cl-b"><button class="btn" id="clAno" type="button">Povolit</button><button class="btn" id="clNe" type="button">Jen nezbytné</button><button class="btn" id="clNast" type="button">Nastavení</button></div></div>`;
    const zavri = () => lista.remove();
    const q = id => lista.querySelector("#" + id);
    if (q("clAno")) q("clAno").onclick = () => { ulozVolbu(true); zavri(); };
    if (q("clNe")) q("clNe").onclick = () => { ulozVolbu(false); zavri(); };
    if (q("clNast")) q("clNast").onclick = () => vykresli(true);
    if (q("clUloz")) q("clUloz").onclick = () => { ulozVolbu(q("clPref").checked); zavri(); };
    if (!lista.isConnected) document.body.appendChild(lista);
  };
  if (!window.faqraiSouhlas || !faqraiSouhlas()) vykresli(false);
  const pata = document.querySelector("footer nav");
  if (pata && !pata.querySelector("[data-cookies]")) { const a = document.createElement("a"); a.href = "#"; a.textContent = "Nastavení cookies"; a.setAttribute("data-cookies", "1"); a.onclick = e => { e.preventDefault(); vykresli(true); }; pata.appendChild(a); }
})();
