# 第二批本地修订：计算核心、输入边界与事件归属

日期：2026-09-05。续第一批；不是公开发布。旧论文、引文及旧审核副本不变。

## 本次已实现

1. 自定义验算器计算移入 `src/core/历表.mjs`，共享数学移入 `数学.mjs`；原 `formula.js` 保留兼容导出，其他工具不用同时迁移。预设移入 `预设.mjs`。不再通过截取JSX源码或动态函数构造器做回归测试。
2. `参数校验.mjs` 检查有限性、范围、类型、N的偶整数约束、对象条目与名称长度；计算入口及网页入口都检查。校验失败返回中英双语字段错误，网页保留输入，隐藏结果、历表与报告，修正后重新生成。
3. 空输入不再强制当零；N不再被偷偷四舍五入或夹取。可选本地日与双星周期的0仍合法；卫星／叠合周期和质量须为正。
4. 数组各最多32项、名称最多120字符；N最多360，年长最多10⁹本地日；月记录预算25000，中气预算12000。这些是演示器的工程边界，不是天文存在或历法可行性定理。
5. 使用useMemo避免只切报告／历表显示时重复计算。月表入口从当前参数重新取得分类，不能套用调用者传来的旧分类。
6. 月记录增加原始end，公开目前的连续半开月界、整数显示舍入、分组、初相位、第一甲型卫星选择及小偏心率阈值约定。未改成新的年界或日界制度。
7. 本地CI配置增加npm test，位于构建前；尚未推送，不能声称远端CI已运行。

## 验证范围

测试直接导入生产模块，覆盖六个真实UI预设、空白／非法参数拒绝、超量条目、极端合法分辨率、同刻事件唯一归属、整数日显示与连续时刻区分、调用者旧分类隔离、开普勒边界与单调性；第一批反例及4096序列穷举继续保留。

复现：`npm test`、`npm run build`。16项测试通过，构建通过；依赖未升级，仍使用上一批相同锁文件及本机审核依赖。CJS API弃用提示尚存。测试通过不代表浏览器已交互验收。

## 仍须处理

- 本批统一校验只覆盖**自定义验算器**，不冒称其他工具页全部完成。
- 年界仍是累计至少N/2个中气截组。高偏心率多事件月可使组越过阈值，不能把该组当作精确太阳年。
- 连续月界与整日月界未统一；整数表只是展示，不用于民用日期认证。最近舍入也不宣称等同所有古代历法的朔日法。
- 仍以第一甲型卫星为主历，尚未加入用户显式选择。小偏心率小于0.005时走均匀分支的旧阈值仍保留，需单独检验和修订。
- 页面其他旧历史注释、跨系统／系外卫星结论、来源和依赖公告仍未全部核清。
- 浏览器连接在上一批不可用，本批没有声称完成视觉或交互验收。发布前需补浏览器测试及与最新上游合并检查。

## English

The custom calculator now has directly importable core modules and shared parameter validation. Invalid edits stop calculation and reporting without silently replacing values. Engineering limits bound list sizes and generated events. Tests exercise actual presets, invalid inputs, half-open event ownership and legacy boundary conventions. Calendar policy is unchanged and remains experimental. This is a local, unreleased revision; browser acceptance and other tool-page audits remain open.
