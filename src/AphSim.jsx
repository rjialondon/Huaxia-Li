import { useEffect, useState } from "react";

// ── Simulation constants (match aphelion_sim.py) ──────────────────────────────
const Y_ANOM  = 365.2596;   // anomalistic year (perihelion→perihelion), d
const Y_TROP  = 365.2422;   // tropical year, d
const T_SYN   = 29.530589;  // Moon synodic period, d
const Z       = 2 * Y_TROP / 24;
const ECC     = 0.0167;
const PERI    = 282.95;     // ecliptic lon of perihelion, ° from VE
const N_YEARS = 400;
const N_PHASES = 6;         // lunar phase offsets (12 in Python; 6 is sufficient)

// ── Equation-of-center to e³ ──────────────────────────────────────────────────
function sunLon(t) {
  const M = 2 * Math.PI * t / Y_ANOM;
  const e = ECC;
  const nu = M
    + (2*e - e**3/4) * Math.sin(M)
    + (5*e**2/4)     * Math.sin(2*M)
    + (13*e**3/12)   * Math.sin(3*M);
  return ((nu * 180 / Math.PI + PERI) % 360 + 360) % 360;
}

// ── Bisection: find t when sun crosses lonTarget ──────────────────────────────
function crossTime(lonTarget, tApprox) {
  let lo = tApprox - Z * 0.6, hi = tApprox + Z * 0.6;
  const diff = t => {
    let d = (sunLon(t) - lonTarget) % 360;
    if (d < 0) d += 360;
    return d > 180 ? d - 360 : d;
  };
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (diff(mid) > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

// ── Generate all Zhongqi crossing times ──────────────────────────────────────
function genZhongqi() {
  const firstLon = (Math.ceil(PERI / 30) * 30) % 360;
  const dLon = ((firstLon - PERI) + 360) % 360;
  let curLon = firstLon;
  let curT   = crossTime(curLon, dLon / 360 * Y_TROP);
  const times = [curT];
  const total = 12 * (N_YEARS + 3);
  for (let i = 1; i < total; i++) {
    curLon = (curLon + 30) % 360;
    curT   = crossTime(curLon, curT + Z);
    times.push(curT);
  }
  return times;
}

// ── Full simulation ───────────────────────────────────────────────────────────
function runSim() {
  const zhongqi = genZhongqi();
  const byMonth = new Array(13).fill(0);   // preceding month index 0..12
  const byLon   = new Array(12).fill(0);   // 30° bins: index k → k*30°
  let total = 0;
  const halfN = 12;

  for (let ph = 0; ph < N_PHASES; ph++) {
    const offset = ph * T_SYN / N_PHASES;
    const months = [];
    let k = 0;
    while (true) {
      const t = offset + k++ * T_SYN;
      if (t > (N_YEARS + 2) * Y_TROP) break;
      months.push(t);
    }

    let zqCursor = 0;
    let yearMonths = [];
    let zqInYear = 0;

    for (let i = 0; i < months.length - 1; i++) {
      const ms = months[i], me = months[i + 1];
      while (zqCursor < zhongqi.length && zhongqi[zqCursor] < ms) zqCursor++;
      let cnt = 0, tmp = zqCursor;
      while (tmp < zhongqi.length && zhongqi[tmp] < me) { cnt++; tmp++; }
      zqInYear += cnt;
      yearMonths.push([ms, cnt === 0]);

      if (zqInYear >= halfN) {
        let reg = 0, prev = 0;
        for (const [tM, isInt] of yearMonths) {
          if (!isInt) { reg++; prev = reg; }
          else if (tM > 0 && tM < N_YEARS * Y_TROP) {
            const lon = sunLon(tM % Y_ANOM);
            byMonth[prev]++;
            byLon[Math.floor(lon / 30)]++;
            total++;
          }
        }
        yearMonths = [];
        zqInYear = 0;
      }
    }
  }
  return { byMonth, byLon, total };
}

// ── Static A.3 / A.4 values (arithmetic, no simulation) ──────────────────────
const Y = Y_TROP, Ts = T_SYN, Tjup = 4332.589;
const mpy = Y / Ts;
const frac = mpy - 12;
const A3 = {
  mpy:    mpy.toFixed(5),
  frac:   frac.toFixed(5),
  freq:   (1 / frac).toFixed(3),
  approx: (7 / 19).toFixed(6),
  err:    (Math.abs(7/19 - frac) / frac * 100).toFixed(4),
  yr19:   (19 * Y).toFixed(3),
  m235:   (235 * Ts).toFixed(3),
  res:    (235 * Ts - 19 * Y).toFixed(3),
};
const A4 = {
  m12:      (12 * Ts).toFixed(4),
  deficit:  (Y - 12 * Ts).toFixed(4),
  jupYr:    (Tjup / Y).toFixed(4),
  jupErr:   (Math.abs(12 - Tjup / Y) / (Tjup / Y) * 100).toFixed(3),
  fiveJup:  (5 * Tjup / Y).toFixed(3),
  fiveErr:  (Math.abs(60 - 5 * Tjup / Y) / 60 * 100).toFixed(3),
};

// ── Zhongqi label table ───────────────────────────────────────────────────────
const ZQ = [
  ["春分", "Vernal Equinox"],
  ["谷雨", "Grain Rain"],
  ["小满", "Grain Buds"],
  ["夏至", "Summer Solstice"],
  ["大暑", "Great Heat"],
  ["处暑", "End of Heat"],
  ["秋分", "Autumnal Equinox"],
  ["霜降", "Frost's Descent"],
  ["小雪", "Minor Snow"],
  ["冬至", "Winter Solstice"],
  ["大寒", "Major Cold"],
  ["雨水", "Rain Water"],
];

// ── Horizontal bar component ──────────────────────────────────────────────────
function Bar({ count, maxCount, color, animate }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ flex: 1, background: "#1a1e2a", borderRadius: 3, overflow: "hidden", height: 14 }}>
      <div style={{
        width: animate ? `${pct}%` : "0%",
        height: "100%",
        background: color,
        borderRadius: 3,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  zh: {
    pageTitle:  "数值验证",
    pageSub:    "论文附录 A.3 · A.4 · §6 的独立数值重现",
    simTitle:   "§6 远日点置闰分布",
    simDesc:    "Earth · 400 回归年 × 6 月相 | 无中气规则 | 近点年 + 三阶中心方程",
    byMonth:    "按置闰前月序分布",
    bySunLon:   "按月起始太阳经度分布（30° 分桶）",
    leap:       "闰",
    aphelion:   "近远日点",
    ws:         "近冬至",
    total:      "置闰月总数",
    claim46:    "闰4/5/6（北半球夏）",
    claimWS:    "闰11 + 闰12（近冬至）",
    expected:   "论文§6 主张",
    computing:  "计算中…",
    sec_a3:     "A.3 默冬章（Metonic Cycle）",
    mpy:        "月/年",
    fracLabel:  "年余分",
    leapFreq:   "置闰频率",
    approx:     "7/19 近似",
    error:      "相对误差",
    metonic19:  "19 回归年",
    metonic235: "235 朔望月",
    residual:   "默冬章残差",
    sec_a4:     "A.4 干支双共振",
    m12d:       "12 朔望月",
    deficit:    "年亏",
    jupSid:     "木星恒星年",
    vs12:       "vs 12，误差",
    fiveJup:    "5 × 木星年",
    vs60:       "vs 60，误差",
    ganzhi:     "60甲子 ≈ 5木星周期",
    sourceNote: "数据：NASA JPL 恒星轨道周期  ·  模拟：独立 JS 实现，与 verification/aphelion_sim.py 对齐",
  },
  en: {
    pageTitle:  "Numerical Verification",
    pageSub:    "Independent numerical reproduction of Appendix A.3 · A.4 · §6",
    simTitle:   "§6 Aphelion Intercalary Distribution",
    simDesc:    "Earth · 400 tropical years × 6 phases | no-Zhongqi rule | anomalistic year + e³ equation of center",
    byMonth:    "Distribution by preceding month number",
    bySunLon:   "Distribution by sun longitude at month start (30° bins)",
    leap:       "Leap",
    aphelion:   "near aphelion",
    ws:         "near WS",
    total:      "Total intercalary months",
    claim46:    "Leap 4/5/6 (NH summer)",
    claimWS:    "Leap 11 + 12 (near WS)",
    expected:   "Paper §6 claim",
    computing:  "Computing…",
    sec_a3:     "A.3 Metonic Cycle (默冬章)",
    mpy:        "Months/year",
    fracLabel:  "Fractional excess",
    leapFreq:   "Intercalary frequency",
    approx:     "7/19 approximation",
    error:      "Relative error",
    metonic19:  "19 tropical years",
    metonic235: "235 synodic months",
    residual:   "Metonic residual",
    sec_a4:     "A.4 Ganzhi Double Resonance (干支双共振)",
    m12d:       "12 synodic months",
    deficit:    "Annual deficit",
    jupSid:     "Jupiter sidereal year",
    vs12:       "vs 12, error",
    fiveJup:    "5 × Jupiter year",
    vs60:       "vs 60, error",
    ganzhi:     "60-year Ganzhi ≈ 5 Jupiter periods",
    sourceNote: "Data: NASA JPL sidereal periods  ·  Simulation: independent JS, aligned with verification/aphelion_sim.py",
  },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AphSim({ lang = "zh" }) {
  const t = T[lang];
  const [result, setResult] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const r = runSim();
      setResult(r);
      // Trigger bar animation after state update
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, 30);
    return () => clearTimeout(id);
  }, []);

  const section = (title, children) => (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "20px 24px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)", marginBottom: 16, letterSpacing: 1 }}>
        {title}
      </div>
      {children}
    </div>
  );

  const row = (label, value, note) => (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 8, flexWrap: "wrap" }}>
      <div style={{ width: 200, fontSize: 11, color: "var(--dim2)", fontFamily: "var(--mono)", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--fg)" }}>{value}</div>
      {note && <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>{note}</div>}
    </div>
  );

  // ── §6 aphelion section ─────────────────────────────────────────────────────
  const aphSection = () => {
    if (!result) return (
      <div style={{ color: "var(--dim)", fontFamily: "var(--mono)", fontSize: 12, padding: "20px 0" }}>
        {t.computing}
      </div>
    );

    const { byMonth, byLon, total } = result;
    const maxMonth = Math.max(...byMonth);
    const maxLon   = Math.max(...byLon);
    const leap46   = byMonth[4] + byMonth[5] + byMonth[6];
    const pct46    = total > 0 ? (leap46 / total * 100).toFixed(1) : "—";
    const ws11     = byMonth[11], ws12 = byMonth[12];

    // Month bar colors
    const monthColor = (i) => {
      if (i >= 4 && i <= 6) return "var(--accent)";
      if (i >= 11)          return "#3b82f6";
      return "#4b5563";
    };

    // Longitude bar colors
    const lonColor = (i) => {
      const lon = i * 30;
      if (lon >= 30 && lon <= 150) return "var(--accent)";  // aphelion half-year
      if (lon >= 240 && lon <= 300) return "#3b82f6";       // winter solstice zone
      return "#4b5563";
    };

    return (
      <>
        {/* Sim params */}
        <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginBottom: 16, lineHeight: 1.8 }}>
          {t.simDesc}<br />
          Y_ANOM={Y_ANOM}d · T_SYN={T_SYN}d · e={ECC} · PERI_LON={PERI}° · N={N_YEARS}yr × {N_PHASES} phases · total={total}
        </div>

        {/* By month */}
        <div style={{ fontSize: 12, color: "var(--dim2)", fontFamily: "var(--mono)", marginBottom: 8 }}>{t.byMonth}</div>
        <div style={{ marginBottom: 20 }}>
          {byMonth.map((count, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <div style={{ width: 44, textAlign: "right", fontSize: 11, fontFamily: "var(--mono)", color: i >= 4 && i <= 6 ? "var(--accent)" : i >= 11 ? "#3b82f6" : "var(--dim)" }}>
                {t.leap}{i}
              </div>
              <Bar count={count} maxCount={maxMonth} color={monthColor(i)} animate={animate} />
              <div style={{ width: 36, fontSize: 11, fontFamily: "var(--mono)", color: "var(--fg)", textAlign: "right" }}>
                {count}
              </div>
              {(i >= 4 && i <= 6) && (
                <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>← {t.aphelion}</div>
              )}
              {i >= 11 && (
                <div style={{ fontSize: 10, color: "#3b82f6", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>← {t.ws}</div>
              )}
            </div>
          ))}
        </div>

        {/* By solar longitude */}
        <div style={{ fontSize: 12, color: "var(--dim2)", fontFamily: "var(--mono)", marginBottom: 8 }}>{t.bySunLon}</div>
        <div style={{ marginBottom: 20 }}>
          {byLon.map((count, i) => {
            const [zh, en] = ZQ[i];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ width: 68, textAlign: "right", fontSize: 11, fontFamily: "var(--mono)", color: "var(--dim)" }}>
                  {i * 30}° {lang === "zh" ? zh : en.split(" ")[0]}
                </div>
                <Bar count={count} maxCount={maxLon} color={lonColor(i)} animate={animate} />
                <div style={{ width: 36, fontSize: 11, fontFamily: "var(--mono)", color: "var(--fg)", textAlign: "right" }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            {
              label: t.claim46,
              value: `${leap46} / ${total} = ${pct46}%`,
              note: `${t.expected}: ~50%`,
              ok: parseFloat(pct46) > 40 && parseFloat(pct46) < 60,
            },
            {
              label: t.claimWS,
              value: `${ws11} + ${ws12} = ${ws11 + ws12}`,
              note: `${t.expected}: ~0`,
              ok: ws11 + ws12 <= 2,
            },
            {
              label: t.total,
              value: total,
              note: `${N_YEARS}yr × ${N_PHASES} phases`,
              ok: true,
            },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 200,
              background: "var(--cell)", border: `1px solid ${s.ok ? "#10b98130" : "#ef444430"}`,
              borderRadius: 8, padding: "12px 16px",
            }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", fontFamily: "var(--mono)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontFamily: "var(--mono)", color: s.ok ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>{s.note}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ── A.3 Metonic ────────────────────────────────────────────────────────────
  const a3Section = () => (
    <>
      {row(`${t.mpy} = Y_trop / T_syn`, `${Y_TROP} / ${T_SYN} = ${A3.mpy}`)}
      {row(t.fracLabel, A3.frac, `→ ${t.leapFreq} ≈ 每 ${A3.freq} 年`)}
      {row(t.approx, `7/19 = ${A3.approx}`, `${t.error} = ${A3.err}%`)}
      <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
      {row(t.metonic19, `${A3.yr19} d`)}
      {row(t.metonic235, `${A3.m235} d`)}
      {row(t.residual, `${A3.res} d`, "≈ 2h 5min")}
    </>
  );

  // ── A.4 Ganzhi ─────────────────────────────────────────────────────────────
  const a4Section = () => (
    <>
      {row(t.m12d, `12 × ${T_SYN} = ${A4.m12d} d`)}
      {row(t.deficit, `${Y_TROP} − ${A4.m12d} = ${A4.deficit} d`)}
      <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
      {row(t.jupSid, `${Tjup} d = ${A4.jupYr} yr`)}
      {row(t.vs12, `${A4.jupErr}%`)}
      {row(t.fiveJup, `${A4.fiveJup} yr`)}
      {row(t.vs60, `${A4.fiveErr}%`)}
      <div style={{ marginTop: 12, fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", borderLeft: "2px solid var(--accent)", paddingLeft: 10 }}>
        {t.ganzhi}
      </div>
    </>
  );

  return (
    <div style={{
      "--bg": "#090b10", "--card": "#11141c", "--cell": "#181c28", "--border": "#222838",
      "--fg": "#e4e7ef", "--dim": "#7b8298", "--dim2": "#9299af", "--accent": "#d4a843",
      "--mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      "--body": "'Noto Serif SC', Georgia, serif",
      fontFamily: "var(--body)", background: "var(--bg)", color: "var(--fg)",
      minHeight: "100vh", padding: "20px 12px",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: lang === "zh" ? 4 : 1, fontFamily: "var(--mono)", marginBottom: 6 }}>
            {t.pageTitle}
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.pageSub}</div>
        </div>

        {section(t.simTitle, aphSection())}
        {section(t.sec_a3, a3Section())}
        {section(t.sec_a4, a4Section())}

        <div style={{ textAlign: "center", fontSize: 10, color: "var(--dim)", marginTop: 8, fontFamily: "var(--mono)", lineHeight: 1.7 }}>
          {t.sourceNote}
        </div>
      </div>
    </div>
  );
}
