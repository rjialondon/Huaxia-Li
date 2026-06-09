import { useState, useEffect } from "react";
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
    heroPrinciple: "设计原则：参数优先从天文结构推导；天文结构缺位时，走约定。公式本身不含任何地球专属常数。",
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
    heroPrinciple: "Design principle: parameters are first derived from celestial structure; convention fills in only where nature provides no answer. The formula contains no Earth-specific constants.",
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

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  dur: `${Math.random() * 4 + 2}s`,
  delay: `${Math.random() * 5}s`,
  minOp: Math.random() * 0.1 + 0.05,
  maxOp: Math.random() * 0.5 + 0.3,
}));

function HomePage({ lang, onNavigate }) {
  const t = NAV[lang];
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    fetch("https://rjialondon.goatcounter.com/counter/TOTAL.json")
      .then(r => r.json())
      .then(d => setVisitCount(d.count ?? null))
      .catch(() => {});
  }, []);
  const cards = [
    { key: "cross", title: t.card1Title, desc: t.card1Desc, color: "#d4a843", icon: "🌌" },
    { key: "exomoon", title: t.card2Title, desc: t.card2Desc, color: "#10b981", icon: "🔭" },
    { key: "calc", title: t.card3Title, desc: t.card3Desc, color: "#3b82f6", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px 48px" }}>

      {/* Hero */}
      <div className="hero-wrap">
        {/* Starfield */}
        <div className="starfield">
          {STARS.map(s => (
            <div key={s.id} className="star" style={{
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              "--dur": s.dur, "--delay": s.delay,
              "--min-op": s.minOp, "--max-op": s.maxOp,
            }} />
          ))}
          <div className="orb" style={{ width: 300, height: 300, top: "-80px", left: "10%", background: "radial-gradient(circle, #d4a84312, transparent 70%)" }} />
          <div className="orb" style={{ width: 250, height: 250, top: "20px", right: "5%", background: "radial-gradient(circle, #3b82f610, transparent 70%)", animationDelay: "4s" }} />
        </div>

        <div className="hero-content">
          <div className="hero-title">
            <span className="title-gradient">{t.heroTitle}</span>
            <div style={{ fontSize: 16, letterSpacing: 3, color: "var(--dim2)", fontFamily: "var(--mono)", fontWeight: 400, marginTop: 4 }}>Huaxia Calendar</div>
          </div>
          <div className="hero-sub">{t.heroSub}</div>
          <div className="hero-formula">
            C<sub>p</sub> = Φ<sub>A</sub>(Θ₁, {"{Ψ∈A}"}) ⊕ Φ<sub>B</sub>(Θ₁…Θ<sub>m</sub>, {"{Ψ∈B}"})
          </div>
          <div className="hero-desc">{t.heroDesc}</div>
          <div className="hero-desc2">{t.heroDesc2}</div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 10, lineHeight: 1.6, letterSpacing: 0.3, borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>{t.heroPrinciple}</div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44 }}>
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => onNavigate(c.key)}
            className="tool-card"
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = c.color;
              e.currentTarget.style.boxShadow = `0 8px 32px ${c.color}18, 0 0 0 1px ${c.color}20`;
              e.currentTarget.style.background = `${c.color}06`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#222838";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#11141c";
            }}
          >
            <div className="card-icon">{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="card-title" style={{ color: c.color }}>{c.title}</div>
              <div className="card-desc">{c.desc}</div>
              <div className="card-enter" style={{ color: c.color }}>{t.enter}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tagline */}
      <div className="tagline-wrap">
        <div className="tagline-main">{t.tagline}</div>
        <div className="tagline-sub">{t.taglineEn}</div>
      </div>

      {/* Paper reference */}
      <div className="paper-card">
        <div className="paper-label">{t.paperLabel}</div>
        <div className="paper-text">{t.paperText}</div>
        <div className="paper-links">
          <a href="https://zenodo.org" target="_blank" rel="noopener noreferrer" className="paper-link">{t.zenodo} ↗</a>
          <a href="https://ssrn.com" target="_blank" rel="noopener noreferrer" className="paper-link">{t.ssrn} ↗</a>
        </div>
      </div>

      <div className="license-text">{t.license}</div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <a href="https://github.com/rjialondon/Huaxia-Li" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", textDecoration: "none", letterSpacing: 0.5 }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--dim)"}
        >⌥ github.com/rjialondon/Huaxia-Li ↗</a>
      </div>

      <div style={{ textAlign: "center", marginTop: 16, paddingBottom: 8 }}>
        {visitCount !== null && (
          <div style={{ fontSize: 12, color: "var(--dim2)", fontFamily: "var(--mono)", marginBottom: 5 }}>
            👁 {visitCount.toLocaleString()} {lang === "zh" ? "次访问" : "visits"}
          </div>
        )}
        <div style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--mono)", opacity: 0.7, lineHeight: 1.6 }}>
          {lang === "zh"
            ? "隐私声明：不收集IP地址，仅统计访问次数。同一浏览器24小时内只计一次。"
            : "Privacy: no IP addresses collected. Visit count only. One count per browser per 24 hours."}
        </div>
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
      <style>{`input:focus { border-color: #d4a843 !important; } select:focus { border-color: #d4a843 !important; }`}</style>

      {/* Nav bar */}
      <nav className="navbar">
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`nav-btn ${page === item.key ? "active" : "inactive"}`}
            >{item.label}</button>
          ))}
        </div>
        <button onClick={() => setLang(lang === "zh" ? "en" : "zh")} className="lang-btn">{t.lang}</button>
      </nav>

      {/* Page content */}
      <div>
        {page === "home" && <HomePage lang={lang} onNavigate={setPage} />}
        {page === "cross" && <CrossVerification lang={lang} />}
        {page === "exomoon" && <ExomoonHunter lang={lang} />}
        {page === "calc" && <CustomCalculator lang={lang} />}
      </div>
    </div>
  );
}
