---
title: 解决Lombok在新版本IDEA2021.3 报Compiler不兼容错误
slug: jie-jue-lombok-zai-xin-ban-ben-idea-bao-compiler-bu-jian-rong-cuo-wu
date: '2021-12-04T23:48:33.801Z'
categories:
- Notes
- Utilities
tags:
- Java
cover: ./2732904-2e36225c0f66366b-9ea6ff168ee94c5ab9c0a5815d90fd99.png
original_permalink: /archives/jie-jue-lombok-zai-xin-ban-ben-idea-bao-compiler-bu-jian-rong-cuo-wu
---

# 症状
形如:

java: You aren't using a compiler supported by lombok, so lombok will not work and has been disabled.   

Your processor is: jdk.proxy2.$Proxy29   Lombok supports: sun/apple javac 1.6, ECJ

# 解决
添加参数 `-Djps.track.ap.dependencies=false`在此:
![27329042e36225c0f66366b.png](./2732904-2e36225c0f66366b-9ea6ff168ee94c5ab9c0a5815d90fd99.png)

# 原理
IDEA预编译的时候是以代理的方式来执行的，不是直接`javac`方式, 所以 lombok依赖的javac方式的`annotation processors`不再生效.
