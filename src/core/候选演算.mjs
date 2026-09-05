import { bestRational, toSynodic } from './数学.mjs';
export const CANDIDATES = [
  {
    id: "kepler1625b", N: 24,
    host: "Kepler-1625 b",
    hostDesc: "类木气态巨行星，~10 MJ，半径≈Jupiter",
    star: "Kepler-1625 (类太阳G型恒星, 1.079 M☉)",
    distance: "8,000 ly",
    Y1: 287.38, // planet orbital period = stellar year
    moonName: "Kepler-1625 b I",
    moonDesc_zh: "海王星大小，~16 M⊕，距行星约40行星半径",
    moonDesc_en: "Neptune-sized, ~16 M⊕, at roughly 40 planetary radii from the planet",
    Ti_est: 19, // Teachey & Kipping 2018, Science Advances 4(10): eaav1784, DOI: 10.1126/sciadv.aav1784 — 卫星周期约束宽松, 中心估计 ~19 d (恒星周期)
    Ti_range: [13, 39], // 复核: Kipping et al. 2022, Nature Astronomy, DOI: 10.1038/s41550-021-01539-1
    TiIsSynodic: false,
    confirmed: false,
    status: "争议中",
    statusDetail_zh: "2018年Teachey & Kipping (HST)发现证据，2019年Kreidberg等独立分析未确认，2023年Heller等认为可能是假阳性。截至2025年仍未确认。",
    statusDetail_en: "Evidence reported by Teachey & Kipping (HST) in 2018; not recovered by Kreidberg et al.'s independent 2019 analysis; Heller et al. 2023 argue a possible false positive. Unconfirmed as of 2025.",
    source: "Teachey & Kipping 2018 (Science Advances), Kipping 2022",
    localDay: 10, // gas giant, assume fast rotation ~10h
    localDayAssumed: true,
  },
  {
    id: "kepler1708b", N: 24,
    host: "Kepler-1708 b",
    hostDesc: "类木气态巨行星，<4.6 MJ，半径≈0.89 RJ",
    star: "Kepler-1708 (类太阳恒星)",
    distance: "5,600 ly",
    Y1: 737.11, // planet orbital period
    moonName: "Kepler-1708 b I",
    moonDesc_zh: "约2.6倍地球半径，距行星约12行星半径",
    moonDesc_en: "About 2.6 Earth radii, at roughly 12 planetary radii from the planet",
    Ti_est: 4.6, // roughly estimated from orbital distance
    Ti_range: [2, 10], // approximate range
    TiIsSynodic: false,
    confirmed: false,
    status: "争议中",
    statusDetail_zh: "2022年Kipping等发现，2023年Heller & Hippke重新分析认为不太可能存在。",
    statusDetail_en: "Reported by Kipping et al. 2022; Heller & Hippke's 2023 reanalysis finds it unlikely to exist.",
    source: "Kipping et al. 2022 (Nature Astronomy)",
    localDay: 10,
    localDayAssumed: true,
  },
  {
    id: "hd206893b", N: 24,
    host: "HD 206893 B",
    hostDesc: "褐矮星/超木星，~20-28 MJ，半径≈1.25 RJ",
    star: "HD 206893 (F5V主序星, ~1.3 M☉)",
    distance: "133 ly",
    Y1: 25.6 * 365.25, // ~25.6 years in days = 9350 days
    moonName: "HD 206893 B I",
    moonDesc_zh: "极大质量，~0.4 MJ (≈9倍海王星质量)，距宿主约0.22 AU",
    moonDesc_en: "Very massive, ~0.4 MJ (≈9 Neptune masses), at ~0.22 AU from its host",
    Ti_est: 0.76 * 365.25, // ~0.76 years = ~277.6 days
    Ti_range: [200, 350], // approximate
    TiIsSynodic: false,
    confirmed: false,
    status: "初步信号",
    statusDetail_zh: "Kral等报告初步天体测量残差：若解释为卫星，周期约0.76年、质量约0.4木星质量；系统误差仍可能解释信号。预印本发表于2025年11月，期刊版2026年。",
    statusDetail_en: "Kral et al. report tentative residuals: if a moon, the period is about 0.76 yr and mass about 0.4 Jupiter masses. Systematics remain possible. Preprint: November 2025; journal: 2026.",
    source: "Kral et al. 2026 (A&A), VLTI/GRAVITY",
    localDay: 10,
    localDayAssumed: true,
  },
  // ── Hypothetical Earth-analogue for comparison ──
  {
    id: "earth_ref", N: 24,
    host_zh: "地球（参考基线）",
    host_en: "Earth (reference baseline)",
    hostDesc: "岩质行星，1 M⊕",
    star: "太阳 (G2V, 1.0 M☉)",
    distance: "0 ly",
    Y1: 365.25,
    moonName: "月球 Moon",
    moonDesc_zh: "0.0123 M⊕，距地球60.3地球半径",
    moonDesc_en: "0.0123 M⊕, at 60.3 Earth radii",
    Ti_est: 29.5306,
    Ti_range: [29.5306, 29.5306],
    TiIsSynodic: true,
    confirmed: true,
    status: "已确认",
    statusDetail_zh: "本页地球参考参数。Tᵢ/Z = 97%，位于甲型范围上界附近。",
    statusDetail_en: "Earth reference parameters on this page. Tᵢ/Z = 97%, near the Mode A upper bound.",
    source: "NASA JPL",
    localDay: 24,
  },
];

export function analyzeCandidate(c) {
  const Z = (2 * c.Y1) / c.N;
  const lo = c.Y1 / c.N;
  const hi = Z;
  const localDayDays = c.localDay / 24;

  const Tsyn = c.TiIsSynodic ? c.Ti_est : toSynodic(c.Ti_est, c.Y1);
  const TsynRange = c.Ti_range.map(t => c.TiIsSynodic ? t : toSynodic(t, c.Y1));

  const inModeA = Number.isFinite(Tsyn) && Tsyn >= localDayDays && Tsyn >= lo && Tsyn < hi;
  const tooFast = Tsyn < lo;
  const belowDay = Tsyn < localDayDays;
  const ratioZ = Tsyn / Z;
  // Infinity 哨兵（Tsid ≥ Y₁ 的异常输入）不得参与交集判定
  const rangeOverlapsA = Number.isFinite(TsynRange[0]) && Number.isFinite(TsynRange[1])
    && Math.max(TsynRange[0], lo, localDayDays) <= TsynRange[1] && Math.max(TsynRange[0], lo, localDayDays) < hi;
  const idealness = ratioZ;

  const daysPerYear = c.localDay > 0 ? c.Y1 / (c.localDay / 24) : null;
  const fracDay = daysPerYear !== null ? daysPerYear - Math.floor(daysPerYear) : null;
  const leapDay = (fracDay !== null && fracDay > 0.002 && fracDay < 0.998)
    ? { ...bestRational(fracDay), daysPerYear } : null;

  return { Z, lo, hi, inModeA, tooFast, belowDay, ratioZ, rangeOverlapsA, idealness, leapDay, Tsyn, TsynRange };
}
