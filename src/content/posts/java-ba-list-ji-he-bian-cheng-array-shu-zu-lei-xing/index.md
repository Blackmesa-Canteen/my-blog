---
title: Java把List集合变成Array数组类型
slug: java-ba-list-ji-he-bian-cheng-array-shu-zu-lei-xing
date: '2022-01-29T23:49:37.452Z'
categories:
- Improvement
- Utilities
tags:
- Improvement
- Java
original_permalink: /archives/java-ba-list-ji-he-bian-cheng-array-shu-zu-lei-xing
---

# 起因
我太笨了, 竟然要初始化一个对应size的数组, 然后手写循环把List集合内容放进数组里. 请调用Java自带的方法.

# 示例代码

以下代码片段把`uncommons`这个`List<String>`集合内容装到了`res`这个`String[]`数组里头:
```java
String[] res  = new String[uncommons.size()];
return uncommons.toArray(res);
```
