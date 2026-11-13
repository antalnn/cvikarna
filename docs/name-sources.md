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
