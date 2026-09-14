---
title: IDEA Cannot resolve symbol 'java'
slug: ideacannotresolvesymboljava
date: '2021-09-30T06:19:12.649Z'
categories:
- Notes
- Utilities
tags:
- Java
cover: ./69796042-8238546f3c0345509e6d36b186bf13c7.jpg
original_permalink: /archives/ideacannotresolvesymboljava
---

# 起因
打开一个java 11的项目,IDEA 报红 Cannot resolve symbol 'java'.

# 原因
更新了IDEA, 可能它把JDK11给删除了.


# 经过
1. 下载OpenJDK11 [adoptium.net](https://adoptium.net/?variant=openjdk11&jvmVariant=hotspot);
2. 安装JDK;
3. 在IDEA中`File->Project Structure->SDKs`, 添加新安装的JDK;
4. 再检查下Project和Modeuls里的SDK版本号是不是正确的;
5. 保存.

# 结果
搞定.
