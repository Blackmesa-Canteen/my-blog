---
title: lombok使用@Slf4j注解写日志
slug: lombok-shi-yong-slf4j-zhu-jie-xie-ri-zhi
date: '2021-12-08T12:35:30.615Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
original_permalink: /archives/lombok-shi-yong-slf4j-zhu-jie-xie-ri-zhi
---

# 支持的日志接口
- debug
- warn
- info
- error
- trace

# 引入项目

1. 引入Lombok依赖
```xml
<dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
</dependency>
```

2. 引入slf4j的依赖

3. 此时可以在类头上直接使用`@Slf4j`注解了. 

# 典型用例
```java
log.error("发现异常:{}, 异常类型{}", e.getMessage(), e.getClass());
```
