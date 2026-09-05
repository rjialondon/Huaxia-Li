import { useState, useMemo } from "react";
import { CANDIDATE_EVIDENCE } from "./core/候选来源.mjs";
import { bestRational } from "./formula.js";
import { CANDIDATES, analyzeCandidate } from "./core/候选演算.mjs";

const T = {
  zh: {
    header: "华夏历 · 甲型系外卫星猎手",
    subtitle: "用给定参数探索平均周期分型 Y₁/N ≤ Tᵢ < 2Y₁/N，不是置闰定理",
    confirmed: (n) => n > 0 ? `其中 ${n} 已确认` : "",
    candidates: (n) => n > 0 ? `${n} 候选` : "",
    maybeLabel: (n) => n > 0 ? `· ${n} 个在演示范围内可能甲型` : "",
    isModeA: "✓ 甲型！",
    maybeA: "⚠ 范围可能甲型",
    notA: "✗ 非甲型",
    gaugeLabel: "Tᵢ 在甲型范围中的位置 (绿色区域=甲型)",
    analysisOk: "给定参数满足甲型分型；不代表已认证置闰",
    analysisMaybe: "演示范围与甲型区间有交集",
    analysisFail: "✗ 不满足甲型条件",
    intercalaryTitle: "平均周期比（不是置闰预测）",
    monthsPerYear: "月/年",
    intMonths: "整数月数",
    fraction: "年余分",
    leapFreq: "余分倒数 ≈",
    years: "年",
    localYears: "本地年",
    leapDayTitle: "宿主行星岁余",
    leapDayCycle: (p, q) => `每 ${q} 年插 ${p} 个闰日`,
    zhangVerify: (p, q) => `余分有理近似 (${p}/${q}) =`,
    error: "误差",
    conclusionTitle: "本页输入的分类结果",
    conclusion1: "本页至少一组系外候选演示参数落入甲型区间。它不证明候选体存在，也不证明通用置闰规则成立。",
    conclusion2: "本页有演示范围与甲型区间相交；须分别核实天体、周期及历法规则。",
    conclusion3: "当前输入未提供额外的甲型系外算例，不代表所有天体的普查结论。",
    conclusionNote: "本页不是完整候选目录。系外条目保留候选身份；周期范围目前只作演示，不冒充观测置信区间。满足平均周期不等式不保证实际置闰，仍须定义事件、相位、日界及年界。",
    footer1: "数据来源：Teachey & Kipping 2018 (Science Advances) · Kipping et al. 2022 (Nature Astronomy) · Kral et al. 2026 (A&A) · NASA Kepler/HST · ESO VLTI/GRAVITY+",
    footer2: "分析框架：贾润章《华夏历》2026 · §4 甲型条件 Y₁/N ≤ Tᵢ < 2Y₁/N（等价于 月数/年 ∈ (N/2, N]）· N 为太阳侧分辨率约定（此处24）——卫星受判于 N，不定义 N",
    orbitLabel: "绕",
    planetYear: "行星年",
    zhongqi: "Z 中气间隔",
    modeARange: "甲型范围",
    tiEst: "Tᵢ (估计)",
    tiRatio: "Tᵢ/Z",
    tiRange: "演示周期范围（非置信区间）",
    days: "天",
    earthYears: "地球年",
    statusMap: { "已确认": "已确认", "争议中": "争议中", "初步信号": "初步信号" },
    analysisSatPeriod: (Ti, lo, hi, pct) => `卫星朔望周期 Tᵢ=${Ti}天 落在 [${lo}, ${hi}) 天的甲型范围内。Tᵢ/Z = ${pct}%。`,
    analysisNearZ: " 接近平均Z上限；仅是周期比关系，尚须检验事件分布。",
    analysisMidRange: " 位于平均周期分型区间内，不据此预测闰月频率。",
    analysisEarthLike: (Y1) => ` 行星年(${Y1}天)与地球(365.25天)在同一量级；仅作年长比较，不证明宜居性或历法适用性。`,
    dirBelow: "低于", dirAbove: "高于",
    analysisMaybeText: (Ti, dir, rlo, rhi, alo, ahi) => `估计值 Tᵢ≈${Ti}天 ${dir}甲型范围，但演示范围（来源待核） [${rlo}, ${rhi}] 天与甲型区间 [${alo}, ${ahi}] 天存在交集。若未来观测精度提高并确认Tᵢ落入该范围，则甲型条件成立。`,
    analysisPeriodNotA: (Ti, limitStr) => `卫星周期 Tᵢ≈${Ti}天 ${limitStr}。`,
    analysisBelowLo: (lo) => `远低于甲型下限(${lo}天)`,
    analysisAboveHi: (hi) => `高于甲型上限(${hi}天)`,
    analysisModeB: " 归入乙型(Mode B)——可作独立计数轨叠合，但不参与置闰。",
    leapMonth: "非实际闰月间隔",
    satisfyModeA: "满足甲型",
  },
  en: {
    header: "Huaxia Calendar · Mode A Exomoon Hunter",
    subtitle: "Explore mean-period classification Y₁/N ≤ Tᵢ < 2Y₁/N, not an intercalation theorem",
    confirmed: (n) => n > 0 ? `${n} confirmed` : "",
    candidates: (n) => n > 0 ? `${n} candidates` : "",
    maybeLabel: (n) => n > 0 ? `· ${n} possibly Mode A within the demo range` : "",
    isModeA: "✓ Mode A!",
    maybeA: "⚠ Possibly Mode A",
    notA: "✗ Not Mode A",
    gaugeLabel: "Tᵢ position within Mode A range (green zone = Mode A)",
    analysisOk: "Supplied parameters meet Mode A; intercalation is not certified",
    analysisMaybe: "Demonstration range overlaps Mode A",
    analysisFail: "✗ Does not satisfy Mode A condition",
    intercalaryTitle: "Mean cycle ratio (not an intercalation prediction)",
    monthsPerYear: "months/year",
    intMonths: "Integer months",
    fraction: "Annual fraction",
    leapFreq: "Reciprocal fraction ≈",
    years: "years",
    localYears: "local years",
    leapDayTitle: "Host Planet Day Surplus",
    leapDayCycle: (p, q) => `${p} leap day(s) per ${q} years`,
    zhangVerify: (p, q) => `Rational fraction approximation (${p}/${q}) =`,
    error: "error",
    conclusionTitle: "Classification of this page's inputs",
    conclusion1: "At least one supplied exomoon parameter set falls in Mode A. This proves neither the candidate's existence nor a universal intercalation rule.",
    conclusion2: "Some supplied ranges overlap Mode A; the objects, periods and calendar rules require separate verification.",
    conclusion3: "These inputs provide no additional Mode A exomoon example; this is not a census of all celestial systems.",
    conclusionNote: "This is not a complete candidate catalogue. Exomoon entries remain candidates; supplied ranges are demonstrations, not observational confidence intervals. Meeting the mean-period inequality does not guarantee intercalation: events, phases and day/year boundaries remain necessary.",
    footer1: "Data: Teachey & Kipping 2018 (Science Advances) · Kipping et al. 2022 (Nature Astronomy) · Kral et al. 2026 (A&A) · NASA Kepler/HST · ESO VLTI/GRAVITY+",
    footer2: "Framework: Jia Runzhang, Huaxia Li (2026) · §4 Mode A condition Y₁/N ≤ Tᵢ < 2Y₁/N (equivalently months/yr ∈ (N/2, N]) · N is a solar-side resolution convention (24 here) — satellites are tested against N, they do not define it",
    orbitLabel: "orbiting",
    planetYear: "Planet Year",
    zhongqi: "Z Zhongqi Interval",
    modeARange: "Mode A Range",
    tiEst: "Tᵢ (estimated)",
    tiRatio: "Tᵢ/Z",
    tiRange: "Demonstration period range (not confidence interval)",
    days: "days",
    earthYears: "Earth years",
    statusMap: { "已确认": "Confirmed", "争议中": "Disputed", "初步信号": "Initial Signal" },
    analysisSatPeriod: (Ti, lo, hi, pct) => `Satellite synodic period Tᵢ=${Ti} days falls within Mode A range [${lo}, ${hi}) days. Tᵢ/Z = ${pct}%.`,
    analysisNearZ: " Near the mean Z upper bound; this is only a ratio, and event distributions still require testing.",
    analysisMidRange: " Within the mean-period classification interval; no leap frequency follows from this alone.",
    analysisEarthLike: (Y1) => ` Planet year (${Y1} days) is of the same order as Earth (365.25 days); this comparison does not establish habitability or calendar validity.`,
    dirBelow: "below", dirAbove: "above",
    analysisMaybeText: (Ti, dir, rlo, rhi, alo, ahi) => `Estimated Tᵢ≈${Ti} days is ${dir} the Mode A range, but demonstration interval [${rlo}, ${rhi}] days overlaps with Mode A range [${alo}, ${ahi}] days. If future observations confirm Tᵢ is within that range, Mode A holds.`,
    analysisPeriodNotA: (Ti, limitStr) => `Satellite period Tᵢ≈${Ti} days ${limitStr}.`,
    analysisBelowLo: (lo) => `far below the Mode A lower bound (${lo} days)`,
    analysisAboveHi: (hi) => `above the Mode A upper bound (${hi} days)`,
    analysisModeB: " Classified as Mode B — can form independent cycle overlays, but not used for intercalation.",
    leapMonth: "not an actual leap-month interval",
    satisfyModeA: "satisfy Mode A",
  },
};

// =============================================
// ALL KNOWN EXOMOON CANDIDATES + HOST PLANETS
// Real data from Kepler, HST, VLTI/GRAVITY
// =============================================

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
      <aside style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>
        {lang === "zh" ? CANDIDATE_EVIDENCE[c.id].zh : CANDIDATE_EVIDENCE[c.id].en}
        {CANDIDATE_EVIDENCE[c.id].links.map(([label,url]) => <a key={url} href={url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginLeft: 8, color: "var(--accent)" }}>{label}</a>)}
      </aside>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{c.moonName}{!c.confirmed && (lang === "zh" ? "（候选）" : " (candidate)")}</div>
          <div style={{ fontSize: 12, color: "var(--dim2)", marginTop: 2 }}>{t.orbitLabel} {(lang === "zh" ? c.host_zh : c.host_en) || c.host} · {c.distance}</div>
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
        {lang === "zh" ? c.moonDesc_zh : c.moonDesc_en}
      </div>

      {/* Parameters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
        {(() => {
          const fmt = (x, d) => Number.isFinite(x) ? x.toFixed(d) : "∞";
          return [
          [`Y₁ ${t.planetYear}`, c.Y1 > 1000 ? `${(c.Y1/365.25).toFixed(1)} ${t.earthYears}` : `${c.Y1.toFixed(2)} ${t.days}`],
          [t.zhongqi, `${a.Z.toFixed(2)} ${t.days}`],
          [t.modeARange, `${a.lo.toFixed(1)}–${a.hi.toFixed(1)} ${t.days}`],
          [t.tiEst, `${fmt(a.Tsyn, 2)} ${t.days}`],
          [t.tiRatio, `${fmt(a.ratioZ * 100, 1)}%`],
          [t.tiRange, `${fmt(a.TsynRange[0], 1)}–${fmt(a.TsynRange[1], 1)} ${t.days}`],
          ];
        })().map(([label, val], i) => (
          <div key={i} style={{ background: "var(--cell)", borderRadius: 8, padding: "7px 11px" }}>
            <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Visual gauge */}
      <div style={{ padding: "8px 0 24px" }}>
        <Gauge value={a.Tsyn} lo={a.lo} hi={a.hi} max={a.hi * 1.5} label={t.gaugeLabel} />
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
              {t.analysisSatPeriod(a.Tsyn.toFixed(2), a.lo.toFixed(1), a.hi.toFixed(1), (a.ratioZ*100).toFixed(1))}
              {a.ratioZ > 0.9 && a.ratioZ < 1.0 && t.analysisNearZ}
              {a.ratioZ < 0.9 && a.ratioZ >= 0.5 && t.analysisMidRange}
              {c.Y1 > 200 && c.Y1 < 400 && t.analysisEarthLike(c.Y1.toFixed(1))}
            </>
          ) : a.rangeOverlapsA ? (
            <>
              {t.analysisMaybeText(a.Tsyn.toFixed(2), a.tooFast ? t.dirBelow : t.dirAbove, a.TsynRange[0].toFixed(1), a.TsynRange[1].toFixed(1), a.lo.toFixed(1), a.hi.toFixed(1))}
            </>
          ) : (
            <>
              {t.analysisPeriodNotA(a.Tsyn.toFixed(2), a.tooFast ? t.analysisBelowLo(a.lo.toFixed(1)) : t.analysisAboveHi(a.hi.toFixed(1)))}
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
              const mpy = c.Y1 / a.Tsyn;
              const frac = mpy - Math.floor(mpy);
              const interval = frac > 0 ? 1 / frac : Infinity;
              return (
                <>
                  <div>Y₁/Tᵢ = {c.Y1.toFixed(2)} / {a.Tsyn.toFixed(2)} = <b>{mpy.toFixed(4)}</b> {t.monthsPerYear}</div>
                  <div>{t.intMonths} = {Math.floor(mpy)} · {t.fraction} = {frac.toFixed(4)}</div>
                  <div>{t.leapFreq} <b>{interval.toFixed(2)}</b> {c.id === "earth_ref" ? t.years : t.localYears} · {t.leapMonth}</div>
                  {(() => { const br = bestRational(frac); return <div style={{ color: "var(--dim2)", marginTop: 4 }}>{t.zhangVerify(br.p, br.q)} {(br.p/br.q).toFixed(5)} vs {frac.toFixed(5)} → {t.error} {(frac === 0 ? 0 : Math.abs(br.p/br.q - frac)/frac*100).toFixed(3)}%</div>; })()}
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
          {c.localDayAssumed && <span style={{ fontSize: 10, color: "var(--dim)", marginLeft: 8, fontFamily: "var(--mono)" }}>{lang === "zh" ? "(本地日=10h，假设值)" : "(local day=10h, assumed)"}</span>}
        </div>
      )}

      {/* Source */}
      <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 10, fontFamily: "var(--mono)" }}>
        {c.source} · {lang === "zh" ? c.statusDetail_zh : c.statusDetail_en}
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
