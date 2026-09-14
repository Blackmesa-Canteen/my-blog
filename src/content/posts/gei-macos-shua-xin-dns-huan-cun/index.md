---
title: 给MacOS刷新DNS缓存
slug: gei-macos-shua-xin-dns-huan-cun
date: '2021-12-11T02:32:41.175Z'
categories:
- Utilities
tags:
- Mac
- Development
- Web
original_permalink: /archives/gei-macos-shua-xin-dns-huan-cun
---

# 起因
配置/etc/hosts无效. 傻逼苹果.

# 经过
1. 检查是不是hosts的语法错误了;
2. 语法正确,使用命令:
`sudo killall -HUP mDNSResponder`
杀杀杀.
3. 清空浏览器自身的DNS缓存.
>DNS查询顺序：浏览器缓存→系统缓存→路由器缓存→ISP DNS 缓存→递归搜索

假设你浏览器是Google Chrome,
输入`chrome://chrome-urls/`,可以查看浏览器所有的配置页面.
访问:`chrome://net-internals/#dns`,点击按钮即可刷新浏览器DNS缓存.

4. 倘若还不成功?

试试控制台`curl`一下域名,看返回的html文档是不是想要的, 如果是想要的,说明只是浏览器的锅,可以尝试开隐私端口或者换个浏览器.

# 结果

一般情况下都能成功.
