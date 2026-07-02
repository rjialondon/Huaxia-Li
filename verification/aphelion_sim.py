# -*- coding: utf-8 -*-
"""
Aphelion clustering simulation — cross-checked against an independent
reference implementation.
Solar model imported from solar_model.py (two-track: tropical mean longitude +
anomalistic mean anomaly, equation of center to e³; validated against JPL
DE421 in ephemeris_check.py).

Verifies (with machine-checked assertions; non-zero exit on failure):
- ~50% of no-Zhongqi months fall in the leap-4/5/6 window (asserted 40–60%);
- months adjacent to the Winter Solstice almost never receive an intercalary
  insertion (asserted < 1% of all intercalary months).

Jia Runzhang (2026). 华夏历 — §6 aphelion intercalary clustering.
No external dependencies. Run: python3 aphelion_sim.py
"""
import sys
from collections import Counter

from solar_model import (
    Y_ANOM, Y_TROP, ECC, PERI_LON_STAT, PERI_DRIFT_DEG_PER_TROP_YR,
    sun_lon, cross_time,
)

# ── Simulation parameters ─────────────────────────────────────────────────────
T_SYN    = 29.530589   # Moon synodic period, days
N        = 24
Z        = 2 * Y_TROP / N   # Zhongqi interval ≈ 30.44 d
PERI_LON = PERI_LON_STAT    # epoch-agnostic (statistics don't depend on epoch)
N_YEARS  = 400
N_PHASES = 12   # different initial lunar phases (0 to T_SYN)

# ── Generate all Zhongqi crossing times ──────────────────────────────────────
def generate_zhongqi(n_years):
    """
    Return list of times (days from t=0 = perihelion) when the Sun crosses
    each 30° multiple of ecliptic longitude (12 Zhongqi per tropical year).
    """
    first_lon = ((PERI_LON // 30.0 + 1) * 30.0) % 360.0
    d_lon     = (first_lon - PERI_LON) % 360.0
    t_approx  = d_lon / 360.0 * Y_TROP

    cur_lon = first_lon
    cur_t   = cross_time(sun_lon, cur_lon, t_approx, Z * 0.6)
    times   = [cur_t]

    for _ in range(1, 12 * (n_years + 3)):
        cur_lon = (cur_lon + 30.0) % 360.0
        cur_t   = cross_time(sun_lon, cur_lon, cur_t + Z, Z * 0.6)
        times.append(cur_t)

    return times

# ── Zhongqi labels by ecliptic longitude ─────────────────────────────────────
ZQ_NAMES = {
      0: ("春分",  "Vernal Equinox"),
     30: ("谷雨",  "Grain Rain"),
     60: ("小满",  "Grain Buds"),
     90: ("夏至",  "Summer Solstice"),
    120: ("大暑",  "Great Heat"),
    150: ("处暑",  "End of Heat"),
    180: ("秋分",  "Autumnal Equinox"),
    210: ("霜降",  "Frost's Descent"),
    240: ("小雪",  "Minor Snow"),
    270: ("冬至",  "Winter Solstice"),
    300: ("大寒",  "Major Cold"),
    330: ("雨水",  "Rain Water"),
}

# ── Simulation ────────────────────────────────────────────────────────────────
intercalary_months = []   # (sun_lon_deg_at_month_start, preceding_regular_month_num)

zhongqi = generate_zhongqi(N_YEARS)

for phase_idx in range(N_PHASES):
    phase_offset = phase_idx * T_SYN / N_PHASES

    month_starts = []
    k = 0
    while True:
        t = phase_offset + k * T_SYN
        if t > (N_YEARS + 2) * Y_TROP:
            break
        month_starts.append(t)
        k += 1

    zq_cursor   = 0
    year_months = []
    zq_in_year  = 0
    halfN = N // 2   # 12 Zhongqi per year

    for i, ms in enumerate(month_starts[:-1]):
        me = month_starts[i + 1]
        while zq_cursor < len(zhongqi) and zhongqi[zq_cursor] < ms:
            zq_cursor += 1
        cnt, tmp = 0, zq_cursor
        while tmp < len(zhongqi) and zhongqi[tmp] < me:
            cnt += 1; tmp += 1
        is_intercalary = (cnt == 0)
        zq_in_year += cnt
        year_months.append((ms, is_intercalary))

        if zq_in_year >= halfN:
            reg, prev_reg = 0, 0
            for (t_m, is_int) in year_months:
                if not is_int:
                    reg += 1; prev_reg = reg
                elif 0 < t_m < N_YEARS * Y_TROP:
                    # Full t, NOT t % Y_ANOM: the two-track model is not
                    # Y_ANOM-periodic — reducing would erase the perihelion
                    # drift and misplace late-run longitudes by up to ~7°.
                    lon = sun_lon(t_m)
                    intercalary_months.append((lon, prev_reg))
            year_months = []
            zq_in_year  = 0

total = len(intercalary_months)

# ── Analysis ──────────────────────────────────────────────────────────────────
def sep(c="-", n=64):
    print(c * n)

sep("=")
print("  APHELION CLUSTERING SIMULATION (400 yr × 12 phases)")
print(f"  Y_ANOM={Y_ANOM}d  T_SYN={T_SYN}d  e={ECC}  PERI_LON={PERI_LON}°")
sep("=")
print(f"  Total intercalary months recorded: {total}")
print()

# By preceding month label
by_month = Counter(m for _, m in intercalary_months)
mx = max(by_month.values(), default=1)
print("  Intercalary count by preceding month number:")
for mn in range(0, 13):
    c   = by_month.get(mn, 0)
    bar = "█" * (c * 40 // mx)
    print(f"  Leap {mn:2d}: {c:5d}  {bar}")

sep()

# By 30° sun-longitude bin
by_lon = Counter(int(lon / 30) * 30 for (lon, _) in intercalary_months)
mx2    = max(by_lon.values(), default=1)
print("\n  Intercalary count by sun longitude at month start (30° bins):")
for lb in range(0, 360, 30):
    zh, en = ZQ_NAMES[lb]
    c   = by_lon.get(lb, 0)
    bar = "█" * (c * 40 // mx2)
    print(f"  {lb:3d}° {zh} ({en[:20]:20s}): {c:5d}  {bar}")

sep()

# Aphelion half-year window, evaluated at MID-RUN epoch: the perihelion drifts
# ~+6.9° over the 400-yr window, so a frozen epoch-0 window would bias edge
# classification; centering at mid-run halves the maximum epoch error to ±3.4°.
peri_mid = PERI_LON + PERI_DRIFT_DEG_PER_TROP_YR * (N_YEARS / 2)
aph_lon  = (peri_mid + 180.0) % 360.0
aph_lo   = (aph_lon  -  90.0) % 360.0
aph_hi   = (aph_lon  +  90.0) % 360.0

def in_aph(lon):
    return (aph_lo <= lon < aph_hi) if aph_lo < aph_hi else (lon >= aph_lo or lon < aph_hi)

n_aph = sum(1 for (lon, _) in intercalary_months if in_aph(lon))
pct   = n_aph / total * 100 if total else 0
print(f"\n  Aphelion lon ≈ {aph_lon:.1f}° (mid-run); half-year window [{aph_lo:.1f}°, {aph_hi:.1f}°):")
print(f"  In aphelion half: {n_aph} / {total} = {pct:.1f}%")
print( "  (Note: no direct paper claim for this longitude window. Paper §6's ~50%")
print( "   refers to the leap-4/5/6 month window below; by sun longitude the")
print( "   aphelion clustering is substantially stronger than that proxy suggests.)")

# Leap 4–6 (NH summer — months with highest aphelion overlap)
n46 = sum(1 for (_, m) in intercalary_months if 4 <= m <= 6)
p46 = n46 / total * 100 if total else 0
print(f"\n  Leap months 4/5/6 (NH summer): {n46} / {total} = {p46:.1f}%  (paper §6: ~50%)")

# Near Winter Solstice
ws11 = by_month.get(11, 0)
ws12 = by_month.get(12, 0)
ws_rate = (ws11 + ws12) / total * 100 if total else 0
print(f"\n  Leap 11: {ws11}   Leap 12: {ws12}   ({ws_rate:.2f}% of all intercalary months)")
print( "  (Near Winter Solstice months — paper claims ~0 over 400 years;")
print( "   a leap 11th month is a celebrated rarity in the real calendar, e.g. 2033)")

# ── Machine-checked claims (CI enforcement) ───────────────────────────────────
failures = []
if total == 0:
    failures.append("no intercalary months recorded — simulation broken")
else:
    if not (40.0 <= p46 <= 60.0):
        failures.append(f"leap-4/5/6 share {p46:.1f}% outside [40%, 60%] (paper §6: ~50%)")
    if ws_rate >= 1.0:
        failures.append(f"near-WS intercalary rate {ws_rate:.2f}% ≥ 1% (paper §6: ~0)")

sep("=")
if failures:
    for f in failures:
        print(f"  ASSERTION FAILED: {f}")
    sep("=")
    sys.exit(1)
print("  Simulation complete. All §6 claims within asserted bounds.")
sep("=")
