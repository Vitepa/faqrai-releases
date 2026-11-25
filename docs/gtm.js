/* Google Tag Manager (GTM-NBJRTQVB) se souhlasem podle § 89 odst. 3 zákona č. 127/2005 Sb.
   - Výchozí stav Consent Mode v2: vše zakázáno. Bez souhlasu se gtm.js vůbec nestáhne (žádný požadavek na Google).
   - Po souhlasu s analytickými nebo marketingovými cookies se souhlas předá Googlu a kontejner se načte.
   - Volbu ukládá lišta cookies v mobil.js do localStorage „faqrai-cookies“ ({ v: 2, preferencni, analyticke, marketingove }). */
(function () {
  var ID = "GTM-NBJRTQVB";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", functionality_storage: "denied", personalization_storage: "denied", security_storage: "granted", wait_for_update: 500 });
  gtag("set", "ads_data_redaction", true);
  gtag("js", new Date());
  var nacteno = false;
  function souhlas() { try { var s = JSON.parse(localStorage.getItem("faqrai-cookies") || "null"); return s && s.v >= 2 ? s : null; } catch (e) { return null; } }
  function smazGoogleCookies() {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (/^(_ga|_gid|_gat|_gcl_|_gac_)/.test(n)) ["", location.hostname, "." + location.hostname.replace(/^www\./, "")].forEach(function (d) { document.cookie = n + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : ""); });
    });
  }
  /* zavolá lišta cookies po uložení volby (a tento skript při načtení stránky) */
  window.faqraiGtm = function (s) {
    s = s || {};
    var a = !!s.analyticke, m = !!s.marketingove;
    gtag("consent", "update", { analytics_storage: a ? "granted" : "denied", ad_storage: m ? "granted" : "denied", ad_user_data: m ? "granted" : "denied", ad_personalization: m ? "granted" : "denied" });
    if (!a && !m) { smazGoogleCookies(); return; }
    if (nacteno) return; nacteno = true;
    dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var j = document.createElement("script"); j.async = true; j.src = "https://www.googletagmanager.com/gtm.js?id=" + ID;
    (document.head || document.documentElement).appendChild(j);
  };
  var s = souhlas(); if (s) window.faqraiGtm(s);
})();
