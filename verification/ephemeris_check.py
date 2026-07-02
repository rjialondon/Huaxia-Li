# -*- coding: utf-8 -*-
"""
Ephemeris cross-check: solar-term (节气) crossing times from the repo's
two-body model (verification/solar_model.py — the same module that powers
aphelion_sim.py) vs. the JPL DE421 ephemeris via Skyfield.

What is being tested
--------------------
The paper's §6 machinery rests on one physical claim: solar terms defined by
ecliptic longitude are *unevenly spaced in time* exactly as Kepler's second
law dictates (定气法). This script measures how closely the shared model
tracks the real Sun.

Method: compute the instants when the Sun's apparent geocentric ecliptic
longitude (of date) crosses each 15° multiple over a 2-year window, from
DE421. Anchor the model at the first crossing, then compare every subsequent
crossing. The residual isolates the model's *shape* error — precisely what
the calendar layer consumes. The model uses the epoch-corrected perihelion
longitude (solar_model.peri_lon_at); aphelion_sim.py uses the epoch-agnostic
statistical value — same model function, one parameter.

Interpretation: calendar decisions are day-granular. A model-vs-ephemeris
agreement at the minutes level leaves ~2 orders of magnitude of margin.

Requirements: pip install skyfield   (downloads de421.bsp, ~17 MB, once)
Run: python3 ephemeris_check.py      (exit code 0 = within tolerance)
"""

import os
import sys

from solar_model import Y_ANOM, Y_TROP, sun_lon, cross_time, peri_lon_at

TOLERANCE_MIN = 30.0   # fail if any term deviates more than this (minutes)
START_UTC = (2024, 3, 1)
N_TERMS = 2 * 24 + 1   # two years of 15° crossings, +1 anchor

# Epoch-corrected perihelion longitude at mid-window:
_EPOCH_YR = START_UTC[0] + START_UTC[1] / 12.0 + 1.0
PERI_LON  = peri_lon_at(_EPOCH_YR)

def model_lon(t):
    return sun_lon(t, peri_lon=PERI_LON)

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

    def eph_sun_lon(tt_jd):
        """Apparent geocentric ecliptic longitude of date (°), per GB/T 33661-2017 定气."""
        t = ts.tt_jd(tt_jd)
        lat, lon, _ = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)
        return lon.degrees % 360.0

    # Walk 15° crossings forward from START_UTC
    t0 = ts.utc(*START_UTC)
    lon0 = eph_sun_lon(t0.tt)
    first_target = -(-lon0 // 15.0) * 15.0 % 360.0
    step_guess = 15.24  # mean days per 15°

    eph_times, targets = [], []
    tt_guess = t0.tt + ((first_target - lon0) % 360.0) / 360.0 * Y_TROP
    target = first_target
    for _ in range(N_TERMS):
        # 30 iterations on a 32 d bracket → ~3e-8 d ≈ 3 ms, vs 30 min tolerance
        tt = cross_time(eph_sun_lon, target, tt_guess, half_width=16.0, iters=30)
        eph_times.append(tt)
        targets.append(target)
        target = (target + 15.0) % 360.0
        tt_guess = tt + step_guess

    # Model times for the same longitude sequence, anchored at the first crossing
    model_times = []
    t_guess = ((targets[0] - PERI_LON) % 360.0) / 360.0 * Y_TROP
    for tgt in targets:
        tm = cross_time(model_lon, tgt, t_guess, half_width=16.0)
        model_times.append(tm)
        t_guess = tm + step_guess

    offset = eph_times[0] - model_times[0]   # absolute epoch alignment
    errs_min = [((eph_times[i] - model_times[i]) - offset) * 1440.0
                for i in range(len(targets))]

    print("=" * 66)
    print("  SOLAR-TERM TIMING: repo model (solar_model.py) vs JPL DE421")
    print(f"  window: {N_TERMS} crossings from {START_UTC[0]}-{START_UTC[1]:02d}-{START_UTC[2]:02d}, anchored at first crossing")
    print("=" * 66)
    print(f"  {'lon':>5}  {'DE421 (TT JD)':>16}  {'model Δ (min)':>14}")
    for i, tgt in enumerate(targets):
        mark = "  ← anchor" if i == 0 else ""
        print(f"  {tgt:5.0f}°  {eph_times[i]:16.5f}  {errs_min[i]:14.2f}{mark}")

    abs_errs = [abs(e) for e in errs_min[1:]]
    print("-" * 66)
    print(f"  max |Δ| = {max(abs_errs):.2f} min   mean |Δ| = {sum(abs_errs)/len(abs_errs):.2f} min")
    print(f"  tolerance = {TOLERANCE_MIN:.0f} min (calendar decisions are day-granular: ~2 orders of margin)")

    if max(abs_errs) > TOLERANCE_MIN:
        print("  RESULT: FAIL")
        return 1
    print("  RESULT: PASS")
    return 0

if __name__ == "__main__":
    sys.exit(main())
