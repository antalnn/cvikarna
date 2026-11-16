import type { Language } from "../../i18n/dictionary";

export type GuideDiagram = "reps" | "protein" | "calories" | "sleep" | "recovery";

export interface GuideSource {
  label: string;
  url: string;
  /** The claim in this section that the paper backs, in one sentence. */
  supports: string;
}

export interface GuideSection {
  id: "training" | "protein" | "calories" | "sleep" | "recovery";
  title: string;
  lede: string;
  paragraphs: string[];
  bullets?: string[];
  takeaways: string[];
  diagram?: GuideDiagram;
  diagramCaption?: string;
  sources: GuideSource[];
}

export interface GuideContent {
  eyebrow: string;
  title: string;
  lede: string;
  sourcesLabel: string;
  takeawaysLabel: string;
  disclaimer: string;
  sections: GuideSection[];
}

const cs: GuideContent = {
  eyebrow: "Průvodce pro začátečníka",
  title: "Pět věcí, které rozhodují o tvém tréninku",
  lede: "Trénink, protein, kalorie, spánek a regenerace. Žádná z nich tě neposune sama. Dohromady rozhodují, jestli se za tři měsíce posuneš ty, nebo jen čísla v deníku.",
  sourcesLabel: "Zdroje k této části",
  takeawaysLabel: "Klíčové body",
  disclaimer:
    "Tohle je obecný začáteční rámec, ne lékařská rada. Když máš zranění, bolest, která neustupuje, nebo diagnózu, která se týká jídla či spánku, řeš to s odborníkem.",
  sections: [
    {
      id: "training",
      title: "Trénink: kolik, jak těžko a kdy přidat",
      lede: "Rozhoduje úsilí a postupnost, ne magický počet opakování.",
      takeaways: [
        "Velké cviky 6 až 12 opakování, izolace 10 až 20. Růst se děje v obou pásmech, když je série tvrdá.",
        "1 až 3 opakování v záloze stačí. Selhání není podmínkou růstu.",
      ],
      paragraphs: [
        "Svaly rostou v širokém rozmezí opakování. Metaanalýza **21 studií** porovnala lehké váhy **do 60 % maxima** s těžkými **nad 60 %**. Když se série dotáhly k selhání, byl růst svalů podobný. Síla ale rostla víc s těžkými vahami.",
        "V praxi to znamená: velké cviky dělej většinou v **6 až 12 opakováních**, izolaci v **10 až 20** a vlastní váhu klidně ve vyšších počtech. Rozhoduje úsilí, ne číslo na papíře.",
        "Nemusíš každou sérii dojet do selhání. Přehled **15 studií** nenašel rozdíl v růstu mezi sériemi do selhání a sériemi, které skončily pár opakování před ním. U velkých cviků nechávej **1 až 3 opakování v záloze**.",
        "Progresivní přetížení neznamená jen víc váhy. Osmitýdenní studie porovnala přidávání váhy a přidávání opakování u stejné váhy. Obojí vedlo k růstu svalů i síly a rozdíly byly malé. Vyber si cestu, kterou udržíš.",
        "Objem se počítá. Studie u trénovaných mužů ukázala, že víc sérií na sval přineslo víc růstu. **Deset až dvacet** tvrdých sérií na sval za týden je rozumný začátek, ne zákon. Víc není lepší, když nestíháš regenerovat.",
      ],
      bullets: [
        "Začni tam, kde udržíš techniku, ne tam, kde chceš být za měsíc.",
        "Když zvládneš horní hranici rozmezí ve všech sériích s **1 až 2 opakováními v záloze**, přidej příště **2,5 kg** na horní tělo nebo **5 kg** na dolní.",
        "Když se technika rozpadne, zůstaň na váze a přidej opakování. Až se technika vrátí, přidej váhu.",
      ],
      diagram: "reps",
      diagramCaption:
        "Rozsahy opakování, které v praxi pokryjí většinu práce. Hranice nejsou ostré a překrývají se.",
      sources: [
        {
          label: "Schoenfeld a kol., 2017, Journal of Strength and Conditioning Research",
          url: "https://doi.org/10.1519/JSC.0000000000002200",
          supports:
            "Podobný růst svalů u lehkých a těžkých vah, větší síla u těžkých vah, když se série dotáhnou k selhání.",
        },
        {
          label: "Refalo a kol., 2023, Sports Medicine",
          url: "https://doi.org/10.1007/s40279-022-01784-y",
          supports:
            "Žádná výhoda tréninku do selhání pro růst svalů oproti sériím s rezervou.",
        },
        {
          label: "Plotkin a kol., 2022, PeerJ",
          url: "https://doi.org/10.7717/peerj.14142",
          supports:
            "Přidávání váhy i přidávání opakování vedlo po osmi týdnech k podobnému růstu a síle.",
        },
        {
          label: "Schoenfeld a kol., 2019, Medicine & Science in Sports & Exercise",
          url: "https://doi.org/10.1249/MSS.0000000000001764",
          supports:
            "Víc sérií na sval přineslo víc hypertrofie u trénovaných mužů, síla byla podobná.",
        },
      ],
    },
    {
      id: "protein",
      title: "Protein: kolik ho potřebuješ a kde je strop",
      lede: "Přínos roste, dokud se křivka nezploští. Pak už jen platíš za dražší moč.",
      takeaways: [
        "Kolem 1,6 g/kg denně se přínos zplošťuje. Pásmo do 2,2 g/kg je bezpečné.",
        "Jídlo stačí. Prášek není lepší, jen pohodlnější.",
      ],
      paragraphs: [
        "Protein je stavební materiál. Metanalýza 49 studií zjistila, že doplněk bílkovin zvyšuje růst svalů i síly při silovém tréninku. Přínos ale neroste donekonečna.",
        "Křivka se zplošťuje kolem **1,6 g** na kilogram tělesné hmotnosti denně. Interval spolehlivosti sahal do **2,2 g**, takže bezpečné pásmo je zhruba mezi tím. Pro osmdesátikilového člověka to je přibližně **130 až 175 g** denně.",
        "Zbytek je jídlo, ne prášek. Kuře, ryby, vejce, mléčné výrobky, luštěniny a tofu fungují stejně dobře, když sečteš celkový příjem za den.",
        "Co studie neukazují: že by víc proteinu poškozovalo ledviny zdravého člověka, že by rozhodovalo načasování kolem tréninku, nebo že by prášek byl lepší než jídlo.",
        "Metanalýza zahrnula **49 randomizovaných studií** s 1863 lidmi a s tréninkem dlouhým aspoň šest týdnů. Proto se čísla dají brát vážněji než výsledek jednoho pokusu.",
        "Dva detaily z té samé práce: u starších lidí byl přínos doplňku menší, u lidí, kteří už trénovali, větší. Věk ani zkušenost ale nemění základ, kterým je celkový denní příjem a tvrdý trénink.",
      ],
      bullets: [
        "**1,6 g/kg** je bod, kde se křivka láme. **2,2 g/kg** je horní hranice odhadu, ne cíl.",
        "Pro 80 kg to je přibližně **130 až 175 g** denně, rozložených do běžných jídel.",
        "Trénovaní lidé měli z vyššího příjmu větší užitek. Začátečník neudělá chybu, když začne na 1,6 g/kg.",
      ],
      diagram: "protein",
      diagramCaption:
        "Přibližný tvar dávkové křivky. Přesná čísla se mezi lidmi liší a pásmo je širší než jeden bod.",
      sources: [
        {
          label: "Morton a kol., 2018, British Journal of Sports Medicine",
          url: "https://doi.org/10.1136/bjsports-2017-097608",
          supports:
            "Doplněk bílkovin zvyšuje růst svalů a síly; 49 studií a 1863 lidí; přínos se zplošťuje kolem 1,6 g/kg denně, horní hranice intervalu 2,2 g/kg, menší u starších a větší u trénovaných.",
        },
      ],
    },
    {
      id: "calories",
      title: "Kalorie: malý přebytek stačí",
      lede: "Svaly potřebují energii, ne tisícikalorický surplus.",
      takeaways: [
        "Velký přebytek není nutný. Malý přebytek nebo údržba často stačí.",
        "0,25 až 0,5 % tělesné hmotnosti za měsíc je rozumné tempo.",
      ],
      paragraphs: [
        "Růst svalů není zdarma, ale nepotřebuje gigantický přebytek. Přehled studií došel k tomu, že velký kalorický přebytek není pro hypertrofii nutný. Často stačí údržba nebo malý přebytek, zvlášť u začátečníků.",
        "Když dlouhodobě jíš málo, tělo nemá z čeho stavět a regenerace se zpomalí. Když jíš výrazně víc, než vydáš, přebytek se ukládá jako tuk a růst svalů to nezrychlí.",
        "Praktické pravidlo pro začátek: jez tolik, aby váha šla pomalu nahoru, zhruba o **0,25 až 0,5 %** tělesné hmotnosti za měsíc. Když tři týdny stojíš a trénink drží, přidej **200 až 300 kcal** denně.",
        "Kalorie nejsou morálka. Jsou to čísla, která se dají měřit, upravovat a zahodit, když přestanou dávat smysl.",
        "Přesnou velikost přebytku nikdo nezměřil. Přehled z roku 2019 říká, že žádná studie ji neověřila u lidí, kteří posilují, a doporučení vycházejí z odhadu, kolik energie si nový sval vezme.",
        "Proto se přebytek nastavuje podle výsledku, ne podle tabulky: dva až tři týdny stejného příjmu, pak váha a obvod pasu, a podle toho přidat nebo ubrat.",
      ],
      bullets: [
        "Při 80 kg je **0,25 až 0,5 %** hmotnosti za měsíc zhruba **200 až 400 g**.",
        "Když váha tři týdny stojí a trénink drží, přidej **200 až 300 kcal** denně.",
        "Vydatné jídlo se dodržuje líp než tekuté kalorie. Sytost je součást plánu, ne detail.",
      ],
      diagram: "calories",
      diagramCaption:
        "Přibližný tvar, ne měření. Malý přebytek stačí na růst; velký už jen přidává tuk.",
      sources: [
        {
          label: "Slater a kol., 2019, Frontiers in Nutrition",
          url: "https://doi.org/10.3389/fnut.2019.00131",
          supports:
            "Kalorický přebytek není podmínkou růstu svalů; velký přebytek nepřináší úměrně víc růstu; velikost přebytku není u posilujících ověřená a rozhoduje i sytost.",
        },
      ],
    },
    {
      id: "sleep",
      title: "Spánek: sedm až devět hodin jako základ",
      lede: "Špatný spánek se projeví dřív ve výkonu než v zrcadle.",
      takeaways: [
        "Dospělí potřebují 7 až 9 hodin. Pod šest hodin klesá výkon.",
        "Pravidelný čas a tma pomáhají víc než dohánění před tréninkem.",
      ],
      paragraphs: [
        "Nedostatek spánku se projeví dřív ve výkonu než ve svalovém růstu. Metaanalýza ukázala, že akutní ztráta spánku zhoršuje fyzický výkon; u silového výkonu byl efekt **menší než u vytrvalosti**, ale nebyl nulový.",
        "Dlouhodobě krátký spánek je spojený s nižší svalovou silou a pomalejší regenerací. Přesný mechanismus není dořešený a žádná studie nedokáže říct, kolik hodin potřebuješ právě ty.",
        "Národní spánková nadace doporučuje dospělým ve věku 18 až 64 let **7 až 9 hodin**. Není to univerzální recept, ale rozumné pásmo, od kterého se dá odečítat.",
        "Co pomáhá: pravidelný čas, tma, chladno a žádný kofein po obědě. Co nepomáhá: dohánět celý týden v jedné noci.",
        "Rozdíl je v tom, jak spánek ztratíš. Jedna probdělá noc sílu příliš nesníží, ale několik zkrácených nocí po sobě sníží výkon ve složených cvicích, jako je dřep nebo mrtvý tah.",
        "Metaanalýza **69 studií** a 227 měření našla průměrný pokles výkonu o **7,6 %**. Nejvíc škodila úplná deprivace a pozdní usínání a každá hodina bdění navíc před tréninkem ubrala zhruba **0,4 %**.",
      ],
      bullets: [
        "Po špatné noci jdi trénovat ráno, ne večer. Ranní výkon zůstal téměř nedotčený.",
        "Chronické zkracování škodí víc než jedna špatná noc.",
        "Kofein a parta pomůžou výkon dohnat. Spánek nenahradí.",
      ],
      diagram: "sleep",
      diagramCaption:
        "Doporučené pásmo pro dospělé. Pod ním se výkon a regenerace zhoršují; nad ním se další přínos neprokázal.",
      sources: [
        {
          label: "Hirshkowitz a kol., 2015, Sleep Health",
          url: "https://doi.org/10.1016/j.sleh.2014.12.010",
          supports: "Doporučení 7 až 9 hodin spánku denně pro dospělé ve věku 18 až 64 let.",
        },
        {
          label: "Craven a kol., 2022, Sports Medicine",
          url: "https://doi.org/10.1007/s40279-022-01706-y",
          supports:
            "Akutní ztráta spánku zhoršuje fyzický výkon; efekt je menší u silových než u vytrvalostních testů; 69 studií, průměrný pokles 7,6 %; nejvíc škodí deprivace a pozdní usnutí, 0,4 % za hodinu bdění, ranní výkon zůstává téměř nedotčený.",
        },
        {
          label: "Knowles a kol., 2018, Journal of Science and Medicine in Sport",
          url: "https://doi.org/10.1016/j.jsams.2018.01.012",
          supports:
            "Nedostatečný spánek je spojený s nižší svalovou silou; jedna probdělá noc sílu příliš nesníží, víc zkrácených nocí sníží výkon ve složených cvicích; příčinný vztah není prokázaný.",
        },
      ],
    },
    {
      id: "recovery",
      title: "Regenerace: odpočinek je součást tréninku",
      lede: "Když ji škrtíš pořád, dřív nebo později klesne i to, co šlo dobře.",
      takeaways: [
        "Tvrdý a lehký den střídej. Dva tvrdé dny na stejnou část těla nedělej.",
        "Když výkon klesne o deset procent na tři tréninky, uber.",
      ],
      paragraphs: [
        "Regenerace není jen pocit. Je to doba, kterou svaly a nervová soustava potřebují, aby se přizpůsobily zátěži. Když ji zkracuješ každý týden, výkon začne klesat a technika se rozpadne dřív než svaly.",
        "Přetrénování je diagnóza, ne nálada. Konsenzus odborných společností ho popisuje jako stav z dlouhodobého přetížení a nedostatečné regenerace, který se nedá vyřešit jedním volným dnem.",
        "Prakticky: **střídej tvrdé a lehké dny**. Po těžkém tréninku nohou neplánuj druhý těžký den. Spánek a jídlo řeš dřív než doplňky. Bolest, která neustupuje, patří odborníkovi.",
        "Co studie neříkají: že existuje jedna správná délka regenerace pro každého, nebo že konkrétní doplněk prokazatelně zkracuje regeneraci.",
        "Sportovní medicína rozlišuje tři stupně: funkční přetížení, ze kterého se po několika dnech vrátíš silnější; nefunkční přetížení, kdy výkon klesá týdny; a syndrom přetrénování, tedy dlouhodobé špatné přizpůsobení.",
        "Syndrom se pozná vylučováním. Nejdřív se musí vyloučit nemoc, málo jídla, málo sacharidů nebo bílkovin, nedostatek železa či hořčíku a alergie. Žádný krevní marker ho sám nepotvrdí.",
      ],
      bullets: [
        "Tvrdý den, lehký den. Ne dva tvrdé dny po sobě na stejnou část těla.",
        "Když se výkon propadne o víc než **deset procent** na tři tréninky, uber sérii nebo váhu.",
        "Když se přidá bolest kloubu nebo nespecifická únava, řeš to dřív, než se to zhorší.",
        "Když se výkon nevrátí po dvou lehkých týdnech, řeš to s lékařem, ne dalším tréninkem.",
      ],
      diagram: "recovery",
      diagramCaption:
        "Jedna svalová skupina se po tvrdém tréninku vrací zhruba dva dny. Lehké dny ji nezastaví.",
      sources: [
        {
          label: "Meeusen a kol., 2013, Medicine & Science in Sports & Exercise",
          url: "https://doi.org/10.1249/MSS.0b013e318279a10a",
          supports:
            "Přetrénování vzniká z dlouhodobého přetížení a nedostatečné regenerace; rozlišuje funkční a nefunkční přetížení a syndrom přetrénování a diagnostikuje se vylučováním.",
        },
        {
          label: "Kreher a Schwartz, 2012, Sports Health",
          url: "https://doi.org/10.1177/1941738111434406",
          supports:
            "Praktický postup u přetrénování: odpočinek, jídlo, spánek a postupný návrat k zátěži.",
        },
      ],
    },
  ],
};

const en: GuideContent = {
  eyebrow: "Beginner guide",
  title: "Five things that decide your training",
  lede: "Training, protein, calories, sleep and recovery. None of them moves you on its own. Together they decide whether you or just the numbers in your log move forward in three months.",
  sourcesLabel: "Sources for this section",
  takeawaysLabel: "Key points",
  disclaimer:
    "This is a general beginner framework, not medical advice. If you have an injury, pain that does not settle, or a condition that affects eating or sleep, talk to a professional.",
  sections: [
    {
      id: "training",
      title: "Training: how much, how heavy, when to add",
      lede: "Effort and progression decide, not a magic rep count.",
      takeaways: [
        "Big lifts 6 to 12 reps, isolation 10 to 20. Growth happens in both bands when the set is hard.",
        "1 to 3 reps in reserve is enough. Failure is not required for growth.",
      ],
      paragraphs: [
        "Muscle grows across a wide rep range. A meta-analysis of **21 studies** compared light loads **at or below 60% of max** with heavy loads **above 60%**. When sets went to failure, muscle growth was similar. Strength grew more with the heavy loads.",
        "In practice: do big lifts mostly in the **6 to 12 range**, isolation work in the **10 to 20 range**, and bodyweight movements at whatever count keeps the set hard. Effort decides, not the number on the page.",
        "You do not have to take every set to failure. A review of **15 studies** found no growth difference between sets taken to failure and sets stopped a few reps short. On big lifts, keep **1 to 3 reps in reserve**.",
        "Progressive overload is not only more weight. An eight-week study compared adding load with adding reps at the same load. Both built muscle and strength, and the differences were small. Pick the path you can keep.",
        "Volume counts. A study in trained men found that more sets per muscle produced more growth. **Ten to twenty** hard sets per muscle per week is a reasonable start, not a law. More is not better when recovery cannot keep up.",
      ],
      bullets: [
        "Start where you can hold form, not where you want to be in a month.",
        "When you hit the top of the rep range on every set with **1 to 2 reps in reserve**, add **2.5 kg** for the upper body or **5 kg** for the lower body next time.",
        "If form breaks, stay at the same weight and add reps. Add weight when form returns.",
      ],
      diagram: "reps",
      diagramCaption:
        "Rep ranges that cover most of the work in practice. The borders are not sharp and they overlap.",
      sources: [
        {
          label: "Schoenfeld et al., 2017, Journal of Strength and Conditioning Research",
          url: "https://doi.org/10.1519/JSC.0000000000002200",
          supports:
            "Similar muscle growth with light and heavy loads, more strength with heavy loads when sets go to failure.",
        },
        {
          label: "Refalo et al., 2023, Sports Medicine",
          url: "https://doi.org/10.1007/s40279-022-01784-y",
          supports: "No hypertrophy advantage for training to failure over stopping with reps in reserve.",
        },
        {
          label: "Plotkin et al., 2022, PeerJ",
          url: "https://doi.org/10.7717/peerj.14142",
          supports:
            "Adding load and adding reps produced similar growth and strength after eight weeks.",
        },
        {
          label: "Schoenfeld et al., 2019, Medicine & Science in Sports & Exercise",
          url: "https://doi.org/10.1249/MSS.0000000000001764",
          supports:
            "More sets per muscle produced more hypertrophy in trained men; strength was similar.",
        },
      ],
    },
    {
      id: "protein",
      title: "Protein: how much you need and where the ceiling is",
      lede: "The benefit rises until the curve flattens. After that you pay for expensive urine.",
      takeaways: [
        "Around 1.6 g/kg per day the benefit flattens. Up to 2.2 g/kg is the safe band.",
        "Food is enough. Powder is not better, only more convenient.",
      ],
      paragraphs: [
        "Protein is building material. A meta-analysis of 49 studies found that protein supplementation increases muscle and strength gains during resistance training. The benefit does not grow forever.",
        "The curve flattens around **1.6 g** per kilogram of bodyweight per day. The confidence interval reached **2.2 g**, so the safe band sits roughly between them. For an 80 kg person that is about **130 to 175 g** per day.",
        "The rest is food, not powder. Chicken, fish, eggs, dairy, legumes and tofu work just as well once you add up the daily total.",
        "What the studies do not show: that more protein harms healthy kidneys, that timing around training decides the result, or that powder beats food.",
        "The meta-analysis pooled **49 randomised trials** with 1863 people and at least six weeks of training, so its numbers carry more weight than one study.",
        "Two details from the same paper: the supplement helped older people less and people who already trained more. Age and experience do not change the base, which is total daily intake and hard training.",
      ],
      bullets: [
        "**1.6 g/kg** is where the curve breaks. **2.2 g/kg** is the top of the estimate, not a target.",
        "For 80 kg that is roughly **130 to 175 g** a day, spread across normal meals.",
        "Trained people got more from a higher intake. A beginner does no harm starting at 1.6 g/kg.",
      ],
      diagram: "protein",
      diagramCaption:
        "The rough shape of the dose curve. Exact numbers differ between people, and the band is wider than one point.",
      sources: [
        {
          label: "Morton et al., 2018, British Journal of Sports Medicine",
          url: "https://doi.org/10.1136/bjsports-2017-097608",
          supports:
            "Protein supplementation increases muscle and strength gains; 49 trials and 1863 people; the benefit plateaus around 1.6 g/kg per day, with an upper interval bound of 2.2 g/kg, smaller in older people and larger in trained ones.",
        },
      ],
    },
    {
      id: "calories",
      title: "Calories: a small surplus is enough",
      lede: "Muscles need energy, not a thousand-calorie surplus.",
      takeaways: [
        "A big surplus is not required. A small surplus or maintenance is often enough.",
        "0.25 to 0.5% of bodyweight per month is a sensible rate.",
      ],
      paragraphs: [
        "Muscle growth is not free, but it does not need a huge surplus. A review found that a large energy surplus is not required for hypertrophy. Maintenance or a small surplus is often enough, especially for beginners.",
        "If you eat too little for a long time, the body has nothing to build with and recovery slows. If you eat far more than you burn, the extra is stored as fat and does not speed muscle growth.",
        "A practical starting rule: eat enough for weight to drift up slowly, about **0.25 to 0.5%** of bodyweight per month. If weight is flat for three weeks while training holds, add **200 to 300 kcal** per day.",
        "Calories are not morality. They are numbers you can measure, adjust, and drop when they stop making sense.",
        "Nobody has measured the exact size of the surplus. The 2019 review says no study has validated one in people who lift, and recommendations come from estimates of the energy a new muscle costs.",
        "So set the surplus from the result, not from a table: two or three weeks at the same intake, then weight and waist, then add or cut.",
      ],
      bullets: [
        "At 80 kg, **0.25 to 0.5%** of bodyweight a month is about **200 to 400 g**.",
        "If weight is flat for three weeks while training holds, add **200 to 300 kcal** a day.",
        "Filling food is easier to keep than liquid calories. Satiety is part of the plan, not a detail.",
      ],
      diagram: "calories",
      diagramCaption:
        "The shape, not a measurement. A small surplus is enough for growth; a large one only adds fat.",
      sources: [
        {
          label: "Slater et al., 2019, Frontiers in Nutrition",
          url: "https://doi.org/10.3389/fnut.2019.00131",
          supports:
            "An energy surplus is not a prerequisite for muscle growth; a large surplus does not produce proportionally more growth; the size of the surplus is not validated in people who lift, and satiety matters.",
        },
      ],
    },
    {
      id: "sleep",
      title: "Sleep: seven to nine hours as the base",
      lede: "Bad sleep shows up in performance before it shows up in the mirror.",
      takeaways: [
        "Adults need 7 to 9 hours. Under six hours, performance drops.",
        "A regular schedule and a dark room help more than catching up before training.",
      ],
      paragraphs: [
        "Sleep loss shows up in performance before it shows up in muscle growth. A meta-analysis found that acute sleep loss impairs physical performance; the effect was **smaller for strength than for endurance**, but it was not zero.",
        "Chronically short sleep is associated with lower muscle strength and slower recovery. The exact mechanism is unresolved, and no study can tell you how many hours you personally need.",
        "The National Sleep Foundation recommends **7 to 9 hours** for adults aged 18 to 64. It is not a universal prescription, but it is a sensible band to work from.",
        "What helps: a regular time, darkness, a cool room and no caffeine after lunch. What does not: repaying a whole week in one night.",
        "The difference is how you lose the sleep. One night without it barely touches strength, but several shortened nights in a row cut force output in compound lifts such as the squat or the deadlift.",
        "A meta-analysis of **69 studies** and 227 measures found an average **7.6%** drop in performance. Full deprivation and late bedtimes hurt most, and every extra hour awake before training cost about **0.4%**.",
      ],
      bullets: [
        "After a poor night, train in the morning, not the evening. Morning performance stayed almost untouched.",
        "Chronic short sleep costs more than one bad night.",
        "Caffeine and a training partner help you make up the performance. They do not replace sleep.",
      ],
      diagram: "sleep",
      diagramCaption:
        "The recommended band for adults. Below it, performance and recovery suffer; above it, no further benefit has been shown.",
      sources: [
        {
          label: "Hirshkowitz et al., 2015, Sleep Health",
          url: "https://doi.org/10.1016/j.sleh.2014.12.010",
          supports: "A recommendation of 7 to 9 hours of sleep per day for adults aged 18 to 64.",
        },
        {
          label: "Craven et al., 2022, Sports Medicine",
          url: "https://doi.org/10.1007/s40279-022-01706-y",
          supports:
            "Acute sleep loss impairs physical performance; the effect is smaller in strength than in endurance tests; 69 studies, a 7.6% average drop; deprivation and late bedtimes hurt most, 0.4% per hour awake, and morning performance stays almost untouched.",
        },
        {
          label: "Knowles et al., 2018, Journal of Science and Medicine in Sport",
          url: "https://doi.org/10.1016/j.jsams.2018.01.012",
          supports:
            "Inadequate sleep is associated with lower muscle strength; one night without sleep barely touches strength, while several shortened nights cut force output in compound lifts; a causal link has not been proven.",
        },
      ],
    },
    {
      id: "recovery",
      title: "Recovery: rest is part of training",
      lede: "Keep cutting it and the thing that was working stops working.",
      takeaways: [
        "Alternate hard and easy days. Do not run two hard days for the same body part.",
        "If performance drops ten percent for three sessions, cut back.",
      ],
      paragraphs: [
        "Recovery is not just a feeling. It is the time muscles and the nervous system need to adapt to the load. Cut it every week and performance drops, while technique breaks before the muscles do.",
        "Overtraining is a diagnosis, not a mood. A consensus statement describes it as a state caused by long-term overload and inadequate recovery that one day off cannot fix.",
        "In practice: **alternate hard and easy days**. Do not plan a second heavy leg day right after the first. Fix sleep and food before supplements. Pain that does not settle belongs to a professional.",
        "What the studies do not say: that one recovery length fits everyone, or that a specific supplement reliably shortens recovery.",
        "Sports medicine separates three levels: functional overreaching, where a few days of weaker performance lead back to a stronger one; non-functional overreaching, where performance falls for weeks; and overtraining syndrome, a long maladaptation.",
        "The syndrome is diagnosed by exclusion. First rule out illness, too little food, too few carbohydrates or protein, low iron or magnesium, and allergies. No blood marker confirms it on its own.",
      ],
      bullets: [
        "Hard day, easy day. Not two hard days in a row for the same body part.",
        "If performance drops by more than **ten percent** for three sessions, cut a set or the weight.",
        "If joint pain or unexplained fatigue appears, deal with it before it gets worse.",
        "If performance is still down after two easy weeks, take it to a doctor, not to another session.",
      ],
      diagram: "recovery",
      diagramCaption:
        "One muscle group takes about two days after a hard session. Easy days do not stop it.",
      sources: [
        {
          label: "Meeusen et al., 2013, Medicine & Science in Sports & Exercise",
          url: "https://doi.org/10.1249/MSS.0b013e318279a10a",
          supports:
            "Overtraining arises from long-term overload and inadequate recovery; the consensus separates functional and non-functional overreaching from overtraining syndrome and diagnoses it by exclusion.",
        },
        {
          label: "Kreher and Schwartz, 2012, Sports Health",
          url: "https://doi.org/10.1177/1941738111434406",
          supports:
            "A practical approach to overtraining: rest, food, sleep and a gradual return to training.",
        },
      ],
    },
  ],
};

export const guideContent: Record<Language, GuideContent> = { cs, en };
