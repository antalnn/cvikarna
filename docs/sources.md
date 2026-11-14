# Sources

The guide page makes one set of claims per section: training, protein, calories, sleep and
recovery. Every paper below backs a claim in a named section, and each section lists its own
sources with that claim in the app. All DOIs were checked on 2026-11-13 against the Crossref
metadata record. The links point at the DOI record.

| Section | Paper | Link | Supports | What it does not show |
|---|---|---|---|---|
| Training | Schoenfeld, Grgic, Ogborn, Krieger, 2017, Journal of Strength and Conditioning Research | https://doi.org/10.1519/JSC.0000000000002200 | 21 studies: similar hypertrophy with loads at or below 60% of max and above 60% when sets go to failure; strength favors heavy loads | That every rep range is equal for strength, or that light loads are optimal for a beginner |
| Training | Refalo, Helms, Trexler, Hamilton, Fyfe, 2023, Sports Medicine | https://doi.org/10.1007/s40279-022-01784-y | 15 studies: no hypertrophy advantage for training to momentary failure over stopping short of it | That failure is harmful, or that a specific number of reps in reserve is ideal |
| Training | Plotkin et al., 2022, PeerJ | https://doi.org/10.7717/peerj.14142 | 43 trained participants, 8 weeks: adding load and adding reps at the same load both improved muscle and strength, differences were small | That the result transfers to beginners, the upper body, or longer programs |
| Training | Schoenfeld, Contreras, Krieger, Grgic, Delcastillo, Belliard, Alto, 2019, Medicine & Science in Sports & Exercise | https://doi.org/10.1249/MSS.0000000000001764 | 34 trained men, 8 weeks: more weekly sets produced more hypertrophy; strength gains were similar | A maximum useful volume, or that the same dose fits every recovery capacity |
| Protein | Morton, Murphy, McKellar, Schoenfeld, Henselmans, Helms, Aragon, Devries, Banfield, Krieger, Phillips, 2018, British Journal of Sports Medicine | https://doi.org/10.1136/bjsports-2017-097608 | 49 studies: protein supplementation increases resistance-training gains in muscle mass and strength; the benefit plateaus around 1.6 g/kg/day with an upper confidence bound of 2.2 g/kg/day | That 1.6 g/kg is a target every person must hit, that timing around training decides the result, or that supplement powder beats food |
| Calories | Slater, Dieter, Marsh, Helms, Shaw, Iraki, 2019, Frontiers in Nutrition | https://doi.org/10.3389/fnut.2019.00131 | A review arguing that an energy surplus is not a prerequisite for hypertrophy and that a large surplus does not produce proportionally more muscle | An exact surplus for every trainee, a weight-loss protocol, or that calories alone determine body composition |
| Sleep | Hirshkowitz et al., 2015, Sleep Health | https://doi.org/10.1016/j.sleh.2014.12.010 | National Sleep Foundation recommendation of 7 to 9 hours per night for adults aged 18 to 64 | That 7 to 9 hours is optimal for every individual, or that sleep alone drives muscle growth |
| Sleep | Craven, McCartney, Desbrow, Sabapathy, Bellinger, Roberts, Irwin, 2022, Sports Medicine | https://doi.org/10.1007/s40279-022-01706-y | Systematic review and meta-analysis: acute sleep loss impairs physical performance, with a smaller effect on strength than on endurance | The effect of chronic short sleep, or a recovery protocol for a specific athlete |
| Sleep | Knowles, Drinkwater, Urwin, Lamon, Aisbett, 2018, Journal of Science and Medicine in Sport | https://doi.org/10.1016/j.jsams.2018.01.012 | A review linking inadequate sleep with lower muscle strength and altered recovery markers | A proven causal link, or the number of hours that restores strength for a given person |
| Recovery | Meeusen et al., 2013, Medicine & Science in Sports & Exercise | https://doi.org/10.1249/MSS.0b013e318279a10a | Joint consensus statement: overtraining syndrome arises from long-term overload and inadequate recovery, is diagnosed by exclusion, and is managed by adjusting load | A single rest protocol, a timeline that fits everyone, or that supplements treat the syndrome |
| Recovery | Kreher and Schwartz, 2012, Sports Health | https://doi.org/10.1177/1941738111434406 | A practical guide to overtraining: rest, nutrition, sleep and a gradual return to training | That one extra rest day fixes long-term overload, or that a specific supplement shortens recovery |

## Where the guide lives

The guide is typed content in the frontend, not a database table. One page does not need an
endpoint, and the text ships with the app in both languages.

- Content: `web/src/features/guides/guideContent.ts`
- Diagrams: `web/src/features/guides/GuideDiagrams.tsx`
- Page: `web/src/features/guides/GuidesPage.tsx`
- Route: `/guides`, linked from the header

## Claims the app does not make

- It does not prescribe a program for a specific sport, injury or medical condition.
- It does not claim that 10 to 20 sets is right for everyone. It names the range as a
  starting point.
- It does not treat the studies as proof that effort is the only variable. Sleep, food,
  technique and recovery stay in the picture.
- It does not present the protein or calorie numbers as medical targets. They are
  population-level estimates with a wide band.
