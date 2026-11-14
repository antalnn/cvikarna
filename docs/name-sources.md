# Czech exercise names and their sources

Every Czech name in `api/Seed/exercises.json` is checked against a Czech gym source before it is used. Nothing here is a literal translation invented for the app.

## How the check was done

- The page behind each URL was fetched on 2026-11-13 and the Czech name below had to appear in the page text as the exercise's own name, not in passing.
- Sources: FitCviky.cz (a Czech exercise library with a page per movement), cviky.cz (Czech exercise encyclopedia), IronYou (Czech exercise database).
- The page title is quoted so the row can be re-checked without guessing what the page said.
- Where the Czech gym community uses the English term (leg press, hip thrust, face pull, plank, Pallof press), `nameCs` keeps the English term and the descriptive Czech variant sits in `aliasesCs`. That is the rule from the plan, not an oversight.

## Rows

| # | English name | Czech name | Page title at the source | URL |
|---|---|---|---|---|
| 1 | Barbell Bench Press | Bench press na vodorovné lavici | Bench press na vodorovné lavici – správná technika + video návod | https://fitcviky.cz/cviky/bench-press-na-vodorovne-lavici |
| 2 | Incline Barbell Bench Press | Benchpress na šikmé lavici hlavou nahoru | Benchpress na šikmé lavici hlavou nahoru – správná technika + video návod | https://fitcviky.cz/cviky/benchpress-na-sikme-lavici-hlavou-nahoru |
| 3 | Dumbbell Bench Press | Tlaky s jednoručkami na vodorovné lavici | Tlaky s jednoručkami na vodorovné lavici – správná technika + video návod | https://fitcviky.cz/cviky/tlaky-s-jednoruckami-na-vodorovne-lavici |
| 4 | Incline Dumbbell Press | Tlaky s jednoručkami v lehu na šikmé lavici | Tlaky s jednoručkami v lehu na šikmé lavici (incline dumbbell bench press) | https://www.cviky.cz/tlaky-s-jednoruckami-v-lehu-na-sikme-lavici-incline-dumbbell-bench-press/ |
| 5 | Cable Crossover | Stahování protisměrných kladek | Stahování protisměrných kladek – správná technika + video návod | https://fitcviky.cz/cviky/stahovani-protismernych-kladek |
| 6 | Dumbbell Fly | Rozpažky na vodorovné lavici | Rozpažky na vodorovné lavici – správná technika + video návod | https://fitcviky.cz/cviky/rozpazky-na-vodorovne-lavici |
| 7 | Barbell Deadlift | Klasický mrtvý tah | Klasický mrtvý tah – správná technika + video návod | https://fitcviky.cz/cviky/klasicky-mrtvy-tah |
| 8 | Bent-Over Barbell Row | Přítahy osy v předklonu | Přítahy osy v předklonu – správná technika + video návod | https://fitcviky.cz/cviky/pritahy-osy-v-predklonu |
| 9 | Pull-Up | Shyby nadhmatem | Shyby nadhmatem – správná technika + video návod | https://fitcviky.cz/cviky/shyby-nadhmatem |
| 10 | Wide-Grip Lat Pulldown | Stahování horní kladky | Stahování horní kladky – správná technika + video návod | https://fitcviky.cz/cviky/stahovani-horni-kladky |
| 11 | Seated Cable Row | Přítahy spodní kladky | Přítahy spodní kladky – správná technika + video návod | https://fitcviky.cz/cviky/pritahy-spodni-kladky |
| 12 | One-Arm Dumbbell Row | Přítahy jednoručky v předklonu | Přítahy jednoručky v předklonu – správná technika + video návod | https://fitcviky.cz/cviky/pritahy-jednorucky-v-predklonu |
| 13 | Seated Barbell Press | Tlaky s osou v sedě | Tlaky s osou v sedě – správná technika + video návod | https://fitcviky.cz/cviky/tlak-s-osou-v-sede |
| 14 | Dumbbell Shoulder Press | Tlaky s jednoručkami v sedě | Tlaky s jednoručkami v sedě – správná technika + video návod | https://fitcviky.cz/cviky/tlaky-s-jednoruckami-v-sede |
| 15 | Side Lateral Raise | Upažování s jednoručkami | Upažování s jednoručkami – správná technika + video návod | https://fitcviky.cz/cviky/upazovani-s-jednoruckami |
| 16 | Reverse Fly | Upažování s jednoručkami v předklonu | Upažování s jednoručkami v předklonu – správná technika + video návod | https://fitcviky.cz/cviky/upazovani-s-jednoruckami-v-predklonu |
| 17 | Face Pull | Face pull | Face pull – správná technika + video návod | https://fitcviky.cz/cviky/face-pull |
| 18 | Barbell Curl | Bicepsový zdvih s osou ve stoje | Bicepsový zdvih s osou ve stoje – správná technika + video návod | https://fitcviky.cz/cviky/bicepsovy-zdvih-s-osou-ve-stoje |
| 19 | Dumbbell Curl | Bicepsový zdvih s jednoručkami | Bicepsový zdvih s jednoručkami – správná technika + video návod | https://fitcviky.cz/cviky/bicepsovy-zdvih-s-jednoruckami |
| 20 | Hammer Curl | Kladivový zdvih s jednoručkami | Kladivový zdvih s jednoručkami (hammer curl, palm-up curl) | https://www.cviky.cz/kladivovy-zdvih-s-jednoruckami-hammer-curl-palm-up-curl/ |
| 21 | Preacher Curl | Bicepsový zdvih na Scottově lavici | Bicepsový zdvih na Scottově lavici – správná technika + video návod | https://fitcviky.cz/cviky/bicepsovy-zdvih-na-scottove-lavici |
| 22 | Close-Grip Bench Press | Benchpress na úzko | Benchpress na úzko – správná technika + video návod | https://fitcviky.cz/cviky/benchpress-na-uzko |
| 23 | Lying Triceps Extension | Tricepsový zdvih osy v lehu | Tricepsový zdvih osy v lehu – správná technika + video návod | https://fitcviky.cz/cviky/tricepsovy-zdvih-osy-v-lehu |
| 24 | Rope Triceps Pushdown | Stahování lana na triceps | Stahování lana na triceps – správná technika + video návod | https://fitcviky.cz/cviky/stahovani-lana-na-triceps |
| 25 | Overhead Cable Triceps Extension | Tricepsové stahování horní kladky s lanem přes hlavu | Tricepsové stahování horní kladky s lanem přes hlavu – správná technika + video návod | https://fitcviky.cz/cviky/tricepsove-stahovani-horni-kladky-s-lanem-pres-hlavu |
| 26 | Barbell Back Squat | Dřep s osou za hlavou | Dřep s osou za hlavou – správná technika + video návod | https://fitcviky.cz/cviky/drep-s-osou-za-hlavou |
| 27 | Front Squat | Dřep s činkou vpředu | Dřep s činkou vpředu (front squat) | https://www.cviky.cz/drep-s-cinkou-vpredu-front-squat/ |
| 28 | Leg Press | Legpress na šikmé lavici | Legpress na šikmé lavici – správná technika + video návod | https://fitcviky.cz/cviky/legpress-na-sikme-lavici |
| 29 | Romanian Deadlift | Rumunský mrtvý tah | Rumunský mrtvý tah – správná technika + video návod | https://fitcviky.cz/cviky/rumunsky-mrtvy-tah |
| 30 | Leg Extension | Předkopávání | Předkopávání v sedě na stroji – správná technika + video návod | https://fitcviky.cz/cviky/predkopavani |
| 31 | Lying Leg Curl | Zakopávání v leže | Zakopávání v leže – správná technika + video návod | https://fitcviky.cz/cviky/zakopavani-v-leze |
| 32 | Barbell Hip Thrust | Hip thrust | Hip thrust – správná technika + video návod | https://fitcviky.cz/cviky/hip-thrust |
| 33 | Walking Lunge | Výpady v chůzi | Výpady v chůzi s jednoručkami – správná technika + video návod | https://fitcviky.cz/cviky/vypady-v-chuzi-s-jednoruckami |
| 34 | Standing Calf Raise | Výpony na lýtka ve stoje | Výpony na lýtka ve stoje – správná technika + video návod | https://fitcviky.cz/cviky/vypony-na-lytka-ve-stoje |
| 35 | Seated Calf Raise | Výpony na lýtka v sedě | Výpony na lýtka v sedě – správná technika + video návod | https://fitcviky.cz/cviky/vypony-na-lytka-v-sede |
| 36 | Plank | Plank | Plank – správná technika + video návod | https://fitcviky.cz/cviky/plank |
| 37 | Hanging Leg Raise | Vznosy ve visu | Vznosy ve visu nebo ve vzporu (hanging leg raise) | https://www.cviky.cz/vznosy-ve-visu-nebo-ve-vzporu-hanging-leg-raise/ |
| 38 | Cable Crunch | Zkracovačky na horní kladce | Zkracovačky na horní kladce (rope crunch) | https://www.cviky.cz/zkracovacky-na-horni-kladce-rope-crunch/ |
| 39 | Ab Roller Rollout | Rollout s kolečkem | Rollout s kolečkem na břicho: technika, zapojené svaly a chyby | https://www.ironyou.app/cs/cviky/ab-wheel-rollout/ |
| 40 | Pallof Press | Pallof press | Pallof press: technika, zapojené svaly a chyby | https://www.ironyou.app/cs/cviky/pallof-press/ |

All 40 rows verified. No row uses a translated name that the source does not carry.

## Rows 41 to 120

Checked against Czech gym sources on 2026-11-14. A page counts only when it uses the name for that movement, in its own heading or page title; a page that mentions the words in a sentence does not count. Where a page names the movement differently, the page's wording is quoted in the last column in the page's own capitalization, while the app writes names in sentence case. Most rows ship that wording. Where a page title drops the equipment, adds weight the movement does not require, or would duplicate another row's name, the app keeps a shorter term and the note says why. Where no Czech source carries a name, the English name ships and the row moves to the second table.

The sources are FitCviky.cz, cviky.cz, IronYou, and Czech exercise libraries that state a page per movement (fitwill.app, TVIKY, NOW Fitness, JOGO Fuel, VelkéSvaly, FitYOU, SatisFIT, Liftava, RepCount, Posilka.cz, Aleš Lamka, InBody).

Some verified names are the English term because the Czech page uses it that way: Plank, Superman, Pull through, Farmer's walk, Glute ham raise and Goblet squat among them. Those rows sit in the first table with their page, not in the fallback list.

### Names with a Czech source

| # | English name | Czech name | Source page | Note |
| --- | --- | --- | --- | --- |
| 41 | Pushups | Kliky | [Kliky – správná technika + video návod \| FitCviky.cz](https://fitcviky.cz/cviky/kliky) |  |
| 42 | Decline Barbell Bench Press | Benchpress na šikmé lavici hlavou dolů | [Trénink prsou: benchpress na šikmé lavici](https://www.amix-store.cz/blog/trenink-prsou-benchpress-na-sikme-lavici) |  |
| 43 | Incline Dumbbell Flyes | Rozpažky s jednoručkami na šikmé lavici | [Rozpažování S Jednoručkami Na Šikmé Lavici](https://fitwill.app/cs/exercise/2514/dumbbell-incline-fly/) | page uses "Rozpažování S Jednoručkami Na Šikmé Lavici" |
| 44 | Dumbbell Bench Press with Neutral Grip | Tlaky s jednoručkami na vodorovné lavici neutrálním úchopem | [Tlaky s jednoručkami na vodorovné lavici – správná technika + video návod \| FitCviky.cz](https://fitcviky.cz/cviky/tlaky-s-jednoruckami-na-vodorovne-lavici) | page uses "Tlaky s jednoručkami na vodorovné lavici"; the app adds the neutral grip that separates it from the flat dumbbell press |
| 45 | Flat Bench Cable Flyes | Rozpažování na protisměrných kladkách vleže | [Rozpažování Na Protisměrných Kladkách Vleže](https://fitwill.app/cs/exercise/0185/cable-lying-fly/) | page uses "Rozpažování Na Protisměrných Kladkách Vleže" |
| 46 | Incline Cable Chest Press | Tlaky na šikmé lavici na spodních kladkách | [Tlaky Na Šikmé Lavici Na Spodních Kladkách](https://fitwill.app/cs/exercise/0169/cable-incline-bench-press/) | page uses "Tlaky Na Šikmé Lavici Na Spodních Kladkách" |
| 47 | Cable Chest Press | Tlaky na prsa na kladce ve stoje | [Tlaky Na Prsa Na Kladce Ve Stoje](https://fitwill.app/cs/exercise/1066/cable-standing-chest-press/) | page uses "Tlaky Na Prsa Na Kladce Ve Stoje" |
| 48 | Machine Bench Press | Tlaky na stroji na prsa | [Tlaky Na Stroji Na Prsa](https://fitwill.app/cs/exercise/0576/lever-chest-press/) | page uses "Tlaky Na Stroji Na Prsa" |
| 49 | Dips - Chest Version | Kliky na bradlech | [Kliky na bradlech (parallel bar dips /dips)](https://www.cviky.cz/kliky-na-bradlech-parallel-bar-dips-dips/) | page uses "Kliky na bradlech (parallel bar dips /dips)" |
| 50 | Incline Push-Up | Kliky o vyvýšenou podložku | [Kliky O Vyvýšenou Podložku](https://fitwill.app/cs/exercise/0493/incline-push-up/) | page uses "Kliky O Vyvýšenou Podložku" |
| 51 | Svend Press | Svend press | [Dumbbell Svend Press](https://fitwill.app/cs/exercise/3452/dumbbell-svend-press/) | page uses "Dumbbell Svend Press" |
| 52 | Chin-Up | Shyby podhmatem | [Shyby Podhmatem](https://fitwill.app/cs/exercise/1326/chin-up/) | page uses "Shyby Podhmatem" |
| 53 | Barbell Shrug | Krčení ramen s osou | [Krčení ramen s velkou činkou v stoji (barbell shrugs)](https://www.cviky.cz/krceni-ramen-s-velkou-cinkou-v-stoji-barbell-shrugs/) | page uses "Krčení ramen s velkou činkou v stoji (barbell shrugs)" |
| 54 | Bent Over Two-Dumbbell Row | Přítahy jednoruček v předklonu | [Přítahy Jednoruček V Předklonu](https://fitwill.app/cs/exercise/0293/dumbbell-bent-over-row/) | page uses "Přítahy Jednoruček V Předklonu" |
| 55 | T-Bar Row with Handle | Přítahy na T-ose | [Přítahy T-osy Na Pákovém Stroji (kotoučové)](https://fitwill.app/cs/exercise/0606/lever-t-bar-row-plate-loaded/) | page uses "Přítahy T-osy Na Pákovém Stroji (kotoučové)" |
| 56 | Inverted Row | Přítahy v náklonu | [Přítahy V Náklonu (Inverted Row)](https://fitwill.app/cs/exercise/0499/inverted-row/) | page uses "Přítahy V Náklonu (Inverted Row)" |
| 57 | Straight-Arm Pulldown | Stahování kladky s napnutými pažemi | [Stahování Kladky S Nataženýma Rukama](https://fitwill.app/cs/exercise/0238/cable-straight-arm-pulldown/) | page uses "Stahování Kladky S Nataženýma Rukama" |
| 58 | V-Bar Pulldown | Stahování horní kladky s V-madlem | [Stahování Horní Kladky S V-adaptérem](https://fitwill.app/cs/exercise/2616/cable-lateral-pulldown-with-v-bar/) | page uses "Stahování Horní Kladky S V-adaptérem" |
| 59 | Underhand Cable Pulldowns | Stahování horní kladky podhmatem | [Stahování Kladky Podhmatem](https://fitwill.app/cs/exercise/0245/cable-underhand-pulldown/) | page uses "Stahování Kladky Podhmatem" |
| 60 | Dumbbell Incline Row | Přítahy jednoruček na šikmé lavici | [Přítahy Jednoruček Na Šikmé Lavici](https://fitwill.app/cs/exercise/0327/dumbbell-incline-row/) | page uses "Přítahy Jednoruček Na Šikmé Lavici" |
| 61 | Lying T-Bar Row | Veslování v lehu na pákovém T-bar stroji | [Veslování V Lehu Na Pákovém T-bar Stroji](https://fitwill.app/cs/exercise/11307/lever-lying-t-bar-row/) |  |
| 62 | Rack Pulls | Rack pull | [Dotahy ze stojanu \| RepCount](https://www.repcountapp.com/cs/exercises/rack-pulls) | page uses "Dotahy ze stojanu"; the app keeps the English term Czech gyms use |
| 63 | Deficit Deadlift | Deficitní mrtvý tah | [Deficitní mrtvý tah: technika a zapojené svaly \| NOW Fitness](https://www.nowfitness.eu/cs/exercises/deficit-deadlift) |  |
| 64 | Hyperextensions (Back Extensions) | Hyperextenze | [Hyperextenze](https://www.velkesvaly.cz/cviky/45-cviky-na-zada/119-hyperextenze) |  |
| 65 | Superman | Superman | [Superman - jak provést, svaly, varianty \| SatisFIT](https://satis.fit/cs-CZ/exercises/superman) |  |
| 66 | Arnold Dumbbell Press | Arnold press | [Arnold Press: technika a zapojené svaly \| Liftava](https://liftava.com/cs/cviky/arnold-press) | page uses "Arnold Press" |
| 67 | Front Dumbbell Raise | Předpažování s jednoručkami | [Předpažování s jednoručkami: Správná technika \| FitYOU.cz](https://fityou.cz/cviky/predpazovani-jednoruckami/) |  |
| 68 | Cable Seated Lateral Raise | Upažování na kladce v sedě | [Upažování na kladce v sedě: jak na to, zapojené svaly \| JOGO Fuel](https://www.jogofuel.com/cs/cviky/upazovani-na-kladce-v-sede) |  |
| 69 | Seated Bent-Over Rear Delt Raise | Upažování v předklonu v sedě | [Upažování v předklonu vsedě na zadní ramena - Tviky](https://tviky.com/cs/exercises/seated-bent-over-rear-delt-raise/) | page uses "Upažování v předklonu vsedě na zadní ramena" |
| 70 | Reverse Machine Flyes | Obrácený motýlek | [Cviky na ramena - doma i v posilovně + trénink - Posilka.cz](https://posilka.cz/technika_cviku/cviky-na-ramena/) |  |
| 71 | Cable Rear Delt Fly | Rozpažování na zadní ramena na kladce | [Rozpažování na zadní ramena na kladce: jak na to, zapojené svaly \| JOGO Fuel](https://www.jogofuel.com/cs/cviky/rozpazovani-na-zadni-ramena-na-kladce) |  |
| 72 | Machine Shoulder (Military) Press | Tlaky na ramenním stroji | [Tlaky na stroji \| VelkéSvaly.cz](https://www.velkesvaly.cz/cviky/46-cviky-na-ramena/231-tlaky-na-stroji) | page uses "Tlaky na stroji"; the app names the shoulder machine so the row is not confused with the chest press machine |
| 73 | Push Press | Push press | [Push press – výrazový tlak (správná technika) \| FitYOU.cz](https://fityou.cz/cviky/push-press-vyrazovy-tlak/) |  |
| 74 | Upright Barbell Row | Přítahy osy k bradě | [Nejlepší cviky na ramena: Máme pro vás kompletní seznam s videi! - SvětFitness.cz](https://www.svetfitness.cz/clanek/nejlepsi-cviky-na-ramena/) |  |
| 75 | Standing Military Press | Tlaky s osou ve stoji | [Zásobník cviků (16.): Ramena - tlaky s velkou činkou](https://kulturistika.ronnie.cz/c-19185-zasobnik-cviku-16-ramena-tlaky-s-velkou-cinkou.html) | page uses "Tlaky s velkou činkou před hlavu vestoje" |
| 76 | Dumbbell Scaption | Skapce s jednoručkami | [Skapce s jednoručkami: jak na to, zapojené svaly \| JOGO Fuel](https://www.jogofuel.com/cs/cviky/skapce-s-jednoruckami) |  |
| 77 | Band Pull Apart | Roztahování gumičky | [Knihovna cviků: 871 cviků s návodem podle svalů \| TVIKY](https://tviky.com/cs/exercises/) | page uses "Roztahování gumy (pull apart)" |
| 78 | EZ-Bar Curl | Bicepsový zdvih s EZ osou | [Bicepsový zdvih s EZ osou: technika, zapojené svaly a chyby \| IronYou](https://www.ironyou.app/cs/cviky/ez-bar-biceps-curl/) |  |
| 79 | Concentration Curls | Koncentrované zdvihy s jednoručkou | [Vybuduj si větší a silnější bicepsy díky této pětici cviků! \| kulturistika.com](https://www.kulturistika.com/magazin/trenink/vybuduj-si-vetsi-a-silnejsi-bicepsy-diky-teto-petici-cviku) | page uses "Koncentrované zdvihy s jednoručkami" |
| 80 | Incline Dumbbell Curl | Bicepsový zdvih na šikmé lavici | [Jak na biceps: Nejlepší cviky na biceps doma i v posilovně - InBody](https://www.inbody.cz/blog/8208-jak-na-biceps-nejlepsi-cviky-na-biceps-doma-i-v-posilovne) |  |
| 82 | Cable Hammer Curls - Rope Attachment | Kladivové zdvihy na kladce s lanem | [Kladivový zdvih na spodní kladce ve stoji s lanem (rope hammer curl)](https://www.cviky.cz/kladivovy-zdvih-na-spodni-kladce-ve-stoji-s-lanem-rope-hammer-curl/) | page uses "Kladivový zdvih na spodní kladce ve stoji s lanem (rope hammer curl)" |
| 83 | Reverse Barbell Curl | Bicepsový zdvih velkou činkou nadhmatem | [Bicepsový zdvih velkou činkou nadhmatem (reverse curl)](https://www.cviky.cz/bicepsovy-zdvih-velkou-cinkou-nadhmatem-reverse-curl/) | page uses "Bicepsový zdvih velkou činkou nadhmatem (reverse curl)" |
| 86 | Zottman Curl | Zottmanův zdvih | [Pokud máte problém s rozvojem paží, zařaďte Zottmanovy zdvihy!](https://kulturistika.ronnie.cz/c-24321-pokud-mate-problem-s-rozvojem-pazi-zaradte-zottmanovy-zdvihy.html) | page uses "Zottmanovy zdvihy" |
| 87 | Dips - Triceps Version | Tricepsové kliky na bradlech | [Tricepsové kliky na bradlech (triceps parallel bar dips)](https://www.cviky.cz/tricepsove-kliky-na-bradlech-triceps-parallel-bar-dips/) | page uses "Tricepsové kliky na bradlech (triceps parallel bar dips)" |
| 88 | Bench Dips | Tricepsové kliky o lavičku | [Tricepsové kliky o lavičku](https://fitcviky.cz/cviky/tricepsove-kliky-o-lavicku) |  |
| 89 | EZ-Bar Skullcrusher | Francouzský tlak s EZ osou v lehu | [Francouzský tlak v lehu (lying french press / lying barbell triceps extension)](https://www.cviky.cz/francouzsky-tlak-v-lehu-lying-french-press-lying-barbell-triceps-extension/) | page uses "Francouzský tlak v lehu"; the app names the EZ bar that this entry uses |
| 90 | Triceps Pushdown | Stahování kladky na triceps | [Stahování horní kladky na triceps](https://fitcviky.cz/cviky/stahovani-hornkladky-na-triceps) | page uses "Stahování horní kladky na triceps" |
| 93 | Dumbbell One-Arm Triceps Extension | Francouzský tlak s jednoručkou | [Francouzský tlak s jednoručkou](https://fitcviky.cz/cviky/francouzsky-tlak-s-jednoruckou) |  |
| 94 | Tricep Dumbbell Kickback | Tricepsové zapažování | [Tricepsové zapažování (kick-back)](https://www.cviky.cz/tricepsove-zapazovani-kick-back/) | page uses "Tricepsové zapažování (kick-back)" |
| 97 | Barbell Lunge | Výpady s osou | [Dřepy do výpadu (lunges)](https://www.cviky.cz/drepy-do-vypadu-lunges/) | page uses "Dřepy do výpadu (lunges)" |
| 98 | Box Squat | Dřep na bednu | [Dřep do sedu na lavici (box squat)](https://www.cviky.cz/drep-do-sedu-na-lavici-box-squat/) | page uses "Dřep do sedu na lavici (box squat)"; the app uses the short gym term |
| 99 | Goblet Squat | Goblet squat | [Goblet dřepy](https://fitcviky.cz/cviky/goblet-drepy) | page uses "Goblet dřepy" |
| 100 | Hack Squat | Hack squat | [Hacken dřep (hack squat)](https://www.cviky.cz/hacken-drep-hack-squat/) | page uses "Hacken dřep (hack squat)" |
| 101 | Dumbbell Lunges | Výpady s jednoručkami | [Bulharské dřepy vs. výpady s jednoručkami](http://www.fitsportirclub.cz/bulharske-drepy-vs-vypady-s-jednoruckami/) |  |
| 102 | Barbell Step Ups | Výstupy na bednu s osou | [Výstupy na bednu](https://fitcviky.cz/cviky/vystupy-na-bednu) | page uses "Výstupy na bednu"; the app names the barbell that this entry uses |
| 103 | Bodyweight Squat | Dřep s vlastní vahou | [Dřep s vlastní vahou](https://www.nowfitness.eu/cs/exercises/bodyweight-squat) |  |
| 104 | Good Morning | Good morning s osou | [Předklony s činkou na ramenou (good mornings)](https://www.cviky.cz/predklony-s-cinkou-na-ramenou-good-mornings/) | page uses "Předklony s činkou na ramenou (good mornings)"; the app keeps the English term Czech gyms use |
| 105 | Seated Leg Curl | Zakopávání v sedě | [Zakopávání vsedě](https://www.ironyou.app/cs/cviky/seated-leg-curl/) | page uses "Zakopávání vsedě" |
| 106 | Stiff-Legged Barbell Deadlift | Mrtvý tah s rovnýma nohama | [Mrtvý tah s nataženými koleny (stiff-legged deadlift), Rumunský tah](https://www.cviky.cz/mrtvy-tah-s-natazenymi-koleny-stiff-legged-deadlift-rumunsky-tah/) | page uses "Mrtvý tah s nataženými koleny, Rumunský tah"; that page's name would collide with the Romanian deadlift row, so the app uses the straight-leg wording |
| 107 | Sumo Deadlift | Sumo mrtvý tah | [Sumo mrtvý tah](https://fitcviky.cz/cviky/sumo-mrtvy-tah) |  |
| 108 | Glute Ham Raise | Glute ham raise | [Glute-Ham Raise: návod, technika, přínosy, zapojené svaly a tipy \| Fitwill](https://fitwill.app/cs/exercise/3193/glute-ham-raise/) | page uses "Glute-Ham Raise" |
| 109 | Barbell Glute Bridge | Glute bridge s osou | [Glute Bridge S Velkou Činkou: návod, technika, přínosy, zapojené svaly a tipy \| Fitwill](https://fitwill.app/cs/exercise/1409/barbell-glute-bridge/) | page uses "Glute Bridge S Velkou Činkou" |
| 110 | One-Legged Cable Kickback | Zanožování na kladce | [Zanožování na kladce](https://fitcviky.cz/cviky/zanozovani-na-kladce) |  |
| 111 | Pull Through | Pull through | [Pull through na kladce](https://www.nowfitness.eu/cs/exercises/cable-pull-through) | page uses "Pull through na kladce" |
| 112 | Calf Press On The Leg Press Machine | Výpony na legpressu | [Výpony na legpressu (vertical calf press)](https://www.cviky.cz/vypony-na-legpressu-vertical-calf-press/) | page uses "Výpony na legpressu (vertical calf press)" |
| 113 | Standing Dumbbell Calf Raise | Výpony s jednoručkami ve stoje | [VÝPONY VE STOJE](https://aleslamka.cz/cviky-vypony-ve-stoje/) | page uses "Výpony ve stoje"; the app names the dumbbells that this entry uses |
| 114 | Crunches | Zkracovačky | [Zkracovačky](https://www.ironyou.app/cs/cviky/crunch/) |  |
| 115 | Hanging Pike | Pike ve visu | [Zvedání Nohou Ve Visu (Hanging Pike): návod, video, technika, přínosy, zapojené svaly a tipy \| Fitwill](https://fitwill.app/cs/exercise/0473/hanging-pike/) | page uses "Zvedání Nohou Ve Visu (Hanging Pike)"; that phrase is the hanging leg raise, so the app keeps the short English term for this movement |
| 116 | Russian Twist | Ruský twist | [Ruský twist](https://www.nowfitness.eu/cs/exercises/bodyweight-russian-twist) |  |
| 117 | Side Bridge | Boční plank | [Boční plank](https://fitcviky.cz/cviky/bocni-plank) |  |
| 118 | Decline Crunch | Zkracovačky na šikmé lavici hlavou dolů | [Útok na břicho - 3. část - popis cviků.](https://clanky.extrifit.cz/b/utok-na-bricho-3-cast-popis-cviku) | page uses "Zkracovačky hlavou dolů se zátěží"; the app names the bench angle instead of added weight |
| 119 | Farmer's Walk | Farmer's walk | [Trénink podle strongmana Jirky Vytisky - Farmer's Walk #5](https://www.kulturistika.com/magazin/trenink/trenink-podle-strongmana-jirky-vytisky-farmer-s-walk-5) | page uses "Farmer's Walk" |

### English fallback

No Czech source page carries a name for these movements, so the app shows the English name.

| # | English name | Detail |
| --- | --- | --- |
| 81 | Cross Body Hammer Curl | No Czech exercise page uses this name. fitcviky.cz catalogue (all ~30 exercises, browsed) has no cross-body hammer curl; cviky.cz search 'kladivový' returns only 'Kladivový zdvih s jednoručkami' and 'Kladivový zdvih na spodní kladce ve stoji s lanem', neither cross-body. The exact phrase appears only on gymtrack.io/cs, which is a machine-translated copy of an English app (weak evidence, not counted). |
| 84 | Spider Curl | cviky.cz site search for 'spider curl' returns 'Omlouváme se, nebyly nalezeny žádné příspěvky'; fitcviky.cz catalogue has no spider curl at all. A search hit on gymmer.com/cz ('Spider curl s EZ tyčí') was not fetched or verified, so it is not recorded as a source. |
| 85 | Incline Hammer Curls | cviky.cz search 'kladivový' returns only two hammer-curl pages (standing dumbbells, low pulley rope), no incline version. fitcviky.cz's incline page is 'Bicepsový zdvih s jednoručkami na nakloněné lavici', which is not a hammer curl and does not carry the name. |
| 91 | Reverse Grip Triceps Pushdown | The cviky.cz pushdown page was fetched in full: its only named variants are V/W adapter and rope ('Tricepsové stahy kladky s V nebo W adaptérem', '... s lanem krátkým nebo dlouhým'). No underhand/reverse-grip pushdown is named on cviky.cz or fitcviky.cz, and cviky.cz search 'podhmat' returns no pushdown page. |
| 92 | Triceps Overhead Extension with Rope | Same movement, but Czech sources call it 'stahování ... přes hlavu', not 'francouzský tlak ... nad hlavou'. cviky.cz has 'Tricepsové tlaky na horní kladce za hlavou (cable triceps extension...)', again without 'francouzský tlak'. |
| 95 | Floor Press | cviky.cz site search for 'floor' returns 'nebyly nalezeny žádné příspěvky'; fitcviky.cz catalogue has no floor press. Only translated/auto-generated pages surfaced ('Floor press'), none from a Czech-authored exercise database. |
| 96 | Smith Machine Squat | cviky.cz site search for 'smith' returns no posts at all. fitcviky.cz uses 'multipress' for the Smith machine and has only 'Bulharský dřep na multipressu' and 'Výpady vzad na multipressu' - no plain Smith squat page under either term. |
| 120 | Plate Pinch | The movement exists in Czech catalogues but keeps an English name: 'Plate pinch' here, 'Úchop Kotouče (Plate Pinch)' on fitwill.app/cs. 'Pinch kotoučů' itself not found as a name. |
