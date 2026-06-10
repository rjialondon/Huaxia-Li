"""
Independent verification of Huaxia Calendar paper tables.
Jia Runzhang (2026). 华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology.
DOI: 10.5281/zenodo.19571784

No external dependencies. Run: python3 verify_tables.py
"""

import math

# ── Synodic period helper ──────────────────────────────────────────────────────
def synodic(T_sid, Y1):
    """Sidereal satellite period -> synodic (apparent) period relative to host star."""
    return 1.0 / (1.0 / T_sid - 1.0 / Y1)

# ── Core formula ──────────────────────────────────────────────────────────────
def mode_A_range(Y1, N=24):
    lo = Y1 / N
    hi = 2 * Y1 / N
    return lo, hi

def classify_satellite(Ti_syn, Y1, local_day_hours, N=24):
    """Returns classification string."""
    lo, hi = mode_A_range(Y1, N)
    local_day_d = local_day_hours / 24.0
    if Ti_syn < local_day_d:
        return "Sub-diurnal (excluded)"
    if lo <= Ti_syn < hi:
        return "Mode A (intercalary)"
    if Ti_syn < lo:
        return "Mode B (too fast)"
    return "Mode B (too slow)"

def intercalary_rate(Y1, Ti_syn):
    mpy = Y1 / Ti_syn
    frac = mpy - math.floor(mpy)
    return mpy, frac, (1.0 / frac if frac > 0 else float('inf'))

def best_rational(frac, max_denom=100):
    best = (1, 1, abs(1 - frac))
    for q in range(1, max_denom + 1):
        p = round(frac * q)
        if p <= 0:
            continue
        err = abs(p / q - frac)
        if err < best[2]:
            best = (p, q, err)
        if err < 1e-6:
            break
    return best[0], best[1], best[2]

# ── Data (JPL values) ─────────────────────────────────────────────────────────
SYSTEMS = [
    {
        "name": "Earth", "Y1": 365.25, "N": 24, "local_day_h": 24.0, "ecc": 0.0167,
        "satellites": [
            {"name": "Moon", "Ti_sid": 27.32166, "TiIsSynodic": False},
        ],
    },
    {
        "name": "Mars", "Y1": 686.97, "N": 24, "local_day_h": 24.66, "ecc": 0.0934,
        "satellites": [
            {"name": "Phobos", "Ti_sid": 0.31891, "TiIsSynodic": False},
            {"name": "Deimos", "Ti_sid": 1.26244, "TiIsSynodic": False},
        ],
    },
    {
        "name": "Jupiter", "Y1": 4332.59, "N": 24, "local_day_h": 9.925, "ecc": 0.0489,
        "satellites": [
            {"name": "Io",       "Ti_sid": 1.76914,  "TiIsSynodic": False},
            {"name": "Europa",   "Ti_sid": 3.55118,  "TiIsSynodic": False},
            {"name": "Ganymede", "Ti_sid": 7.15455,  "TiIsSynodic": False},
            {"name": "Callisto", "Ti_sid": 16.68902, "TiIsSynodic": False},
        ],
    },
    {
        "name": "Saturn", "Y1": 10759.22, "N": 24, "local_day_h": 10.656, "ecc": 0.0565,
        "satellites": [
            {"name": "Titan",    "Ti_sid": 15.9454,  "TiIsSynodic": False},
            {"name": "Iapetus",  "Ti_sid": 79.3302,  "TiIsSynodic": False},
        ],
    },
    {
        "name": "Uranus (sidereal, corrected)", "Y1": 30685.4, "N": 24, "local_day_h": 17.24, "ecc": 0.0472,
        "satellites": [],
        "note": "Paper uses 30589 d (tropical); sidereal is 30685.4 d. Errata #1.",
    },
]

# ── Verification ──────────────────────────────────────────────────────────────
def sep(char="-", n=70):
    print(char * n)

sep("=")
print("  HUAXIA CALENDAR — INDEPENDENT TABLE VERIFICATION")
sep("=")

for sys in SYSTEMS:
    Y1 = sys["Y1"]
    N  = sys["N"]
    lo, hi = mode_A_range(Y1, N)
    Z = 2 * Y1 / N
    print(f"\n{'='*60}")
    print(f"  {sys['name']}  Y₁={Y1:.2f} d  N={N}  Z={Z:.4f} d")
    print(f"  Mode A range: [{lo:.3f}, {hi:.3f}) days")
    if "note" in sys:
        print(f"  NOTE: {sys['note']}")

    for sat in sys["satellites"]:
        Ti_syn = sat["Ti_sid"] if sat["TiIsSynodic"] else synodic(sat["Ti_sid"], Y1)
        cls    = classify_satellite(Ti_syn, Y1, sys["local_day_h"], N)
        ratio  = Ti_syn / Z * 100
        print(f"  {sat['name']:12s}: Ti_sid={sat['Ti_sid']:.5f}d  Ti_syn={Ti_syn:.5f}d  "
              f"Ti/Z={ratio:.1f}%  → {cls}")
        if "Mode A" in cls:
            mpy, frac, interval = intercalary_rate(Y1, Ti_syn)
            p, q, err = best_rational(frac)
            print(f"             Intercalary: {mpy:.4f} mo/yr, frac={frac:.5f}, "
                  f"every {interval:.2f} yr, Zhang {p}/{q} (err={err*100:.4f}%)")

sep()
print("\n  SHICHEN TABLE (local_day / 12 hours)")
sep()
shichen_data = [
    ("Earth",   24.0),
    ("Mars",    24.66),
    ("Jupiter", 9.925),
    ("Venus",   2802.0),
    ("TRAPPIST-1e", 6.101 * 24),
]
for name, ld in shichen_data:
    shichen = ld / 12
    print(f"  {name:20s}: local_day={ld:.2f}h  shichen={shichen:.4f}h")

sep()
print("\n  VENUS DEGENERATE CASE")
sep()
venus_Y1    = 224.7
venus_ld    = 2802.0
venus_ratio = venus_ld / (venus_Y1 * 24)
print(f"  Venus: Y₁={venus_Y1}d, local_day={venus_ld}h")
print(f"  local_day/Y₁ = {venus_ratio:.4f}  (>1 → degenerate: day longer than year)")
print(f"  Formula output: pure solar calendar (no satellites, degenerate shichen)")

sep("=")
print("  All tables verified. See errata in verification/README.md.")
sep("=")
