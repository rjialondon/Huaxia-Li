# Verification Scripts

Independent verification of key claims in Jia Runzhang (2026), *The Huaxia Li (华夏历): A Misclassified Planetary Timekeeping Methodology and Its Architectural Relevance to Self-Sovereign Computing Systems*.

## Scripts

### verify_tables.py
Independently recomputes all tables in Appendix A using JPL parameters:
- Mode A interval [Y₁/N, 2Y₁/N) for each solar system body
- Full satellite classification (Mode A / B / excluded) for all known moons
- Intercalary rate, Metonic-equivalent Zhang cycle, Ganzhi double-resonance
- Shichen (时辰) table
- Venus degenerate case

Run: `python3 verify_tables.py`  
No external dependencies (standard library only).

### aphelion_sim.py
Kepler-equation simulation over 400 years × 12 initial phases, using a
precession-correct two-track solar model (mean longitude at the tropical rate,
mean anomaly at the anomalistic rate; equation of center to e³).
Quantitatively verifies the aphelion clustering effect for intercalary months:
approximately 50% of no-Zhongqi months fall in the leap-4/5/6 window;
the months adjacent to the Winter Solstice almost never receive an intercalary
insertion (5 + 0 of 1,782 over 400 yr × 12 phases — matching the real calendar,
where a leap 11th month is a celebrated rarity, e.g. 2033).

Run: `python3 aphelion_sim.py`  
No external dependencies (standard library only).

**Reading the two clustering metrics.** The script reports aphelion clustering two ways,
and they are different quantities:
- *Leap-4/5/6 month window* ≈ 49.2% — this is the metric the paper's §6 "~50%" claim refers to.
- *Aphelion half-year by sun longitude* (window [12.9°, 192.9°)) ≈ 84.0% — a direct
  longitude-based measure with no corresponding claim in the paper. It shows the physical
  clustering is substantially **stronger** than the month-number proxy suggests, because the
  Sun spends more than half of each year traversing the aphelion half (Kepler's second law).

### ephemeris_check.py
Cross-checks the solar model against the **JPL DE421 ephemeris** (via Skyfield):
computes 49 consecutive solar-term crossing times (apparent ecliptic longitude
of date, per GB/T 33661-2017) over two years and compares them with the repo
model anchored at the first crossing.

Current result: **max |Δ| ≈ 14 min, mean ≈ 6 min** — calendar decisions are
day-granular (1440 min), leaving ~2 orders of magnitude of margin. The residual
is dominated by lunar/planetary perturbations and nutation, i.e. the two-body
model's physical floor.

Run: `pip install skyfield && python3 ephemeris_check.py`  
(downloads de421.bsp ~17 MB once; exits non-zero if tolerance exceeded)

## Known Errata (paper not changed; recorded here for transparency)

1. **Appendix A.1 — Uranus year value**: The paper uses 30,589 days (tropical period).
   All other planets use sidereal periods. The sidereal period for Uranus is 30,685.4 days,
   giving Z = 2557.1 days. This inconsistency does not affect any classification conclusion.

2. **Intercalary over-count (~+0.9%)**: Under the strict no-Zhongqi rule, the simulated
   intercalary rate is ≈ 0.3717/year vs. the required 0.3683/year (a +0.9% over-count).
   A rigorous implementation should use the integral form ⌊D(T)⌋ or the "year contains
   13 months" anchor rule (cf. GB/T 33661-2017). The app code is not affected — it only
   computes Mode classification and mean intercalary rates, not month-by-month insertion.
