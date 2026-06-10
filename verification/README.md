# Verification Scripts

Independent verification of key claims in Jia Runzhang (2026), *华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology*.

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
Kepler-equation simulation over 400 years × 12 initial phases.
Quantitatively verifies the aphelion clustering effect for intercalary months:
approximately 50% of no-Zhongqi months fall in the leap-4/5/6 window;
the Winter Solstice month has zero intercalary insertions over 400 years.

Run: `python3 aphelion_sim.py`  
No external dependencies (standard library only).

## Known Errata (paper not changed; recorded here for transparency)

1. **Appendix A.1 — Uranus year value**: The paper uses 30,589 days (tropical period).
   All other planets use sidereal periods. The sidereal period for Uranus is 30,685.4 days,
   giving Z = 2557.1 days. This inconsistency does not affect any classification conclusion.

2. **Intercalary over-count (~+0.9%)**: Under the strict no-Zhongqi rule, the simulated
   intercalary rate is ≈ 0.3717/year vs. the required 0.3683/year (a +0.9% over-count).
   A rigorous implementation should use the integral form ⌊D(T)⌋ or the "year contains
   13 months" anchor rule (cf. GB/T 33661-2017). The app code is not affected — it only
   computes Mode classification and mean intercalary rates, not month-by-month insertion.
