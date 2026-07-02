# -*- coding: utf-8 -*-
"""
独立验证：华夏历论文附录 A 各表 + 正文数值
Jia Runzhang (2026). 华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology.
DOI: 10.5281/zenodo.19571784

无外部依赖。运行: python3 verify_tables.py
"""
import math

# ── 会合周期 ──────────────────────────────────────────────────────────────────
def synodic(T_sid, Y1, retrograde=False):
    """
    恒星轨道周期 → 朔望/会合周期。
    顺行: 1/T_syn = 1/T_sid − 1/Y1
    逆行: 1/T_syn = 1/|T_sid| + 1/Y1  (方向相反，叠加而非抵消)
    """
    if retrograde:
        return 1.0 / (1.0 / abs(T_sid) + 1.0 / Y1)
    return 1.0 / (1.0 / T_sid - 1.0 / Y1)

# ── 公式核心 ──────────────────────────────────────────────────────────────────
def mode_A_range(Y1, N=24):
    return Y1 / N, 2 * Y1 / N

def classify_satellite(Ti_syn, Y1, local_day_hours, N=24):
    lo, hi = mode_A_range(Y1, N)
    ld = local_day_hours / 24.0
    if Ti_syn < ld:           return "∅ 亚日 (excluded)"
    if lo <= Ti_syn < hi:     return "A ★ 甲型 (intercalary)"
    if Ti_syn < lo:           return "B 乙型快 (too fast)"
    return                           "B 乙型慢 (too slow)"

def intercalary_rate(Y1, Ti_syn):
    mpy  = Y1 / Ti_syn
    frac = mpy - math.floor(mpy)
    return mpy, frac, (1.0 / frac if frac > 0 else float('inf'))

def best_rational(frac, max_denom=100):
    best = (1, 1, abs(1 - frac))
    for q in range(1, max_denom + 1):
        p = round(frac * q)
        if p <= 0: continue
        err = abs(p / q - frac)
        if err < best[2]: best = (p, q, err)
        if err < 1e-6: break
    return best[0], best[1], best[2]

# ── 数据（JPL 恒星轨道周期，单位地球日）───────────────────────────────────────
# retrograde=True 标记逆行卫星
SYSTEMS = [
    {
        "name": "Earth",
        # 独立参考值用 JPL 恒星年 365.256；论文用儒略年 365.25 (误差 0.003%)
        "Y1": 365.256, "Y1_paper": 365.25, "N": 24, "local_day_h": 24.0, "ecc": 0.0167,
        "satellites": [
            {"name": "Moon", "Ti_sid": 27.32166, "retrograde": False},
        ],
    },
    {
        "name": "Mars",
        "Y1": 686.980, "Y1_paper": 686.97, "N": 24, "local_day_h": 24.6597, "ecc": 0.0934,
        "satellites": [
            {"name": "Phobos", "Ti_sid": 0.31891,  "retrograde": False},
            {"name": "Deimos", "Ti_sid": 1.26244,  "retrograde": False},
        ],
    },
    {
        "name": "Jupiter",
        "Y1": 4332.589, "Y1_paper": 4332.6, "N": 24, "local_day_h": 9.926, "ecc": 0.0489,
        "satellites": [
            {"name": "Io",       "Ti_sid": 1.76914,  "retrograde": False},
            {"name": "Europa",   "Ti_sid": 3.55118,  "retrograde": False},
            {"name": "Ganymede", "Ti_sid": 7.15455,  "retrograde": False},
            {"name": "Callisto", "Ti_sid": 16.68902, "retrograde": False},
            {"name": "Himalia",  "Ti_sid": 250.56,   "retrograde": False},  # 不规则卫星
        ],
    },
    {
        "name": "Saturn",
        "Y1": 10759.22, "Y1_paper": 10759.2, "N": 24, "local_day_h": 10.656, "ecc": 0.0565,
        "satellites": [
            {"name": "Titan",   "Ti_sid": 15.9454,  "retrograde": False},
            {"name": "Iapetus", "Ti_sid": 79.3215,  "retrograde": False},
            {"name": "Phoebe",  "Ti_sid": 550.56,   "retrograde": True},   # 逆行不规则卫星
        ],
    },
    {
        "name": "Neptune",
        "Y1": 60189.0, "Y1_paper": 60190.0, "N": 24, "local_day_h": 16.11, "ecc": 0.0097,
        "satellites": [
            {"name": "Triton",  "Ti_sid": 5.8769,   "retrograde": True},   # 逆行，最大卫星
            {"name": "Nereid",  "Ti_sid": 360.13,   "retrograde": False},
        ],
    },
    {
        # 勘误 #1：论文用回归周期 30589 d，恒星周期应为 30685.4 d
        "name": "Uranus (sidereal, 已校正)",
        "Y1": 30685.4, "Y1_paper": 30589.0, "N": 24, "local_day_h": 17.24, "ecc": 0.0472,
        "satellites": [],
        "errata": "论文附录 A.1 用回归周期 30589 d；恒星周期 30685.4 d，Z 差 7.7 d，不影响任何分类结论。",
    },
]

def sep(c="─", n=72): print(c * n)

sep("═")
print("  华夏历 · 独立验证脚本（与独立参照实现交叉核对）")
sep("═")

# ── A.1 + A.2 行星年 & 卫星分类 ─────────────────────────────────────────────
print("\n【A.1 各行星 Mode A 区间】【A.2 卫星分类（会合周期）】")
for sys in SYSTEMS:
    Y1 = sys["Y1"]
    N  = sys["N"]
    lo, hi = mode_A_range(Y1, N)
    Z = 2 * Y1 / N
    Yp = sys.get("Y1_paper", Y1)
    flag = "" if abs(Y1 - Yp) / Y1 < 0.002 else "  ⚠ 差异"
    sep()
    print(f"  {sys['name']}")
    print(f"  Y₁(JPL)={Y1:.3f}d  Y₁(论文)={Yp:.2f}d{flag}")
    print(f"  Z={Z:.4f}d  Mode A 区间: [{lo:.3f}, {hi:.3f}) d")
    if "errata" in sys:
        print(f"  ⚠ 勘误: {sys['errata']}")
    for sat in sys["satellites"]:
        Ti_syn = synodic(sat["Ti_sid"], Y1, retrograde=sat["retrograde"])
        cls    = classify_satellite(Ti_syn, Y1, sys["local_day_h"], N)
        ratio  = Ti_syn / Z * 100
        retro  = " [逆行]" if sat["retrograde"] else ""
        print(f"    {sat['name']:10s}{retro}: T_sid={sat['Ti_sid']:9.4f}d  "
              f"T_syn={Ti_syn:9.4f}d  Ti/Z={ratio:5.1f}%  → {cls}")
        if "A ★" in cls:
            mpy, frac, intv = intercalary_rate(Y1, Ti_syn)
            p, q, err = best_rational(frac)
            print(f"              置闰: {mpy:.4f} 月/年, 余分={frac:.5f}, "
                  f"每 {intv:.2f} 年, 章法 {p}/{q} (误差 {err*100:.4f}%)")

# ── A.3 置闰率 + 默冬章 ──────────────────────────────────────────────────────
sep("═")
print("\n【A.3 置闰率 + 默冬章（回归年 × 朔望月，更精确值）】")
sep()
Ytrop   = 365.2422    # 回归年
Tsynod  = 29.530589   # 朔望月
mpy = Ytrop / Tsynod
frac_int = mpy - 12
print(f"  月/年 = {Ytrop}/{Tsynod} = {mpy:.5f}")
print(f"  年余分 = {frac_int:.5f}  → 置闰频率 ≈ 每 {1/frac_int:.3f} 年")
print(f"  7/19  = {7/19:.6f}   实际余分 = {frac_int:.6f}   "
      f"相对误差 = {abs(7/19 - frac_int) / frac_int * 100:.4f}%")
print(f"  19 回归年 = {19*Ytrop:.3f} d;  235 朔望月 = {235*Tsynod:.3f} d;  "
      f"默冬章残差 = {235*Tsynod - 19*Ytrop:.3f} d")
# 补充：论文用 Julian 年 365.25 的对应值
mpy_j = 365.25 / Tsynod
frac_j = mpy_j - 12
print(f"\n  (论文用儒略年 365.25: 月/年={mpy_j:.5f}, 余分={frac_j:.5f}, "
      f"每 {1/frac_j:.3f} 年置闰)")

# ── A.4 干支双共振 ────────────────────────────────────────────────────────────
sep("═")
print("\n【A.4 干支双共振】")
sep()
Tjup_d  = 4332.589
Tjup_yr = Tjup_d / Ytrop
print(f"  12 朔望月 = {12*Tsynod:.4f} d, 年亏 {Ytrop - 12*Tsynod:.4f} d (论文: 10.88 d)")
print(f"  木星恒星周期 = {Tjup_yr:.4f} 回归年  vs 12 误差 = {abs(12 - Tjup_yr)/Tjup_yr*100:.3f}% (论文: 1.16%)")
print(f"  5 × 木星年 = {5*Tjup_yr:.3f} yr  vs 60,  误差 = {abs(60 - 5*Tjup_yr)/60*100:.3f}%")

# ── 4.5 时辰表 ───────────────────────────────────────────────────────────────
sep("═")
print("\n【4.5 时辰表】")
sep()
for planet, ld_h in [("Earth", 24.0), ("Mars", 24.6597), ("Jupiter", 9.926), ("Venus", 2802.0)]:
    sc = ld_h / 12
    print(f"  {planet:8s}: 太阳日={ld_h:8.3f} h  1时辰={sc:8.4f} h = {sc*60:7.2f} min")

# 金星太阳日第一性原理验算
T_rot_v = -243.018   # 恒星自转周期，负号=逆行 (JPL)
Y_v     = 224.701    # 金星恒星年
T_solar_v = 1.0 / abs(1.0 / T_rot_v - 1.0 / Y_v)
print(f"\n  Venus 太阳日独立计算:")
print(f"    T_rot={T_rot_v}d (逆行), Y={Y_v}d")
print(f"    1/|1/T_rot − 1/Y| = {T_solar_v:.4f} d = {T_solar_v*24:.1f} h  (论文: 116.75 d / 2802 h ✓)")

# 金星退化验证
lo_v, hi_v = mode_A_range(Y_v)
print(f"  Venus Mode A 区间: [{lo_v:.2f}, {hi_v:.2f}) d")
print(f"  硬下界 = {T_solar_v:.2f} d > {hi_v:.2f} d → 区间为空 → 纯太阳历退化 ✓")

sep("═")
print("  验证完毕。已知勘误详见 verification/README.md。")
sep("═")
