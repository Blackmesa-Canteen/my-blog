---
title: Remove the first element from the LinkedHashMap
slug: linkedhashmap-shan-chu-di-yi-ge-yuan-su
date: '2022-06-14T09:51:38.648Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Algorithm
- Development
- Improvement
original_permalink: /archives/linkedhashmap-shan-chu-di-yi-ge-yuan-su
---

LinkedHashMap保留了插入顺序, 所以有方法区去除第一个元素(也是最早插入的元素). 见代码:

```java
Iterator<Map.Entry<Integer, Integer>> iterator = map.entrySet().iterator();
			iterator.next();
			iterator.remove();
```

