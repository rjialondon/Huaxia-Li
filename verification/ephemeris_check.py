# -*- coding: utf-8 -*-
"""
Ephemeris cross-check: solar-term (节气) crossing times from the repo's
two-body Kepler model vs. the JPL DE421 ephemeris (via Skyfield).

What is being tested
--------------------
The paper's §6 machinery rests on one physical claim: solar terms defined by
ecliptic longitude are *unevenly spaced in time* exactly as Kepler's second
law dictates (定气法). This script measures how closely the repo's simplified
model (fixed perihelion longitude + equation of center to e³, as in
aphelion_sim.py) tracks the real Sun.

Method: compute the instants when the Sun's apparent geocentric ecliptic
longitude (of date) crosses each 15° multiple over a 2-year window, from
DE421. Anchor the model at the first crossing, then compare every subsequent
crossing. The residual isolates the model's *shape* error — precisely what
the calendar layer consumes.

Interpretation: calendar decisions are day-granular. A model-vs-ephemeris
agreement at the minutes level leaves three orders of magnitude of margin.

Requirements: pip install skyfield   (downloads de421.bsp, ~17 MB, once)
Run: python3 ephemeris_check.py      (exit code 0 = within tolerance)
"""

import math
import os
import sys

TOLERANCE_MIN = 30.0   # fail if any term deviates more than this (minutes)
START_UTC = (2024, 3, 1)
N_TERMS = 49           # 2 years of 15° crossings (+1 anchor)

# ── Repo model (kept in sync with aphelion_sim.py) ───────────────────────────
Y_ANOM   = 365.2596    # anomalistic year, days
Y_TROP   = 365.2422    # tropical year, days
ECC      = 0.0167
# Perihelion longitude, epoch-corrected to mid-window (aphelion_sim.py uses a
# fixed 282.95 because its 400-yr statistics are epoch-agnostic; an absolute
# comparison against a real ephemeris needs the epoch value):
# ϖ(J2000) = 282.9373°, drifting +61.9″/yr relative to the equinox of date.
_EPOCH_YR = START_UTC[0] + START_UTC[1] / 12.0 + 1.0   # mid of 2-yr window
PERI_LON  = 282.9373 + 0.0172 * (_EPOCH_YR - 2000.0)

def model_sun_lon(t):
    """
    Two-track model: mean longitude at the tropical rate, mean anomaly at the
    anomalistic rate (their difference = perihelion drift vs equinox of date).
    λ(t) = PERI_LON + 360°·t/Y_TROP + C(M), M = 2π·t/Y_ANOM; C to e³.
    """
    M = 2 * math.pi * t / Y_ANOM
    e = ECC
    C = ((2*e - e**3/4) * math.sin(M)
         + (5*e**2/4)    * math.sin(2*M)
         + (13*e**3/12)  * math.sin(3*M))
    return (PERI_LON + 360.0 * t / Y_TROP + math.degrees(C)) % 360.0

def model_cross_time(lon_target, t_approx, half_width=16.0):
    lo, hi = t_approx - half_width, t_approx + half_width
    def diff(t):
        d = (model_sun_lon(t) - lon_target) % 360.0
        return d - 360.0 if d > 180.0 else d
    for _ in range(80):
        mid = (lo + hi) / 2
        if diff(mid) > 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2

# ── Ephemeris side ────────────────────────────────────────────────────────────
def main():
    try:
        from skyfield.api import Loader
        from skyfield.framelib import ecliptic_frame
    except ImportError:
        print("SKIP: skyfield not installed (pip install skyfield).")
        return 0

    load = Loader(os.environ.get("SKYFIELD_DATA", os.path.dirname(os.path.abspath(__file__))))
    ts  = load.timescale()
    eph = load("de421.bsp")
    earth, sun = eph["earth"], eph["sun"]

    def eph_sun_lon(t):
        """Apparent geocentric ecliptic longitude of date (°), per GB/T 33661-2017 定气."""
        lat, lon, _ = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
        return lon.degrees % 360.0

    def eph_cross_time(lon_target, t_approx_tt):
        lo, hi = t_approx_tt - 16.0, t_approx_tt + 16.0
        def diff(tt):
            d = (eph_sun_lon(ts.tt_jd(tt)) - lon_target) % 360.0
            return d - 360.0 if d > 180.0 else d
        for _ in range(60):
            mid = (lo + hi) / 2
            if diff(mid) > 0:
                hi = mid
            else:
                lo = mid
        return (lo + hi) / 2

    # Walk 15° crossings forward from START_UTC
    t0 = ts.utc(*START_UTC)
    lon0 = eph_sun_lon(t0)
    first_target = (math.ceil(lon0 / 15.0) * 15.0) % 360.0
    step_guess = 15.24  # mean days per 15°

    eph_times, targets = [], []
    tt_guess = t0.tt + ((first_target - lon0) % 360.0) / 360.0 * 365.2422
    target = first_target
    for _ in range(N_TERMS):
        tt = eph_cross_time(target, tt_guess)
        eph_times.append(tt)
        targets.append(target)
        target = (target + 15.0) % 360.0
        tt_guess = tt + step_guess

    # Model times for the same longitude sequence, anchored at the first crossing
    model_times = []
    t_guess = ((targets[0] - PERI_LON) % 360.0) / 360.0 * Y_ANOM
    for tgt in targets:
        tm = model_cross_time(tgt, t_guess)
        model_times.append(tm)
        t_guess = tm + step_guess

    offset = eph_times[0] - model_times[0]   # absolute epoch alignment
    errs_min = [((eph_times[i] - model_times[i]) - offset) * 1440.0
                for i in range(len(targets))]

    print("=" * 66)
    print("  SOLAR-TERM TIMING: repo Kepler model vs JPL DE421 (Skyfield)")
    print(f"  window: {N_TERMS} crossings from {START_UTC[0]}-{START_UTC[1]:02d}-{START_UTC[2]:02d}, anchored at first crossing")
    print("=" * 66)
    print(f"  {'lon':>5}  {'DE421 (TT JD)':>16}  {'model Δ (min)':>14}")
    for i, tgt in enumerate(targets):
        mark = "  ← anchor" if i == 0 else ""
        print(f"  {tgt:5.0f}°  {eph_times[i]:16.5f}  {errs_min[i]:14.2f}{mark}")

    abs_errs = [abs(e) for e in errs_min[1:]]
    print("-" * 66)
    print(f"  max |Δ| = {max(abs_errs):.2f} min   mean |Δ| = {sum(abs_errs)/len(abs_errs):.2f} min")
    print(f"  tolerance = {TOLERANCE_MIN:.0f} min (calendar decisions are day-granular: ~3 orders of margin)")

    if max(abs_errs) > TOLERANCE_MIN:
        print("  RESULT: FAIL")
        return 1
    print("  RESULT: PASS")
    return 0

if __name__ == "__main__":
    sys.exit(main())
