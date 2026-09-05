import { useState, useCallback, useMemo } from "react";
import { bestRational } from "./formula.js";
import { evaluateModel } from "./core/模型.mjs";
import { PRESETS } from "./core/预设.mjs";
import { LIMITS } from "./core/参数校验.mjs";

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
    stellarYear: "行星年 Y₁ (本地日)",
    localDay: "本地日时长（小时，可选）",
    ecc: "轨道离心率 e",
    locked: "潮汐锁定",
    yes: "是", no: "否",
    solarTerms: "节气分段 N",
    satConfig: "卫星配置",
    satName: "卫星名称",
    satPeriod: "朔望周期 Tᵢ (本地日)",
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
    intercalary: "平均周期比（不是置闰计数）",
    monthsPerYear: "月/年",
    fraction: "年余分",
    leapFreq: "余分倒数 ≈",
    localYears: "本地年（非实际置闰间隔）",
    leapDayTitle: "岁余 · 置闰日",
    leapDayPerYear: "年长（本地日）",
    leapDayFrac: "岁余",
    leapDayCycle: (p, q) => `每 ${q} 年插 ${p} 个闰日`,
    formulaBox: "公式总结",
    output: "华夏历输出",
    luniSolar: "阴阳合历",
    pureSolar: "纯太阳历 (n=0)",
    solarPlus: (n) => `太阳历 + ${n}乙型计数轨`,
    gregOk: "年长接近公历平均年 ✓",
    gregFail: "不满足此年长匹配判据（非公历失效）",
    emptySet: "空集",
    keplerNote: "开普勒效应",
    highEcc: "高离心率：置闰自动聚集于远日点",
    presets: "预设模板",
    presetEarth: "地球",
    presetMars: "火星",
    presetJupiter: "木星",
    presetTatooine: "塔图因 (Kepler-16b)",
    presetCustom: "清空自定义",
    presetExtreme: "极端 e=0.95",
    overlays: "乙型叠合体 (可选)",
    overlayName: "名称",
    overlayPeriod: "周期 (本地年)",
    addOverlay: "+ 添加叠合体",
    binaryPeriod: "双星互绕周期 (地球日)",
    tip: "提示：修改任何参数，右侧结果实时更新。试试改变卫星周期看它如何在甲/乙型之间跳转！",
    tipEn: "Tip: Change any parameter and results update in real time. Try adjusting satellite period to see it jump between Mode A and B!",
    generateReport: "生成报告",
    copyReport: "复制文本",
    copied: "已复制 ✓",
    reportTitle: "行星历法分析报告",
    reportSubtitle: "基于华夏历通用行星公式",
    rBasic: "基本参数",
    rDerived: "推导参数",
    rStars: "恒星层",
    rSats: "卫星分类",
    rNoSat: "无卫星 (n=0)",
    rIntercalary: "平均周期比（不是置闰计数）",
    rIntMonth: "整数月数",
    rFrac: "年余分",
    rFreq: "余分倒数 ≈",
    rLocalYr: "本地年（非实际置闰间隔）",
    rZhang: "余分有理近似（非已证章法）",
    rOverlays: "乙型叠合体",
    rOutput: "公式输出",
    rCalType: "历法类型",
    rGreg: "公历兼容性",
    rFooter: "分析框架：贾润章《华夏历》2026 · §4 通用行星公式",
    calendarShow: "▼ 历法表",
    calendarHide: "▲ 历法表",
    calYearLabel: "年", calMonthsLabel: "月数", calLeapLabel: "置闰", calDaysLabel: "本地日",
    calLeapMark: (n) => `闰${n}月`,
    calNoLeap: "—",
    calZhangSummary: (y, l, d) => `${y}年 · 理论置闰${l}次 · 合计 ${d} 本地日`,
    calZhangSimulated: (l) => `本次模拟: ${l}次 (历元效应)`,
    calZhangError: (p) => `章法精度: ${p}%`,
    calTermLabel: (j) => `节气 ${j}`,
    calTermDays: "本地日",
    calTiZ: (Ti, Z) => `Tᵢ = ${Ti} 本地日  ·  Z = ${Z} 本地日`,
    localDayConv: (ed, sh) => `1 本地日 = ${ed} 地球日 · 1 时辰 = ${sh} 小时`,
    yearViewTitle: "年图 · Cp = ΦA ⊕ ΦB",
    yearViewPhiA: "ΦA 月份层",
    yearViewPhiB: "ΦB 节气层",
    solarCycleTitle: (n) => `岁余 · ${n}年置闰周期`,
    solarLeapDay: (n) => `+1日 · 第${n}节气后`,
    solarLeapMark: "← 闰日",
    solarYearSummary: (y, l, d) => `${y}年 · 置闰${l}次 · 合计 ${d} 本地日`,
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
    stellarYear: "Planet Year Y₁ (local days)",
    localDay: "Local Day Length (hours, optional)",
    ecc: "Orbital Eccentricity e",
    locked: "Tidally Locked",
    yes: "Yes", no: "No",
    solarTerms: "Solar Term Divisions N",
    satConfig: "Satellite Configuration",
    satName: "Satellite Name",
    satPeriod: "Synodic Period Tᵢ (local days)",
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
    intercalary: "Mean cycle ratio (not an intercalation count)",
    monthsPerYear: "months/year",
    fraction: "Annual fraction",
    leapFreq: "Reciprocal fraction ≈",
    localYears: "local years (not a leap interval)",
    leapDayTitle: "Day Surplus · Leap Day (岁余)",
    leapDayPerYear: "Year (local days)",
    leapDayFrac: "Day surplus (岁余)",
    leapDayCycle: (p, q) => `${p} leap day(s) per ${q} years`,
    formulaBox: "Formula Summary",
    output: "Huaxia Li Output",
    luniSolar: "Lunisolar Calendar",
    pureSolar: "Pure Solar Calendar (n=0)",
    solarPlus: (n) => `Solar + ${n} Mode B tracks`,
    gregOk: "Year length near Gregorian mean ✓",
    gregFail: "Year-length criterion not met (not calendar failure)",
    emptySet: "∅ empty",
    keplerNote: "Keplerian Effect",
    highEcc: "High eccentricity: intercalary insertions cluster near aphelion automatically",
    presets: "Presets",
    presetEarth: "Earth",
    presetMars: "Mars",
    presetJupiter: "Jupiter",
    presetTatooine: "Tatooine (Kepler-16b)",
    presetCustom: "Clear / Custom",
    presetExtreme: "Extreme e=0.95",
    overlays: "Mode B Overlays (optional)",
    overlayName: "Name",
    overlayPeriod: "Period (local years)",
    addOverlay: "+ Add Overlay",
    binaryPeriod: "Binary Mutual Orbit (Earth days)",
    tip: "Tip: Change any parameter and results update in real time. Try adjusting satellite period to see it jump between Mode A and B!",
    generateReport: "Generate Report",
    copyReport: "Copy Text",
    copied: "Copied ✓",
    reportTitle: "Planetary Calendar Report",
    reportSubtitle: "Based on the Huaxia Calendar Universal Planetary Formula",
    rBasic: "Basic Parameters",
    rDerived: "Derived Parameters",
    rStars: "Stellar Layer",
    rSats: "Satellite Classification",
    rNoSat: "No satellites (n=0)",
    rIntercalary: "Mean cycle ratio (not an intercalation count)",
    rIntMonth: "Integer months",
    rFrac: "Annual fraction",
    rFreq: "Reciprocal fraction ≈",
    rLocalYr: "local years (not a leap interval)",
    rZhang: "Rational approximation (not a certified cycle)",
    rOverlays: "Mode B Overlays",
    rOutput: "Formula Output",
    rCalType: "Calendar Type",
    rGreg: "Gregorian Compatibility",
    rFooter: "Framework: Jia Runzhang, Huaxia Calendar (2026) · §4 Universal Planetary Formula",
    calendarShow: "▼ Calendar",
    calendarHide: "▲ Calendar",
    calYearLabel: "Year", calMonthsLabel: "Months", calLeapLabel: "Intercalary", calDaysLabel: "Local Days",
    calLeapMark: (n) => `+M${n}`,
    calNoLeap: "—",
    calZhangSummary: (y, l, d) => `${y} yrs · theoretical ${l} intercalary · ${d} local days total`,
    calZhangSimulated: (l) => `Simulated: ${l} (epoch effect)`,
    calZhangError: (p) => `Zhang accuracy: ${p}%`,
    calTermLabel: (j) => `Term ${j}`,
    calTermDays: "local d",
    calTiZ: (Ti, Z) => `Tᵢ = ${Ti} local d  ·  Z = ${Z} local d`,
    localDayConv: (ed, sh) => `1 local day = ${ed} Earth days · 1 shichen = ${sh} h`,
    yearViewTitle: "Year View · Cp = ΦA ⊕ ΦB",
    yearViewPhiA: "ΦA Lunar months",
    yearViewPhiB: "ΦB Solar terms",
    solarCycleTitle: (n) => `Day Surplus · ${n}-Year Leap Cycle`,
    solarLeapDay: (n) => `+1 d · after term ${n}`,
    solarLeapMark: "← leap day",
    solarYearSummary: (y, l, d) => `${y} yrs · ${l} leap insertions · ${d} local days total`,
  },
};

// ── HELPERS ── 共享实现见 formula.js

// ── PRESETS ──
// N = 节气分段数：太阳侧分辨率的独立约定（黄道 360° 等分 N 份，偶数使节/气成对）。
// 因果链（勿倒）：先选 N（想把季节跟踪到多细），卫星再受判——
//   甲型判据 Y₁/N ≤ Tᵢ < 2Y₁/N 等价于 月数/年 ∈ (N/2, N]。
// 地球 N=24 恰好 = 2×月数(12.37)，是华夏历刻意利用的共振（无中气置闰机制最紧），
//   属设计巧思而非判据前提；N = 2·round(Y₁/Tᵢ) 只是给新行星选共振最优 N 的启发式。
// ⚠  慎重修改：N 牵动 Z、lo、hi、历法表全部导出量，改之前先确认意图。

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
    <input type="number" value={value} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
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
    <input type="text" maxLength={LIMITS.maxName} value={value} onChange={e => onChange(e.target.value)}
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

// ── REPORT GENERATOR ──
function buildReport(state, r, t, lang) {
  const zh = lang === "zh";
  const d = zh ? "天" : "days";
  const hr = zh ? "小时" : "hours";
  const sep = "─".repeat(52);
  const lines = [
    sep,
    `  ${t.reportTitle}`,
    `  ${t.reportSubtitle}`,
    `  Cp = ΦA(Θ₁,{Ψ∈A}) ⊕ ΦB(Θ₁…Θm,{Ψ∈B})`,
    sep,
    "",
    `【${t.rBasic}】`,
    `  Y₁ (${zh ? "行星年" : "Planet Year"}): ${state.Y1} ${d}`,
    `  ${zh ? "本地日" : "Local Day"}: ${state.localDay} ${hr}`,
    `  e (${zh ? "离心率" : "Eccentricity"}): ${state.ecc}`,
    `  N (${zh ? "节气分段" : "Solar Term Div."}): ${state.N}`,
    ...(state.locked ? [`  ⚠ ${zh ? "潮汐锁定" : "Tidally Locked"}`] : []),
    "",
    `【${t.rDerived}】`,
    `  Z (${zh ? "中气间隔" : "Zhongqi Interval"}): ${r.Z.toFixed(4)} ${d}`,
    `  ${zh ? "甲型范围" : "Mode A Range"}: [${r.lo.toFixed(2)}, ${r.hi.toFixed(2)}) ${d}`,
    ...(r.shichenValid ? [`  ${zh ? "时辰" : "Shichen"}: ${r.shichen.toFixed(2)} ${hr}`] : []),
    "",
    `【${t.rStars}】 m=${state.stars.length}`,
    ...state.stars.map((s, i) => `  Θ${i + 1}: ${s.name} (${s.mass} M☉)`),
    ...(state.binaryPeriod > 0 ? [`  ${zh ? "双星周期" : "Binary Period"}: ${state.binaryPeriod} ${d}`] : []),
    "",
    `【${t.rSats}】 n=${state.sats.length}`,
    ...(state.sats.length === 0
      ? [`  ${t.rNoSat}`]
      : r.classified.map(s => {
          const tag = s.mode === "A" ? (zh ? "甲型 ✓" : "Mode A ✓") : s.mode === "B" ? (zh ? "乙型" : "Mode B") : (zh ? "排除" : "Excluded");
          return `  ${s.name}: Tᵢ=${s.Ti} ${d} → ${tag}  (Tᵢ/Z=${(s.ratioZ * 100).toFixed(1)}%)`;
        })),
    "",
    ...(r.intercalary ? [
      `【${t.rIntercalary}】`,
      `  Y₁/Tᵢ = ${r.intercalary.monthsPerYear.toFixed(4)} ${zh ? "月/年" : "months/yr"}`,
      `  ${t.rIntMonth} = ${Math.floor(r.intercalary.monthsPerYear)}`,
      `  ${t.rFrac} = ${r.intercalary.fraction.toFixed(5)}`,
      `  ${t.rFreq} ${r.intercalary.interval.toFixed(2)} ${t.rLocalYr}`,
      ...(() => {
        const br = bestRational(r.intercalary.fraction);
        const err = r.intercalary.fraction === 0 ? "0.000" : (Math.abs(br.p / br.q - r.intercalary.fraction) / r.intercalary.fraction * 100).toFixed(3);
        return [`  ${t.rZhang}: ${br.p}/${br.q}  (${zh ? "误差" : "error"}: ${err}%)`];
      })(),
      "",
    ] : []),
    ...(r.leapDay ? [
      `【${zh ? "岁余·置闰日" : "Day Surplus · Leap Day"}】`,
      `  ${zh ? "年长（本地日）" : "Year (local days)"}: ${r.leapDay.daysPerYear.toFixed(4)}`,
      `  ${zh ? "岁余" : "Day surplus"}: ${(r.leapDay.daysPerYear - Math.floor(r.leapDay.daysPerYear)).toFixed(4)}`,
      `  ${r.leapDay.p}/${r.leapDay.q} → ${zh ? `每 ${r.leapDay.q} 年插 ${r.leapDay.p} 个闰日` : `${r.leapDay.p} leap day(s) per ${r.leapDay.q} years`}`,
      "",
    ] : []),
    ...((state.overlays || []).length > 0 ? [
      `【${t.rOverlays}】`,
      ...(state.overlays || []).map(o => `  ${o.name}: ${o.period} ${zh ? "本地年/周期" : "local yrs/cycle"}`),
      "",
    ] : []),
    `【${t.rOutput}】`,
    `  ΦA: ${r.modeA.length > 0 ? r.modeA.map(s => s.name).join(", ") + " ✓" : (zh ? "空集 ∅" : "∅ empty")}`,
    `  ΦB: ${[...r.modeB.map(s => s.name), ...(state.overlays || []).map(o => o.name)].join(", ") || (zh ? "空集 ∅" : "∅ empty")}`,
    "",
    `  ${t.rCalType}: ${r.modeA.length > 0 ? (zh ? "阴阳合历" : "Lunisolar Calendar") : state.sats.length === 0 ? (zh ? "纯太阳历 (n=0)" : "Pure Solar (n=0)") : (zh ? `太阳历 + ${r.modeB.length}条乙型计数轨` : `Solar + ${r.modeB.length} Mode B tracks`)}`,
    `  ${r.gregWorks ? t.gregOk : t.gregFail}`,
    "",
    sep,
    `  ${t.rFooter}`,
    `${zh ? "主历卫星" : "Calendar satellite"}: ${r.primary ? `${r.primary.index+1}. ${r.primary.name}` : "—"}`,
    zh ? "月界为连续[start,end)；整数日仅舍入展示；累计中气截组不等于民用历年。太阳年窗口账见月表，跨界月单列。" : "Months use continuous [start,end); integer days are rounded display only. Event-count groups are not civil years. Solar-window ledgers and crossing fragments are shown in the month table.",
    zh ? "本地修订预览：平均周期比不是置闰计数；多星配置不是多体解算；本报告不是认证民用历。" : "Local revision preview: mean cycle ratios are not intercalation counts; multi-star configuration is not a many-body solver; this is not a certified civil calendar.",
    sep,
  ];
  return lines.join("\n");
}

// ── YEAR VIEW COMPONENT ──
function YearView({ cal, r, lang, t }) {
  const zh = lang === "zh";
  const Y1 = cal.Y1;

  // ΦB 节气层：每格按比例宽度，标整数起始日
  const PhiBRow = ({ terms, totalW }) => (
    <div>
      <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--mono)", marginBottom: 4 }}>{t.yearViewPhiB}</div>
      <div style={{ display: "flex", gap: 1, borderRadius: 4, overflow: "hidden", height: 32 }}>
        {terms.map((term, i) => {
          const isAph = cal.aphTermNum === term.j;
          const color = term.length < r.lo * 0.99 ? "#3b82f6" : term.length > r.lo * 1.01 ? "#f59e0b" : "#10b981";
          return (
            <div key={i} title={`${zh ? "节气" : "Term"} ${term.j}  ${zh ? "第" : "Day "}${term.dayStart ?? (Math.round(term.start) + 1)}`}
              style={{ flex: term.length, background: color + "22", borderLeft: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0, position: "relative" }}>
              {isAph && <span style={{ fontSize: 8, color: "#f59e0b", fontFamily: "var(--mono)" }}>▲</span>}
            </div>
          );
        })}
      </div>
      {/* 节气起始日刻度：每隔 N/8 个标一次，避免拥挤 */}
      <div style={{ display: "flex", fontSize: 8, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2, position: "relative", height: 12 }}>
        {terms.filter((_, i) => i % Math.max(1, Math.round(terms.length / 8)) === 0).map((term, i) => (
          <div key={i} style={{ position: "absolute", left: `${(term.dayStart ?? Math.round(term.start) + 1) / Y1 * 100}%`, transform: "translateX(-50%)" }}>
            {zh ? `第${term.dayStart ?? Math.round(term.start) + 1}日` : `d${term.dayStart ?? Math.round(term.start) + 1}`}
          </div>
        ))}
      </div>
    </div>
  );

  // 整数日月份表（通用）
  const DayTable = ({ rows, leapTermNum }) => (
    <div style={{ overflowX: "auto", marginTop: 8 }}>
      <table style={{ borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12, width: "100%" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {[zh ? "月/节气" : "Month/Term", zh ? "起始日" : "Start day", zh ? "天数" : "Days", zh ? "备注" : "Note"].map((h, i) => (
              <th key={i} style={{ padding: "5px 12px", textAlign: "left", color: "var(--dim)", fontWeight: 400, fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #ffffff06", background: row.highlight ? row.highlight + "12" : "transparent" }}>
              <td style={{ padding: "3px 12px", color: row.labelColor ?? "var(--dim2)" }}>{row.label}</td>
              <td style={{ padding: "3px 12px" }}>{row.startDay}</td>
              <td style={{ padding: "3px 12px", fontWeight: row.highlight ? 600 : 400, color: row.highlight ?? "var(--fg)" }}>{row.days}</td>
              <td style={{ padding: "3px 12px", fontSize: 10, color: "var(--dim)" }}>{row.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (cal.type === "solar") {
    const rows = cal.terms.map((term, i, arr) => {
      const isAph = cal.aphTermNum === term.j;
      const isFast = term.length < r.lo * 0.99;
      const isSlow = term.length > r.lo * 1.01;
      // 相邻 dayStart 做差 → Bresenham 精度，总和保证等于 round(Y1)
      const termDays = i < arr.length - 1
        ? arr[i + 1].dayStart - term.dayStart
        : Math.round(cal.Y1) + 1 - term.dayStart;
      return {
        label: zh ? `节气 ${term.j}` : `Term ${term.j}`,
        labelColor: isAph ? "#f59e0b" : "var(--dim2)",
        startDay: zh ? `第 ${term.dayStart} 日` : `Day ${term.dayStart}`,
        days: termDays,
        highlight: isAph ? "#f59e0b" : isFast ? "#3b82f6" : isSlow ? "#f59e0b" : null,
        note: isAph ? (zh ? "← 闰日 · 远日点" : "← leap day · aphelion") : isFast ? (zh ? "近日点" : "perihelion") : isSlow ? (zh ? "远日点侧" : "aphelion side") : "",
      };
    });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PhiBRow terms={cal.terms} totalW={Y1} />
        <DayTable rows={rows} />
      </div>
    );
  }

  // 阴阳合历：ΦA 月份层 + ΦB 节气层
  const d1 = cal.year1detail;
  if (!d1) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ΦA 月份层 */}
      <div>
        <div style={{ fontSize: 10, color: "#10b981", fontFamily: "var(--mono)", marginBottom: 4 }}>{t.yearViewPhiA}</div>
        <div style={{ display: "flex", gap: 1, borderRadius: 4, overflow: "hidden", height: 32 }}>
          {d1.months.map((m, i) => (
            <div key={i} title={`${m.isIntercalary ? (zh ? "闰月" : "Leap") : (zh ? `${m.num}月` : `M${m.num}`)}  ${zh ? "第" : "Day "}${m.dayStart}`}
              style={{ flex: m.length, background: m.isIntercalary ? "#f59e0b22" : i % 2 === 0 ? "#10b98125" : "#10b98112", borderLeft: `2px solid ${m.isIntercalary ? "#f59e0b" : "#10b981"}`, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
              <span style={{ fontSize: 9, color: m.isIntercalary ? "#f59e0b" : "#10b981", fontFamily: "var(--mono)", overflow: "hidden" }}>
                {m.isIntercalary ? (zh ? "闰" : "L") : m.num}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 8, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2, position: "relative", height: 12 }}>
          {d1.months.filter((_, i) => i % Math.max(1, Math.round(d1.months.length / 6)) === 0).map((m, i) => (
            <div key={i} style={{ position: "absolute", left: `${m.dayStart / d1.totalDays * 100}%`, transform: "translateX(-50%)" }}>
              {zh ? `第${m.dayStart}日` : `d${m.dayStart}`}
            </div>
          ))}
        </div>
      </div>

      {/* ΦB 节气层（用 year1detail.terms 的整数日定位） */}
      <div>
        <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--mono)", marginBottom: 4 }}>{t.yearViewPhiB}</div>
        <div style={{ display: "flex", gap: 1, borderRadius: 4, overflow: "hidden", height: 32, position: "relative" }}>
          {d1.terms.map((term, i) => {
            const nextDay = i + 1 < d1.terms.length ? d1.terms[i + 1].day : Math.round(cal.Y1) + 1;
            const len = nextDay - term.day;
            const color = len < r.lo * 0.99 ? "#3b82f6" : len > r.lo * 1.01 ? "#f59e0b" : "#10b981";
            const isAph = cal.aphTermNum === term.j;
            return (
              <div key={i} title={`${zh ? "节气" : "Term"} ${term.j}  ${zh ? "第" : "Day "}${term.day}`}
                style={{ flex: len, background: color + "22", borderLeft: `2px solid ${color + (isAph ? "ff" : "88")}`, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                {isAph && <span style={{ fontSize: 8, color: "#f59e0b" }}>▲</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", fontSize: 8, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2, position: "relative", height: 12 }}>
          {d1.terms.filter((_, i) => i % Math.max(1, Math.round(d1.terms.length / 8)) === 0).map((term, i) => (
            <div key={i} style={{ position: "absolute", left: `${(term.day - 1) / Math.round(cal.Y1) * 100}%`, transform: "translateX(-50%)" }}>
              {zh ? `第${term.day}日` : `d${term.day}`}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.7 }}>
        {zh
          ? `第1年 · ${d1.months.length}个月 · ${d1.totalDays}本地日 · N=${cal.N}节气`
          : `Year 1 · ${d1.months.length} months · ${d1.totalDays} local days · N=${cal.N} terms`}
        {cal.aphTermNum && <span style={{ color: "#f59e0b", marginLeft: 8 }}>{zh ? `▲ 远日点 第${cal.aphTermNum}节气` : `▲ aphelion term ${cal.aphTermNum}`}</span>}
      </div>

      {/* 月份整数日表 */}
      {(() => {
        const longMonth = Math.ceil(cal.Ti);
        return <DayTable rows={d1.months.map(m => ({
          label: m.isIntercalary ? (zh ? `闰${m.leapAfter}月` : `Leap M${m.leapAfter}`) : (zh ? `${m.num}月` : `Month ${m.num}`),
          labelColor: m.isIntercalary ? "#f59e0b" : "var(--dim2)",
          startDay: zh ? `第 ${m.dayStart} 日` : `Day ${m.dayStart}`,
          days: m.length,
          highlight: m.isIntercalary ? "#f59e0b" : m.length >= longMonth ? "#10b981" : null,
          note: m.isIntercalary ? (zh ? "无中气 → 置闰" : "no Zhongqi → intercalary") : m.length >= longMonth ? (zh ? "大月" : "long month") : (zh ? "小月" : "short month"),
        }))} />;
      })()}
    </div>
  );
}

// ── MAIN ──
export default function CustomCalculator({ lang }) {
  const [state, setState] = useState({ ...PRESETS.earth });
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [showYearView, setShowYearView] = useState(false);
  const t = L[lang];
  const { r, cal, errors } = useMemo(() => evaluateModel(state), [state]);
  const reportText = showReport && r ? buildReport(state, r, t, lang) : "";

  const set = useCallback((key, val) => setState(prev => ({ ...prev, [key]: val })), []);

  const loadPreset = (key) => setState({ ...PRESETS[key] });

  const addSat = () => set("sats", [...state.sats, { name: `Sat-${state.sats.length + 1}`, Ti: 15 }]);
  const removeSat = (i) => setState(prev => ({...prev,
    sats: prev.sats.filter((_,idx)=>idx!==i),
    primarySatellite: prev.primarySatellite === i ? -1 : prev.primarySatellite > i ? prev.primarySatellite-1 : prev.primarySatellite,
  }));
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
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: lang === "zh" ? 3 : 1, fontFamily: "var(--mono)", marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.subtitle}</div>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {[["earth", t.presetEarth], ["mars", t.presetMars], ["jupiter", t.presetJupiter], ["tatooine", t.presetTatooine], ["extreme", t.presetExtreme], ["custom", t.presetCustom]].map(([k, label]) => (
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
              <button disabled={state.stars.length >= LIMITS.maxItems} onClick={addStar} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "var(--orange)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addStar}</button>
            </div>

            {/* Planet */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.planetConfig}</div>
              <InputRow label={t.stellarYear}><NumInput value={state.Y1} onChange={v => set("Y1", v)} min={0.1} /></InputRow>
              <InputRow label={t.localDay}><NumInput value={state.localDay} onChange={v => set("localDay", v)} min={0} /></InputRow>
              <InputRow label={t.ecc}><NumInput value={state.ecc} onChange={v => set("ecc", v)} min={0} max={0.99} step={0.01} /></InputRow>
              {/* Raw N stays visible; validation rejects odd/out-of-range edits. */}
              <InputRow label={t.solarTerms}><NumInput value={state.N} onChange={v => set("N", v)} min={4} max={360} step={2} /></InputRow>
              <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", paddingLeft: 190, marginTop: -4, marginBottom: 8 }}>
                {lang === "zh"
                  ? "N 是太阳侧约定；卫星受判于 N（月数/年 ∈ (N/2, N] ⇒ 甲型）"
                  : "N is a solar-side convention; satellites are tested against it (months/yr ∈ (N/2, N] ⇒ Mode A)"}
              </div>
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
                <InputRow label={t.binaryPeriod}><NumInput value={state.binaryPeriod} onChange={v => set("binaryPeriod", v)} min={0} /></InputRow>
              )}
            </div>

            {/* Satellites */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.satConfig}</div>
              <label style={{display:"block",marginBottom:12,fontSize:12}}>
                {lang === "zh" ? "主历卫星：" : "Calendar satellite: "}
                <select value={state.primarySatellite ?? ""} onChange={e=>set("primarySatellite",e.target.value === "" ? null : Number(e.target.value))}>
                  <option value="">{lang === "zh" ? "自动（仅限唯一甲型；多候选须选）" : "Auto (unique Mode A only; choose if multiple)"}</option>
                  {state.primarySatellite === -1 && <option value={-1}>{lang === "zh" ? "原选择已删除，请重选" : "Selection deleted; choose again"}</option>}
                  {state.sats.map((s,i)=><option key={i} value={i}>{i+1}. {s.name || "?"}</option>)}
                </select>
              </label>
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
              <button disabled={state.sats.length >= LIMITS.maxItems} onClick={addSat} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "var(--green)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addSat}</button>
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
              <button disabled={state.overlays.length >= LIMITS.maxItems} onClick={addOverlay} style={{ background: "var(--cell)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", color: "#a78bfa", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11, marginTop: 4 }}>{t.addOverlay}</button>
            </div>

            {/* Tip */}
            <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.6, padding: "0 4px" }}>{t.tip}</div>
          </div>

          {/* RIGHT: Results */}
          {errors.length > 0 && <div role="alert" style={{ flex: 1, minWidth: 280, padding: 18, border: "1px solid #ef4444", borderRadius: 12 }}>
            <strong>{lang === "zh" ? "请修正参数；计算与报告已暂停" : "Correct parameters; calculation and reporting paused"}</strong>
            <ul>{errors.map(e => <li key={e.field}>{e.field}: {lang === "zh" ? e.zh : e.en}</li>)}</ul>
            <div>{lang === "zh" ? "这些是本地演示的数值与资源边界，不是天体存在与否的判据。" : "These are numerical and resource limits of the local demo, not physical existence criteria."}</div>
          </div>}
          {r && <>
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

            {/* 岁余·置闰日 */}
            {r.leapDay && (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 12, color: "var(--orange)", fontFamily: "var(--mono)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.leapDayTitle}</div>
                <div style={{ fontSize: 13, fontFamily: "var(--mono)", lineHeight: 2, color: "var(--fg)" }}>
                  <div>{t.leapDayPerYear} = {Math.floor(r.leapDay.daysPerYear)} + {(r.leapDay.daysPerYear - Math.floor(r.leapDay.daysPerYear)).toFixed(4)}</div>
                  <div>{t.leapDayFrac} = {(r.leapDay.daysPerYear - Math.floor(r.leapDay.daysPerYear)).toFixed(4)} → {r.leapDay.p}/{r.leapDay.q}</div>
                  <div style={{ color: "var(--orange)", fontWeight: 600 }}>{t.leapDayCycle(r.leapDay.p, r.leapDay.q)}</div>
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
          </>}
        </div>

        {r && <>
        <aside style={{ marginTop: 16, padding: 14, border: "1px solid #d4a84366", borderRadius: 8, lineHeight: 1.7 }}>
          {lang === "zh"
            ? "当前实验约定：月界按连续时刻 [start,end) 计中气；整数日仅用四舍五入展示，尚未按整日重新归属事件。累计至少 N/2 个中气后截组，不称认证历年。多个甲型卫星须明确选主历；初朔和近日点锚在 t=0。"
            : "Experimental conventions: events use continuous [start,end) month boundaries. Rounded integer days are display-only, without event reassignment. Groups close after at least N/2 events, not certified civil year boundaries. Multiple Mode A satellites require explicit selection; mean new moon and perihelion start at t=0."}
          <div>{lang === "zh" ? "当前主历卫星：" : "Current calendar satellite: "}{r.primary?.name ?? "—"}</div>
        </aside>
        {/* Generate Report */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={() => { setShowReport(v => !v); setCopied(false); }} style={{
            background: showReport ? "var(--accent)" : "var(--card)",
            color: showReport ? "#090b10" : "var(--accent)",
            border: "1px solid var(--accent)", borderRadius: 10,
            padding: "10px 28px", cursor: "pointer", fontFamily: "var(--body)",
            fontSize: 14, fontWeight: 700, letterSpacing: 1,
            transition: "all 0.15s",
          }}>
            {showReport ? "▲ " : "▼ "}{t.generateReport}
          </button>
        </div>

        {showReport && (
          <div style={{ marginTop: 16, background: "var(--card)", border: "1px solid var(--accent)40", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase" }}>{t.reportTitle}</div>
              <button onClick={() => {
                navigator.clipboard.writeText(reportText).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }} style={{
                background: copied ? "#10b98120" : "var(--cell)",
                color: copied ? "#10b981" : "var(--dim2)",
                border: `1px solid ${copied ? "#10b981" : "var(--border)"}`,
                borderRadius: 8, padding: "5px 14px", cursor: "pointer",
                fontFamily: "var(--mono)", fontSize: 12, transition: "all 0.2s",
              }}>
                {copied ? t.copied : t.copyReport}
              </button>
            </div>
            <pre style={{
              fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg)",
              lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0,
              background: "var(--cell)", borderRadius: 10, padding: "16px 20px",
              overflowX: "auto",
            }}>{reportText}</pre>
          </div>
        )}

        {/* Calendar Table */}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button onClick={() => setShowCal(v => !v)} style={{
            background: showCal ? "var(--green)" : "var(--card)",
            color: showCal ? "#090b10" : "var(--green)",
            border: "1px solid var(--green)", borderRadius: 10,
            padding: "10px 28px", cursor: "pointer", fontFamily: "var(--body)",
            fontSize: 14, fontWeight: 700, letterSpacing: 1, transition: "all 0.15s",
          }}>
            {showCal ? t.calendarHide : t.calendarShow}
          </button>
        </div>

        {/* 年图按钮 */}
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <button onClick={() => setShowYearView(v => !v)} style={{
            background: showYearView ? "var(--accent)" : "var(--card)",
            color: showYearView ? "#090b10" : "var(--accent)",
            border: "1px solid var(--accent)", borderRadius: 10,
            padding: "10px 28px", cursor: "pointer", fontFamily: "var(--body)",
            fontSize: 14, fontWeight: 700, letterSpacing: 1, transition: "all 0.15s",
          }}>
            {showYearView ? "▲ " : "▼ "}{t.yearViewTitle}
          </button>
        </div>

        {showYearView && (
          <div style={{ marginTop: 16, background: "var(--card)", border: "1px solid #d4a84340", borderRadius: 14, padding: "20px 24px" }}>
            <YearView cal={cal} r={r} lang={lang} t={t} />
          </div>
        )}

        {showCal && (
          <div style={{ marginTop: 16, background: "var(--card)", border: "1px solid #10b98140", borderRadius: 14, padding: "20px 24px" }}>
            {cal.type === "lunisolar" ? (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase" }}>
                    {lang === "zh" ? `华夏历 · ${cal.numYears}组实验月表（非已证章法）` : `Huaxia Li · ${cal.numYears} experimental groups (not a certified cycle)`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 4 }}>
                    {t.calTiZ((cal.Ti_local ?? cal.Ti).toFixed(3), (cal.Z_local ?? cal.Z).toFixed(3))}
                  </div>
                  {cal.localDay > 0 && cal.localDay !== 24 && (
                    <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>
                      {t.localDayConv((cal.localDay / 24).toFixed(4), (cal.localDay / 12).toFixed(3))}
                    </div>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "var(--mono)", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {[t.calYearLabel, t.calMonthsLabel, t.calLeapLabel, t.calDaysLabel].map((h, i) => (
                          <th key={i} style={{ padding: "6px 12px", textAlign: "left", color: "var(--dim)", fontWeight: 400, fontSize: 11, minWidth: 60 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cal.years.map(y => (
                        <tr key={y.y} style={{ borderBottom: "1px solid #ffffff08", background: y.hasLeap ? "#10b98108" : "transparent" }}>
                          <td style={{ padding: "4px 12px", color: "var(--dim2)" }}>{y.y}</td>
                          <td style={{ padding: "4px 12px", fontWeight: y.hasLeap ? 600 : 400, color: y.hasLeap ? "var(--green)" : "var(--fg)" }}>{y.months.length}</td>
                          <td style={{ padding: "4px 12px", color: y.hasLeap ? "var(--green)" : "var(--dim)", fontWeight: y.hasLeap ? 600 : 400 }}>
                            {y.hasLeap ? y.months.filter(m => m.isIntercalary).map(m => t.calLeapMark(m.leapAfter)).join(" / ") : t.calNoLeap}
                          </td>
                          <td style={{ padding: "4px 12px" }}>{y.totalDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--cell)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.9 }}>
                  <div>{lang === "zh" ? `完整月 ${cal.eventStats.months}；中气 ${cal.eventStats.events}；无中气月 ${cal.totalLeap}；含空月的组数 ${cal.leapYears}` : `Complete months ${cal.eventStats.months}; events ${cal.eventStats.events}; empty months ${cal.totalLeap}; groups with empty months ${cal.leapYears}`}</div>
                  <div>L₀ = M − Q + E = {cal.eventStats.months} − {cal.eventStats.events} + {cal.eventStats.extraEvents} = {cal.totalLeap}</div>
                  <div>{lang === "zh" ? "仅统计所列完整月。E 为每月超过一个的中气数之和；空月标签不等于已认证的民用闰月。" : "Counts cover the displayed complete months only. E counts extra events beyond one per month. Empty-month labels are not certified civil intercalation."}</div>
                </div>
                <details style={{marginTop:16,lineHeight:1.7}}>
                  <summary>{lang === "zh" ? "日界对照（不覆盖原月表）" : "Day-boundary comparison (original table unchanged)"}</summary>
                  <p>{lang === "zh" ? "用相同月序及中气事件表对照：连续月界 [朔时,下朔时)，与整日月界 [floor(朔时),floor(下朔时))。整数表示相对日零点，不是时区或真实民用日期。这里用向下取整，不是上方整数显示的四舍五入。" : "Same month indices and event list: [new-moon time,next time) versus [floor(time),floor(next time)). Integers mark relative-day midnight, not a timezone or real civil date. This uses floor, not the rounded display above."}</p>
                  {(() => { const d=cal.dayBoundaryComparison; return <>
                    <div>{lang === "zh" ? "归属变化的月 / 空月标签变化：" : "Months with changed ownership / empty-label changes: "}{d.changedMonths} / {d.changedEmptyLabels}</div>
                    <div>{lang === "zh" ? "连续范围" : "Instant scope"}: [{d.scope.instantStart}, {d.scope.instantEnd}) · L₀={d.instant.months}−{d.instant.events}+{d.instant.extraEvents}={d.instant.emptyMonths}</div>
                    <div>{lang === "zh" ? "整日范围" : "Whole-day scope"}: [{d.scope.dayStart}, {d.scope.dayEnd}) · L₀={d.wholeDay.months}−{d.wholeDay.events}+{d.wholeDay.extraEvents}={d.wholeDay.emptyMonths}</div>
                    <div>{lang === "zh" ? "外边界新增 / 移出事件数：" : "Events gained / lost at outer boundaries: "}{d.outerGained.length} / {d.outerLost.length}</div>
                    <button onClick={()=>{
                      const blob=new Blob([JSON.stringify({parameters:state,primary:cal.primary,comparison:d},null,2)],{type:"application/json"});
                      const url=URL.createObjectURL(blob);const link=document.createElement("a");
                      link.href=url;link.download="huaxia-day-boundary-comparison.json";link.click();
                      setTimeout(()=>URL.revokeObjectURL(url),1000);
                    }}>{lang === "zh" ? "下载全部日界对照 JSON" : "Download full comparison JSON"}</button>
                    <p>{lang === "zh" ? "以下最多显示80个变化月；完整数据见下载。新增／移出是相对该月，内部换月可能记在两行，不能当成两个不同事件。" : "Up to 80 changed months below; download for all rows. Gains/losses are per month: an internal move may appear twice, not as two distinct events."}</p>
                    {d.rows.filter(row=>row.changed).slice(0,80).map(row=><div key={row.monthIndex} style={{marginBottom:8}}>
                      M{row.monthIndex}: [{row.start.toFixed(6)}, {row.end.toFixed(6)}) → [{row.dayStart}, {row.dayEnd}) · Q: {row.instantCount} → {row.dayCount}<br/>
                      + {row.gained.join(", ") || "—"} / − {row.lost.join(", ") || "—"}
                    </div>)}
                  </>; })()}
                </details>
                <details style={{marginTop:16,lineHeight:1.7}}>
                  <summary>{lang === "zh" ? "太阳年窗口账（与上方实验分组分开）" : "Solar-year window ledger (separate from experimental groups)"}</summary>
                  <p>{lang === "zh" ? "窗口按 [iY,(i+1)Y) 划分。下列恒等式只用完整落入窗口的月；跨界月片段单列，不当成完整月或闰月。窗口中气总数与完整月中气数不是同一口径。" : "Windows use [iY,(i+1)Y). The identity uses only wholly contained months; crossing fragments are listed separately, not counted as complete or leap months. Window events and complete-month events have different scopes."}</p>
                  {cal.solarWindows.map(w=><details key={w.window} style={{marginBottom:8}}>
                    <summary>{w.window}: [{w.start.toFixed(4)}, {w.end.toFixed(4)}) · {lang === "zh" ? "窗口中气" : "window events"} {w.eventsInWindow} · L₀ = {w.stats.months} − {w.stats.events} + {w.stats.extraEvents} = {w.stats.emptyMonths} · {lang === "zh" ? "跨界片段" : "fragments"} {w.fragments.length}</summary>
                    <div>{lang === "zh" ? "完整月序号：" : "Complete month indices: "}{w.complete.join(", ")}</div>
                    {w.fragments.map(f=><div key={f.k}>M{f.k}: [{f.monthStart.toFixed(4)}, {f.monthEnd.toFixed(4)}) → [{f.overlapStart.toFixed(4)}, {f.overlapEnd.toFixed(4)})</div>)}
                  </details>)}
                </details>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase" }}>
                    {lang === "zh" ? `太阳历节气表 · N=${cal.N}` : `Solar Terms · N=${cal.N}`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 4 }}>
                    {`Y₁ = ${(cal.Y1_local ?? cal.Y1).toFixed(2)} ${lang === "zh" ? "本地日" : "local days"}`}
                    {cal.ecc > 0.05 && <span style={{ color: "var(--orange)", marginLeft: 8 }}>{lang === "zh" ? "· 开普勒效应已激活" : "· Keplerian active"}</span>}
                  </div>
                  {cal.localDay > 0 && cal.localDay !== 24 && (
                    <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>
                      {t.localDayConv((cal.localDay / 24).toFixed(4), (cal.localDay / 12).toFixed(3))}
                    </div>
                  )}
                </div>
                {cal.terms.length === 0 ? (
                  <div style={{ color: "var(--dim)", fontFamily: "var(--mono)", fontSize: 12 }}>—</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 5 }}>
                    {cal.terms.map(term => {
                      const isAph = cal.aphTermNum === term.j;
                      return (
                        <div key={term.j} style={{
                          background: isAph ? "#f59e0b08" : "var(--cell)",
                          borderRadius: 6, padding: "7px 9px",
                          borderLeft: `3px solid ${term.length < r.lo * 0.99 ? "#3b82f6" : term.length > r.lo * 1.01 ? "#f59e0b" : "#10b981"}`,
                          outline: isAph && cal.solarYears ? "1px dashed #f59e0b60" : "none",
                        }}>
                          <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)" }}>{t.calTermLabel(term.j)}</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{term.length.toFixed(2)}</div>
                          <div style={{ fontSize: 10, color: "var(--dim2)" }}>{t.calTermDays}</div>
                          {isAph && cal.solarYears && (
                            <div style={{ fontSize: 9, color: "#f59e0b", fontFamily: "var(--mono)", marginTop: 2 }}>{t.solarLeapMark}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {state.ecc > 0.01 && (
                  <div style={{ marginTop: 12, fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
                    {lang === "zh"
                      ? `蓝 < 均值 ${r.lo.toFixed(2)} 本地日（近日点快速）· 黄 > 均值（远日点慢速）· 演示相位：第1节气锚定近日点；不代表历史年首规则`
                      : `Blue < mean ${r.lo.toFixed(2)} local d (fast, perihelion) · Yellow > mean (slow, aphelion) · Demo phase: term 1 at perihelion; not a historical year-start rule`}
                  </div>
                )}

                {/* 岁余年表 — 通用置闰日周期 */}
                {cal.solarYears && (
                  <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                      {t.solarCycleTitle(cal.solarYears.numYears)}
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "var(--mono)", fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {[t.calYearLabel, t.calDaysLabel, t.calLeapLabel].map((h, i) => (
                              <th key={i} style={{ padding: "6px 12px", textAlign: "left", color: "var(--dim)", fontWeight: 400, fontSize: 11, minWidth: 60 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cal.solarYears.years.map(y => (
                            <tr key={y.y} style={{ borderBottom: "1px solid #ffffff08", background: y.isLeap ? "#d4a84308" : "transparent" }}>
                              <td style={{ padding: "4px 12px", color: "var(--dim2)" }}>{y.y}</td>
                              <td style={{ padding: "4px 12px", fontWeight: y.isLeap ? 600 : 400, color: y.isLeap ? "var(--accent)" : "var(--fg)" }}>{y.days}</td>
                              <td style={{ padding: "4px 12px", color: y.isLeap ? "var(--accent)" : "var(--dim)", fontWeight: y.isLeap ? 600 : 400 }}>
                                {y.isLeap ? t.solarLeapDay(cal.solarYears.aphTermNum) : t.calNoLeap}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--cell)", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim2)" }}>
                      {t.solarYearSummary(cal.solarYears.numYears, cal.solarYears.leapCount, cal.solarYears.totalDays)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </>}

      </div>
    </div>
  );
}
