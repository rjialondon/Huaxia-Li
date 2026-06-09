# 华夏历 · Universal Planetary Formula
# Huaxia Calendar — Interactive Verification Tools

**Live Demo:** [Your GitHub Pages URL will be here]

## What is this?

A set of interactive tools that verify a mathematical formula extracted from the ancient Chinese calendar (华夏历, Huaxia Calendar). The formula handles timekeeping for **any** planetary system — single star, binary star, with or without moons, tidally locked or free-rotating — using one unified structure.

The Gregorian calendar is a hardcoded implementation for Earth. This formula is the parametric generalization.

$$C_p = \Phi_A\bigl(\Theta_1,\ \{\Psi_i \in \text{Mode A}\}\bigr)\ \oplus\ \Phi_B\bigl(\Theta_1,\ldots,\Theta_m,\ \{\Psi_i \in \text{Mode B}\}\bigr)$$

## Three Tools

### 1. Cross-System Verification (跨星系交叉验证)
10 real astronomical systems tested with NASA/ESO data:
- Solar System: Earth, Mars, Jupiter, Venus
- Exoplanets: TRAPPIST-1 e/f, Proxima Centauri b, Kepler-16b, TOI-5624 e, b Centauri b, Gliese 536 c

**Result:** All 10 systems produce defined output. Gregorian works for 1.

### 2. Mode A Exomoon Hunter (甲型系外卫星猎手)
Searches known exomoon candidates for intercalary eligibility (Mode A condition: Y₁/N ≤ Tᵢ < 2Y₁/N).

**Finding:** Kepler-1625 b I (estimated Tᵢ ≈ 19 days) falls within Mode A range — potentially the second Mode A instance beyond Earth's Moon.

### 3. Custom Calculator (自定义验算器)
Input any planetary parameters. Add/remove stars, satellites, overlay cycles. Formula outputs in real time.

## Paper

Jia Runzhang (2026). *华夏历: The Huaxia Calendar as a Universal Timekeeping Methodology — From Terrestrial Naming Correction to Interstellar Structural Generalization.*

- Zenodo: https://doi.org/10.5281/zenodo.19571784
- SSRN: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158

## Deploy

```bash
npm install
npm run build
# Output in /docs — ready for GitHub Pages
```

Set GitHub Pages source to `docs/` folder on the `main` branch.

## Bilingual

All tools support Chinese/English toggle (中文/EN button).

## Data Sources

NASA JPL Planetary Fact Sheets · NASA Kepler/TESS · ESO HARPS/SPHERE/VLT · Spitzer/JWST · Agol et al. 2021 · Doyle et al. 2011 · Teachey & Kipping 2018 · Kral et al. 2026

## License

Apache 2.0
