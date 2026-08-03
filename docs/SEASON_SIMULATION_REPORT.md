# Season 01 simulation report

Generated deterministically from `game/narrative/season_01.json`.

## Result

- Status: **PASSED**
- Reachable scenes: **140/140**
- Critical branch nodes with three destinations: **30/30**
- Route closures: **20**
- Delayed consequences: **70**
- Terminal choice paths (choices counted, convergences preserved): **3695220735358648082902080255159582440025**
- Canonical content SHA-256: `e51c40747b574b4ad6c44b4e12d8dce3285e23acaf2643bd180910953b21e7d6`

## Conditional coverage

| Requirement type | Variants |
|---|---:|
| `dominant_stat` | 6 |
| `flag` | 1 |
| `origin` | 40 |
| `real_action` | 12 |
| `relationship` | 14 |
| `skip_count` | 9 |
| `stat` | 1 |
| `weak_stat` | 6 |

## Ending reachability fixtures

| Ending | Resolved ending | Result |
|---|---|---|
| `architect` | `architect` | PASS |
| `restorer` | `restorer` | PASS |
| `athlete` | `athlete` | PASS |
| `strategist` | `strategist` | PASS |
| `connector` | `connector` | PASS |
| `steady` | `steady` | PASS |
| `returner` | `returner` | PASS |
| `open` | `open` | PASS |

## Interpretation

This proves reference integrity, acyclicity, reachability, genuine route splits,
convergences, delayed-consequence wiring and satisfiable ending rules. It is an
automated structural simulation, not a substitute for blind human narrative
playtesting.

## Errors

- None.
