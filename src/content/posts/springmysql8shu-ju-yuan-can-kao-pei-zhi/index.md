---
title: Spring Mysql 8 数据源参考配置
slug: springmysql8shu-ju-yuan-can-kao-pei-zhi
date: '2022-01-07T01:19:25.976Z'
categories:
- Notes
- Utilities
tags:
- Development
- Database
- SpringBoot
original_permalink: /archives/springmysql8shu-ju-yuan-can-kao-pei-zhi
---

# POM依赖
```
<dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
</dependency>
```

# 配置文件

```
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.datasource.url=jdbc:mysql://localhost:3306/learn_user?useSSL=false&useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC

spring.datasource.username=root

spring.datasource.password=root
```

**Mysql 8 以下的:**

```
spring.datasource.driver-class-name=com.mysql.jdbc.Driver

spring.datasource.url=jdbc:mysql://localhost:3306/learn_user?useSSL=false&useUnicode=true&characterEncoding=UTF-8

spring.datasource.username=root

spring.datasource.password=root
```

# 注意
如果项目在maven的依赖xml文件里配置有关数据源的变量, `&`字符需要写成转义的形式:`&amp;`.
