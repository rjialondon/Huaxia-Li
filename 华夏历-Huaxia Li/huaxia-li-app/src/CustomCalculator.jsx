import { useState, useCallback } from "react";

// ── i18n ──
const L = {
  zh: {
    title: "华夏历 · 通用行星公式 · 自定义验算器",
    subtitle: "输入任意行星参数，公式实时输出结果",
    lang: "EN",
    // Sections
    starConfig: "恒星配置",
    starCount: "恒星数量 m",
    starName: "恒星名称",
    starMass: "质量 (M☉)",
    addStar: "+ 添加伴星",
    planetConfig: "行星参数",
    stellarYear: "恒星年 Y₁ (地球日)",
    localDay: "本地日 (小时)",
    ecc: "轨道离心率 e",
    locked: "潮汐锁定",
    yes: "是", no: "否",
    solarTerms: "节气分段 N",
    satConfig: "卫星配置",
    satName: "卫星名称",
    satPeriod: "朔望周期 Tᵢ (地球日)",
    addSat: "+ 添加卫星",
    removeSat: "删除",
    removeStar: "删除",
    noSats: "无卫星 — 点击上方按钮添加",
    // Results
    results: "公式输出",
    derivedParams: "推导参数",
    zhongqi: "中气间隔 Z",
    modeARange: "甲型范围",
    shichen: "时辰",
    days: "天",
    hours: "小时",
    undefined: "未定义",
    degenerate: "退化",
    satResults: "卫星分类",
    modeA: "甲型 Mode A",
    modeB: "乙型 Mode B",
    excluded: "排除",
    intercalaryEligible: "置闰参与",
    tooFast: "周期过快",
    tooSlow: "周期过慢",
    subDiurnal: "亚昼夜",
    cyclesPerYear: "周期/年",
    intercalary: "置闰预测",
    monthsPerYear: "月/年",
    fraction: "年余分",
    leapFreq: "置闰频率 ≈ 每",
    localYears: "本地年一次",
    formulaBox: "公式总结",
    output: "华夏历输出",
    luniSolar: "阴阳合历",
    pureSolar: "纯太阳历 (n=0)",
    solarPlus: (n) => `太阳历 + ${n}乙型计数轨`,
    gregOk: "公历：可工作 ✓",
    gregFail: "公历：结构崩溃 ✗",
    emptySet: "空集",
    keplerNote: "开普勒效应",
    highEcc: "高离心率：置闰自动聚集于远日点",
    presets: "预设模板",
    presetEarth: "地球",
    presetMars: "火星",
    presetJupiter: "木星",
    presetTatooine: "塔图因 (Kepler-16b)",
    presetCustom: "清空自定义",
    overlays: "乙型叠合体 (可选)",
    overlayName: "名称",
    overlayPeriod: "周期 (本地年)",
    addOverlay: "+ 添加叠合体",
    binaryPeriod: "双星互绕周期 (地球日)",
    tip: "提示：修改任何参数，右侧结果实时更新。试试改变卫星周期看它如何在甲/乙型之间跳转！",
    tipEn: "Tip: Change any parameter and results update in real time. Try adjusting satellite period to see it jump between Mode A and B!",
  },
  en: {
    title: "Huaxia Calendar · Universal Planetary Formula · Custom Calculator",
    subtitle: "Input any planetary parameters — formula outputs in real time",
    lang: "中文",
    starConfig: "Star Configuration",
    starCount: "Number of Stars m",
    starName: "Star Name",
    starMass: "Mass (M☉)",
    addStar: "+ Add Companion Star",
    planetConfig: "Planet Parameters",
    stellarYear: "Stellar Year Y₁ (Earth days)",
    localDay: "Local Day (hours)",
    ecc: "Orbital Eccentricity e",
    locked: "Tidally Locked",
    yes: "Yes", no: "No",
    solarTerms: "Solar Term Divisions N",
    satConfig: "Satellite Configuration",
    satName: "Satellite Name",
    satPeriod: "Synodic Period Tᵢ (Earth days)",
    addSat: "+ Add Satellite",
    removeSat: "Remove",
    removeStar: "Remove",
    noSats: "No satellites — click button above to add",
    results: "Formula Output",
    derivedParams: "Derived Parameters",
    zhongqi: "Zhongqi Interval Z",
    modeARange: "Mode A Range",
    shichen: "Shichen (时辰)",
    days: "days",
    hours: "hours",
    undefined: "Undefined",
    degenerate: "Degenerate",
    satResults: "Satellite Classification",
    modeA: "Mode A 甲型",
    modeB: "Mode B 乙型",
    excluded: "Excluded",
    intercalaryEligible: "Intercalary-eligible",
    tooFast: "Too fast",
    tooSlow: "Too slow",
    subDiurnal: "Sub-diurnal",
    cyclesPerYear: "cycles/yr",
    intercalary: "Intercalary Prediction",
    monthsPerYear: "months/year",
    fraction: "Annual fraction",
    leapFreq: "Intercalary frequency ≈ every",
    localYears: "local years",
    formulaBox: "Formula Summary",
    output: "Huaxia Li Output",
    luniSolar: "Lunisolar Calendar",
    pureSolar: "Pure Solar Calendar (n=0)",
    solarPlus: (n) => `Solar + ${n} Mode B tracks`,
    gregOk: "Gregorian: Works ✓",
    gregFail: "Gregorian: Structural collapse ✗",
    emptySet: "∅ empty",
    keplerNote: "Keplerian Effect",
    highEcc: "High eccentricity: intercalary insertions cluster near aphelion automatically",
    presets: "Presets",
    presetEarth: "Earth",
    presetMars: "Mars",
    presetJupiter: "Jupiter",
    presetTatooine: "Tatooine (Kepler-16b)",
    presetCustom: "Clear / Custom",
    overlays: "Mode B Overlays (optional)",
    overlayName: "Name",
    overlayPeriod: "Period (local years)",
    addOverlay: "+ Add Overlay",
    binaryPeriod: "Binary Mutual Orbit (Earth days)",
    tip: "Tip: Change any parameter and results update in real time. Try adjusting satellite period to see it jump between Mode A and B!",
  },
};

// ── PRESETS ──
const PRESETS = {
  earth: {
    stars: [{ name: "Sun", mass: 1.0 }],
    Y1: 365.25, localDay: 24, ecc: 0.0167, locked: false, N: 24,
    sats: [{ name: "Moon", Ti: 29.5306 }],
    overlays: [{ name: "Jupiter (岁星)", period: 11.862 }],
    binaryPeriod: 0,
  },
  mars: {
    stars: [{ name: "Sun", mass: 1.0 }],
    Y1: 686.97, localDay: 24.66, ecc: 0.0934, locked: false, N: 24,
    sats: [{ name: "Phobos", Ti: 0.319 }, { name: "Deimos", Ti: 1.26 }],
    overlays: [], binaryPeriod: 0,
  },
  jupiter: {
    stars: [{ name: "Sun", mass: 1.0 }],
    Y1: 4332.6, localDay: 9.93, ecc: 0.0489, locked: false, N: 24,
    sats: [{ name: "Io", Ti: 1.769 }, { name: "Europa", Ti: 3.551 }, { name: "Ganymede", Ti: 7.155 }, { name: "Callisto", Ti: 16.689 }],
    overlays: [], binaryPeriod: 0,
  },
  tatooine: {
    stars: [{ name: "Kepler-16A", mass: 0.69 }, { name: "Kepler-16B", mass: 0.20 }],
    Y1: 228.776, localDay: 24, ecc: 0.0069, locked: false, N: 24,
    sats: [],
    overlays: [{ name: "Binary orbit", period: 41.08 / 228.776 }],
    binaryPeriod: 41.08,
  },
  custom: {
    stars: [{ name: "Star A", mass: 1.0 }],
    Y1: 100, localDay: 24, ecc: 0, locked: false, N: 24,
    sats: [], overlays: [], binaryPeriod: 0,
  },
};

function InputRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      <div style={{ width: 180, fontSize: 12, color: "var(--dim2)", fontFamily: "var(--mono)", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 120 }}>{children}</div>
    </div>
  );
}

function NumInput({ value, onChange, min, max, step, style: extraStyle }) {
  return (
    <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
      min={min} max={max} step={step || "any"}
      style={{
        background: "var(--cell)", color: "var(--fg)", border: "1px solid var(--border)",
        borderRadius: 6, padding: "6px 10px", fontFamily: "var(--mono)", fontSize: 13,
        width: "100%", outline: "none", ...extraStyle,
      }}
    />
  );
}

function TextInput({ value, onChange }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: "var(--cell)", color: "var(--fg)", border: "1px solid var(--border)",
        borderRadius: 6, padding: "6px 10px", fontFamily: "var(--mono)", fontSize: 13,
        width: "100%", outline: "none",
      }}
    />
  );
}

function Badge({ text, color }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: color + "20", color, fontFamily: "var(--mono)" }}>{text}</span>;
}

// ── FORMULA ENGINE ──
function compute(state) {
  const { Y1, localDay, ecc, locked, N, sats, stars, overlays, binaryPeriod } = state;
  const Z = (2 * Y1) / N;
  const lo = Y1 / N;
  const hi = Z;
  const localDayDays = localDay / 24;
  const dayExceedsYear = localDay > Y1 * 24;
  const shichenValid = !locked && !dayExceedsYear;
  const shichen = shichenValid ? localDay / 12 : null;

  const classified = sats.map(s => {
    const Ti = s.Ti;
    let mode, label, color;
    if (Ti < localDayDays) { mode = "excluded"; label = "sub-diurnal"; color = "#6b7280"; }
    else if (Ti >= lo && Ti < hi) { mode = "A"; label = "intercalary"; color = "#10b981"; }
    else if (Ti < lo) { mode = "B"; label = "fast"; color = "#3b82f6"; }
    else { mode = "B"; label = "slow"; color = "#3b82f6"; }
    return { ...s, mode, label, color, cyclesPerYear: Y1 / Ti, ratioZ: Ti / Z };
  });

  const modeA = classified.filter(s => s.mode === "A");
  const modeB = classified.filter(s => s.mode === "B");

  let intercalary = null;
  if (modeA.length > 0) {
    const mpy = Y1 / modeA[0].Ti;
    const frac = mpy - Math.floor(mpy);
    intercalary = { monthsPerYear: mpy, fraction: frac, interval: frac > 0 ? 1 / frac : Infinity };
  }

  const gregWorks = stars.length === 1 && sats.length === 1 && modeA.length === 1 && !locked;

  return { Z, lo, hi, shichen, shichenValid, classified, modeA, modeB, intercalary, gregWorks, dayExceedsYear };
}

// ── MAIN ──
export default function CustomCalculator() {
  const [lang, setLang] = useState("zh");
  const [state, setState] = useState({ ...PRESETS.earth });
  const t = L[lang];
  const r = compute(state);

  const set = useCallback((key, val) => setState(prev => ({ ...prev, [key]: val })), []);

  const loadPreset = (key) => setState({ ...PRESETS[key] });

  const addSat = () => set("sats", [...state.sats, { name: `Sat-${state.sats.length + 1}`, Ti: 15 }]);
  const removeSat = (i) => set("sats", state.sats.filter((_, idx) => idx !== i));
  const updateSat = (i, key, val) => set("sats", state.sats.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const addStar = () => set("stars", [...state.stars, { name: `Star ${String.fromCharCode(65 + state.stars.length)}`, mass: 0.5 }]);
  const removeStar = (i) => { if (state.stars.length > 1) set("stars", state.stars.filter((_, idx) => idx !== i)); };
  const updateStar = (i, key, val) => set("stars", state.stars.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const addOverlay = () => set("overlays", [...(state.overlays||[]), { name: `Cycle-${(state.overlays||[]).length+1}`, period: 1 }]);
  const removeOverlay = (i) => set("overlays", (state.overlays||[]).filter((_, idx) => idx !== i));
  const updateOverlay = (i, key, val) => set("overlays", (state.overlays||[]).map((o, idx) => idx === i ? { ...o, [key]: val } : o));

  return (
    <div style={{
      "--bg": "#090b10", "--card": "#11141c", "--cell": "#181c28", "--border": "#222838",
      "--fg": "#e4e7ef", "--dim": "#7b8298", "--dim2": "#9299af", "--accent": "#d4a843",
      "--green": "#10b981", "--blue": "#3b82f6", "--red": "#ef4444", "--orange": "#f97316",
      "--mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      "--body": "'Noto Serif SC', Georgia, serif",
      fontFamily: "var(--body)", background: "var(--bg)", color: "var(--fg)",
      minHeight: "100vh", padding: "20px 12px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20, position: "relative" }}>
          <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} style={{
            position: "absolute", right: 0, top: 0, background: "var(--card)", color: "var(--accent)",
            border: "1px solid var(--accent)", borderRadius: 8, padding: "4px 14px", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
          }}>{t.lang}</button>
          <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: lang === "zh" ? 3 : 1, fontFamily: "var(--mono)", marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.subtitle}</div>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {[["earth", t.presetEarth], ["mars", t.presetMars], ["jupiter", t.presetJupiter], ["tatooine", t.presetTatooine], ["custom", t.presetCustom]].map(([k, label]) => (
            <button key={k} onClick={() => loadPreset(k)} style={{
              background: "var(--card)", color: "var(--dim2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11,
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "start", flexWrap: "wrap" }}>
          {/* LEFT: Inputs */}
          <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Stars */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.starConfig}</div>
              {state.stars.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--mono)", width: 20 }}>Θ{i+1}</div>
                  <TextInput value={s.name} onChange={v => updateStar(i, "name", v)} />
                  <NumInput value={s.mass} onChange={v => updateStar(i, "mass", v)} min={0.01} step={0.01} style={{ width: 80 }} />
                  <span style={{ fontSize: 10, color: "var(--dim)" }}>M☉</span>
                  {state.stars.length > 1 && <button onClick={() => removeStar(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>{t.removeStar}</button>}
                </div>
              ))}
              <button onClick={addStar} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "var(--orange)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addStar}</button>
            </div>

            {/* Planet */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.planetConfig}</div>
              <InputRow label={t.stellarYear}><NumInput value={state.Y1} onChange={v => set("Y1", v)} min={0.1} /></InputRow>
              <InputRow label={t.localDay}><NumInput value={state.localDay} onChange={v => set("localDay", v)} min={0.1} /></InputRow>
              <InputRow label={t.ecc}><NumInput value={state.ecc} onChange={v => set("ecc", v)} min={0} max={0.99} step={0.01} /></InputRow>
              <InputRow label={t.solarTerms}><NumInput value={state.N} onChange={v => set("N", v)} min={2} max={360} step={1} /></InputRow>
              <InputRow label={t.locked}>
                <div style={{ display: "flex", gap: 8 }}>
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => set("locked", v)} style={{
                      background: state.locked === v ? "var(--accent)" : "var(--cell)",
                      color: state.locked === v ? "#090b10" : "var(--dim)",
                      border: `1px solid ${state.locked === v ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 6, padding: "4px 16px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12,
                    }}>{v ? t.yes : t.no}</button>
                  ))}
                </div>
              </InputRow>
              {state.stars.length >= 2 && (
                <InputRow label={t.binaryPeriod}><NumInput value={state.binaryPeriod || 0} onChange={v => set("binaryPeriod", v)} min={0} /></InputRow>
              )}
            </div>

            {/* Satellites */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.satConfig}</div>
              {state.sats.length === 0 && <div style={{ fontSize: 12, color: "var(--dim)", padding: "8px 0" }}>{t.noSats}</div>}
              {state.sats.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", width: 20 }}>Ψ{i+1}</div>
                  <TextInput value={s.name} onChange={v => updateSat(i, "name", v)} />
                  <NumInput value={s.Ti} onChange={v => updateSat(i, "Ti", v)} min={0.001} style={{ width: 100 }} />
                  <span style={{ fontSize: 10, color: "var(--dim)" }}>{t.days}</span>
                  <button onClick={() => removeSat(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>{t.removeSat}</button>
                </div>
              ))}
              <button onClick={addSat} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "var(--green)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addSat}</button>
            </div>

            {/* Overlays */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "#a78bfa", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.overlays}</div>
              {(state.overlays||[]).map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <TextInput value={o.name} onChange={v => updateOverlay(i, "name", v)} />
                  <NumInput value={o.period} onChange={v => updateOverlay(i, "period", v)} min={0.001} style={{ width: 100 }} />
                  <span style={{ fontSize: 10, color: "var(--dim)" }}>{lang === "zh" ? "本地年" : "loc.yr"}</span>
                  <button onClick={() => removeOverlay(i)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>{t.removeSat}</button>
                </div>
              ))}
              <button onClick={addOverlay} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "#a78bfa", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addOverlay}</button>
            </div>

            {/* Tip */}
            <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.6, padding: "0 4px" }}>{t.tip}</div>
          </div>

          {/* RIGHT: Results */}
          <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Derived */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.derivedParams}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.zhongqi}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.Z.toFixed(4)} {t.days}</div>
                </div>
                <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.modeARange}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.lo.toFixed(3)} – {r.hi.toFixed(3)}</div>
                  <div style={{ fontSize: 10, color: "var(--dim2)" }}>{t.days}</div>
                </div>
                <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.shichen}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.shichenValid ? `${r.shichen.toFixed(2)} ${t.hours}` : state.locked ? t.undefined : t.degenerate}</div>
                </div>
                <div style={{ background: "var(--cell)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>m / n</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{state.stars.length} / {state.sats.length}</div>
                </div>
              </div>
            </div>

            {/* Satellite classification */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.satResults}</div>
              {r.classified.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--dim)", padding: "8px 0" }}>n=0</div>
              ) : (
                r.classified.map((s, i) => {
                  const modeLabel = s.mode === "A" ? t.modeA : s.mode === "B" ? t.modeB : t.excluded;
                  const subLabel = s.label === "intercalary" ? t.intercalaryEligible : s.label === "fast" ? t.tooFast : s.label === "slow" ? t.tooSlow : t.subDiurnal;
                  return (
                    <div key={i} style={{ background: "var(--cell)", borderRadius: 8, padding: "10px 14px", borderLeft: `4px solid ${s.color}`, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Ψ{i+1} {s.name}</span>
                        <Badge text={`${modeLabel} · ${subLabel}`} color={s.color} />
                      </div>
                      <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--dim2)", marginTop: 4 }}>
                        Tᵢ={s.Ti} {t.days} · {s.cyclesPerYear.toFixed(1)} {t.cyclesPerYear} · Tᵢ/Z={(s.ratioZ * 100).toFixed(1)}%
                      </div>
                      {/* Visual position bar */}
                      <div style={{ position: "relative", height: 16, background: "#0e1118", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                        {(() => {
                          const scale = r.hi * 1.5 || 1;
                          const pL = (r.lo / scale) * 100;
                          const pR = (r.hi / scale) * 100;
                          const pV = Math.min((s.Ti / scale) * 100, 100);
                          return <>
                            <div style={{ position: "absolute", left: `${pL}%`, width: `${pR - pL}%`, height: "100%", background: "#10b98118", borderLeft: "1px solid #10b981", borderRight: "1px solid #10b981" }} />
                            <div style={{ position: "absolute", left: `${pV}%`, top: 2, height: 12, width: 3, background: s.color, borderRadius: 2, transform: "translateX(-1.5px)" }} />
                          </>;
                        })()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Intercalary */}
            {r.intercalary && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.intercalary}</div>
                <div style={{ fontSize: 13, fontFamily: "var(--mono)", lineHeight: 2, color: "var(--fg)" }}>
                  <div>Y₁/Tᵢ = {r.intercalary.monthsPerYear.toFixed(4)} {t.monthsPerYear}</div>
                  <div>{t.fraction} = {r.intercalary.fraction.toFixed(4)}</div>
                  <div>{t.leapFreq} <b>{r.intercalary.interval.toFixed(2)}</b> {t.localYears}</div>
                </div>
              </div>
            )}

            {/* Keplerian */}
            {state.ecc > 0.05 && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>{t.keplerNote} · e={state.ecc}</div>
                <div style={{ fontSize: 12, color: "var(--dim2)", lineHeight: 1.6 }}>{t.highEcc}</div>
              </div>
            )}

            {/* Formula summary */}
            <div style={{ background: "var(--card)", border: "1px solid var(--accent)40", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.formulaBox}</div>
              <div style={{ background: "var(--cell)", borderRadius: 8, padding: 14, fontFamily: "var(--mono)", fontSize: 13, lineHeight: 2 }}>
                <div style={{ color: "var(--dim2)", fontSize: 11 }}>C<sub>p</sub> = Φ<sub>A</sub>(Θ₁, {"{Ψ∈A}"}) ⊕ Φ<sub>B</sub>(Θ₁…Θ<sub>{state.stars.length}</sub>, {"{Ψ∈B}"})</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--green)" }}>Φ<sub>A</sub>: </span>
                  {r.modeA.length > 0 ? r.modeA.map(s => s.name).join(", ") + " ✓" : t.emptySet}
                </div>
                <div>
                  <span style={{ color: "var(--blue)" }}>Φ<sub>B</sub>: </span>
                  {r.modeB.length > 0 || (state.overlays||[]).length > 0
                    ? [...r.modeB.map(s => s.name), ...(state.overlays||[]).map(o => o.name)].join(", ")
                    : t.emptySet}
                </div>
                <div style={{
                  marginTop: 10, padding: "8px 12px", borderRadius: 6, fontWeight: 600,
                  background: r.modeA.length > 0 ? "#10b98115" : "#f59e0b15",
                  color: r.modeA.length > 0 ? "var(--green)" : "#f59e0b",
                }}>
                  {r.modeA.length > 0 ? `✓ ${t.output}: ${t.luniSolar}` :
                    state.sats.length === 0 ? `→ ${t.output}: ${t.pureSolar}` :
                    `→ ${t.output}: ${t.solarPlus(r.modeB.length)}`}
                </div>
                <div style={{
                  marginTop: 6, padding: "8px 12px", borderRadius: 6,
                  background: r.gregWorks ? "#10b98115" : "#ef444415",
                  color: r.gregWorks ? "var(--green)" : "var(--red)",
                }}>
                  {r.gregWorks ? t.gregOk : t.gregFail}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
