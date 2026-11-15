/* Nastavení webu FaqrAi – upravte zde, nic jiného není potřeba měnit. */
window.FAQRAI_CFG = {
  provider: { name: "Pavel Vítek", ico: "",          // IČO doplňte, jakmile ho máte
              email: "pavel.vitek16@gmail.com", vatPayer: false, address: "" },
  orderEmail: "pavel.vitek16@gmail.com",            // kam chodí objednávky
  orderEndpoint: "",                                // volitelné: URL formulářové služby (Formspree, Getform…) – objednávka se tam pošle POSTem a nemusíte spoléhat na e-mail
  account: { number: "", iban: "" },                // bankovní účet pro platbu (IBAN kvůli QR platbě), např. "CZ6508000000192000145399"
  releases: "https://github.com/Vitepa/faqrai-releases/releases/latest",
  /* Ceny v Kč. Neplátce DPH: ceny jsou konečné. */
  prices: {
    simple: { year: 990,  lifetime: 2490, support: 490,  name: "FaqrAi Simple", desc: "OSVČ – faktury, výdaje, daně a přehledy" },
    faqrai: { year: 2490, lifetime: 5990, support: 990,  seatYear: 990, seatLifetime: 1990, name: "FaqrAi", desc: "Malé firmy – faktury, DPH, zálohy, pokladna, sklad" }
  },
  trialDays: 30
};
