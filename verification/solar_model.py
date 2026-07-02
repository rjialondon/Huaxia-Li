# -*- coding: utf-8 -*-
"""
Single source of truth for the simplified solar model used by both
aphelion_sim.py (400-yr statistics) and ephemeris_check.py (DE421 cross-check).

Two-track decomposition (precession-correct): the mean longitude advances at
the TROPICAL rate (returns to the same equinox-referenced longitude in Y_TROP),
while the mean anomaly — argument of the equation of center — advances at the
ANOMALISTIC rate. Their difference is the drift of the perihelion relative to
the equinox of date (~61.8″/yr); conflating the two years accumulates
~25 min/yr of longitude-timing error (measured against JPL DE421).

    λ(t) = ϖ + 360°·t/Y_TROP + C(M),   M = 2π·t/Y_ANOM,   C to O(e³)

A mirrored JavaScript copy lives in src/AphSim.jsx (sunLon) — cross-language,
kept in sync by hand; this module is the reference.
"""
import math

Y_ANOM = 365.2596     # anomalistic year (perihelion→perihelion), days
Y_TROP = 365.2422     # tropical year (equinox→equinox), days
ECC    = 0.0167       # Earth orbital eccentricity

# Perihelion ecliptic longitude (from equinox of date):
PERI_LON_STAT  = 282.95    # epoch-agnostic default for long statistical runs
PERI_LON_J2000 = 282.9373  # epoch J2000.0 value

# Perihelion drift vs equinox of date — DERIVED from the two years, not free:
# per tropical year the mean longitude gains 360°, the anomaly gains
# 360·Y_TROP/Y_ANOM, so ϖ advances by the difference (≈ 0.01716°/yr ≈ 61.8″/yr).
PERI_DRIFT_DEG_PER_TROP_YR = 360.0 * (1.0 - Y_TROP / Y_ANOM)

def peri_lon_at(epoch_yr):
    """Perihelion longitude of date for a given Julian epoch year."""
    return PERI_LON_J2000 + PERI_DRIFT_DEG_PER_TROP_YR * (epoch_yr - 2000.0)

def sun_lon(t, peri_lon=PERI_LON_STAT, e=ECC):
    """
    Model ecliptic longitude of the Sun (° from equinox of date) at t days
    from perihelion. NOT periodic in Y_ANOM (the tropical term advances
    360·Y_ANOM/Y_TROP ≈ 360.0172° per anomalistic year) — never reduce t
    modulo Y_ANOM before calling.
    """
    M = 2 * math.pi * t / Y_ANOM
    C = ((2*e - e**3/4) * math.sin(M)
         + (5*e**2/4)    * math.sin(2*M)
         + (13*e**3/12)  * math.sin(3*M))
    return (peri_lon + 360.0 * t / Y_TROP + math.degrees(C)) % 360.0

def cross_time(lon_fn, lon_target, t_approx, half_width, iters=40):
    """
    Bisection: time near t_approx at which lon_fn(t) crosses lon_target (°).
    Handles the 0°/360° wrap via ±180° signed difference. 40 iterations on a
    ~30 d bracket ≈ 3e-11 d resolution — far below any consumer's needs.
    """
    t_lo, t_hi = t_approx - half_width, t_approx + half_width

    def diff(t):
        d = (lon_fn(t) - lon_target) % 360.0
        return d - 360.0 if d > 180.0 else d

    for _ in range(iters):
        t_mid = (t_lo + t_hi) / 2
        if diff(t_mid) > 0:
            t_hi = t_mid
        else:
            t_lo = t_mid
    return (t_lo + t_hi) / 2
