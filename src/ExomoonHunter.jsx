import { useState, useMemo } from "react";

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

const T = {
  zh: {
    header: "华夏历 · 甲型系外卫星猎手",
    subtitle: "在已知系外卫星候选体中搜索满足置闰条件 Y₁/N ≤ Tᵢ < 2Y₁/N 的甲型实例",
    summaryLabel: "/ {0} 满足甲型",
    confirmed: (n) => n > 0 ? `其中 ${n} 已确认` : "",
    candidates: (n) => n > 0 ? `${n} 候选` : "",
    maybeLabel: (n) => n > 0 ? `· ${n} 个在不确定性范围内可能甲型` : "",
    isModeA: "✓ 甲型！",
    maybeA: "⚠ 范围可能甲型",
    notA: "✗ 非甲型",
    gaugeLabel: "Tᵢ 在甲型范围中的位置 (绿色区域=甲型)",
    analysisOk: "✓ 满足甲型条件！可触发置闰交叉验证",
    analysisMaybe: "⚠ 不确定性范围与甲型区间有交集",
    analysisFail: "✗ 不满足甲型条件",
    intercalaryTitle: "置闰预测",
    monthsPerYear: "月/年",
    intMonths: "整数月数",
    fraction: "年余分",
    leapFreq: "置闰频率 ≈ 每",
    years: "年",
    localYears: "本地年",
    leapDayTitle: "宿主行星岁余",
    leapDayCycle: (p, q) => `每 ${q} 年插 ${p} 个闰日`,
    zhangVerify: (p, q) => `最优章法 (${p}/${q}) =`,
    error: "误差",
    conclusionTitle: "发现",
    conclusion1: "除地球月球外，存在至少一个系外卫星候选体满足甲型条件——这意味着华夏历的置闰机制不仅仅是地球的特例，而是在其他恒星系统中也能被实例化的通用结构。",
    conclusion2: "目前仅地球月球是唯一已确认的甲型实例，但部分候选体的不确定性范围与甲型区间有交集。随着JWST和VLTI/GRAVITY+的观测精度提升，未来可能发现更多甲型实例。",
    conclusion3: "目前仅地球月球是唯一已知的甲型实例。",
    conclusionNote: "需要注意：截至2026年，尚无任何系外卫星被正式确认。上述候选体均需进一步验证。但公式的价值在于——它提前给出了判定标准：只要 Y₁/N ≤ Tᵢ < 2Y₁/N，置闰自动成立，无需重新设计。标准在那里等着数据。",
    footer1: "数据来源：Teachey & Kipping 2018 · Kipping 2022 · Kral et al. 2026 · NASA Kepler/HST · ESO VLTI/GRAVITY",
    footer2: "分析框架：贾润章《华夏历》2026 · §4 甲型条件 Y₁/N ≤ Tᵢ < 2Y₁/N · N=24 为地球型参考值（可变设计参数）",
    orbitLabel: "绕",
    planetYear: "行星年",
    zhongqi: "Z 中气间隔",
    modeARange: "甲型范围",
    tiEst: "Tᵢ (估计)",
    tiRatio: "Tᵢ/Z",
    tiRange: "Tᵢ范围",
    days: "天",
    earthYears: "地球年",
    statusMap: { "已确认": "已确认", "争议中": "争议中", "初步信号": "初步信号" },
    analysisSatPeriod: (Ti, lo, hi, pct) => `卫星朔望周期 Tᵢ=${Ti}天 落在 [${lo}, ${hi}) 天的甲型范围内。Tᵢ/Z = ${pct}%。`,
    analysisNearZ: " 接近Z上限，与地球月球(97%)类似——近共振状态，置闰规则可以用「无中气」观测法直接实施。",
    analysisMidRange: " 位于甲型中段，置闰频率较高，但「无中气」规则依然适用。",
    analysisEarthLike: (Y1) => ` 行星年(${Y1}天)与地球(365.25天)在同一量级——这是一个"类地华夏历"的真实候选！`,
    dirBelow: "低于", dirAbove: "高于",
    analysisMaybeText: (Ti, dir, rlo, rhi, alo, ahi) => `估计值 Tᵢ≈${Ti}天 ${dir}甲型范围，但观测不确定性范围 [${rlo}, ${rhi}] 天与甲型区间 [${alo}, ${ahi}] 天存在交集。若未来观测精度提高并确认Tᵢ落入该范围，则甲型条件成立。`,
    analysisPeriodNotA: (Ti, limitStr) => `卫星周期 Tᵢ≈${Ti}天 ${limitStr}。`,
    analysisBelowLo: (lo) => `远低于甲型下限(${lo}天)`,
    analysisAboveHi: (hi) => `高于甲型上限(${hi}天)`,
    analysisModeB: " 归入乙型(Mode B)——可作独立计数轨叠合，但不参与置闰。",
    leapMonth: "一次闰月",
    satisfyModeA: "满足甲型",
  },
  en: {
    header: "Huaxia Calendar · Mode A Exomoon Hunter",
    subtitle: "Searching known exomoon candidates for Mode A intercalary eligibility: Y₁/N ≤ Tᵢ < 2Y₁/N",
    summaryLabel: "/ {0} satisfy Mode A",
    confirmed: (n) => n > 0 ? `${n} confirmed` : "",
    candidates: (n) => n > 0 ? `${n} candidates` : "",
    maybeLabel: (n) => n > 0 ? `· ${n} possibly Mode A within uncertainty` : "",
    isModeA: "✓ Mode A!",
    maybeA: "⚠ Possibly Mode A",
    notA: "✗ Not Mode A",
    gaugeLabel: "Tᵢ position within Mode A range (green zone = Mode A)",
    analysisOk: "✓ Satisfies Mode A condition — intercalary cross-verification possible",
    analysisMaybe: "⚠ Uncertainty range overlaps with Mode A interval",
    analysisFail: "✗ Does not satisfy Mode A condition",
    intercalaryTitle: "Intercalary Prediction",
    monthsPerYear: "months/year",
    intMonths: "Integer months",
    fraction: "Annual fraction",
    leapFreq: "Intercalary frequency ≈ every",
    years: "years",
    localYears: "local years",
    leapDayTitle: "Host Planet Day Surplus",
    leapDayCycle: (p, q) => `${p} leap day(s) per ${q} years`,
    zhangVerify: (p, q) => `Best Zhang Period (${p}/${q}) =`,
    error: "error",
    conclusionTitle: "Findings",
    conclusion1: "Beyond Earth's Moon, at least one exomoon candidate satisfies Mode A — meaning the Huaxia Calendar's intercalary mechanism is not Earth-specific but a universal structure instanciable in other stellar systems.",
    conclusion2: "Earth's Moon remains the only confirmed Mode A instance, but some candidates' uncertainty ranges overlap with the Mode A interval. Improved JWST and VLTI/GRAVITY+ precision may reveal more instances.",
    conclusion3: "Earth's Moon is currently the only known Mode A instance.",
    conclusionNote: "Note: As of 2026, no exomoon has been officially confirmed. All candidates require further verification. The formula's value lies in providing the criterion in advance: whenever Y₁/N ≤ Tᵢ < 2Y₁/N, intercalation is automatic. The standard awaits the data.",
    footer1: "Data: Teachey & Kipping 2018 · Kipping 2022 · Kral et al. 2026 · NASA Kepler/HST · ESO VLTI/GRAVITY",
    footer2: "Framework: Jia Runzhang, Huaxia Li (2026) · §4 Mode A condition Y₁/N ≤ Tᵢ < 2Y₁/N · N=24 is Earth-analogue reference (variable design parameter)",
    orbitLabel: "orbiting",
    planetYear: "Planet Year",
    zhongqi: "Z Zhongqi Interval",
    modeARange: "Mode A Range",
    tiEst: "Tᵢ (estimated)",
    tiRatio: "Tᵢ/Z",
    tiRange: "Tᵢ range",
    days: "days",
    earthYears: "Earth years",
    statusMap: { "已确认": "Confirmed", "争议中": "Disputed", "初步信号": "Initial Signal" },
    analysisSatPeriod: (Ti, lo, hi, pct) => `Satellite synodic period Tᵢ=${Ti} days falls within Mode A range [${lo}, ${hi}) days. Tᵢ/Z = ${pct}%.`,
    analysisNearZ: " Near the Z upper bound, similar to Earth's Moon (97%) — near-resonance; intercalation can be directly implemented via the no-zhongqi rule.",
    analysisMidRange: " In the mid-range of Mode A; higher intercalary frequency, but the no-zhongqi rule still applies.",
    analysisEarthLike: (Y1) => ` Planet year (${Y1} days) is in the same order of magnitude as Earth (365.25 days) — a genuine "Earth-analogue Huaxia Calendar" candidate!`,
    dirBelow: "below", dirAbove: "above",
    analysisMaybeText: (Ti, dir, rlo, rhi, alo, ahi) => `Estimated Tᵢ≈${Ti} days is ${dir} the Mode A range, but uncertainty interval [${rlo}, ${rhi}] days overlaps with Mode A range [${alo}, ${ahi}] days. If future observations confirm Tᵢ is within that range, Mode A holds.`,
    analysisPeriodNotA: (Ti, limitStr) => `Satellite period Tᵢ≈${Ti} days ${limitStr}.`,
    analysisBelowLo: (lo) => `far below the Mode A lower bound (${lo} days)`,
    analysisAboveHi: (hi) => `above the Mode A upper bound (${hi} days)`,
    analysisModeB: " Classified as Mode B — can form independent cycle overlays, but not used for intercalation.",
    leapMonth: "leap month",
    satisfyModeA: "satisfy Mode A",
  },
};

// =============================================
// ALL KNOWN EXOMOON CANDIDATES + HOST PLANETS
// Real data from Kepler, HST, VLTI/GRAVITY
// =============================================

const CANDIDATES = [
  {
    id: "kepler1625b", N: 24,
    host: "Kepler-1625 b",
    hostDesc: "类木气态巨行星，~10 MJ，半径≈Jupiter",
    star: "Kepler-1625 (类太阳G型恒星, 1.079 M☉)",
    distance: "8,000 ly",
    Y1: 287.38, // planet orbital period = stellar year
    moonName: "Kepler-1625 b I (候选)",
    moonDesc: "海王星大小，~16 M⊕，距行星约40行星半径",
    Ti_est: 19, // estimated orbital period around planet ~19 days (Grokipedia/Kipping)
    Ti_range: [13, 39], // range from CNN paper
    confirmed: false,
    status: "争议中",
    statusDetail: "2018年Teachey & Kipping (HST)发现证据，2019年Kreidberg等独立分析未确认，2023年Heller等认为可能是假阳性。截至2025年仍未确认。",
    source: "Teachey & Kipping 2018 (Science Advances), Kipping 2022",
    localDay: 10, // gas giant, assume fast rotation ~10h
  },
  {
    id: "kepler1708b", N: 24,
    host: "Kepler-1708 b",
    hostDesc: "类木气态巨行星，<4.6 MJ，半径≈0.89 RJ",
    star: "Kepler-1708 (类太阳恒星)",
    distance: "5,600 ly",
    Y1: 737.11, // planet orbital period
    moonName: "Kepler-1708 b I (候选)",
    moonDesc: "约2.6倍地球半径，距行星约12行星半径",
    Ti_est: 4.6, // roughly estimated from orbital distance
    Ti_range: [2, 10], // approximate range
    confirmed: false,
    status: "争议中",
    statusDetail: "2022年Kipping等发现，2023年Heller & Hippke重新分析认为不太可能存在。",
    source: "Kipping et al. 2022 (Nature Astronomy)",
    localDay: 10,
  },
  {
    id: "hd206893b", N: 24,
    host: "HD 206893 B",
    hostDesc: "褐矮星/超木星，~20-28 MJ，半径≈1.25 RJ",
    star: "HD 206893 (F5V主序星, ~1.3 M☉)",
    distance: "133 ly",
    Y1: 25.6 * 365.25, // ~25.6 years in days = 9350 days
    moonName: "HD 206893 B I (候选)",
    moonDesc: "极大质量，~0.4 MJ (≈9倍海王星质量)，距宿主约0.22 AU",
    Ti_est: 0.76 * 365.25, // ~0.76 years = ~277.6 days
    Ti_range: [200, 350], // approximate
    confirmed: false,
    status: "初步信号",
    statusDetail: "2026年1月巴黎天文台Kral等使用VLTI/GRAVITY天体测量首次检测。信号显示~9个月周期的天体测量摆动。尚需进一步验证。",
    source: "Kral et al. 2026 (A&A), VLTI/GRAVITY",
    localDay: 10,
  },
  // ── Hypothetical Earth-analogue for comparison ──
  {
    id: "earth_ref", N: 24,
    host: "地球 (参考基线)",
    hostDesc: "岩质行星，1 M⊕",
    star: "太阳 (G2V, 1.0 M☉)",
    distance: "0 ly",
    Y1: 365.25,
    moonName: "月球 Moon",
    moonDesc: "0.0123 M⊕, 距地球60.3地球半径",
    Ti_est: 29.5306,
    Ti_range: [29.53, 29.53],
    confirmed: true,
    status: "已确认",
    statusDetail: "唯一已知的甲型实例。Tᵢ/Z = 97%，位于甲型范围上界附近。",
    source: "NASA JPL",
    localDay: 24,
  },
];

function analyzeCandidate(c) {
  const Z = (2 * c.Y1) / c.N;
  const lo = c.Y1 / c.N;
  const hi = Z;
  const localDayDays = c.localDay / 24;

  // Check Ti_est
  const inModeA = c.Ti_est >= lo && c.Ti_est < hi;
  const tooFast = c.Ti_est < lo;
  const belowDay = c.Ti_est < localDayDays;
  const ratioZ = c.Ti_est / Z;

  // Check range
  const rangeOverlapsA = c.Ti_range[0] < hi && c.Ti_range[1] >= lo;

  // How close to ideal?
  // Ideal is Ti/Z close to 1 (like Earth's Moon at 97%)
  const idealness = ratioZ;

  // 岁余：宿主行星本地日的余分 → 置闰日周期
  const daysPerYear = c.localDay > 0 ? c.Y1 / (c.localDay / 24) : null;
  const fracDay = daysPerYear !== null ? daysPerYear - Math.floor(daysPerYear) : null;
  const leapDay = (fracDay !== null && fracDay > 0.002 && fracDay < 0.998)
    ? { ...bestRational(fracDay), daysPerYear } : null;

  return { Z, lo, hi, inModeA, tooFast, belowDay, ratioZ, rangeOverlapsA, idealness, leapDay };
}

function Gauge({ value, lo, hi, max, label }) {
  // Visual gauge showing where Ti falls relative to Mode A range
  const scale = max * 1.3;
  const pctLo = (lo / scale) * 100;
  const pctHi = (hi / scale) * 100;
  const pctVal = Math.min((value / scale) * 100, 100);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginBottom: 4 }}>{label}</div>
      <div style={{ position: "relative", height: 28, background: "var(--cell)", borderRadius: 6, overflow: "hidden" }}>
        {/* Mode A zone */}
        <div style={{
          position: "absolute", left: `${pctLo}%`, width: `${pctHi - pctLo}%`,
          height: "100%", background: "#10b98120", borderLeft: "2px solid #10b981", borderRight: "2px solid #10b981",
        }} />
        {/* Marker */}
        <div style={{
          position: "absolute", left: `${pctVal}%`, top: 0, height: "100%",
          width: 3, background: value >= lo && value < hi ? "#10b981" : "#ef4444",
          borderRadius: 2, transform: "translateX(-1.5px)",
        }} />
        {/* Labels */}
        <div style={{ position: "absolute", left: `${pctLo}%`, bottom: -16, fontSize: 9, color: "var(--dim)", fontFamily: "var(--mono)", transform: "translateX(-50%)" }}>
          {lo.toFixed(1)}
        </div>
        <div style={{ position: "absolute", left: `${pctHi}%`, bottom: -16, fontSize: 9, color: "var(--dim)", fontFamily: "var(--mono)", transform: "translateX(-50%)" }}>
          {hi.toFixed(1)}
        </div>
        <div style={{ position: "absolute", left: `${pctVal}%`, top: -16, fontSize: 9, color: value >= lo && value < hi ? "#10b981" : "#ef4444", fontFamily: "var(--mono)", transform: "translateX(-50%)", fontWeight: 700 }}>
          {value.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ c, t, lang }) {
  const a = analyzeCandidate(c);
  const isModeA = a.inModeA;

  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${isModeA ? "#10b98140" : "var(--border)"}`,
      borderRadius: 14, padding: "20px 24px", marginBottom: 18,
      boxShadow: isModeA ? "0 0 20px #10b98115" : "none",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{c.moonName}</div>
          <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 2 }}>{t.orbitLabel} {c.host} · {c.distance}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
            background: c.confirmed ? "#10b98120" : c.status === "初步信号" ? "#f59e0b20" : "#ef444420",
            color: c.confirmed ? "#10b981" : c.status === "初步信号" ? "#f59e0b" : "#ef4444",
            fontFamily: "var(--mono)",
          }}>
            {(t.statusMap && t.statusMap[c.status]) || c.status}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
            background: isModeA ? "#10b98125" : a.rangeOverlapsA ? "#f59e0b20" : "#6b728020",
            color: isModeA ? "#10b981" : a.rangeOverlapsA ? "#f59e0b" : "#6b7280",
            fontFamily: "var(--mono)",
          }}>
            {isModeA ? t.isModeA : a.rangeOverlapsA ? t.maybeA : t.notA}
          </span>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: "var(--dim2)", lineHeight: 1.6, marginBottom: 12 }}>
        {c.moonDesc}
      </div>

      {/* Parameters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
        {[
          [`Y₁ ${t.planetYear}`, c.Y1 > 1000 ? `${(c.Y1/365.25).toFixed(1)} ${t.earthYears}` : `${c.Y1.toFixed(2)} ${t.days}`],
          [t.zhongqi, `${a.Z.toFixed(2)} ${t.days}`],
          [t.modeARange, `${a.lo.toFixed(1)}–${a.hi.toFixed(1)} ${t.days}`],
          [t.tiEst, `${c.Ti_est.toFixed(1)} ${t.days}`],
          [t.tiRatio, `${(a.ratioZ * 100).toFixed(1)}%`],
          [t.tiRange, `${c.Ti_range[0]}–${c.Ti_range[1]} ${t.days}`],
        ].map(([label, val], i) => (
          <div key={i} style={{ background: "var(--cell)", borderRadius: 8, padding: "7px 11px" }}>
            <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Visual gauge */}
      <div style={{ padding: "8px 0 24px" }}>
        <Gauge value={c.Ti_est} lo={a.lo} hi={a.hi} max={a.hi * 1.5} label={t.gaugeLabel} />
      </div>

      {/* Analysis */}
      <div style={{
        background: isModeA ? "#10b98110" : "var(--cell)",
        borderRadius: 8, padding: "12px 16px",
        borderLeft: `4px solid ${isModeA ? "#10b981" : a.rangeOverlapsA ? "#f59e0b" : "#6b7280"}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isModeA ? "#10b981" : "var(--fg)", marginBottom: 6 }}>
          {isModeA ? t.analysisOk : a.rangeOverlapsA ? t.analysisMaybe : t.analysisFail}
        </div>
        <div style={{ fontSize: 12, color: "var(--dim2)", lineHeight: 1.7 }}>
          {isModeA ? (
            <>
              {t.analysisSatPeriod(c.Ti_est.toFixed(1), a.lo.toFixed(1), a.hi.toFixed(1), (a.ratioZ*100).toFixed(1))}
              {a.ratioZ > 0.9 && a.ratioZ < 1.0 && t.analysisNearZ}
              {a.ratioZ < 0.9 && a.ratioZ >= 0.5 && t.analysisMidRange}
              {c.Y1 > 200 && c.Y1 < 400 && t.analysisEarthLike(c.Y1.toFixed(1))}
            </>
          ) : a.rangeOverlapsA ? (
            <>
              {t.analysisMaybeText(c.Ti_est.toFixed(1), a.tooFast ? t.dirBelow : t.dirAbove, c.Ti_range[0], c.Ti_range[1], a.lo.toFixed(1), a.hi.toFixed(1))}
            </>
          ) : (
            <>
              {t.analysisPeriodNotA(c.Ti_est.toFixed(1), a.tooFast ? t.analysisBelowLo(a.lo.toFixed(1)) : t.analysisAboveHi(a.hi.toFixed(1)))}
              {a.tooFast && t.analysisModeB}
            </>
          )}
        </div>
      </div>

      {/* Intercalary calculation if Mode A */}
      {isModeA && (
        <div style={{ background: "var(--cell)", borderRadius: 8, padding: "12px 16px", marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "#10b981", fontFamily: "var(--mono)", fontWeight: 600, marginBottom: 6 }}>{t.intercalaryTitle}</div>
          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--fg)", lineHeight: 1.9 }}>
            {(() => {
              const mpy = c.Y1 / c.Ti_est;
              const frac = mpy - Math.floor(mpy);
              const interval = frac > 0 ? 1 / frac : Infinity;
              return (
                <>
                  <div>Y₁/Tᵢ = {c.Y1.toFixed(2)} / {c.Ti_est.toFixed(1)} = <b>{mpy.toFixed(4)}</b> {t.monthsPerYear}</div>
                  <div>{t.intMonths} = {Math.floor(mpy)} · {t.fraction} = {frac.toFixed(4)}</div>
                  <div>{t.leapFreq} <b>{interval.toFixed(2)}</b> {c.host.includes("地球") ? t.years : t.localYears} · {t.leapMonth}</div>
                  {(() => { const br = bestRational(frac); return <div style={{ color: "var(--dim2)", marginTop: 4 }}>{t.zhangVerify(br.p, br.q)} {(br.p/br.q).toFixed(5)} vs {frac.toFixed(5)} → {t.error} {(Math.abs(br.p/br.q - frac)/frac*100).toFixed(3)}%</div>; })()}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 岁余 */}
      {a.leapDay && (
        <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 14px", marginTop: 10, fontFamily: "var(--mono)", fontSize: 12 }}>
          <span style={{ color: "#f59e0b", fontWeight: 600 }}>{t.leapDayTitle}：</span>
          <span style={{ color: "var(--dim2)" }}>{a.leapDay.p}/{a.leapDay.q} → </span>
          <span style={{ color: "var(--fg)" }}>{t.leapDayCycle(a.leapDay.p, a.leapDay.q)}</span>
        </div>
      )}

      {/* Source */}
      <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 10, fontFamily: "var(--mono)" }}>
        {c.source} · {c.statusDetail}
      </div>
    </div>
  );
}

export default function ExomoonModeAHunter({ lang = "zh" }) {
  const t = T[lang];
  const modeACandidates = CANDIDATES.filter(c => analyzeCandidate(c).inModeA);
  const maybeA = CANDIDATES.filter(c => { const a = analyzeCandidate(c); return !a.inModeA && a.rangeOverlapsA; });

  return (
    <div style={{
      "--bg": "#080a0f", "--card": "#10131b", "--cell": "#171c28", "--border": "#222838",
      "--fg": "#e2e5ed", "--dim": "#6a7188", "--dim2": "#8f96ab", "--accent": "#c9a44a",
      "--mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      "--body": "'Noto Serif SC', Georgia, serif",
      fontFamily: "var(--body)", background: "var(--bg)", color: "var(--fg)",
      minHeight: "100vh", padding: "24px 16px", maxWidth: 720, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: 4, fontFamily: "var(--mono)", marginBottom: 6 }}>{t.header}</div>
        <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>{t.subtitle}</div>
      </div>

      {/* Summary */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
          {modeACandidates.length} <span style={{ fontSize: 14, fontWeight: 400, color: "var(--dim2)" }}>/ {CANDIDATES.length} {t.satisfyModeA}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 4 }}>
          {modeACandidates.length > 0 && [t.confirmed(modeACandidates.filter(c=>c.confirmed).length), t.candidates(modeACandidates.filter(c=>!c.confirmed).length)].filter(Boolean).join("，")}
          {t.maybeLabel(maybeA.length)}
        </div>
      </div>

      {/* Cards */}
      {CANDIDATES.map(c => <CandidateCard key={c.id} c={c} t={t} lang={lang} />)}

      {/* Conclusion */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginTop: 8 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 600, marginBottom: 10 }}>{t.conclusionTitle}</div>
        <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8 }}>
          {modeACandidates.length > 1 ? t.conclusion1 : modeACandidates.length === 1 && maybeA.length > 0 ? t.conclusion2 : t.conclusion3}
        </div>
        <div style={{ fontSize: 12, color: "var(--dim2)", lineHeight: 1.7, marginTop: 10 }}>{t.conclusionNote}</div>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: "var(--dim)", marginTop: 20, fontFamily: "var(--mono)", lineHeight: 1.7 }}>
        {t.footer1}<br />{t.footer2}
      </div>
    </div>
  );
}
