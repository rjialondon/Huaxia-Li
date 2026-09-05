import { bestRational, gregorianWorks, summarizeMonths } from "./数学.mjs";
import { assertParameters } from "./参数校验.mjs";
import { solarWindowLedger } from './窗口.mjs';
import { compareDayBoundaries } from './日界对照.mjs';

// ── FORMULA ENGINE ──
// Y1 和 Tᵢ 均以本地日为单位。localDay(小时) 仅用于推导时辰，可为 0。
export function compute(state) {
  assertParameters(state);
  const { Y1, localDay, ecc, locked, N, sats, stars, overlays, binaryPeriod } = state;
  const Z = (2 * Y1) / N;
  const lo = Y1 / N;
  const hi = Z;
  // 年比一转还短 → 退化（如潮汐锁定极端情况）
  const dayExceedsYear = Y1 < 1;
  const shichenValid = !locked && !dayExceedsYear && localDay > 0;
  const shichen = shichenValid ? localDay / 12 : null;

  const classified = sats.map((s, index) => {
    const Ti = s.Ti;
    let mode, label, color;
    // Ti < 1 本地日 = 亚昼夜，公转快于自转，不参与历法
    if (Ti < 1) { mode = "excluded"; label = "sub-diurnal"; color = "#6b7280"; }
    else if (Ti >= lo && Ti < hi) { mode = "A"; label = "intercalary"; color = "#10b981"; }
    else if (Ti < lo) { mode = "B"; label = "fast"; color = "#3b82f6"; }
    else { mode = "B"; label = "slow"; color = "#3b82f6"; }
    return { ...s, index, mode, label, color, cyclesPerYear: Y1 / Ti, ratioZ: Ti / Z };
  });

  const modeA = classified.filter(s => s.mode === "A");
  const modeB = classified.filter(s => s.mode === "B");
  const primary = state.primarySatellite == null ? (modeA[0] ?? null) : classified[state.primarySatellite];

  let intercalary = null;
  if (modeA.length > 0) {
    const mpy = Y1 / primary.Ti;
    const frac = mpy - Math.floor(mpy);
    intercalary = { monthsPerYear: mpy, fraction: frac, interval: frac > 0 ? 1 / frac : Infinity };
  }

  // 公历判据见 formula.js gregorianWorks（Y1 已是本地日计数年长）
  const gregWorks = gregorianWorks(Y1, locked);

  // Current rounding/ratio demonstrations; no claim of historical equivalence.
  const daysPerYear = (!locked && !dayExceedsYear) ? Y1 : null;
  const fracDay = daysPerYear !== null ? daysPerYear - Math.floor(daysPerYear) : null;
  const leapDay = (fracDay !== null && fracDay > 0.002 && fracDay < 0.998)
    ? { ...bestRational(fracDay), daysPerYear } : null;

  return { Z, lo, hi, shichen, shichenValid, classified, modeA, modeB, primary, intercalary, gregWorks, dayExceedsYear, leapDay };
}

// ── CALENDAR ENGINE ──
// Time within year [0, Y1) to reach k-th solar term out of N (k=0..N; k=N → Y1)
// 相位约定：第0节气锚定于近日点（θ 从近日点起算）。这是演示约定——
// 不以本演示的相位或窗口定义代替任何历史历法的岁首、年首及置闰规则。
export function keplerTermTime(k, N, ecc, Y1) {
  if (!Number.isSafeInteger(k) || k < 0 || k > 23040 ||
      !Number.isInteger(N) || N < 4 || N > 360 || N % 2 !== 0 ||
      !Number.isFinite(ecc) || ecc < 0 || ecc > .99 ||
      !Number.isFinite(Y1) || Y1 < .001 || Y1 > 1e9) {
    throw new RangeError('Unsupported Kepler demonstration parameters');
  }
  const yr = Math.floor(k / N);
  const kMod = k % N;
  if (kMod === 0) return yr * Y1;
  const theta = (2 * Math.PI / N) * kMod;
  const factor = Math.sqrt((1 - ecc) / (1 + ecc));
  let E = 2 * Math.atan(factor * Math.tan(theta / 2));
  if (E < 0) E += 2 * Math.PI;
  const M = E - ecc * Math.sin(E);
  return yr * Y1 + (M / (2 * Math.PI)) * Y1;
}

export function generateCalendar(state) {
  const r = compute(state);
  const { Y1, ecc, N, localDay } = state;
  // Y1 和 Tᵢ 已是本地日；无需 ldd 换算。localDay 仅用于换算注脚显示。
  const Z = r.Z;
  if (N < 2 || Y1 <= 0) return { type: "solar", terms: [], Y1, N, ecc, localDay };

  if (r.modeA.length === 0) {
    // 纯太阳历：N 节气，每段 Y1/N 本地日
    const termLen = Y1 / N;
    const terms = [];
    let cum = 0;
    for (let j = 1; j <= N; j++) {
      const t1 = ecc < 0.005 ? (j - 1) * termLen : keplerTermTime(j - 1, N, ecc, Y1);
      const t2 = ecc < 0.005 ? j * termLen : keplerTermTime(j, N, ecc, Y1);
      const len = t2 - t1;
      cum += len;
      terms.push({ j, start: t1, length: len, cumulative: cum, dayStart: Math.round(t1) + 1 });
    }
    // 岁余年表：同朔余算法，Y₁ 非整数 → round(k·Y₁)−round((k−1)·Y₁) → 大/小年交替
    // 出处：《四分历》岁余四分之一；地球=4年1闰，火星≈5年3闰，各星自推
    // 闰日位置：远日点（最长节气末尾）——余分在此积累，还于此处，同无中气置闰逻辑
    const aphTermIdx = terms.reduce((mi, t, i, a) => t.length > a[mi].length ? i : mi, 0);
    const aphTermNum = terms[aphTermIdx].j; // 远日点节气编号（1-based）
    const fracDay = Y1 - Math.floor(Y1);
    let solarYears = null;
    if (fracDay > 0.002 && fracDay < 0.998) {
      const numYrs = Math.min(bestRational(fracDay, 100).q, 60);
      const baseYear = Math.floor(Y1);
      const yrs = [];
      for (let k = 1; k <= numYrs; k++) {
        const days = Math.round(k * Y1) - Math.round((k - 1) * Y1);
        yrs.push({ y: k, days, isLeap: days > baseYear });
      }
      const leapCount = yrs.filter(y => y.isLeap).length;
      const totalDays = yrs.reduce((s, y) => s + y.days, 0);
      solarYears = { years: yrs, numYears: numYrs, leapCount, totalDays, aphTermNum };
    }
    return { type: "solar", terms, Y1, N, ecc, localDay, Z_local: Z, solarYears, aphTermNum };
  }

  const Ti = r.primary.Ti;
  if (Ti <= 0) return { type: "solar", terms: [], Y1, N, ecc };

  // Legacy finite display horizon from a fractional-ratio approximation.
  // Its denominator is not a proof of an intercalation cycle.
  const frac0 = (Y1 / Ti) - Math.floor(Y1 / Ti);
  const numYears = frac0 > 0.001 ? Math.min(bestRational(frac0, 100).q, 60) : 19;

  // Zhongqi: N/2 per year, interval Z = 2Y₁/N
  // Global j-th Zhongqi is at j*Z (mean), or Keplerian: yr*Y₁ + keplerTermTime(2*(j%halfN), N, ecc, Y₁)
  const halfN = Math.round(N / 2);
  const totalZQ = (numYears + 2) * halfN;
  const zqTimes = [];
  for (let j = 0; j <= totalZQ; j++) {
    if (ecc < 0.005) {
      zqTimes.push(j * Z);
    } else {
      const yr = Math.floor(j / halfN);
      const k = j % halfN;
      zqTimes.push(yr * Y1 + keplerTermTime(2 * k, N, ecc, Y1));
    }
  }

  // Generate month sequence with pointer sweep (O(n+m))
  const totalMonths = Math.ceil((numYears + 2) * Y1 / Ti) + 5;
  if (totalMonths > 25000 || totalZQ > 12000) throw new RangeError('Calculation budget exceeded');
  const allMonths = [];
  let zqCursor = 0;
  for (let k = 1; k <= totalMonths; k++) {
    const start = (k - 1) * Ti;
    const end = k * Ti;
    // 朔余离散化：Tᵢ 已是本地日，余分自然累积，大/小月整数交替——同《大衍历》朔余法
    const length = Math.round(k * Ti) - Math.round((k - 1) * Ti);
    while (zqCursor < zqTimes.length && zqTimes[zqCursor] < start) zqCursor++;
    let zqCount = 0, tmp = zqCursor;
    while (tmp < zqTimes.length && zqTimes[tmp] < end) { zqCount++; tmp++; }
    allMonths.push({ k, start, end, length, zqCount, isIntercalary: zqCount === 0 });
    if (start > (numYears + 1) * Y1) break;
  }

  // Legacy experimental grouping, NOT a certified historical/civil year boundary.
  const years = [];
  let yearMonths = [];
  let zqInYear = 0;
  for (const m of allMonths) {
    yearMonths.push(m);
    zqInYear += m.zqCount;
    if (zqInYear >= halfN) {
      let regNum = 0, prevReg = 0;
      const labeled = yearMonths.map(mo => {
        if (!mo.isIntercalary) { regNum++; prevReg = regNum; return { ...mo, num: regNum }; }
        return { ...mo, leapAfter: prevReg };
      });
      const totalDays = labeled.reduce((s, mo) => s + mo.length, 0);
      const leapMs = labeled.filter(mo => mo.isIntercalary);
      years.push({ y: years.length + 1, months: labeled, totalDays, hasLeap: leapMs.length > 0, leapAfter: leapMs[0]?.leapAfter ?? null });
      yearMonths = [];
      zqInYear = 0;
      if (years.length >= numYears) break;
    }
  }

  // 第1年详图：月份整数起始日 + 节气整数起始日，供 Cp = ΦA ⊕ ΦB 图解
  let year1detail = null;
  if (years.length > 0) {
    let d = 1;
    const y1months = years[0].months.map(m => {
      const mo = { ...m, dayStart: d };
      d += m.length;
      return mo;
    });
    const termStarts = Array.from({ length: N }, (_, idx) => {
      const t = ecc < 0.005 ? idx * (Y1 / N) : keplerTermTime(idx, N, ecc, Y1);
      return { j: idx + 1, day: Math.round(t) + 1 };
    });
    year1detail = { months: y1months, terms: termStarts, totalDays: years[0].totalDays };
  }

  const eventStats = summarizeMonths(years.flatMap(y => y.months));
  const totalLeap = eventStats.emptyMonths;
  const leapYears = years.filter(y => y.hasLeap).length;
  const totalDaysSum = years.reduce((s, y) => s + y.totalDays, 0); // 本地日
  const expectedDays = Math.round(numYears * Y1); // 本地日，Y1已是本地日
  const solarWindows = solarWindowLedger(allMonths, zqTimes, Y1, numYears);
  const dayBoundaryComparison = compareDayBoundaries(years.flatMap(y=>y.months), zqTimes);
  return { type: "lunisolar", years, totalLeap, leapYears, eventStats, numYears, solarWindows, dayBoundaryComparison, primary: r.primary,
           Ti, Ti_local: Ti, Z, Z_local: Z, Y1, Y1_local: Y1,
           localDay, totalDaysSum, expectedDays, year1detail };
}


export const BOUNDARIES = Object.freeze({ month: "[start,end)", integerDisplay: "Math.round; display only", group: "close after at least N/2 events; experimental", phase: "first solar term and mean new moon at t=0; perihelion", satellite: "explicit index when multiple Mode A satellites; automatic only for a unique candidate", solarModel: "mean below e=0.005, Kepler otherwise (legacy threshold)" });
