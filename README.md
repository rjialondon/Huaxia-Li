# 华夏历 · Huaxia Li

参数化历法实验框架 / An experimental parametric calendar framework

> 本地修订预览，尚未发布。基于提交 `18b9e9bee84884891d06baf73747a16eccea0ece`。旧论文保持不变；纠错与未决问题见 [REVISION.md](REVISION.md)。这不是已获天文或历史认证的民用历。

## 项目主张

华夏历以日月合参、节候与并行周期组织时间，探索跨行星的参数化历法结构。华夏历是项目本名；历史来路、数学命题、计算实现和天文适用性分别举证。

本库提供跨系统参数演示、卫星候选体分类、自定义验算和数值实验。平均周期分型是当前设计约定，不是一般置闰定理；有输出不证明任意行星系统都适用。多星配置目前不代表完成多体动力学求解。年长接近365.2425本地日的判据，也不判断公历是否能执行。

## 已落实的纠错

自定义月表以同一批完整月记录统计：

`L₀ = M − Q + E`，其中 M 为月数，Q 为中气事件数，E 为各月超过一个中气的事件数之和，L₀ 为无中气月数。

只有每月最多一个中气时，才可简化为 `L₀=M−Q`。年平均周期比的小数部分不是一般情况下的空月数；有空月的年数也不是空月总数。旧月表的年界、日界和命月策略尚未认证，当前空月标签仅用于实验。

## 验证与参与

```sh
npm ci
npm test
npm run build
```

测试包含整数周期、多中气补偿、4096种短事件序列、取整反例和有理逼近边界。构建输出在 `docs/`；请勿把此部分修订直接部署。旧Python研究脚本位于 [verification/](verification/)，运行成功不自动证明全部论文主张。

欢迎历算、天文和版本校勘研究者参与：请给出规则、版本与页码、时间尺度及事件定义、可复现输入和期望结果。尚需完成真朔与日界验证、历史颁历复原、多体适用条件、数据来源复核及浏览器验收。模型算得通、与某史例相容和历史上确曾采用，是三种不同结论。

## English

Huaxia Li organizes time through solar–lunar relations, seasonal markers and parallel cycles. It explores a parametric structure across planetary settings. Historical foundations, mathematical statements, software behavior and astronomical applicability require separate evidence.

This is an **unreleased local revision**, not a certified civil calendar. Classification examples do not prove universality; multi-star configuration is not a many-body solver. The month counter distinguishes empty months from groups containing them and exposes `L₀=M−Q+E`. Fractional cycle ratios are not exact intercalation counts. See [revision notes](REVISION.md) for unresolved work. Reproducible contributions are welcome.

## 已发表论文 / Published paper — unchanged

Jia Runzhang (2026). *The Huaxia Li (华夏历): A Misclassified Planetary Timekeeping Methodology and Its Architectural Relevance to Self-Sovereign Computing Systems.*

- [Paper DOI](https://doi.org/10.5281/zenodo.19571784)
- [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6576158)
- [Software archive, all versions](https://doi.org/10.5281/zenodo.21133058)
- [Original v1.1.0 software archive](https://doi.org/10.5281/zenodo.21133059)

See [CITATION.cff](CITATION.cff). These links identify existing publications, not this unreleased revision. License: Apache 2.0.
