# 草稿PR提交边界

本PR只提出实验修订，不合并main、不发布网页，不改已发表论文。

## 尚未提交的CI接入

本地修订原计划在 `.github/workflows/verify.yml` 的 `npm ci` 与 `npm run build` 之间加入 `npm test`。推送时现有凭证缺少workflow写入权限，服务端拒绝，因此本PR**保持原工作流不变**；未申请或扩大凭证权限。

新增测试文件及package.json的test入口仍在本PR中。干净检出副本已运行42项测试及构建，全部通过。远端原工作流不会因此自动运行新增npm test；后续须由具有工作流写入权限的人补上这一行。不得把远端原工作流通过冒称新增42项自动测试已经运行。

REVISION系列和release-evidence保留本地施工记录，其中CI改动及change-manifest记录的是本地完整候选集；本PR实际差异不含工作流这一行，以本文件及PR文件清单为准。

真实浏览器交互／视觉验收仍未完成。RELEASE-CHECKLIST.md中的发布门槛继续有效。旧构建散列资源在本分支更新，可从main的原提交恢复；线上网页未更新。
