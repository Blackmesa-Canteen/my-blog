---
title: Spring Cloud Alibaba技术栈
slug: springcloudalibaba-ji-shu-zhan
date: '2021-12-01T04:26:28.746Z'
categories:
- Notes
- Learning
- Utilities
tags:
- Development
- Java
cover: ./src=http---pic1.zhimg.com-v2-0e96436a999ac26218fc54344799c859_1200x500.jpg&refer=http---pic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg-f4aa1ed1bf2948b4963a856ccd30163f.jpg
original_permalink: /archives/springcloudalibaba-ji-shu-zhan
---

# 前言
这是一个Spring Cloud技术栈的笔记.

# 一个微服务架构图
![截屏20211201 下午3.18.41.jpg](./%E6%88%AA%E5%B1%8F2021-12-01%20%E4%B8%8B%E5%8D%883.18.41-de79b4571e1342dc870ad786708e9199.jpg)

# 部分技术栈
采用Spring Cloud Alibaba(持续被维护,有可视化管理界面):
- 服务治理(发现/注册): Nacos
- 配置中心: Nacos
- 负载均衡(模块之间): Ribbon
- 远程调用:基于Http的 -- Feign
- API网关(验证/鉴权,路由): Gateway
- 服务容错(熔断,降级,限流): Sentinel
- 消息队列: RabbitMQ直接调API就好.
- 持久化: MyBatis-plus
- NonSQL: Redis

# 简化开发
后台管理系统前端后端均可基于人人开源改编.

