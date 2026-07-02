// 公式层共享函数 — 单一来源，三个工具页共用。
// 改这里 = 三处同时改；请勿在组件内另开副本。

// 最优有理逼近：余分 frac ≈ p/q（章法），分母上限 maxDenom
export function bestRational(frac, maxDenom = 100) {
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
// 受希尔球约束，受缚卫星必有 Tsid < Y1；护栏防异常输入除零/取负。
// 返回 Infinity 时调用方必须用 Number.isFinite 接住（显示 ∞ / 判为无效）。
export const toSynodic = (Tsid, Y1) =>
  (Tsid > 0 && Tsid < Y1) ? 1 / (1 / Tsid - 1 / Y1) : Infinity;

// 公历判据：公历是把地球参数硬编码进结构的纯太阳历，与卫星无关——
// 可工作 ⇔ 本地日计数年长 ≈ 365.2425（97/400闰日规则拟合的常数）。
// 容差 ±0.02 本地日/年（漂移 < 1日/50本地年），覆盖回归/恒星/儒略三种地球年口径。
export const GREGORIAN_YEAR = 365.2425;
export const GREGORIAN_TOL = 0.02;
export const gregorianWorks = (daysPerLocalYear, locked) =>
  !locked && daysPerLocalYear !== null && Number.isFinite(daysPerLocalYear) &&
  Math.abs(daysPerLocalYear - GREGORIAN_YEAR) < GREGORIAN_TOL;
