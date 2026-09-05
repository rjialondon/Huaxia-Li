// 公式层共享函数 — 单一来源，三个工具页共用。
// 改这里 = 三处同时改；请勿在组件内另开副本。

// 最优有理逼近：余分 frac ≈ p/q（章法），分母上限 maxDenom
export function bestRational(frac, maxDenom = 100) {
  if (!Number.isFinite(frac) || frac < 0 || frac > 1 || !Number.isSafeInteger(maxDenom) || maxDenom < 1 || maxDenom > 10000) {
    throw new RangeError('Expected a fraction in [0,1] and a denominator limit in [1,10000]');
  }
  let best = { p: 0, q: 1, err: frac };
  for (let q = 1; q <= maxDenom; q++) {
    const p = Math.round(frac * q);
    const err = Math.abs(p / q - frac);
    if (err < best.err) best = { p, q, err };
    if (err === 0) break;
  }
  return best;
}

// 同一批完整月的事件账；不决定年界、命月或置闰制度。
export function summarizeMonths(months) {
  let events = 0, emptyMonths = 0, extraEvents = 0;
  for (const { zqCount } of months) {
    if (!Number.isSafeInteger(zqCount) || zqCount < 0) throw new RangeError('Invalid event count');
    events += zqCount;
    emptyMonths += Number(zqCount === 0);
    extraEvents += Math.max(zqCount - 1, 0);
  }
  return { months: months.length, events, emptyMonths, extraEvents, netCount: months.length - events };
}

// 恒星周期 → 朔望周期（相对宿主恒星的会合周期）
// Tsid: 卫星绕行星的轨道周期(天); Y1: 行星年(天)
// 同向、共面、匀角速度近似，且限定 Tsid < Y1；不是一般三维月相解。
// 超出近似域不等于证明天体不存在；逆行需另行定义方向。
// 返回 Infinity 时调用方必须用 Number.isFinite 接住（显示 ∞ / 判为无效）。
export const toSynodic = (Tsid, Y1) =>
  (Number.isFinite(Tsid) && Number.isFinite(Y1) && Tsid > 0 && Y1 > 0 && Tsid < Y1)
    ? Tsid * (Y1 / (Y1 - Tsid)) : Infinity;

// 公历判据：公历是把地球参数硬编码进结构的纯太阳历，与卫星无关——
// 可工作 ⇔ 本地日计数年长 ≈ 365.2425（97/400闰日规则拟合的常数）。
// 容差 ±0.02 本地日/年（漂移 < 1日/50本地年），覆盖回归/恒星/儒略三种地球年口径。
export const GREGORIAN_YEAR = 365.2425;
export const GREGORIAN_TOL = 0.02;
export const gregorianWorks = (daysPerLocalYear, locked) =>
  !locked && daysPerLocalYear !== null && Number.isFinite(daysPerLocalYear) &&
  Math.abs(daysPerLocalYear - GREGORIAN_YEAR) < GREGORIAN_TOL;
