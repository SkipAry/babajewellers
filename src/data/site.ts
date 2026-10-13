/**
 * ─────────────────────────────────────────────────────────────
 *  BABA JEWELLERS — SITE CONFIGURATION
 *  Every editable detail of the website lives in this file.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Baba Jewellers",
  tagline: "Where Trust Meets Tradition",
  url: "https://babajewellers.co.in",
  phoneDisplay: "+91 96071 76437",
  phoneE164: "+919607176437",
  whatsappNumber: "919607176437",
  whatsappMessage:
    "Hello Baba Jewellers, I would like to enquire about your jewellery collection.",
  establishedDate: "9 June 2008",
  establishedYear: 2008,
  founder: "Mr. Santosh Tiwari",
  businessHours: "8:30 AM – 9:00 PM, all days",
  /**
   * Formspree endpoint for the enquiry form.
   * Keep this in sync with the active form at https://formspree.io.
   */
  formEndpoint: "https://formspree.io/f/mpqveyvp",
  instagram:
    "https://www.instagram.com/babajewellersofficial?igsh=MW51dXJiaXZ0bXBkdg==",
};

export type Store = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  note: string;
  callDisplay: string;
  callE164: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  /** Schema.org display name for this specific branch. */
  schemaName: string;
  /** Exact coordinates from Google Maps. null until the owner supplies them. */
  geo: { lat: number; lng: number } | null;
  /** Google Business Profile URL. null until the profile is claimed. */
  gbpUrl: string | null;
  /** When this branch opened. null when only the year is known. */
  foundingDate: string | null;
};

export const stores: Store[] = [
  {
    id: "karanje",
    label: "The Original Store — Since 2008",
    line1: "Shop No. 13, Karanje Complex",
    line2: "Pune–Nagar Road, Shikrapur",
    city: "Pune, Maharashtra 412208",
    note: "Where our journey began on 9 June 2008.",
    callDisplay: "+91 73979 65958",
    callE164: "+917397965958",
    whatsappDisplay: "9096082163",
    whatsappNumber: "919096082163",
    schemaName: "Baba Jewellers — Karanje Complex, Shikrapur",
    geo: null,
    /* ⚠ NEEDED: this branch's own Google Business Profile share link.
       Both branches are real and separately listed, so each needs its own
       `sameAs`. Without it Google has no way to connect this address to
       the site. */
    gbpUrl: null,
    foundingDate: "2008-06-09",
  },
  {
    id: "baba-complex",
    label: "Our New Chapter — Since 2023",
    line1: "Baba Complex",
    line2: "Shikrapur–Talegaon Dhamdhere Road, Shikrapur",
    city: "Pune, Maharashtra 412208",
    note: "Opened 22 October 2023 to serve you even better.",
    callDisplay: "+91 85301 75311",
    callE164: "+918530175311",
    whatsappDisplay: "8379985958",
    whatsappNumber: "918379985958",
    schemaName: "Baba Jewellers — Baba Complex, Shikrapur",
    geo: null,
    /* Owner-supplied share link, 2 Sep 2026. Resolves to the Google
       listing titled "Baba jewellers Talegaon Dhamdhere" (kgmid
       /g/11wpzpkksr), which is this branch — Baba Complex sits on the
       Shikrapur–Talegaon Dhamdhere road. Emitted as `sameAs`, which is
       what tells Google the website and the Business Profile are one
       entity rather than two unrelated things mentioning the same name. */
    gbpUrl: "https://share.google/wOrhT7zmMp1OtpGG5",
    foundingDate: null,
  },
];

export const mapsLinkFor = (store: Store) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Baba Jewellers, ${store.line1}, ${store.line2}, ${store.city}`
  )}`;

export const telLinkFor = (store: Store) => `tel:${store.callE164}`;

export const whatsappLinkFor = (store: Store) =>
  `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
    site.whatsappMessage
  )}`;

export const whatsappLink = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
  site.whatsappMessage
)}`;

export const telLink = `tel:${site.phoneE164}`;

/** Towns and villages the stores realistically serve — used for schema areaServed. */
export const areaServed = [
  "Shikrapur",
  "Shirur",
  "Ranjangaon",
  "Talegaon Dhamdhere",
  "Kendur",
  "Pune",
];

/** Product categories carried, used for schema hasOfferCatalog. */
export const offerCatalog = [
  "Bridal Jewellery Sets",
  "Gold Necklaces and Chokers",
  "Mangalsutra",
  "Bangles",
  "Earrings and Jhumkas",
  "Rings",
  "Silver Jewellery",
];

/* ── Running offers (the sliding banners under the hero) ──────
   NOT to be confused with `offerCatalog` above, which is the list of
   product categories used for schema hasOfferCatalog.

   Each entry is one of the shop's own printed ad creatives plus a plain
   text version of the same claim. The text is not decoration: the banner
   is an image with the offer baked into it, so without `headline` the
   offer is invisible to Google and to screen readers, and unreadable on a
   narrow phone where a 3:1 banner is only ~125px tall.

   `validTill` is an ISO date. Expired offers are dropped at BUILD time —
   which is fine here because the daily rates workflow commits to main
   every morning and that redeploys the site, so an expired banner
   disappears within a day. Set to null for an offer with no end date.  */
export type Offer = {
  id: string;
  /** Banner creative, 3:1. Lives in public/offers/. */
  image: string;
  /** The same offer re-laid-out for narrow screens, 2:1. A 3:1 banner is
      only ~125px tall on a 375px phone, which leaves the text baked into
      the artwork unreadable; this is a separate creative, not a crop, so
      nothing is lost. Served below 640px. */
  imageMobile: string;
  /** Full description of the banner for screen readers. */
  alt: string;
  /** The offer in Marathi, as printed on the banner. */
  headlineMr: string;
  /** The same offer in English. */
  headline: string;
  /** ISO date, or null for no end date. */
  validTill: string | null;
  /**
   * Festival artwork that temporarily replaces the banner while the offer
   * itself carries on unchanged.
   *
   * This exists so a seasonal creative does NOT become a second offer.
   * Adding Dussehra as its own entry would have put two banners for the
   * same 6% discount in the carousel at once, emitted a duplicate `Offer`
   * into the schema, and listed it twice on /offers/. One offer, swappable
   * artwork, is the honest shape: the terms never changed, only the dress.
   */
  seasonal?: {
    image: string;
    imageMobile: string;
    alt: string;
    /** Last day the festival artwork shows. After this the standard
        banner returns, while `validTill` keeps governing the offer. */
    until: string;
  };
};

const allOffers: Offer[] = [
  {
    id: "gold-making-charges-6-percent",
    image: "/offers/gold-making-charges-6-percent.webp",
    imageMobile: "/offers/gold-making-charges-6-percent-mobile.webp",
    alt: "Baba Jewellers offer — only 6% making charges on all gold jewellery, valid until 15 November 2026.",
    headlineMr: "सोन्याच्या दागिन्यांच्या घडणावळीवर फक्त ६%",
    headline: "Only 6% making charges on all gold jewellery",
    validTill: "2026-11-15",
    /* Dussehra dress for the same 6% offer. Reverts to the standard
       banner on 22 Oct; the offer itself runs to 15 Nov regardless. */
    seasonal: {
      image: "/offers/dussehra-gold-6-percent.webp",
      imageMobile: "/offers/dussehra-gold-6-percent-mobile.webp",
      alt: "Baba Jewellers Dussehra offer — only 6% making charges on all gold jewellery.",
      until: "2026-10-21",
    },
  },
  {
    id: "silver-making-charges-flat-50",
    image: "/offers/silver-making-charges-flat-50.webp",
    imageMobile: "/offers/silver-making-charges-flat-50-mobile.webp",
    alt: "Baba Jewellers Ganeshotsav offer — flat 50% off making charges on silver jewellery.",
    headlineMr: "चांदीच्या दागिन्यांच्या मेकिंग चार्जेसवर फ्लॅट ५०% सूट",
    headline: "Flat 50% off making charges on silver jewellery",
    // Not printed on the banner; confirmed by the shop on 11 Sep 2026.
    validTill: "2026-09-27",
  },
];

/* Build-time expiry. Compared date-only in IST so an offer lasts through
   the whole of its final day rather than expiring at midnight UTC.

   Do NOT compute this with Intl.DateTimeFormat("en-CA"). It reads as the
   obvious way to get YYYY-MM-DD, and it works on any Node with full ICU —
   including every machine we test on. On a small-icu build, which some CI
   and deploy images still ship, "en-CA" silently falls back to US format
   and returns "10/9/2026". The comparison below then runs
   "2026-09-27" >= "10/9/2026", which is TRUE because "2" sorts after "1",
   so every expired offer survives instead of being dropped.

   That is not hypothetical: the Ganeshotsav silver offer expired
   27 Sep 2026 and was still advertising 50% off on the live site on
   9 Oct, through twelve daily rebuilds, because of exactly this.

   Shifting the epoch and slicing the ISO string has no locale or ICU
   dependency and cannot return anything but YYYY-MM-DD. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const TODAY_IST = new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);

/* Expiry first, then artwork. Both resolved at build time against the same
   TODAY_IST, so the banner, the /offers/ page and the schema can never
   disagree about which creative is running.

   `seasonal` is dropped from the returned object once resolved — every
   consumer then sees a plain Offer with the correct artwork already
   chosen, and none of them needs to know festivals exist. */
export const offers: Offer[] = allOffers
  .filter((o) => o.validTill === null || o.validTill >= TODAY_IST)
  .map(({ seasonal, ...offer }) =>
    seasonal && seasonal.until >= TODAY_IST
      ? {
          ...offer,
          image: seasonal.image,
          imageMobile: seasonal.imageMobile,
          alt: seasonal.alt,
        }
      : offer
  );

/* ── The six Baba Jewellers promises ────────────────────────── */
export const promises = [
  {
    icon: "hallmark" as const,
    title: "100% BIS Hallmarked Gold",
    text: "Every gold jewellery piece is BIS Hallmarked for guaranteed purity and authenticity.",
  },
  {
    icon: "returns" as const,
    title: "15-Day Returns",
    text: "Easy and hassle-free returns within 15 days, as per our return policy.",
  },
  {
    icon: "pricing" as const,
    title: "Transparent Pricing",
    text: "Clear gold rates, making charges, GST and complete pricing with no hidden costs.",
  },
  {
    icon: "payment" as const,
    title: "Multiple Payment Options",
    text: "Pay conveniently using Cash, UPI, Credit/Debit Cards, EMI and Bank Transfer.",
  },
  {
    icon: "trust" as const,
    title: "Trusted Jewellery Store",
    text: "A trusted destination for premium jewellery, honest service and lasting relationships.",
  },
  {
    icon: "heart" as const,
    title: "Customer Satisfaction",
    text: "Committed to exceptional service and a memorable shopping experience every time.",
  },
];

export type PromiseIcon = (typeof promises)[number]["icon"];

/* ── Collection pieces (public/products/) ───────────────────── */
export type Piece = {
  id: string;
  title: string;
  category: "Necklaces" | "Earrings" | "Bangles" | "Rings" | "Bracelets";
  image: string;
  alt: string;
  tall?: boolean;
};

/* "Bracelets" is its own filter rather than being folded into Bangles.
   The three pieces under it are heavy men's chain bracelets, and a man
   looking for one does not filter by "Bangles" — in Indian retail that
   word means women's. Collapsing the two would hide the only men's
   jewellery on the site behind a label its buyer will never tap. */
export const collectionFilters = [
  "All",
  "Necklaces",
  "Earrings",
  "Bangles",
  "Bracelets",
  "Rings",
] as const;

export const pieces: Piece[] = [
  /* ── Men's bracelets, added 11 Oct 2026 ──────────────────────
     Shot on red satin inside a gold rule, unlike the older pieces which
     sit on maroon velvet. Deliberately listed first: they are the only
     men's jewellery on the site, and Dhanteras (6 Nov) is the one time of
     year men buy gold for themselves. */
  {
    id: "mens-woven-curb-bracelet",
    title: "Mens Bracelet",
    category: "Bracelets",
    image: "/products/12-mens-woven-curb-bracelet.webp",
    alt: "Men's gold bracelet of densely woven links with leaf-cut texturing, engraved tapered end caps and an S-hook clasp",
    tall: true,
  },
  {
    id: "mens-box-link-bracelet",
    title: "Mens Bracelet",
    category: "Bracelets",
    image: "/products/13-mens-box-link-bracelet.webp",
    alt: "Men's gold bracelet of rectangular ribbed panels with round centre studs, linked into a flat band with an S-hook clasp",
  },
  {
    id: "mens-curb-bracelet-faceted",
    title: "Mens Bracelet",
    category: "Bracelets",
    image: "/products/14-mens-curb-bracelet-faceted.webp",
    alt: "Heavy men's gold curb-link bracelet with diamond-cut faceted links, an engraved end cap and an S-hook clasp",
  },

  {
    id: "gold-choker",
    title: "Bridal Gold Choker",
    category: "Necklaces",
    image: "/products/11-gold-choker.webp",
    alt: "Intricately carved gold choker necklace displayed on a maroon velvet box",
    tall: true,
  },
  {
    id: "necklace-set",
    title: "Necklace & Earrings Set",
    category: "Necklaces",
    image: "/products/05-necklace-set.webp",
    alt: "Gold necklace with matching earrings set displayed on a maroon velvet bust",
  },
  {
    id: "chandbali-earrings",
    title: "Pearl Chandbali Earrings",
    category: "Earrings",
    image: "/products/01-earrings.webp",
    alt: "Gold chandbali earrings with pearl drops resting on an earthen bowl",
    tall: true,
  },
  {
    id: "long-necklace",
    title: "Temple Long Necklace",
    category: "Necklaces",
    image: "/products/03-long-necklace.webp",
    alt: "Long gold temple-style necklace arranged on maroon fabric",
  },
  {
    id: "peacock-bangles",
    title: "Peacock Bangles",
    category: "Bangles",
    image: "/products/07-peacock-bangles.webp",
    alt: "Pair of gold bangles with peacock motifs on a maroon backdrop",
  },
  {
    id: "ornate-earrings",
    title: "Ornate Jhumka Earrings",
    category: "Earrings",
    image: "/products/06-ornate-earrings.webp",
    alt: "Ornate gold jhumka earrings photographed on deep maroon velvet",
    tall: true,
  },
  {
    id: "classic-bangles",
    title: "Classic Gold Bangles",
    category: "Bangles",
    image: "/products/02-bangles.webp",
    alt: "Set of classic carved gold bangles stacked on a maroon surface",
  },
  {
    id: "pendant-necklace",
    title: "Pendant Necklace",
    category: "Necklaces",
    image: "/products/08-pendant-necklace.webp",
    alt: "Delicate gold pendant necklace displayed against maroon velvet",
  },
  {
    id: "stone-ring",
    title: "Statement Stone Ring",
    category: "Rings",
    image: "/products/09-square-stone-ring.webp",
    alt: "Gold ring with a square cut stone in a maroon presentation box",
  },
  {
    id: "jhumka-stand",
    title: "Heritage Jhumkas",
    category: "Earrings",
    image: "/products/04-jhumka-stand.webp",
    alt: "Traditional gold jhumka earrings hanging on a display stand",
  },
  {
    id: "jhumka-box",
    title: "Bridal Jhumkas",
    category: "Earrings",
    image: "/products/10-jhumka-box.webp",
    alt: "Bridal gold jhumka earrings presented in a maroon jewellery box",
  },
];

/* ── Reels (public/reels/) ──────────────────────────────────── */
export const reels = [
  {
    id: "reel-1",
    src: "/reels/reel-1.mp4",
    poster: "/reels/reel-1-poster.webp",
    label: "From our collection",
  },
  {
    id: "reel-2",
    src: "/reels/reel-2.mp4",
    poster: "/reels/reel-2-poster.webp",
    label: "Crafted to be worn",
  },
  {
    id: "reel-3",
    src: "/reels/reel-3.mp4",
    poster: "/reels/reel-3-poster.webp",
    label: "Moments in gold",
  },
];

/* ── Journey milestones ─────────────────────────────────────── */
export const milestones = [
  {
    year: "2008",
    title: "The First Store",
    text: "On 9 June 2008, Mr. Santosh Tiwari opened Baba Jewellers at Karanje Complex, Pune–Nagar Road, Shikrapur — with a simple vision: pure jewellery, honest pricing and personal service.",
  },
  {
    year: "2023",
    title: "A New Chapter",
    text: "On 22 October 2023, we began a proud new chapter at Baba Complex on the Shikrapur–Talegaon Dhamdhere Road — growing while staying true to the values we started with.",
  },
  {
    year: "Today",
    title: "Generations of Trust",
    text: "Families who visited us as newlyweds now bring their children. Every ornament we sell carries the same promise of purity, transparency and care.",
  },
];

/* ── FAQs (visible content; also used for FAQ schema) ───────── */
export const faqs = [
  {
    question: "Is all your gold jewellery BIS Hallmarked?",
    answer:
      "Yes. Every gold ornament at Baba Jewellers is 100% BIS Hallmarked, which certifies its purity and authenticity as per the Bureau of Indian Standards.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer easy returns within 15 days of purchase, as per our return policy. Visit either store with your ornament and invoice, and our team will assist you.",
  },
  {
    question: "Do you offer an exchange facility?",
    answer:
      "Yes. We provide a lifetime exchange facility on our jewellery, along with transparent valuation. Ask our team in-store for the details that apply to your ornament.",
  },
  {
    question: "How is your pricing calculated?",
    answer:
      "Our pricing is fully transparent — the day's gold rate, making charges and GST are shown clearly, with no hidden costs. You are welcome to ask for a complete breakup before you buy.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Cash, UPI, credit and debit cards, EMI and bank transfer — choose whatever is most convenient for you.",
  },
  {
    question: "What kind of jewellery do you keep?",
    answer:
      "An exclusive collection of gold and silver jewellery for weddings, festivals, daily wear and every special occasion — necklaces, chokers, earrings, jhumkas, bangles, rings and more.",
  },
  {
    question: "Where are your stores located?",
    answer:
      "We have two stores in Shikrapur, Pune: the original store at Shop No. 13, Karanje Complex, Pune–Nagar Road (since 2008), and our newer store at Baba Complex, Shikrapur–Talegaon Dhamdhere Road (since 2023). Both are open 8:30 AM to 9:00 PM, all days.",
  },
];

/* ── बाबा सुवर्ण एलीट योजना — savings scheme ─────────────────
   Figures are transcribed from the scheme poster. Do not compute the
   bonus from a rate: it is not a fixed percentage (12 months = 6.25% of
   the deposit, 30 months at ₹5,000 = 15%), so every row is stated. */

export type SavingsPlan = { amount: number; months: number; bonus: number };

export const savingsPlans: SavingsPlan[] = [
  { amount: 5000, months: 12, bonus: 3750 },
  { amount: 5000, months: 18, bonus: 8500 },
  { amount: 5000, months: 24, bonus: 15000 },
  { amount: 5000, months: 30, bonus: 22500 },
  { amount: 10000, months: 24, bonus: 30000 },
  { amount: 20000, months: 30, bonus: 90000 },
  { amount: 30000, months: 30, bonus: 135000 },
];

/** Monthly amounts, in poster order. */
export const savingsAmounts = [...new Set(savingsPlans.map((p) => p.amount))];

/** Durations available for a given monthly amount. */
export const monthsFor = (amount: number) =>
  savingsPlans.filter((p) => p.amount === amount).map((p) => p.months);

export const findPlan = (amount: number, months: number) =>
  savingsPlans.find((p) => p.amount === amount && p.months === months);

/** ₹1,20,000 — Indian grouping, no decimals. */
export const inr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

export const savingsScheme = {
  /** Eyebrow above the heading — the poster's own strapline. */
  name: "आजची बचत, उद्याचे सुवर्ण भविष्य",
  heading: "बाबा ज्वेलर्स एलीट योजना",
  intro:
    "मासिक रक्कम आणि कालावधी निवडा. तुमची एकूण बचत व अतिरिक्त लाभ लगेच पाहा.",
  disclaimer:
    "ही योजना फक्त सुवर्ण दागिने खरेदीसाठी लागू आहे. नियम व अटी लागू.",
  /** Pre-filled WhatsApp text. The number itself is site.whatsappNumber. */
  enquiryMessage:
    "नमस्कार बाबा ज्वेलर्स, मला बाबा ज्वेलर्स एलीट योजनेबद्दल अधिक माहिती हवी आहे.",
};

/* ── Occasions for the enquiry form ─────────────────────────── */
export const occasions = [
  "Wedding / Bridal",
  "Engagement",
  "Festival",
  "Gift",
  "Daily Wear",
  "Investment",
  "Other",
];
