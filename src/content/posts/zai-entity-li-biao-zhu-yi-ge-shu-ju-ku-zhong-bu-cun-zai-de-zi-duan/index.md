---
title: 在Entity里标注一个数据库中不存在的字段
slug: zai-entity-li-biao-zhu-yi-ge-shu-ju-ku-zhong-bu-cun-zai-de-zi-duan
date: '2021-12-07T06:09:27.696Z'
categories:
- Notes
- Utilities
tags:
- Development
- SpringCloud
original_permalink: /archives/zai-entity-li-biao-zhu-yi-ge-shu-ju-ku-zhong-bu-cun-zai-de-zi-duan
---

# 起因
想要在Entity bean里加一个自定义字段,但是数据库中不存在.


# 解法
在新加的字段使用`@TableField`注解,代码片段如下:
```java
/**
	 * 组图标
	 */
	private String icon;

	@TableField(exist = false)
	private Long[] catelogPath;
```

# 另一个解法
其实添加太多数据库不存在的字段不规范,请另外声明一个VO类型.
