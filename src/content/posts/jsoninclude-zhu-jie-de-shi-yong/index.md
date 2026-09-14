---
title: '@JsonInclude注解的使用'
slug: jsoninclude-zhu-jie-de-shi-yong
date: '2021-12-07T06:00:46.230Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
- SpringCloud
cover: ./src=http---pic1.zhimg.com-v2-0e96436a999ac26218fc54344799c859_1200x500.jpg&refer=http---pic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg-f4aa1ed1bf2948b4963a856ccd30163f.jpg
original_permalink: /archives/jsoninclude-zhu-jie-de-shi-yong
---

# 起因
今天,前端要求说服务器回应的JSON尽量不要有null，可有为空串“” 或者 0 或者 []，但尽量不要null;

后天,前端要求说回应的JSON如果某个字段为空,就不要有这个字段了.

使用@JsonInclude注解,实体类与json互转的时候,能够决定属性值为null的参不参与序列化.

# 介绍
`@JsonInclude`标记是jackson包提供的json序列化方法，已经集成于Springboot中，此方法的配置意在可以对实体json序列化的时候进行对应的数值处理.

将该标记放在属性上，如果该属性为空字符串或者为null则都不参与序列化 。如果放在类上边,那对这个类的全部属性起作用.

注解中带参数,如`@JsonInclude(JsonInclude.Include.NON_EMPTY)`

参数:

1. ALWAYS // 默认策略，任何情况都执行序列化

2. NON_NULL // 非空,当属性为NULL不序列化 

3. NON_ABSENT // null的不会序列化，但如果类型是AtomicReference，依然会被序列化

4. NON_EMPTY // null、集合数组等没有内容、空字符串等，都不会被序列化

5. NON_DEFAULT // 如果字段是默认值，就不会被序列化

6. CUSTOM // 此时要指定valueFilter属性，该属性对应一个类，用来自定义判断被JsonInclude修饰的字段是否序列化

7. USE_DEFAULTS // 当JsonInclude在类和属性上都有时，优先使用属性上的注解，此时如果在序列化的get方法上使用了JsonInclude，并设置为USE_DEFAULTS，就会使用类注解的设置  

