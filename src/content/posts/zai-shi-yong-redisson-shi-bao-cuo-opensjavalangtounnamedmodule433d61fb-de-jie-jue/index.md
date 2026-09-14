---
title: 在使用Redisson时报错"opens java.lang" to unnamed module @433d61fb的解决
slug: zai-shi-yong-redisson-shi-bao-cuo-opensjavalangtounnamedmodule433d61fb-de-jie-jue
date: '2021-12-17T03:54:51.209Z'
categories:
- Notes
- Random
- Utilities
tags:
- Development
- Java
original_permalink: /archives/zai-shi-yong-redisson-shi-bao-cuo-opensjavalangtounnamedmodule433d61fb-de-jie-jue
---

# 起因

**草泥马**.
代码写得都是对的, 编译时候给我报错如下:
`Error creating bean with name 'redisson' defined in class path resource ... opens java.lang" to unnamed module @433d61f`

然后一些其他的Bean也注入不进去了, 也同样出现上述的报错.

# 经过
找到疑点`"opens java.lang" to unnamed module @433d61fb`, google发现可能是我用的JDK版本是16导致的问题.

于是切换该项目JDK等级为1.8, 编译成功

# 其余解法
Google上提出了其他解法:

- 更换JDK版本 -- 成功
- 添加JVM参数:`--illegal-access=warn` and `--add-opens java.base/java.lang=ALL-UNNAMED` -- 无效

# 原因
这个就是单纯的JDK 16版本特性的问题, 有老外尝试JDK 17也能够成功编译.

