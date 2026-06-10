"""
Kepler-equation aphelion clustering simulation.
Verifies: ~50% of no-Zhongqi months fall in the leap-4/5/6 window;
Winter Solstice month has 0 intercalary insertions over 400 years.

Jia Runzhang (2026). 华夏历 — §6 aphelion intercalary clustering.
No external dependencies. Run: python3 aphelion_sim.py
"""

import math

# ── Kepler equation solver ─────────────────────────────────────────────────────
def mean_to_eccentric(M, ecc, tol=1e-10):
    E = M
    for _ in range(200):
        dE = (M - E + ecc * math.sin(E)) / (1 - ecc * math.cos(E))
        E += dE
        if abs(dE) < tol:
            break
    return E

def time_to_true_anomaly(t, Y1, ecc):
    """Convert time t (days) to true anomaly (radians, 0=perihelion)."""
    M = 2 * math.pi * t / Y1
    E = mean_to_eccentric(M, ecc)
    nu = 2 * math.atan2(
        math.sqrt(1 + ecc) * math.sin(E / 2),
        math.sqrt(1 - ecc) * math.cos(E / 2)
    )
    return nu % (2 * math.pi)

# ── Earth parameters ──────────────────────────────────────────────────────────
Y1   = 365.25          # days
Ti   = 29.5306         # Moon synodic period
N    = 24
ecc  = 0.0167
Z    = 2 * Y1 / N      # Zhongqi interval ~30.44 d

# perihelion longitude for Earth (winter in NH = ~Jan 3 = ~280° from vernal equinox)
# For simplicity we define t=0 at perihelion; vernal equinox is at ~80 days after perihelion
VERNAL_EQUINOX_DAYS = 79.0   # approx days from perihelion to vernal equinox

def zhongqi_times(year_start, n_halfN):
    """Return times of Zhongqi events for `n_halfN` half-N intervals starting at year_start."""
    halfN = N // 2  # 12 Zhongqi per year
    times = []
    for j in range(n_halfN + 1):
        yr  = j // halfN
        k   = j % halfN
        t0  = year_start + yr * Y1
        if k == 0:
            times.append(t0)
        else:
            # find time when true anomaly = 2*pi/N * (2*k) from this year's perihelion
            target_nu = (2 * math.pi / N) * (2 * k)
            # solve: time such that true_anomaly(t - yr*Y1) = target_nu
            # do simple bisection
            t_lo, t_hi = t0, t0 + Y1
            for _ in range(60):
                t_mid = (t_lo + t_hi) / 2
                nu_mid = time_to_true_anomaly(t_mid - (year_start + yr * Y1), Y1, ecc)
                if nu_mid < target_nu:
                    t_lo = t_mid
                else:
                    t_hi = t_mid
            times.append((t_lo + t_hi) / 2)
    return times

# ── Simulation ────────────────────────────────────────────────────────────────
N_YEARS  = 400
N_PHASES = 12   # different initial lunar phases (0 to Ti)

intercalary_months = []  # list of (true_anomaly_at_month_start, month_num_label)

for phase_idx in range(N_PHASES):
    phase_offset = phase_idx * Ti / N_PHASES

    # Generate all Zhongqi times over N_YEARS + 2 buffer years
    total_halfN = (N_YEARS + 4) * (N // 2)
    zq = zhongqi_times(0.0, total_halfN)

    # Generate all month boundaries
    month_starts = []
    k = 0
    while True:
        t = phase_offset + k * Ti
        if t > (N_YEARS + 2) * Y1:
            break
        month_starts.append(t)
        k += 1

    # Sweep: build calendar years, label intercalary months
    zq_cursor = 0
    year_months = []
    zq_in_year  = 0
    halfN = N // 2

    for i, ms in enumerate(month_starts[:-1]):
        me = month_starts[i + 1]
        # count Zhongqi in [ms, me)
        while zq_cursor < len(zq) and zq[zq_cursor] < ms:
            zq_cursor += 1
        cnt = 0
        tmp = zq_cursor
        while tmp < len(zq) and zq[tmp] < me:
            cnt += 1
            tmp += 1
        is_intercalary = (cnt == 0)
        zq_in_year += cnt
        year_months.append((ms, is_intercalary))

        if zq_in_year >= halfN:
            # label regular months 1..12 and intercalary
            reg = 0
            prev_reg = 0
            for (t_m, is_int) in year_months:
                if not is_int:
                    reg += 1
                    prev_reg = reg
                else:
                    # intercalary after prev_reg
                    if 0 < t_m < N_YEARS * Y1:
                        nu = time_to_true_anomaly(t_m % Y1, Y1, ecc)
                        intercalary_months.append((nu, prev_reg))
            year_months = []
            zq_in_year  = 0

total = len(intercalary_months)

# ── Analysis ──────────────────────────────────────────────────────────────────
def sep(c="-", n=60):
    print(c * n)

sep("=")
print("  APHELION CLUSTERING SIMULATION (400 yr × 12 phases)")
sep("=")
print(f"  Total intercalary months recorded: {total}")
print()

# By month label
from collections import Counter
by_month = Counter(m for _, m in intercalary_months)
print("  Intercalary count by month number:")
for mn in range(0, 13):
    count = by_month.get(mn, 0)
    bar = "█" * (count * 40 // max(by_month.values(), default=1))
    print(f"  Leap {mn:2d}: {count:5d}  {bar}")

sep()
# Aphelion window: true anomaly ~ pi (180°) ± 60° = [120°, 240°]
# Corresponds roughly to months 4-6 in NH calendar (perihelion in January)
aph_lo = math.pi - math.pi / 3   # 120°
aph_hi = math.pi + math.pi / 3   # 240°
in_aph = sum(1 for (nu, _) in intercalary_months if aph_lo <= nu <= aph_hi)
pct_aph = in_aph / total * 100 if total > 0 else 0

print(f"\n  Aphelion window [120°, 240°] from perihelion:")
print(f"  Intercalary months in window: {in_aph} / {total} = {pct_aph:.1f}%")
print(f"  (Expected ~50% — paper §6 claim)")

# Winter Solstice month (month 11 in traditional Chinese calendar)
# Defined as the month containing Winter Solstice = month starting near nu=270° from VE
# In our sim, perihelion=0; WS is at ~280° from VE = ~360°-(VERNAL_EQUINOX_DAYS/Y1)*360°
ws_nu = 2 * math.pi * (1 - VERNAL_EQUINOX_DAYS / Y1)  # ~282° in radians
ws_label = by_month.get(11, 0)
print(f"\n  Intercalary months labeled 'Leap 11' (after month 11): {ws_label}")
print(f"  Intercalary months labeled 'Leap 12': {by_month.get(12, 0)}")
print(f"  (Both near Winter Solstice — paper claims ~0 over 400 years)")

sep("=")
print("  Simulation complete.")
sep("=")
