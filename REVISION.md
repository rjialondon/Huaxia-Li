# 2026-09-05 本地修订第一批 / Unreleased revision

> 续批状态见 [第二批修订记录](REVISION-02.md)。下文保留第一批当时的结果与未决清单，最新进度以续批为准。

> 最新： [第三批修订记录](REVISION-03.md)——跨系统与候选页的表述、来源边界和分类一致性。

> 第四批：[主历选择与太阳年窗口账](REVISION-04.md)。历史记录保留，当前边界见第四批。

> 第五批：[连续月界与整日月界对照](REVISION-05.md)。新增独立日界诊断，不覆盖原月表。

> 第六批：[合入与验收](REVISION-06.md)。42项测试及构建通过，真实浏览器验收尚未完成；当前发布判定见RELEASE-CHECKLIST.md。

基线：18b9e9bee84884891d06baf73747a16eccea0ece。这是独立本地工作副本，尚未与最新上游合并；不改已发表论文、DOI或引文文件，不推送、不上线。

## 已修改

- 首页中英双语重立项目说明，保留华夏历本名，不再以“提取”定义项目身份，不把有输出称为通用性证明。
- 全站显示本地预览、历史论文保留及能力边界；说明未完成的旧工具修订。
- 自定义月表改为逐月统计空月；分列含空月的组数，列出一年多个空月的全部标签。
- 以同一份月记录计算 M、Q、L₀、E，展示恒等式 L₀=M−Q+E；撤下余分乘年数作为实际闰月总数的展示。
- 自定义摘要与文本报告将余分、余分倒数标为数学量，不再称实际置闰频率；零余分报告不再产生0/0相对误差。
- 有理逼近支持0/1，拒绝非有限、越界参数及无界搜索；不再用提前达到1e−6停止冒充搜索内最优。
- 新增标准库回归测试；这是局部验证，不是全文或民用历认证。

## 未完成，禁止作为正式发布版

- 所有输入框的统一校验与资源上限；独立核心模块拆分。
- 跨系统、系外卫星页旧结论及数据出处逐条复核，包含公历评价、候选体状态、周期单位等。
- 年界、日界、命月及主历卫星选择。旧月表分组算法保留实验身份；不能因统计修正就称其正确。
- 开普勒小偏心率阈值、瞬时月界与整数日显示、旧注释中的古历归属仍待修订。
- 依赖公告重查和分步升级；旧数值脚本中的全部断言补齐。
- 完整浏览器交互验收和上游最新提交差异检查。

## 复验

`npm test`；`npm run build`。新增测试包括整数周期空月反例、多中气补偿、4096种事件序列、取整反例及有理逼近边界。构建产物在docs/，只保存在本地；构建通过不是发布批准。

## English summary

Unreleased local work based on the commit above. The published paper is unchanged. Empty months are now counted from month records rather than the number of groups containing them. The UI exposes the exact count identity and distinguishes fractional cycle ratios from intercalation. Rational approximation handles zero and validates bounds. New regression tests cover counterexamples; historical/civil year boundaries and remaining legacy claims are not certified. Do not deploy this partial revision.

## 本机验收记录

2026-09-05：`npm test` 7项通过，其中一项穷举4096种序列，一项调用实际月表函数验证圆轨道、高偏心率、木星和地球参数。`npm run build` 通过，Vite 5.4.21；仍有旧CJS API弃用提示。

整链检验确认：Y=240、T=15、N=24圆轨道的完整太阳年有4个空月，但旧分组第一组只有15个月；因此测试分别检查完整时间窗与实际分组，不偷换成同一窗口。分组制度未修复。

依赖使用既有审核副本的node_modules只读用途软链接，未重新下载或升级；换机器需按锁文件运行npm ci。此处对有理逼近边界的修复不代表已完成所有输入框校验。

本地服务器可启动；当前没有可用的浏览器自动化连接（可用浏览器列表为空），所以未完成视觉与交互验收。禁止把构建成功描述为页面验收通过。
