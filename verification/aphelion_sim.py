"""
Aphelion clustering simulation — aligned with 大哥 independent reference.
Uses anomalistic year, sun-longitude Zhongqi, equation-of-center to e³.
Verifies: ~50% of no-Zhongqi months fall in the aphelion half-year;
Winter Solstice month has ~0 intercalary insertions over 400 years.

Jia Runzhang (2026). 华夏历 — §6 aphelion intercalary clustering.
No external dependencies. Run: python3 aphelion_sim.py
"""

import math
from collections import Counter

# ── Earth orbital parameters ──────────────────────────────────────────────────
Y_ANOM   = 365.2596    # anomalistic year (perihelion→perihelion), days
Y_TROP   = 365.2422    # tropical year (VE→VE), days; Z and sim bounds use this
T_SYN    = 29.530589   # Moon synodic period, days
N        = 24
Z        = 2 * Y_TROP / N   # Zhongqi interval ≈ 30.44 d
ecc      = 0.0167
PERI_LON = 282.95       # ecliptic longitude of perihelion (°), from vernal equinox

# ── Equation-of-center to e³: mean anomaly → ecliptic longitude ───────────────
def sun_lon(t):
    """
    Ecliptic longitude of Sun (° from vernal equinox) at t days from perihelion.
    Equation-of-center series expanded to third order in eccentricity.
    """
    M  = 2 * math.pi * t / Y_ANOM
    e  = ecc
    nu = (M
          + (2*e - e**3/4) * math.sin(M)
          + (5*e**2/4)      * math.sin(2*M)
          + (13*e**3/12)    * math.sin(3*M))
    return (math.degrees(nu) + PERI_LON) % 360.0

# ── Bisection: find time near t_approx when sun crosses lon_target ────────────
def time_of_sun_lon(lon_target, t_approx, half_width=None):
    """Return time near t_approx when sun_lon crosses lon_target (degrees)."""
    if half_width is None:
        half_width = Z * 0.6
    t_lo, t_hi = t_approx - half_width, t_approx + half_width

    def diff(t):
        d = (sun_lon(t) - lon_target) % 360.0
        return d - 360.0 if d > 180.0 else d

    for _ in range(80):
        t_mid = (t_lo + t_hi) / 2
        if diff(t_mid) > 0:
            t_hi = t_mid
        else:
            t_lo = t_mid
    return (t_lo + t_hi) / 2

# ── Generate all Zhongqi crossing times ──────────────────────────────────────
def generate_zhongqi(n_years):
    """
    Return list of times (days from t=0 = perihelion) when Sun crosses
    each 30° multiple of ecliptic longitude (12 Zhongqi per tropical year).
    """
    # First Zhongqi after t=0: sun starts at PERI_LON=282.95°, next 30° boundary
    first_lon = (math.ceil(PERI_LON / 30.0) * 30.0) % 360.0
    d_lon     = (first_lon - PERI_LON) % 360.0
    t_approx  = d_lon / 360.0 * Y_TROP

    cur_lon = first_lon
    cur_t   = time_of_sun_lon(cur_lon, t_approx)
    times   = [cur_t]

    for _ in range(1, 12 * (n_years + 3)):
        cur_lon = (cur_lon + 30.0) % 360.0
        cur_t   = time_of_sun_lon(cur_lon, cur_t + Z)
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
N_YEARS  = 400
N_PHASES = 12   # different initial lunar phases (0 to T_SYN)

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
                    lon = sun_lon(t_m % Y_ANOM)
                    intercalary_months.append((lon, prev_reg))
            year_months = []
            zq_in_year  = 0

total = len(intercalary_months)

# ── Analysis ──────────────────────────────────────────────────────────────────
def sep(c="-", n=64):
    print(c * n)

sep("=")
print("  APHELION CLUSTERING SIMULATION (400 yr × 12 phases)")
print(f"  Y_ANOM={Y_ANOM}d  T_SYN={T_SYN}d  e={ecc}  PERI_LON={PERI_LON}°")
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

# Aphelion half-year window
# Earth aphelion ≈ PERI_LON + 180° = 102.95° from vernal equinox
aph_lon = (PERI_LON + 180.0) % 360.0   # ≈ 102.95°
aph_lo  = (aph_lon  -  90.0) % 360.0   # ≈  12.95°
aph_hi  = (aph_lon  +  90.0) % 360.0   # ≈ 192.95°

def in_aph(lon):
    return (aph_lo <= lon < aph_hi) if aph_lo < aph_hi else (lon >= aph_lo or lon < aph_hi)

n_aph = sum(1 for (lon, _) in intercalary_months if in_aph(lon))
pct   = n_aph / total * 100 if total else 0
print(f"\n  Aphelion lon ≈ {aph_lon:.1f}°; half-year window [{aph_lo:.1f}°, {aph_hi:.1f}°):")
print(f"  In aphelion half: {n_aph} / {total} = {pct:.1f}%  (paper §6: ~50%)")

# Leap 4–6 (NH summer — months with highest aphelion overlap)
n46 = sum(1 for (_, m) in intercalary_months if 4 <= m <= 6)
p46 = n46 / total * 100 if total else 0
print(f"\n  Leap months 4/5/6 (NH summer): {n46} / {total} = {p46:.1f}%  (paper §6: ~50%)")

# Near Winter Solstice
ws11 = by_month.get(11, 0)
ws12 = by_month.get(12, 0)
print(f"\n  Leap 11: {ws11}   Leap 12: {ws12}")
print(f"  (Near Winter Solstice month — paper claims ~0 over 400 years)")

sep("=")
print("  Simulation complete.")
sep("=")
