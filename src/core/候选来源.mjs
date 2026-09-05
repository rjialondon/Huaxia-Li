// Scoped evidence review, 2026-09-05. Links do not certify every card value.
const debate = [
  ['2023 reanalysis', 'https://www.nature.com/articles/s41550-023-02148-w'],
  ['2025 response', 'https://www.nature.com/articles/s41550-025-02547-1'],
];
export const CANDIDATE_EVIDENCE = {
  kepler1625b: {
    zh: '争议须并列阅读反分析与作者回应。本卡19日及13–39日尚未完成原表核对；范围仅作演示，10小时本地日是假设。',
    en: 'Read the reanalysis and author response together. The 19 d estimate and 13–39 d range have not been checked against the source table here; the range is demonstrative and the 10 h local day is assumed.',
    links: debate,
  },
  kepler1708b: {
    zh: '原研究提出候选，后续存在反分析与回应。4.6日及2–10日的原表出处待核；不作为观测置信区间，10小时本地日是假设。',
    en: 'A candidate proposal is followed by reanalysis and response. Source-table verification of 4.6 d and 2–10 d is pending; this is not a confidence interval and the 10 h day is assumed.',
    links: [['2022 candidate', 'https://www.nature.com/articles/s41550-021-01539-1'], ...debate],
  },
  hd206893b: {
    zh: '论文摘要支持条件性的约0.76年／0.4木星质量信号，不支持确认发现。200–350日范围及10小时本地日仅为演示输入；其余参数仍待逐表核对。',
    en: 'The abstract supports a conditional ~0.76 yr / ~0.4 Jupiter-mass signal, not a confirmed discovery. The 200–350 d range and 10 h day are demonstration inputs; other fields await source-table checks.',
    links: [['Kral et al.', 'https://arxiv.org/abs/2511.20091']],
  },
  earth_ref: {
    zh: '地球平均周期参考，范围退化为同一个平均值；不是逐次真朔误差范围，也不是对全部天体的唯一性断言。',
    en: 'Earth mean-period reference; the range is a single mean value, not a true-new-moon error interval or a uniqueness claim across all objects.',
    links: [],
  },
};
