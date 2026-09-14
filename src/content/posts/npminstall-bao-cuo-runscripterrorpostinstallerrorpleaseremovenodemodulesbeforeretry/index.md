---
title: 'npm install报错RunScriptError: post install error, please remove node_modules
  before retry!'
slug: npminstall-bao-cuo-runscripterrorpostinstallerrorpleaseremovenodemodulesbeforeretry
date: '2021-12-19T03:26:09.120Z'
categories:
- Utilities
tags:
- Notes
original_permalink: /archives/npminstall-bao-cuo-runscripterrorpostinstallerrorpleaseremovenodemodulesbeforeretry
---

# 症状
安装一个node项目的依赖, `npm install`安装时报错: RunScriptError: post install error, please remove node_modules before retry!

# 原因
我用的node版本太新了, v16去了.

# 解决
降低node版本为v14, 运行命令`npm rebuild node-sass`, 再重新`npm install`就不报错了.
