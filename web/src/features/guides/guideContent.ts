import type { Language } from "../../i18n/dictionary";

export interface GuideSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideSource {
  label: string;
  url: string;
  note: string;
}

export interface GuideContent {
  eyebrow: string;
  title: string;
  lede: string;
  sections: GuideSection[];
  sourcesTitle: string;
  sourcesNote: string;
  sources: GuideSource[];
  disclaimer: string;
}

const cs: GuideContent = {
  eyebrow: "Průvodce pro začátečníka",
  title: "Jak začít: opakování, úsilí a posun vpřed",
  lede: "Než si vybereš program, potřebuješ vědět tři věci: jak těžkou váhu vzít, jak blízko k selhání cvičit a kdy přidat. Tady je krátký průvodce, který stojí na čtyřech studiích a žádných zázracích.",
  sections: [
    {
      title: "Kolik opakování má smysl",
      paragraphs: [
        "Svaly rostou v širokém rozmezí. Metaanalýza 21 studií porovnala lehké váhy do 60 % maxima s těžkými nad 60 % a u obou skupin našla podobný nárůst svalů, když se série dotáhly k selhání. Síla ale rostla víc s těžkými vahami.",
        "V praxi to znamená, že velké cviky dělej většinou v 6 až 12 opakováních, izolaci v 10 až 20 a vlastní váhu klidně ve vyšších počtech. Rozhoduje úsilí, ne magické číslo.",
        "Nemusíš každou sérii dojet do selhání. Přehled 15 studií nenašel rozdíl v růstu mezi sériemi do selhání a sériemi, které skončily pár opakování před ním. Selhání vynechávej hlavně u velkých cviků a nech si 1 až 3 opakování v záloze.",
        "Poznáš to podle tempa. Poslední opakování se výrazně zpomalí a další už bys nedal s čistou technikou. Když bys zvládl ještě deset, série byla lehká.",
      ],
    },
    {
      title: "Jak přidávat váhu nebo opakování",
      paragraphs: [
        "Progresivní přetížení znamená, že postupem času děláš víc práce. Nemusí to být jen váha. Osmitýdenní studie porovnala přidávání váhy a přidávání opakování u stejné váhy. Obojí vedlo k růstu svalů i síly a rozdíly byly malé.",
        "Začni tam, kde udržíš techniku. Když zvládneš horní hranici rozmezí ve všech sériích s 1 až 2 opakováními v záloze, přidej příště 2,5 kg na horní tělo nebo 5 kg na dolní. Když se technika rozpadne, zůstaň na váze a přidej opakování.",
        "Objem se počítá. Studie u trénovaných mužů ukázala, že víc sérií na sval přineslo víc růstu v průběhu osmi týdnů. Deset až dvacet tvrdých sérií na sval za týden je rozumný začátek. Víc není automaticky lepší, když nestíháš regenerovat.",
        "Zapisuj si série. Aplikace ti ukáže objem, odhad maxima a počet sérií na sval za týden. Čísla jsou nástroj, ne cíl.",
      ],
    },
    {
      title: "Co s tím dělat první měsíc",
      paragraphs: [
        "Vyber čtyři až šest cviků, které pokryjí tlak, tah, dřep a předklon. U každého dělej 2 až 4 série.",
        "První dva týdny nech 2 až 3 opakování v záloze a uč se techniku. Třetí a čtvrtý týden přidej sérii nebo malou váhu, jen když technika drží.",
        "Když se váha zastaví na tři tréninky, nepanikař. Zkontroluj spánek, jídlo a počet sérií. Někdy je potřeba ubrat, ne přidat.",
      ],
    },
  ],
  sourcesTitle: "Zdroje",
  sourcesNote: "Každé tvrzení výše vychází z těchto prací. Odkazy vedly na DOI v době psaní stránky.",
  sources: [
    {
      label: "Schoenfeld a kol., 2017, Journal of Strength and Conditioning Research",
      url: "https://doi.org/10.1519/JSC.0000000000002200",
      note: "Metaanalýza 21 studií: podobná hypertrofie u lehkých a těžkých vah, větší síla u těžkých.",
    },
    {
      label: "Refalo a kol., 2023, Sports Medicine",
      url: "https://doi.org/10.1007/s40279-022-01784-y",
      note: "Přehled 15 studií: trénink do selhání nemá výhodu pro růst oproti sériím s rezervou.",
    },
    {
      label: "Plotkin a kol., 2022, PeerJ",
      url: "https://doi.org/10.7717/peerj.14142",
      note: "Osm týdnů: přidávání váhy i opakování vedlo k podobnému růstu a síle.",
    },
    {
      label: "Schoenfeld a kol., 2019, Medicine & Science in Sports & Exercise",
      url: "https://doi.org/10.1249/MSS.0000000000001764",
      note: "Osm týdnů u trénovaných mužů: víc sérií přineslo víc hypertrofie, síla byla podobná.",
    },
  ],
  disclaimer:
    "Tohle je obecný začáteční rámec, ne lékařská rada. Když máš zranění nebo bolest, která neustupuje, řeš to s odborníkem.",
};

const en: GuideContent = {
  eyebrow: "Beginner guide",
  title: "How to start: reps, effort and moving forward",
  lede: "Before you pick a program, you need three things: how heavy to go, how close to failure to train, and when to add. This is a short guide built on four studies and no miracles.",
  sections: [
    {
      title: "How many reps make sense",
      paragraphs: [
        "Muscle grows across a wide rep range. A meta-analysis of 21 studies compared light loads at or below 60% of max with heavy loads above 60%. Both produced similar muscle growth when sets went to failure. Strength grew more with the heavy loads.",
        "In practice, do big lifts mostly in the 6 to 12 range, isolation work in the 10 to 20 range, and bodyweight movements at whatever rep count keeps the set hard. Effort decides, not a magic number.",
        "You do not have to take every set to failure. A review of 15 studies found no growth difference between sets taken to failure and sets stopped a few reps short. Leave failure out of the big lifts especially, and keep 1 to 3 reps in reserve.",
        "You can tell by the speed. The last rep slows down clearly, and another one would break form. If you could do ten more, the set was light.",
      ],
    },
    {
      title: "How to add weight or reps",
      paragraphs: [
        "Progressive overload means doing more work over time. It does not have to be more weight. An eight-week study compared adding load with adding reps at the same load. Both built muscle and strength, and the differences were small.",
        "Start where you can keep form. When you hit the top of the rep range on every set with 1 to 2 reps in reserve, add 2.5 kg for the upper body or 5 kg for the lower body next time. If form breaks, stay at the same weight and add reps.",
        "Volume counts. A study in trained men found that more sets per muscle produced more growth over eight weeks. Ten to twenty hard sets per muscle per week is a reasonable starting point. More is not automatically better when recovery cannot keep up.",
        "Log your sets. The app shows volume, estimated max and weekly sets per muscle. The numbers are a tool, not the goal.",
      ],
    },
    {
      title: "What to do in the first month",
      paragraphs: [
        "Pick four to six movements that cover a press, a pull, a squat and a hinge. Do 2 to 4 sets of each.",
        "For the first two weeks, keep 2 to 3 reps in reserve and learn the technique. In weeks three and four, add a set or a small amount of weight only when form holds.",
        "If the weight stalls for three sessions, do not panic. Check sleep, food and set count. Sometimes the answer is to do less, not more.",
      ],
    },
  ],
  sourcesTitle: "Sources",
  sourcesNote: "Every claim above comes from these papers. The links resolved to the DOI when this page was written.",
  sources: [
    {
      label: "Schoenfeld et al., 2017, Journal of Strength and Conditioning Research",
      url: "https://doi.org/10.1519/JSC.0000000000002200",
      note: "Meta-analysis of 21 studies: similar hypertrophy with light and heavy loads, more strength with heavy loads.",
    },
    {
      label: "Refalo et al., 2023, Sports Medicine",
      url: "https://doi.org/10.1007/s40279-022-01784-y",
      note: "Review of 15 studies: training to failure has no growth advantage over sets with reps in reserve.",
    },
    {
      label: "Plotkin et al., 2022, PeerJ",
      url: "https://doi.org/10.7717/peerj.14142",
      note: "Eight weeks: adding load and adding reps produced similar growth and strength.",
    },
    {
      label: "Schoenfeld et al., 2019, Medicine & Science in Sports & Exercise",
      url: "https://doi.org/10.1249/MSS.0000000000001764",
      note: "Eight weeks in trained men: more sets produced more hypertrophy, strength was similar.",
    },
  ],
  disclaimer:
    "This is a general beginner framework, not medical advice. If you have an injury or pain that does not settle, talk to a professional.",
};

export const guideContent: Record<Language, GuideContent> = { cs, en };
