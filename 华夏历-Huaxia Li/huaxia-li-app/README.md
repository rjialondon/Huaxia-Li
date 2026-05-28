# 华夏通用行星历法系统
# Huaxia Universal Planetary Calendar System (UPCS)

**Interactive Verification Tools · 交互验算工具**

**Live Demo:** [Your GitHub Pages URL will be here]

---

## What is UPCS?

The **Huaxia Universal Planetary Calendar System** is a mathematical framework derived from the ancient Chinese calendar (华夏历). It is not a new invention — it is the formal recognition that the Huaxia Calendar's architecture was never Earth-specific. Its dual-vector structure (solar position + lunar phase), cross-verification intercalary mechanism, and modular cycle overlay engine (Tiangan Dizhi, 天干地支) constitute a **universal parametric methodology** applicable to any planetary system.

$$C_p = \Phi_A\bigl(\Theta_1,\ \{\Psi_i \in \text{Mode A}\}\bigr)\ \oplus\ \Phi_B\bigl(\Theta_1,\ldots,\Theta_m,\ \{\Psi_i \in \text{Mode B}\}\bigr)$$

Where:
- **P** = target planet; **m** = number of host stars (≥1); **n** = number of satellites (≥0)
- **Θⱼ** = stellar angular position function (solar terms / 节气)
- **Ψᵢ** = satellite synodic phase function (lunar cycle / 朔望)
- **ΦA** = intercalary cross-verification operator (置闰)
- **ΦB** = independent cycle overlay operator (干支)
- **⊕** = parallel composition (合)

The Gregorian calendar is a hardcoded implementation for (m=1, n=1, non-locked, low-eccentricity). UPCS is the parametric generalization. Change the parameters, the formula outputs a structurally valid calendar. No redesign required.

**Not a calendar. A methodology that generates calendars.**

**不是一个历法。是一个生成历法的方法论。**

---

## Three Interactive Tools

### 1. Cross-System Verification · 跨星系交叉验证
10 real astronomical systems tested with NASA/ESO/Kepler/JWST data:

| Category | Systems |
|----------|---------|
| Solar System baseline | Earth, Mars, Jupiter, Venus |
| Tidally locked exoplanets | TRAPPIST-1 e, TRAPPIST-1 f |
| Nearest exoplanet | Proxima Centauri b |
| Circumbinary (m=2) | Kepler-16b ("Tatooine") |
| 2026 discovery | TOI-5624 e |
| Extreme parameters | b Centauri (AB) b (e=0.4, P~7170 yr) |
| Habitable zone | Gliese 536 c |

**Result:** All 10 systems produce defined output. Gregorian works for 1 out of 10.

### 2. Mode A Exomoon Hunter · 甲型系外卫星猎手
Searches all known exomoon candidates for intercalary eligibility (Mode A condition: Y₁/N ≤ Tᵢ < 2Y₁/N).

**Key finding:** Kepler-1625 b I (estimated Tᵢ ≈ 19 days, planet year = 287 days) falls squarely within Mode A range [12.0, 24.0) days — potentially **the second Mode A instance beyond Earth's Moon**, 8,000 light-years away.

### 3. Custom Calculator · 自定义验算器
Input any planetary parameters. Add/remove stars, satellites, cycle overlays. Formula outputs in real time. Watch satellite classification shift as you adjust Tᵢ across the Mode A boundary.

---

## Paper

Jia Runzhang (贾润章), 2026.

***华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology — From Terrestrial Naming Correction to Interstellar Structural Generalization.***

- **Zenodo:** [https://doi.org/10.5281/zenodo.19571784](https://doi.org/10.5281/zenodo.19571784)
- **SSRN:** [https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158)

---

## Deploy

The `docs/` folder contains pre-built static files ready for GitHub Pages.

```bash
# To rebuild from source:
npm install
npm run build
# Output in /docs
```

**GitHub Pages setup:** Repository Settings → Pages → Source: `Deploy from a branch` → Branch: `main`, Folder: `/docs`

---

## Bilingual · 双语

All tools support Chinese/English toggle (中文/EN).

## Data Sources

NASA JPL Planetary Fact Sheets · NASA Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST · Agol et al. 2021 · Doyle et al. 2011 · Teachey & Kipping 2018 · Kipping et al. 2022 · Kral et al. 2026 (A&A) · Anglada-Escudé et al. 2016 · Bonfant et al. 2026 · Janson et al. 2021

## License

Apache License 2.0

Copyright 2026 Jia Runzhang (贾润章)

Licensed under the Apache License, Version 2.0. You may use, modify, and distribute this software freely, subject to the conditions of the license. This license includes an express grant of patent rights from contributors to users, and automatic termination of patent license for any party that initiates patent litigation related to this software.

See [LICENSE](LICENSE) for full text.
