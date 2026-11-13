# Sources

The guide page makes four claims and names one paper for each. All four were checked on
2026-11-13 against the Europe PMC metadata and abstract for the DOI. The links point at the
DOI record.

| Paper | Link | Supports | What it does not show |
|---|---|---|---|
| Schoenfeld, Grgic, Ogborn, Krieger, 2017, Journal of Strength and Conditioning Research | https://doi.org/10.1519/JSC.0000000000002200 | 21 studies, sets to failure: similar hypertrophy with loads at or below 60% of max and above 60%; strength favors heavy loads | That every rep range is equal for strength, or that light loads are optimal for a beginner |
| Refalo, Helms, Trexler, Hamilton, Fyfe, 2023, Sports Medicine | https://doi.org/10.1007/s40279-022-01784-y | 15 studies: no hypertrophy advantage for training to momentary failure over stopping short of it | That failure is harmful, or that a specific number of reps in reserve is ideal |
| Plotkin et al., 2022, PeerJ | https://doi.org/10.7717/peerj.14142 | 43 trained participants, 8 weeks: adding load and adding reps at the same load both improved muscle and strength, differences were small | That the result transfers to beginners, the upper body, or longer programs |
| Schoenfeld, Contreras, Krieger, Grgic, Delcastillo, Belliard, Alto, 2019, Medicine & Science in Sports & Exercise | https://doi.org/10.1249/MSS.0000000000001764 | 34 trained men, 8 weeks: more weekly sets produced more hypertrophy; strength gains were similar | A maximum useful volume, or that the same dose fits every recovery capacity |

## Where the guide lives

The guide is typed content in the frontend, not a database table. One page does not need an
endpoint, and the text ships with the app in both languages.

- Content: `web/src/features/guides/guideContent.ts`
- Page: `web/src/features/guides/GuidesPage.tsx`
- Route: `/guides`, linked from the header

## Claims the app does not make

- It does not prescribe a program for a specific sport, injury or medical condition.
- It does not claim that 10 to 20 sets is right for everyone. It names the range as a
  starting point.
- It does not treat the studies as proof that effort is the only variable. Sleep, food,
  technique and recovery stay in the picture.
