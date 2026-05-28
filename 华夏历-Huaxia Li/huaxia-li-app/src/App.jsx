import { useState } from "react";
import CrossVerification from "./CrossVerification.jsx";
import ExomoonHunter from "./ExomoonHunter.jsx";
import CustomCalculator from "./CustomCalculator.jsx";

const NAV = {
  zh: {
    home: "首页",
    cross: "跨星系验证",
    exomoon: "甲型猎手",
    calc: "自定义验算",
    lang: "EN",
    heroTitle: "华夏历",
    heroSub: "通用行星公式",
    heroFormula: "Universal Planetary Formula",
    heroDesc: "一个从中国古代历法中提取的数学框架，用同一套结构处理任意行星系统的计时问题。",
    heroDesc2: "以下三个交互工具使用真实天文数据验证公式的通用性。",
    card1Title: "跨星系交叉验证",
    card1Desc: "10个真实天文系统 — 从地球到环双星行星，从6天超短年到7170年超长周期。代入公式，全部有定义输出。公历仅在地球参数下可工作。",
    card2Title: "甲型系外卫星猎手",
    card2Desc: "在已知系外卫星候选体中搜索满足置闰条件的甲型实例。Kepler-1625 b I：可能是地球月球之外的第二个甲型候选。",
    card3Title: "自定义验算器",
    card3Desc: "输入任意行星参数，公式实时输出结果。添加恒星、卫星、叠合体，观察分类如何变化。",
    enter: "进入 →",
    paperLabel: "论文",
    paperText: "Jia Runzhang (2026). 华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology",
    zenodo: "Zenodo",
    ssrn: "SSRN",
    license: "数据来源：NASA JPL · Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST",
    tagline: "不是一个历法。是一个生成历法的方法论。",
    taglineEn: "Not a calendar. A methodology that generates calendars.",
  },
  en: {
    home: "Home",
    cross: "Cross-System",
    exomoon: "Mode A Hunter",
    calc: "Custom Calc",
    lang: "中文",
    heroTitle: "华夏历",
    heroSub: "Universal Planetary Formula",
    heroFormula: "Huaxia Calendar",
    heroDesc: "A mathematical framework extracted from the ancient Chinese calendar, capable of handling timekeeping for any planetary system with a single unified structure.",
    heroDesc2: "Three interactive tools below verify the formula's universality using real astronomical data.",
    card1Title: "Cross-System Verification",
    card1Desc: "10 real astronomical systems — from Earth to circumbinary planets, from 6-day ultra-short years to 7,170-year ultra-long periods. All produce defined output. Gregorian works only for Earth.",
    card2Title: "Mode A Exomoon Hunter",
    card2Desc: "Searching known exomoon candidates for Mode A intercalary eligibility. Kepler-1625 b I: potentially the second Mode A instance beyond Earth's Moon.",
    card3Title: "Custom Calculator",
    card3Desc: "Input any planetary parameters, get real-time formula output. Add stars, satellites, overlays. Watch classifications shift as you adjust values.",
    enter: "Enter →",
    paperLabel: "Paper",
    paperText: "Jia Runzhang (2026). 华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology",
    zenodo: "Zenodo",
    ssrn: "SSRN",
    license: "Data: NASA JPL · Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST",
    tagline: "Not a calendar. A methodology that generates calendars.",
    taglineEn: "不是一个历法。是一个生成历法的方法论。",
  },
};

function HomePage({ lang, onNavigate }) {
  const t = NAV[lang];
  const cards = [
    { key: "cross", title: t.card1Title, desc: t.card1Desc, color: "#d4a843", icon: "🌌" },
    { key: "exomoon", title: t.card2Title, desc: t.card2Desc, color: "#10b981", icon: "🔭" },
    { key: "calc", title: t.card3Title, desc: t.card3Desc, color: "#3b82f6", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 6, marginBottom: 8 }}>{t.heroTitle}</div>
        <div style={{ fontSize: 16, color: "#d4a843", fontFamily: "var(--mono)", letterSpacing: 2, marginBottom: 4 }}>{t.heroSub}</div>
        <div style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--mono)", marginBottom: 20 }}>
          C<sub>p</sub> = Φ<sub>A</sub>(Θ₁, {"{Ψ∈A}"}) ⊕ Φ<sub>B</sub>(Θ₁…Θ<sub>m</sub>, {"{Ψ∈B}"})
        </div>
        <div style={{ fontSize: 14, color: "var(--dim2)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
          {t.heroDesc}
        </div>
        <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 12 }}>{t.heroDesc2}</div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {cards.map((c) => (
          <button key={c.key} onClick={() => onNavigate(c.key)} style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
            padding: "24px 28px", cursor: "pointer", textAlign: "left",
            transition: "all 0.2s", display: "flex", gap: 20, alignItems: "start",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 0 20px ${c.color}15`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--dim2)", lineHeight: 1.7 }}>{c.desc}</div>
              <div style={{ fontSize: 12, color: c.color, fontFamily: "var(--mono)", marginTop: 10 }}>{t.enter}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tagline */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", letterSpacing: 1 }}>{t.tagline}</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>{t.taglineEn}</div>
      </div>

      {/* Paper reference */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginBottom: 6 }}>{t.paperLabel}</div>
        <div style={{ fontSize: 12, color: "var(--dim2)", lineHeight: 1.6 }}>{t.paperText}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
          <a href="https://doi.org/10.5281/zenodo.19571784" target="_blank" rel="noopener noreferrer" style={{
            fontSize: 11, color: "#d4a843", fontFamily: "var(--mono)", textDecoration: "none",
            padding: "4px 12px", border: "1px solid #d4a84340", borderRadius: 6,
          }}>{t.zenodo} ↗</a>
          <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158" target="_blank" rel="noopener noreferrer" style={{
            fontSize: 11, color: "#d4a843", fontFamily: "var(--mono)", textDecoration: "none",
            padding: "4px 12px", border: "1px solid #d4a84340", borderRadius: 6,
          }}>{t.ssrn} ↗</a>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 20, lineHeight: 1.6 }}>
        {t.license}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("zh");
  const t = NAV[lang];

  const navItems = [
    { key: "home", label: t.home },
    { key: "cross", label: t.cross },
    { key: "exomoon", label: t.exomoon },
    { key: "calc", label: t.calc },
  ];

  return (
    <div style={{
      "--bg": "#090b10", "--card": "#11141c", "--cell": "#181c28", "--border": "#222838",
      "--fg": "#e4e7ef", "--dim": "#7b8298", "--dim2": "#9299af", "--accent": "#d4a843",
      "--mono": "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      "--body": "'Noto Serif SC', Georgia, serif",
      fontFamily: "var(--body)", background: "var(--bg)", color: "var(--fg)",
      minHeight: "100vh",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #090b10; } button:hover { opacity: 0.9; } a:hover { opacity: 0.8; } input:focus { border-color: #d4a843 !important; }`}</style>

      {/* Nav bar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", borderBottom: "1px solid var(--border)",
        background: "#090b10ee", backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setPage(item.key)} style={{
              background: page === item.key ? "var(--accent)" : "transparent",
              color: page === item.key ? "#090b10" : "var(--dim2)",
              border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer",
              fontFamily: "var(--body)", fontSize: 13, fontWeight: page === item.key ? 700 : 400,
              transition: "all 0.15s",
            }}>{item.label}</button>
          ))}
        </div>
        <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} style={{
          background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)",
          borderRadius: 6, padding: "4px 12px", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
        }}>{t.lang}</button>
      </nav>

      {/* Page content */}
      <div>
        {page === "home" && <HomePage lang={lang} onNavigate={setPage} />}
        {page === "cross" && <CrossVerification />}
        {page === "exomoon" && <ExomoonHunter />}
        {page === "calc" && <CustomCalculator />}
      </div>
    </div>
  );
}
