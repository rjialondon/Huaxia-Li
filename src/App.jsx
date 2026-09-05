import { useState, useEffect } from "react";
import CrossVerification from "./CrossVerification.jsx";
import ExomoonHunter from "./ExomoonHunter.jsx";
import CustomCalculator from "./CustomCalculator.jsx";
import AphSim from "./AphSim.jsx";

const NAV = {
  zh: {
    home: "首页",
    cross: "跨星系验证",
    exomoon: "甲型猎手",
    calc: "自定义验算",
    annex: "数值验证",
    lang: "EN",
    heroTitle: "华夏历",
    heroSub: "参数化历法 · 通用结构探索",
    heroFormula: "Universal Planetary Formula",
    heroDesc: "华夏历：以日月合参、节候与并行周期组织时间，提出并实现参数化历法的实验框架。",
    heroDesc2: "以华夏历法传统为研究根基，探索跨行星的共同结构。数值算例、历史复原和天文认证分别举证；有输出不等于通用性已获证明。",
    heroPrinciple: "设计原则：公式只含自由参数（Y₁·本地日·Tᵢ·N）。N 是太阳侧分辨率约定——24 只是地球实例的取值；判据检验卫星，不由卫星定义。",
    card1Title: "跨星系交叉验证",
    card1Desc: "多组天体参数的分类演示。数据来源与模型假设须分别核实；年长匹配判据不判断公历能否执行，也不构成多体动力学认证。",
    card2Title: "甲型系外卫星猎手",
    card2Desc: "在已知系外卫星候选体中搜索满足置闰条件的甲型实例。Kepler-1625 b I：可能是地球月球之外的第二个甲型实例（该候选体本身尚存观测争议）。",
    card3Title: "自定义验算器",
    card3Desc: "输入任意行星参数，公式实时输出结果。添加恒星、卫星、叠合体，观察分类如何变化。",
    enter: "进入 →",
    paperLabel: "论文",
    paperText: "Jia Runzhang (2026). The Huaxia Li (华夏历): A Misclassified Planetary Timekeeping Methodology and Its Architectural Relevance to Self-Sovereign Computing Systems",
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
    annex: "Numerics",
    lang: "中文",
    heroTitle: "华夏历",
    heroSub: "Parametric Calendars · Exploring a General Structure",
    heroFormula: "Huaxia Calendar",
    heroDesc: "Huaxia Li organizes time through solar–lunar relations, seasonal markers and parallel cycles, and implements an experimental parametric calendar framework.",
    heroDesc2: "Rooted in the Huaxia calendrical tradition, this project explores common structures across planets. Numerical examples, historical reconstruction and astronomical validation require separate evidence. Defined output is not proof of universality.",
    heroPrinciple: "Design principle: the formula carries only free parameters (Y₁, local day, Tᵢ, N). N is a solar-side resolution convention — 24 is merely Earth's instance value; the criterion tests satellites, it is not defined by them.",
    card1Title: "Cross-System Verification",
    card1Desc: "Classification demonstrations using multiple celestial parameter sets. Sources and assumptions require separate checks. A year-length match is neither a test of Gregorian executability nor a many-body validation.",
    card2Title: "Mode A Exomoon Hunter",
    card2Desc: "Searching known exomoon candidates for Mode A intercalary eligibility. Kepler-1625 b I: potentially the second Mode A instance beyond Earth's Moon (the candidate itself remains observationally disputed).",
    card3Title: "Custom Calculator",
    card3Desc: "Input any planetary parameters, get real-time formula output. Add stars, satellites, overlays. Watch classifications shift as you adjust values.",
    enter: "Enter →",
    paperLabel: "Paper",
    paperText: "Jia Runzhang (2026). The Huaxia Li (华夏历): A Misclassified Planetary Timekeeping Methodology and Its Architectural Relevance to Self-Sovereign Computing Systems",
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
          <a href="https://doi.org/10.5281/zenodo.19571784" target="_blank" rel="noopener noreferrer" className="paper-link">{t.zenodo} ↗</a>
          <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158" target="_blank" rel="noopener noreferrer" className="paper-link">{t.ssrn} ↗</a>
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
            ? "隐私声明：不存储IP地址，仅统计访问次数。同一浏览器24小时内只计一次。"
            : "Privacy: no IP addresses stored. Visit count only. One count per browser per 24 hours."}
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
    { key: "annex", label: t.annex },
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
      <aside style={{ maxWidth: 960, margin: "16px auto", padding: "14px 18px", border: "1px solid #d4a84366", borderRadius: 8, lineHeight: 1.7 }}>
        <strong>{lang === "zh" ? "本地修订预览 · 尚未发布" : "Local revision preview · Unreleased"}</strong>
        <div>{lang === "zh" ? "已发表论文保留原貌；本版追加纠错。工具仍为理想化实验：平均周期分型不是置闰定理，多星配置不是多体解算，月表不是认证民用历。部分旧工具措辞仍在逐项修订。欢迎历算、天文与版本校勘研究者复核这些具体缺口。" : "The published paper remains unchanged; corrections are additive. These are idealized experiments: mean-period classification is not an intercalation theorem, multi-star configuration is not a many-body solver, and month tables are not certified civil calendars. Some legacy tool wording remains under review. Researchers in calendrical computation, astronomy and textual criticism are invited to examine these specific gaps."}</div>
      </aside>
      <div>
        {page === "home" && <HomePage lang={lang} onNavigate={setPage} />}
        {page === "cross" && <CrossVerification lang={lang} />}
        {page === "exomoon" && <ExomoonHunter lang={lang} />}
        {page === "calc" && <CustomCalculator lang={lang} />}
        {page === "annex" && <AphSim lang={lang} />}
      </div>
    </div>
  );
}
