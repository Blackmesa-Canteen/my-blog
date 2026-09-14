---
title: Gateway网关配置文件书写
slug: gateway-wang-guan-pei-zhi-wen-jian-shu-xie
date: '2021-12-05T10:45:13.828Z'
categories:
- Random
- Utilities
tags:
- Java
- SpringBoot
cover: ./69796042-8238546f3c0345509e6d36b186bf13c7.jpg
original_permalink: /archives/gateway-wang-guan-pei-zhi-wen-jian-shu-xie
---

# 开端
其实建议查手册,但是我懒,所以就写出一个配置文件范本来供自己参考.

# 范本
```yaml
spring:
    gateway:
      routes:
        - id: product_route
          uri: lb://demomarket-product
          predicates:
            - Path=/api/product/**
          filters:
            - RewritePath=/api/(?<segment>.*),/$\{segment}

        - id: third_party_route
          uri: lb://demomarket-third-party
          predicates:
            - Path=/api/thirdparty/**
          filters:
            - RewritePath=/api/thirdparty/(?<segment>.*),/$\{segment}

        - id: admin_route
          uri: lb://renren-fast
          predicates:
            - Path=/api/**
          filters:
            - RewritePath=/api/(?<segment>.*),/renren-fast/$\{segment}


  application:
    name: demomarket-gateway
```

# 注意
一定注意routes的**predicates**的顺序,从叶子路由的到根路由,先细后粗,先礼后兵,先上车后刷卡.不然路由会被遮掩.
