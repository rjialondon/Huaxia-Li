import { useState, useMemo } from "react";

// =============================================
// i18n BILINGUAL SUPPORT
// =============================================
const T = {
  zh: {
    title: "华夏历 · 通用行星公式 · 跨星系交叉验证",
    subtitle: "真实天文数据验算",
    detailView: "逐系统验算",
    summaryView: "汇总矩阵",
    langToggle: "EN",
    params: "公式参数",
    stellarYear: "Y₁ 恒星年",
    zhongqiInterval: "Z 中气间隔",
    modeARange: "甲型范围",
    eccentricity: "离心率 e",
    localDay: "本地日",
    shichen: "时辰",
    binaryPeriod: "双星周期",
    multiStar: (m) => `多恒星层 Θ₁…Θ${m} (m=${m})`,
    primaryStar: "主恒星",
    companionStar: "伴星/乙型叠合",
    multiStarNote: "公式处理：Θ₁定义主恒星年和节气，Θ₂(伴星角位置)作为独立乙型叠合层运行。行星绕双星质心运行时，Θ应相对于质心定义。",
    satClass: "卫星分类 ΦA / ΦB",
    noSatLocked: "潮汐锁定行星通常无法维持稳定卫星轨道",
    noSatNone: "该行星无天然卫星",
    noSat: (locked) => `无已知卫星 (n=0) — ${locked ? "潮汐锁定行星通常无法维持稳定卫星轨道" : "该行星无天然卫星"}`,
    overlayBodies: "附加叠合体:",
    periodRatio: "周期比",
    localYears: "本地年",
    intercalary: "置闰验算",
    monthsPerYear: "月/年",
    intMonths: "整数月数",
    annualFrac: "年余分",
    intercalaryFreq: "置闰频率",
    perYear: "年",
    perLocalYear: "本地年",
    leapDayTitle: "岁余 · 置闰日",
    leapDayPerYear: "年长（本地日）",
    leapDayFrac: "岁余",
    leapDayCycle: (p, q) => `每 ${q} 年插 ${p} 个闰日`,
    zhangVerify: (p, q) => `最优章法 (${p}/${q})：`,
    error: "误差",
    keplerEffect: "开普勒效应",
    meanZ: "平均中气间隔",
    periVeloRatio: "近日点速度/远日点速度",
    zPeri: "近日点",
    zAph: "远日点",
    short: "短",
    long: "长",
    highEccNote: "⚠ 高离心率：节气间隔时间变化剧烈，置闰自动聚集于远日点。Dingqi (定气) 角度定义自动适应。",
    lowEccNote: "节气间隔有可检测的时间变化，置闰倾向聚集于远日点附近。",
    formulaOutput: "公式输出 Cp",
    huaxiaOutput: "华夏历输出",
    gregCompat: "公历：专为此参数设计，可工作 ✓",
    gregFail: "公历：结构崩溃 ✗ — 无法处理此行星参数",
    emptySet: "空集",
    summaryTitle: "交叉验证汇总",
    colSystem: "系统", colM: "m", colN: "n", colModeA: "甲型", colModeB: "乙型", colOutput: "输出", colGreg: "公历",
    tidallyLocked: "潮汐锁定",
    days: "天",
    hours: "h",
    earthYears: "地球年",
    earthDays: "天 (Earth days)",
    undefinedLocked: "未定义(锁定)",
    degenerate: "退化",
    overlaySource: "乙型叠合源",
    cyclesPerYear: "周期/年",
    luniSolar: "阴阳合历",
    pureSolar: "纯太阳历 (n=0)",
    solarPlus: (n) => `太阳历 + ${n}乙型计数轨`,
    modeAIntercalary: "置闰参与",
    modeBFast: "周期过快",
    modeBSlow: "周期过慢",
    subDiurnal: "亚昼夜排除",
    footer1: "数据来源：NASA JPL · NASA Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST",
    footer2: "论文：贾润章《华夏历》2026 · 公式 §4 交叉验证",
    cats: {
      "太阳系验证基线": "太阳系验证基线",
      "系外行星：潮汐锁定": "系外行星：潮汐锁定",
      "系外行星：最近邻": "系外行星：最近邻",
      "系外行星：环双星": "系外行星：环双星",
      "系外行星：2026新发现": "系外行星：2026新发现",
      "系外行星：极端参数": "系外行星：极端参数",
      "系外行星：宜居带": "系外行星：宜居带",
    },
  },
  en: {
    title: "Huaxia Calendar · Universal Planetary Formula · Cross-System Verification",
    subtitle: "Verified with real astronomical data",
    detailView: "Per-System",
    summaryView: "Summary Matrix",
    langToggle: "中文",
    params: "Formula Parameters",
    stellarYear: "Y₁ Stellar Year",
    zhongqiInterval: "Z Zhongqi Interval",
    modeARange: "Mode A Range",
    eccentricity: "Eccentricity e",
    localDay: "Local Day",
    shichen: "Shichen (时辰)",
    binaryPeriod: "Binary Period",
    multiStar: (m) => `Multi-Star Layer Θ₁…Θ${m} (m=${m})`,
    primaryStar: "Primary Star",
    companionStar: "Companion / Mode B Overlay",
    multiStarNote: "Formula: Θ₁ defines the primary stellar year and solar terms; Θ₂ (companion angular position) runs as an independent Mode B overlay. For circumbinary orbits, Θ is defined relative to the barycenter.",
    satClass: "Satellite Classification ΦA / ΦB",
    noSat: (locked) => `No known satellites (n=0) — ${locked ? "Tidally locked planets generally cannot sustain stable satellite orbits" : "This planet has no natural satellites"}`,
    overlayBodies: "Additional overlay bodies:",
    periodRatio: "Period ratio",
    localYears: "local years",
    intercalary: "Intercalary Verification",
    monthsPerYear: "months/year",
    intMonths: "Integer months",
    annualFrac: "Annual fraction",
    intercalaryFreq: "Intercalary frequency",
    perYear: "years",
    perLocalYear: "local years",
    leapDayTitle: "Day Surplus · Leap Day (岁余)",
    leapDayPerYear: "Year (local days)",
    leapDayFrac: "Day surplus (岁余)",
    leapDayCycle: (p, q) => `${p} leap day(s) per ${q} years`,
    zhangVerify: (p, q) => `Best Zhang Period (${p}/${q}):`,
    error: "Error",
    keplerEffect: "Keplerian Effect",
    meanZ: "Mean Zhongqi interval",
    periVeloRatio: "V(perihelion)/V(aphelion)",
    zPeri: "Perihelion",
    zAph: "Aphelion",
    short: "short",
    long: "long",
    highEccNote: "⚠ High eccentricity: solar term intervals vary dramatically; intercalary insertions cluster near aphelion automatically. Dingqi (true solar term) angular definition adapts without modification.",
    lowEccNote: "Solar term intervals show detectable variation; intercalary insertions tend to cluster near aphelion.",
    formulaOutput: "Formula Output Cp",
    huaxiaOutput: "Huaxia Li Output",
    gregCompat: "Gregorian: Designed for these parameters, works ✓",
    gregFail: "Gregorian: Structural collapse ✗ — Cannot handle these planetary parameters",
    emptySet: "∅ empty",
    summaryTitle: "Cross-Verification Summary",
    colSystem: "System", colM: "m", colN: "n", colModeA: "Mode A", colModeB: "Mode B", colOutput: "Output", colGreg: "Greg.",
    tidallyLocked: "Tidally Locked",
    days: "days",
    hours: "h",
    earthYears: "Earth years",
    earthDays: "days (Earth days)",
    undefinedLocked: "Undefined (locked)",
    degenerate: "Degenerate",
    overlaySource: "Mode B overlay source",
    cyclesPerYear: "cycles/yr",
    luniSolar: "Lunisolar Calendar",
    pureSolar: "Pure Solar (n=0)",
    solarPlus: (n) => `Solar + ${n} Mode B tracks`,
    modeAIntercalary: "Intercalary-eligible",
    modeBFast: "Too fast",
    modeBSlow: "Too slow",
    subDiurnal: "Sub-diurnal excluded",
    footer1: "Data: NASA JPL · NASA Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST",
    footer2: "Paper: Jia Runzhang, Huaxia Li (2026) · Formula §4 Cross-Verification",
    cats: {
      "太阳系验证基线": "Solar System Baseline",
      "系外行星：潮汐锁定": "Exoplanets: Tidally Locked",
      "系外行星：最近邻": "Exoplanets: Nearest",
      "系外行星：环双星": "Exoplanets: Circumbinary",
      "系外行星：2026新发现": "Exoplanets: 2026 Discovery",
      "系外行星：极端参数": "Exoplanets: Extreme Parameters",
      "系外行星：宜居带": "Exoplanets: Habitable Zone",
    },
  },
};

// =============================================
// DATA — bilingual notes
// =============================================

// For names like "地球 Earth": zh→first word, en→rest. Pure-English names: first word for brevity.
function sysDisplayName(name, lang, full = false) {
  const firstIsChinese = /[一-鿿]/.test(name[0]);
  if (firstIsChinese) {
    const parts = name.split(" ");
    if (lang === "zh") return full ? name : parts[0];
    return parts.slice(1).join(" ") || name;
  }
  return full ? name : name.split(" ")[0];
}

const SYSTEMS = [
  {
    id: "earth", category: "太阳系验证基线", name: "地球 Earth", emoji: "🌍", distance: "0 ly",
    source: "NASA JPL Planetary Fact Sheets", m: 1, N: 24,
    stars: [{ name: "太阳 Sun", mass: 1.0 }],
    Y1: 365.25, localDay: 24.0, eccentricity: 0.0167, tidallyLocked: false,
    satellites: [{ name: "月球 Moon", Ti: 29.5306, TiIsSynodic: true }],
    overlays: [{ name: "木星 Jupiter (岁星)", period_years: 11.862 }],
    notes_zh: "论文基线案例 (m=1, n=1)。月球满足甲型条件，木星提供乙型年度叠合。",
    notes_en: "Paper baseline case (m=1, n=1). Moon satisfies Mode A; Jupiter provides Mode B annual overlay.",
  },
  {
    id: "mars", category: "太阳系验证基线", name: "火星 Mars", emoji: "🔴", distance: "0 ly",
    source: "NASA JPL", m: 1, N: 24, stars: [{ name: "太阳 Sun", mass: 1.0 }],
    Y1: 686.97, localDay: 24.66, eccentricity: 0.0934, tidallyLocked: false,
    satellites: [{ name: "火卫一 Phobos", Ti: 0.319, TiIsSynodic: false }, { name: "火卫二 Deimos", Ti: 1.26, TiIsSynodic: false }],
    overlays: [],
    notes_zh: "高离心率测试。两颗卫星均低于甲型下限，公式正确输出纯太阳历。",
    notes_en: "High-eccentricity test. Both satellites below Mode A threshold; formula correctly outputs pure solar calendar.",
  },
  {
    id: "jupiter", category: "太阳系验证基线", name: "木星 Jupiter", emoji: "🟠", distance: "0 ly",
    source: "NASA JPL", m: 1, N: 24, stars: [{ name: "太阳 Sun", mass: 1.0 }],
    Y1: 4332.6, localDay: 9.93, eccentricity: 0.0489, tidallyLocked: false,
    satellites: [
      { name: "木卫一 Io", Ti: 1.769, TiIsSynodic: false }, { name: "木卫二 Europa", Ti: 3.551, TiIsSynodic: false },
      { name: "木卫三 Ganymede", Ti: 7.155, TiIsSynodic: false }, { name: "木卫四 Callisto", Ti: 16.689, TiIsSynodic: false },
    ],
    overlays: [],
    notes_zh: "多卫星乙型叠合测试。四颗伽利略卫星全部周期过快，输出太阳层+4条计数轨。",
    notes_en: "Multi-satellite Mode B test. All four Galilean moons too fast for Mode A; outputs solar layer + 4 counting tracks.",
  },
  {
    id: "venus", category: "太阳系验证基线", name: "金星 Venus", emoji: "🌕", distance: "0 ly",
    source: "NASA JPL", m: 1, N: 24, stars: [{ name: "太阳 Sun", mass: 1.0 }],
    Y1: 224.7, localDay: 2802, eccentricity: 0.0068, tidallyLocked: false,
    satellites: [], overlays: [],
    notes_zh: "极端退化测试：逆行超慢自转，本地日 > 恒星年，无卫星。公式输出最极端纯太阳历。",
    notes_en: "Extreme degenerate test: retrograde ultra-slow rotation, local day > stellar year, no satellites. Formula outputs most extreme pure solar calendar.",
  },
  {
    id: "trappist1e", category: "系外行星：潮汐锁定", name: "TRAPPIST-1 e", emoji: "🔵", distance: "40.7 ly",
    source: "NASA Spitzer/JWST, Agol et al. 2021", m: 1, N: 24,
    stars: [{ name: "TRAPPIST-1 (M8V)", mass: 0.089 }],
    Y1: 6.101, localDay: 6.101 * 24, eccentricity: 0.005, tidallyLocked: true,
    satellites: [],
    overlays: [
      { name: "TRAPPIST-1 d", period_years: 4.05 / 6.101 },
      { name: "TRAPPIST-1 f", period_years: 9.207 / 6.101 },
    ],
    notes_zh: "宜居带潮汐锁定行星。'年'仅6.1地球日。本地日=恒星年→时辰层退化。无卫星。",
    notes_en: "Habitable-zone tidally locked planet. 'Year' is only 6.1 Earth days. Local day = stellar year → Shichen layer degenerates. No satellites.",
  },
  {
    id: "trappist1f", category: "系外行星：潮汐锁定", name: "TRAPPIST-1 f", emoji: "🔵", distance: "40.7 ly",
    source: "NASA Spitzer/JWST, Agol et al. 2021", m: 1, N: 24,
    stars: [{ name: "TRAPPIST-1 (M8V)", mass: 0.089 }],
    Y1: 9.207, localDay: 9.207 * 24, eccentricity: 0.01, tidallyLocked: true,
    satellites: [],
    overlays: [
      { name: "TRAPPIST-1 e", period_years: 6.101 / 9.207 },
      { name: "TRAPPIST-1 g", period_years: 12.354 / 9.207 },
    ],
    notes_zh: "宜居带超地球。潮汐锁定，恒星固定于天空。无昼夜循环，时辰未定义。",
    notes_en: "Habitable-zone super-Earth. Tidally locked; star fixed in sky. No diurnal cycle; Shichen undefined.",
  },
  {
    id: "proximab", category: "系外行星：最近邻", name: "Proxima Centauri b", emoji: "🟤", distance: "4.24 ly",
    source: "ESO HARPS, Anglada-Escudé et al. 2016", m: 1, N: 24,
    stars: [{ name: "Proxima Centauri (M5.5V)", mass: 0.122 }],
    Y1: 11.186, localDay: 11.186 * 24, eccentricity: 0.02, tidallyLocked: true,
    satellites: [],
    overlays: [{ name: "Alpha Centauri AB", period_years: 550000 * 365.25 / 11.186 }],
    notes_zh: "距太阳最近系外行星。很可能潮汐锁定。无已知卫星。Alpha Cen AB在~13000 AU处，理论上构成m=2但周期极长。",
    notes_en: "Nearest exoplanet to the Sun. Likely tidally locked. No known satellites. Alpha Cen AB at ~13,000 AU theoretically constitutes m=2 but with an extremely long period.",
  },
  {
    id: "kepler16b", category: "系外行星：环双星", name: "Kepler-16b", emoji: "🪐", distance: "245 ly",
    source: "NASA Kepler, Doyle et al. 2011", m: 2, N: 24,
    stars: [{ name: "Kepler-16A (K, 0.69M☉)", mass: 0.69 }, { name: "Kepler-16B (M, 0.20M☉)", mass: 0.20 }],
    Y1: 228.776, localDay: 24, eccentricity: 0.0069, tidallyLocked: false,
    binaryPeriod: 41.08,
    satellites: [],
    overlays: [{ name: "Binary mutual orbit", period_years: 41.08 / 228.776 }],
    notes_zh: "首颗确认的环双星行星（'塔图因'）。m=2验证案例！双星互绕周期41天构成天然乙型叠合。",
    notes_en: "First confirmed circumbinary planet ('Tatooine'). m=2 test case! Binary mutual orbit of 41 days forms a natural Mode B overlay.",
  },
  {
    id: "toi5624e", category: "系外行星：2026新发现", name: "TOI-5624 e", emoji: "⭐", distance: "331 ly",
    source: "TESS, Bonfils et al. April 2026", m: 1, N: 24,
    stars: [{ name: "TOI-5624 (Sun-like)", mass: 0.87 }],
    Y1: 21.49, localDay: 21.49 * 24, eccentricity: 0.0, tidallyLocked: true,
    satellites: [],
    overlays: [{ name: "TOI-5624 f", period_years: 45.37 / 21.49 }],
    notes_zh: "2026年4月发现的亚海王星。5行星系统中第4颗。轨道周期21.5天。",
    notes_en: "Sub-Neptune discovered April 2026. 4th planet in a 5-planet system. Orbital period 21.5 days.",
  },
  {
    id: "bcentaurib", category: "系外行星：极端参数", name: "b Centauri (AB) b", emoji: "💫", distance: "325 ly",
    source: "ESO SPHERE VLT, Janson et al. 2021", m: 2, N: 24,
    stars: [{ name: "b Cen A (B3V, ~6M☉)", mass: 6.0 }, { name: "b Cen B (~4M☉)", mass: 4.0 }],
    Y1: 7170 * 365.25, localDay: 10, localDayAssumed: true, eccentricity: 0.4, tidallyLocked: false,
    satellites: [], overlays: [],
    notes_zh: "极端参数压力测试：超木星(10.9 MJ)绕双星运行，周期~7170年，离心率0.4。",
    notes_en: "Extreme parameter stress test: super-Jupiter (10.9 MJ) orbiting binary, period ~7,170 years, eccentricity 0.4.",
  },
  {
    id: "gj536c", category: "系外行星：宜居带", name: "Gliese 536 c", emoji: "🟢", distance: "32.7 ly",
    source: "HARPS, 2025", m: 1, N: 24,
    stars: [{ name: "GJ 536 (M1V)", mass: 0.52 }],
    Y1: 32.76, localDay: 32.76 * 24, eccentricity: 0.0, tidallyLocked: true,
    satellites: [], overlays: [],
    notes_zh: "近距红矮星宜居带行星。平衡温度~290K（与地球相当）。很可能潮汐锁定。",
    notes_en: "Nearby M-dwarf habitable zone planet. Equilibrium temp ~290K (Earth-like). Likely tidally locked.",
  },
];

// ── HELPERS ──
function bestRational(frac, maxDenom = 100) {
  let best = { p: 1, q: 1, err: Math.abs(1 - frac) };
  for (let q = 1; q <= maxDenom; q++) {
    const p = Math.round(frac * q);
    if (p <= 0) continue;
    const err = Math.abs(p / q - frac);
    if (err < best.err) best = { p, q, err };
    if (err < 1e-6) break;
  }
  return best;
}

// 恒星周期 → 朔望周期（相对宿主恒星的会合周期）
// Tsid: 卫星绕行星的轨道周期(天); Y1: 行星年(天)
const toSynodic = (Tsid, Y1) => 1 / (1 / Tsid - 1 / Y1);

// ── FORMULA ENGINE ──
function classify(Ti, Y1, localDayHours, lang, N) {
  const t = T[lang];
  const localDayDays = localDayHours / 24;
  const lo = Y1 / N;
  const hi = (2 * Y1) / N;
  if (Ti < localDayDays) return { mode: "∅", label: t.subDiurnal, color: "#6b7280", reason: `Tᵢ(${Ti.toFixed(3)}d) < ${lang==="zh"?"本地日":"local day"}(${localDayDays.toFixed(2)}d)` };
  if (Ti >= lo && Ti < hi) return { mode: lang==="zh"?"甲型A":"Mode A", label: t.modeAIntercalary, color: "#10b981", reason: `${lo.toFixed(2)} ≤ ${Ti.toFixed(3)} < ${hi.toFixed(2)}` };
  if (Ti < lo) return { mode: lang==="zh"?"乙型B":"Mode B", label: t.modeBFast, color: "#3b82f6", reason: `Tᵢ(${Ti.toFixed(3)}d) < ${lang==="zh"?"下限":"lower"}(${lo.toFixed(2)}d)` };
  return { mode: lang==="zh"?"乙型B":"Mode B", label: t.modeBSlow, color: "#3b82f6", reason: `Tᵢ(${Ti.toFixed(3)}d) ≥ ${lang==="zh"?"上限":"upper"}(${hi.toFixed(2)}d)` };
}

function analyze(sys, lang) {
  const t = T[lang];
  const Z = (2 * sys.Y1) / sys.N;
  const lo = sys.Y1 / sys.N;
  const hi = Z;
  const isLocked = sys.tidallyLocked;
  const dayExceedsYear = sys.localDay > sys.Y1 * 24;
  const shichenValid = !isLocked && !dayExceedsYear;
  const shichen = shichenValid ? sys.localDay / 12 : null;

  const sats = sys.satellites.map((s) => {
    const Tsyn = s.TiIsSynodic ? s.Ti : toSynodic(s.Ti, sys.Y1);
    const cls = classify(Tsyn, sys.Y1, sys.localDay, lang, sys.N);
    return { ...s, ...cls, Ti: Tsyn, Ti_sidereal: s.Ti, cyclesPerYear: sys.Y1 / Tsyn, ratioZ: Tsyn / Z };
  });

  const modeA = sats.filter((s) => s.color === "#10b981");
  const modeB = sats.filter((s) => s.color === "#3b82f6");

  let intercalary = null;
  if (modeA.length > 0) {
    const sat = modeA[0];
    const mpy = sys.Y1 / sat.Ti;
    const frac = mpy - Math.floor(mpy);
    intercalary = { monthsPerYear: mpy, fraction: frac, intervalYears: frac > 0 ? 1 / frac : Infinity };
  }

  let formulaOutput;
  if (modeA.length > 0) formulaOutput = { type: t.luniSolar, icon: "✓", color: "#10b981" };
  else if (sys.satellites.length === 0) formulaOutput = { type: t.pureSolar, icon: "→", color: "#f59e0b" };
  else formulaOutput = { type: t.solarPlus(modeB.length), icon: "→", color: "#3b82f6" };

  const gregWorks = sys.m === 1 && sys.satellites.length === 1 && modeA.length === 1 && !isLocked;

  // 岁余（三余之一）：同《四分历》「岁余四分之一」逻辑，适用任意行星
  const daysPerYear = (!isLocked && !dayExceedsYear && sys.localDay > 0)
    ? sys.Y1 / (sys.localDay / 24) : null;
  const fracDay = daysPerYear !== null ? daysPerYear - Math.floor(daysPerYear) : null;
  const leapDay = (fracDay !== null && fracDay > 0.002 && fracDay < 0.998)
    ? { ...bestRational(fracDay), daysPerYear } : null;

  return { Z, lo, hi, sats, modeA, modeB, intercalary, formulaOutput, gregWorks, shichen, shichenValid, isLocked, dayExceedsYear, leapDay };
}

// ── UI ──
function Badge({ text, color }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: color + "20", color, fontFamily: "var(--mono)" }}>{text}</span>;
}
function Cell({ label, value, sub }) {
  return (
    <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--dim2)" }}>{sub}</div>}
    </div>
  );
}

function Detail({ sys, lang }) {
  const t = T[lang];
  const a = analyze(sys, lang);
  const notes = lang === "zh" ? sys.notes_zh : sys.notes_en;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{sys.emoji} {sysDisplayName(sys.name, lang, true)}</div>
            <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 4 }}>{sys.distance} · {sys.source}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge text={`m=${sys.m}`} color="#c9a44a" />
            <Badge text={`n=${sys.satellites.length}`} color="#8b5cf6" />
            {a.isLocked && <Badge text={t.tidallyLocked} color="#ef4444" />}
            {sys.eccentricity > 0.1 && <Badge text={`e=${sys.eccentricity}`} color="#f97316" />}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 10, lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 10 }}>{notes}</div>
      </div>

      {/* Parameters */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.params}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          <Cell label={t.stellarYear} value={sys.Y1 >= 1000 ? `${(sys.Y1/365.25).toFixed(1)} ${t.earthYears}` : `${sys.Y1.toFixed(3)} ${t.days}`} sub={sys.Y1 >= 1000 ? `${sys.Y1.toLocaleString()} ${t.days}` : null} />
          <Cell label={t.zhongqiInterval} value={`${a.Z.toFixed(4)} ${t.days}`} />
          <Cell label={t.modeARange} value={`${a.lo.toFixed(3)} – ${a.hi.toFixed(3)}`} sub={t.earthDays} />
          <Cell label={t.eccentricity} value={sys.eccentricity} />
          <Cell label={t.localDay} value={sys.localDay < 48 ? `${sys.localDay.toFixed(2)} ${t.hours}` : `${(sys.localDay/24).toFixed(1)} ${t.days}`} sub={sys.localDayAssumed ? (lang === "zh" ? "假设值 / assumed" : "assumed value") : null} />
          <Cell label={t.shichen} value={a.shichenValid ? `${a.shichen.toFixed(2)} ${t.hours}` : a.isLocked ? t.undefinedLocked : t.degenerate} />
          {sys.m >= 2 && sys.binaryPeriod && <Cell label={t.binaryPeriod} value={`${sys.binaryPeriod.toFixed(2)} ${t.days}`} sub={t.overlaySource} />}
          <Cell label="N" value={sys.N} sub={
            a.modeA.length > 0
              ? (lang === "zh" ? "推导自 Y₁/Tᵢ" : "derived from Y₁/Tᵢ")
              : (lang === "zh" ? "约定 (无甲型卫星)" : "convention (no Mode A sat.)")
          } />
        </div>
      </div>

      {/* Multi-star */}
      {sys.m >= 2 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#f59e0b", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.multiStar(sys.m)}</div>
          {sys.stars.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--cell)", borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${i === 0 ? "#f59e0b" : "#a78bfa"}` }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Θ{i+1}: {s.name}</span>
              <span style={{ fontSize: 11, color: "var(--dim2)", fontFamily: "var(--mono)" }}>{s.mass}M☉</span>
              <Badge text={i === 0 ? t.primaryStar : t.companionStar} color={i === 0 ? "#f59e0b" : "#a78bfa"} />
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 8, lineHeight: 1.6 }}>{t.multiStarNote}</div>
        </div>
      )}

      {/* Satellite classification */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.satClass}</div>
        {a.sats.length === 0 ? (
          <div style={{ color: "var(--dim2)", fontSize: 13, padding: "10px 0" }}>{t.noSat(a.isLocked)}</div>
        ) : (
          a.sats.map((s, i) => (
            <div key={i} style={{ background: "var(--cell)", borderRadius: 8, padding: "10px 14px", borderLeft: `4px solid ${s.color}`, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                <Badge text={`${s.mode} ${s.label}`} color={s.color} />
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--dim2)", marginTop: 4 }}>
                Tᵢ={s.Ti}d · {s.cyclesPerYear.toFixed(1)} {t.cyclesPerYear} · Tᵢ/Z={(s.ratioZ * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{s.reason}</div>
            </div>
          ))
        )}
        {sys.overlays?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontFamily: "var(--mono)", marginBottom: 6 }}>{t.overlayBodies}</div>
            {sys.overlays.map((ov, i) => (
              <div key={i} style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px", borderLeft: "4px solid #8b5cf6", marginBottom: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{ov.name}</span>
                <span style={{ fontFamily: "var(--mono)", color: "var(--dim2)", marginLeft: 8 }}>{t.periodRatio} ≈ {ov.period_years.toFixed(4)}{ov.period_years < 100 ? ` ${t.localYears}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intercalary */}
      {a.intercalary && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#10b981", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.intercalary}</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", lineHeight: 2, color: "var(--fg)" }}>
            <div>Y₁/Tᵢ = {a.intercalary.monthsPerYear.toFixed(4)} {t.monthsPerYear}</div>
            <div>{t.annualFrac} = {a.intercalary.fraction.toFixed(4)}</div>
            <div>{t.intercalaryFreq} ≈ 1/{a.intercalary.intervalYears.toFixed(2)} {sys.id === "earth" ? t.perYear : t.perLocalYear}</div>
            {(() => {
              const br = bestRational(a.intercalary.fraction);
              return (
                <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  <b>{t.zhangVerify(br.p, br.q)}</b> {br.p}/{br.q} = {(br.p/br.q).toFixed(5)} vs {a.intercalary.fraction.toFixed(5)} → {t.error} = {(Math.abs(br.p/br.q - a.intercalary.fraction)/a.intercalary.fraction*100).toFixed(3)}%
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 岁余·置闰日 */}
      {a.leapDay && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#f59e0b", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.leapDayTitle}</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", lineHeight: 2, color: "var(--fg)" }}>
            <div>{t.leapDayPerYear} = {Math.floor(a.leapDay.daysPerYear)} + {(a.leapDay.daysPerYear - Math.floor(a.leapDay.daysPerYear)).toFixed(4)}</div>
            <div>{t.leapDayFrac} = {(a.leapDay.daysPerYear - Math.floor(a.leapDay.daysPerYear)).toFixed(4)} → {a.leapDay.p}/{a.leapDay.q}</div>
            <div style={{ color: "#f59e0b", fontWeight: 600 }}>{t.leapDayCycle(a.leapDay.p, a.leapDay.q)}</div>
          </div>
        </div>
      )}

      {/* Keplerian effect */}
      {sys.eccentricity > 0.05 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#f97316", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.keplerEffect} · e={sys.eccentricity}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg)", lineHeight: 1.8 }}>
            {(() => {
              const e = sys.eccentricity;
              const vRatio = (1+e)/(1-e);
              const zMin = a.Z * (1-e)*(1-e) / Math.sqrt(1-e*e);
              const zMax = a.Z * (1+e)*(1+e) / Math.sqrt(1-e*e);
              return <>
                <div>{t.meanZ} Z̄ = {a.Z.toFixed(3)} {t.days}</div>
                <div>{t.periVeloRatio} ≈ {Math.sqrt(vRatio).toFixed(3)}</div>
                <div>Z({t.zPeri}) ≈ {zMin.toFixed(2)}d ({t.short}) · Z({t.zAph}) ≈ {zMax.toFixed(2)}d ({t.long})</div>
                <div style={{ color: "var(--dim2)", marginTop: 4 }}>{e > 0.2 ? t.highEccNote : t.lowEccNote}</div>
              </>;
            })()}
          </div>
        </div>
      )}

      {/* Formula output */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.formulaOutput}</div>
        <div style={{ background: "var(--cell)", borderRadius: 8, padding: 14, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 2.0 }}>
          <div style={{ color: "var(--dim2)", fontSize: 11 }}>C<sub>p</sub> = Φ<sub>A</sub>(Θ₁, {"{Ψᵢ∈A}"}) ⊕ Φ<sub>B</sub>(Θ₁…Θ<sub>{sys.m}</sub>, {"{Ψᵢ∈B}"})</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: "#10b981" }}>Φ<sub>A</sub>: </span>
            {a.modeA.length > 0 ? a.modeA.map(s=>s.name).join(", ") + " ✓" : t.emptySet}
          </div>
          <div>
            <span style={{ color: "#3b82f6" }}>Φ<sub>B</sub>: </span>
            {a.modeB.length > 0 || sys.overlays?.length > 0
              ? [...a.modeB.map(s=>s.name), ...(sys.overlays||[]).map(o=>o.name)].join(", ")
              : t.emptySet}
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: a.formulaOutput.color + "15", color: a.formulaOutput.color, fontWeight: 600 }}>
            {a.formulaOutput.icon} {t.huaxiaOutput}: {a.formulaOutput.type}
          </div>
          <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: 6, background: a.gregWorks ? "#10b98115" : "#ef444415", color: a.gregWorks ? "#10b981" : "#ef4444" }}>
            {a.gregWorks ? t.gregCompat : t.gregFail}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTable({ systems, lang }) {
  const t = T[lang];
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", overflowX: "auto" }}>
      <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.summaryTitle}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--mono)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {[t.colSystem, t.colM, t.colN, t.colModeA, t.colModeB, t.colOutput, t.colGreg].map(h => (
              <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--dim2)", fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {systems.map(sys => {
            const a = analyze(sys, lang);
            return (
              <tr key={sys.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "6px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{sys.emoji} {sysDisplayName(sys.name, lang)}</td>
                <td style={{ padding: "6px 8px" }}>{sys.m}</td>
                <td style={{ padding: "6px 8px" }}>{sys.satellites.length}</td>
                <td style={{ padding: "6px 8px", color: a.modeA.length > 0 ? "#10b981" : "var(--dim)" }}>{a.modeA.length > 0 ? a.modeA.length + " ✓" : "—"}</td>
                <td style={{ padding: "6px 8px", color: a.modeB.length > 0 ? "#3b82f6" : "var(--dim)" }}>{a.modeB.length > 0 ? a.modeB.length : "—"}</td>
                <td style={{ padding: "6px 8px", color: a.formulaOutput.color, whiteSpace: "nowrap" }}>{a.formulaOutput.type}</td>
                <td style={{ padding: "6px 8px", color: a.gregWorks ? "#10b981" : "#ef4444" }}>{a.gregWorks ? "✓" : "✗"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CrossVerification({ lang }) {
  const [selected, setSelected] = useState("earth");
  const [view, setView] = useState("detail");
  const t = T[lang];

  const categories = useMemo(() => {
    const map = new Map();
    SYSTEMS.forEach(s => {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category).push(s);
    });
    return map;
  }, []);

  const current = SYSTEMS.find(s => s.id === selected);

  return (
    <div style={{
      "--bg": "#090b10", "--card": "#11141c", "--cell": "#181c28", "--border": "#222838",
      "--fg": "#e4e7ef", "--dim": "#7b8298", "--dim2": "#9299af", "--accent": "#d4a843",
      "--body": "'Noto Serif SC', Georgia, serif",
      "--mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      fontFamily: "var(--body)", background: "var(--bg)", color: "var(--fg)",
      minHeight: "100vh", padding: "20px 12px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: lang === "zh" ? 4 : 1, fontFamily: "var(--mono)", marginBottom: 6 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
            C<sub>p</sub> = Φ<sub>A</sub>(Θ₁,{"{Ψ∈A}"}) ⊕ Φ<sub>B</sub>(Θ₁…Θ<sub>m</sub>,{"{Ψ∈B}"}) · {t.subtitle}
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {[["detail", t.detailView], ["summary", t.summaryView]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "var(--accent)" : "var(--card)",
              color: view === v ? "#090b10" : "var(--dim)",
              border: `1px solid ${view === v ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8, padding: "6px 16px", cursor: "pointer",
              fontFamily: "var(--body)", fontSize: 13, fontWeight: view === v ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>

        {view === "summary" ? (
          <SummaryTable systems={SYSTEMS} lang={lang} />
        ) : (
          <div style={{ display: "flex", gap: 16, alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {[...categories.entries()].map(([cat, syss]) => (
                <div key={cat}>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", letterSpacing: 1, padding: "10px 4px 4px", textTransform: "uppercase" }}>
                    {t.cats[cat] || cat}
                  </div>
                  {syss.map(s => (
                    <button key={s.id} onClick={() => setSelected(s.id)} style={{
                      background: selected === s.id ? "var(--accent)" : "var(--card)",
                      color: selected === s.id ? "#0a0c10" : "var(--fg)",
                      border: `1px solid ${selected === s.id ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                      fontFamily: "var(--body)", fontSize: 13, textAlign: "left",
                      transition: "all 0.15s", width: "100%", opacity: selected === s.id ? 1 : 0.85,
                    }}>
                      <div style={{ fontWeight: 600 }}>{s.emoji} {sysDisplayName(s.name, lang)}</div>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>m={s.m} n={s.satellites.length} · {s.distance}</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              {current && <Detail sys={current} lang={lang} />}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10, color: "var(--dim)", marginTop: 24, fontFamily: "var(--mono)", lineHeight: 1.7 }}>
          {t.footer1}<br />{t.footer2}
        </div>
      </div>
    </div>
  );
}
