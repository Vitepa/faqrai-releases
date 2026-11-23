/* ============================================================================
   Nastavení webu FaqrAi. Všechno, co se prodává a za kolik, je tady – HTML se
   měnit nemusí. Ceny v Kč. Po změně stačí soubor nahrát na hosting.
   ============================================================================ */
window.FAQRAI_CFG = {
  provider: {
    name: "Pavel Vítek", ico: "30286573",
    email: "info@faqrai.cz", address: "",                 // obecný kontakt (patičky, podmínky, ochrana údajů)
    vatPayer: false                          // true = ceny níže jsou bez DPH a k objednávce se připočte 21 %
  },
  orderEmail: "fakturace@faqrai.cz",         // objednávky, faktury a platby (mailto, když není endpoint)
  prodejOd: "2026-12-01T00:00:00+01:00",      // do tohoto okamžiku web nenabízí koupi licence, jen beta test zdarma (mobil.js)
  supportEmail: "podpora@faqrai.cz",         // technická podpora (stránka Podpora, převod dat, reklamace)
  orderEndpoint: "https://faqrai-stahovani.faqrai.workers.dev/objednavka",   // objednávky jdou do služby na Cloudflare (čtou se ve Správci); prázdné = e-mailem
  account: { number: "", iban: "" },
  prispevky: { castky: [200, 500, 1000], zprava: "PRISPEVEK FAQRAI" },   // stránka Podpořte vývoj: nabízené částky a zpráva pro příjemce (QR používá IBAN výše)
  beta: { endpoint: "https://faqrai-stahovani.faqrai.workers.dev/prihlaska" },   // přihlášky do beta testu: služba na Cloudflare (čtou se v generátoru licencí); prázdné = e-mailem         // bankovní účet; IBAN je potřeba pro QR platbu (např. "CZ6508000000192000145399")
  releases: "https://github.com/Vitepa/faqrai-releases/releases/latest",
  releasesApi: "https://api.github.com/repos/Vitepa/faqrai-releases/releases",   // pro stránku Ke stažení (seznam změn)
  sluzba: "https://faqrai-stahovani.faqrai.workers.dev",                          // služba ke stažení (cloudflare/stahovani): instalačky aktuální verze
  publicKey: "5Begww25ucs6NtjGc04n9BNlK9saI39/nNcVYj2U75o=",                     // veřejný klíč licencí (ověření na webu); musí být shodný s src/licence-public-key.txt
  trialDays: 30,
  invoiceDueDays: 14,

  /* ---- Produkty --------------------------------------------------------------
     id        – interní klíč (používá se v odkazech ?p=simple a v objednávce)
     byte      – číslo produktu v licenci (1 Simple, 2 FaqrAi; další 3, 4…)
     seats     – prodává se na počet zařízení (true) / osobní licence (false)
     year      – cena za 1 rok (první zařízení); seatYear – každé další zařízení za rok
     lifetime  – cena trvalé licence (null = nenabízet); seatLifetime – další zařízení trvale.
                 Trvalá licence (licenční podmínky 2.1, čl. 3.2 a 4): fixpacky, daňové parametry a povinné upgrady
                 vždy, podpora e-mailem rok; nové verze s novými funkcemi (upgrady) jen s platnou podporou / údržbou.
     maintenance – roční údržba trvalé licence: prodlouží podporu o rok a zahrnuje upgrady vydané v tom roce;
                 seatMaintenance / firmMaintenance – za každé další zařízení / firmu.
     Časově omezená licence (1–3 roky) má po celou dobu v ceně všechno: fixpacky, nové verze, parametry i podporu.
     firmYear / firmLifetime – příplatek za každou další firmu v jednom programu (jen FaqrAi; vynechat = nenabízet)
     available – false = jen „Připravujeme“, nelze objednat (lze přihlásit zájem)
  --------------------------------------------------------------------------- */
  products: [
    { id: "simple", byte: 1, name: "FaqrAi Simple", short: "Simple", color: "#2741A0", logo: "img/logo-simple.svg", available: true,
      desc: "OSVČ – faktury, výdaje, daně a přehledy", seats: false,
      // tarify: hlavní ceny = Plus (všechno včetně automatiky), zaklad = přepíše ceny pro tarif Základ
      year: 1990, lifetime: null, maintenance: 1290, month: 199, monthSupport: 49, yearSupport: 0,
      zaklad: { year: 990, maintenance: 690, month: 99 },   // 0 = podpora v ceně ročního předplatného (jako u roční licence)   // month = měsíční předplatné bez závazku (kartou přes Stripe); monthSupport = podpora e-mailem k předplatnému za měsíc
      bullets: ["faktury plátce i neplátce DPH, QR platba, opravné doklady", "daňové přiznání a přehledy ČSSZ / ZP, vedlejší činnost", "další příjmy (§ 8–10), paušální daň, přenos ztráty", "OCR skenů, balík pro účetní, pokladna"] },
    { id: "faqrai", byte: 2, name: "FaqrAi", short: "FaqrAi", color: "#0F766E", logo: "img/logo-faqrai.svg", available: true,
      desc: "Malé firmy – faktury, DPH, zálohy, pokladna, sklad", seats: true, maxSeats: 50,
      includedSeats: 5,   // počítačů v základní ceně
      year: 3990, seatYear: 890, lifetime: null, month: 379, seatMonth: 79, firmMonth: 139, monthSupport: 99, yearSupport: 0,
      zaklad: { year: 2490, seatYear: 690, month: 239, seatMonth: 69, maintenance: 1790, seatMaintenance: 490 },
      firmYear: 1490, maxFirms: 50,
      maintenance: 2690, seatMaintenance: 590, firmMaintenance: 990,   // každá další firma (s.r.o.) v jednom programu; první je v ceně
      bullets: ["zálohové faktury, DDPP, vyúčtování, EUR", "DPH na vstupu i výstupu, kontrolní hlášení", "pokladna, sklad, role zařízení", "více firem (s.r.o.) v jednom programu", "export Pohoda XML a ISDOC"] },
    { id: "duo", byte: 3, name: "FaqrAi Duo", short: "Duo", color: "#6D28D9", logo: "img/logo-duo.svg", available: false, eta: "2027",
      desc: "Podvojné účetnictví pro s.r.o. a spolky", seats: true, year: 4990, seatYear: 1490, lifetime: null,
      bullets: ["účetní deník, hlavní kniha, osnova pro podnikatele", "předkontace dokladů z FaqrAi", "rozvaha, výsledovka, příloha", "přiznání k DPPO"] },
    { id: "server", byte: 4, name: "FaqrAi Server", short: "Server", color: "#17465C", logo: "img/logo-server.svg", available: false, eta: "2027",
      desc: "Server ve vaší síti pro celou firmu", seats: true, year: 14900, seatYear: 990, lifetime: null, perUserLabel: "uživatel",
      bullets: ["všechny počítače s FaqrAi nad jednou šifrovanou databází", "přihlášení přes Active Directory nebo Entra ID", "doklady i v SharePointu, přístup z prohlížeče", "sám se aktualizuje, FixPacky i bez internetu"] }
  ],

  /* ---- Tarify: Základ (vše pro daně a evidenci) a Plus (navíc automatika a napojení) ---- */
  tiers: [
    { id: "zaklad", name: "Základ", desc: "Faktury, výdaje, daně, DPH, přehledy a export pro EPO – vše, co potřebujete podle zákona." },
    { id: "plus", name: "Plus", desc: "Navíc automatika: párování s bankou, automatické upomínky a opakované faktury, platby kartou, faktura online, doklady z mobilu, předpověď peněz, evidence času, API a napojení." }
  ],

  /* ---- Délky licence a slevy za platbu předem ---- */
  terms: [
    // prodává se jen předplatné (dřívější licence na roky a trvalé licence se už nenabízejí; údržba trvalých licencí zůstává přes ?m=maintenance)
    { yearlySub: true, label: "Ročně – předplatné s automatickým prodlužováním" },   // kartou, prodlužuje se samo; zrušit lze kdykoli
    { monthly: true, label: "Měsíčně – předplatné bez závazku" },   // kartou, zrušit lze kdykoli
    { years: 1, label: "1 rok", maintenanceOnly: true }, { years: 2, label: "2 roky", maintenanceOnly: true, discount: 0.10 }   // jen údržba dříve prodaných trvalých licencí
  ],

  /* ---- Doplňky ---------------------------------------------------------------
     mode: "year" (× počet let licence), "once" (jednorázově), "seatYear" (× zařízení × roky), "seatOnce"
     products: na které produkty se vztahuje (vynechat = na všechny); default: předvybrat
  --------------------------------------------------------------------------- */
  addons: [],   // doplňkové služby (zaškolení, převod dat…) se neprodávají – jen licence

  /* ---- Balíčky (předvolby jedním kliknutím) ---- */
  bundles: [],   // rychlé předvolby (při prodeji jen předplatného nejsou potřeba),

  /* ---- Slevové kódy ----------------------------------------------------------
     percent nebo amount; validUntil (RRRR-MM-DD); products (jen pro některé); minTotal
  --------------------------------------------------------------------------- */
  coupons: [
    { code: "UCETNI10", percent: 10, note: "doporučení účetní" },
    { code: "START2027", amount: 500, validUntil: "2027-01-31", products: ["simple"], minTotal: 1490 }
  ],

  /* ---- Přechod mezi produkty a prodloužení ---- */
  upgrade: { from: "simple", to: "faqrai", credit: 0.5, note: "Při přechodu ze Simple na FaqrAi započteme 50 % z ceny zbývající doby licence Simple." },
  renewalDiscount: 0.05,   // sleva při prodloužení před koncem platnosti (zadané číslo stávající licence)

  /* ---- Newsletter a podpora ---- */
  newsletter: { endpoint: "", provider: "", note: "Čtvrtletně: změny sazeb a limitů, termíny, novinky v programech. Žádný spam, odhlášení jedním kliknutím." }, // endpoint = URL formulářové služby (Buttondown/Mailchimp/Formspree). Prázdné = odběr e-mailem na orderEmail.
  support: { mailEndpoint: "https://faqrai.cz/podpora-odeslat.php", endpoint: "https://faqrai-stahovani.faqrai.workers.dev/podpora", hours: "v pracovní dny, zpravidla do 2 pracovních dnů" },
  siteUrl: "https://faqrai.cz/",   // veřejná adresa webu (pro sdílení a sitemap)

  /* ---- Texty ---- */
  texts: {
    afterOrder: "Fakturu pošleme e-mailem; licenční klíč vydáme po připsání platby, obvykle do jednoho pracovního dne.",
    maintenanceNote: "Údržba je pro trvalé licence: prodlouží podporu e-mailem o zvolenou dobu a zahrnuje nové verze programu s novými funkcemi vydané v tom období. Opravy a povinné aktualizace dostáváte i bez ní. Navazuje na konec dosavadní podpory.",
    consent: "Souhlasím s obchodními a licenčními podmínkami a beru na vědomí informace o zpracování osobních údajů. Jako podnikatel objednávám na IČO; právo spotřebitele na odstoupení od smlouvy se neuplatní."
  }
};
