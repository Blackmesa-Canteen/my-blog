---
title: Spring Cloud 常用操作步骤
slug: springcloudchang-yong-cao-zuo-bu-zhou
date: '2021-12-01T05:43:19.290Z'
categories:
- Notes
- Learning
- Utilities
tags:
- Java
- SpringCloud
cover: ./src=http---pic1.zhimg.com-v2-0e96436a999ac26218fc54344799c859_1200x500.jpg&refer=http---pic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg-f4aa1ed1bf2948b4963a856ccd30163f.jpg
original_permalink: /archives/springcloudchang-yong-cao-zuo-bu-zhou
---

# Nacos服务治理
1. 引入`spring-cloud-starter-alibaba-nacos-discovery`依赖
2. 程序入口写注解`@EnableDiscoveryClient`
3. application.yml写服务名,和服务中心地址:
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848

  application:
    name: demomarket-coupon
```
# Nacos统一配置管理
![截屏20211201 下午4.36.18.jpg](./%E6%88%AA%E5%B1%8F2021-12-01%20%E4%B8%8B%E5%8D%884.36.18-9d88ccfc8b6d4e7ea080a1b3e5a1f97b.jpg)

## 命名空间
配置有命名空间的概念,进行环境隔离,比如微服务间隔离,或者分成dev,pro啥的.
可在bootstrap.yaml里配置.
```yaml
config:
  cloud:
    nacos:
      config:
        namespace: 命名空间UUID(不是写命名空间的名字)
```

**以上信息均在bootstrap.yml里配置**

## 配置集
所有配置的集合,配置集ID就是配置文件名
## 配置分组
比如结合业务场景进行不同配置:如高负荷下用啥配置,平常用啥配置.


# Feign 远程调用
![截屏20211201 下午4.37.28.jpg](./%E6%88%AA%E5%B1%8F2021-12-01%20%E4%B8%8B%E5%8D%884.37.28-3f82545a924d45bbae161ddb3aefc5f1.jpg)

主要是在消费者端,新建一个feign包专门容纳接口.实例:
`这里的RequestMapping是服务提供者暴露的api`
```java
@FeignClient("demomarket-coupon")
public interface CouponFeignService {

    @RequestMapping("/coupon/coupon/member/list")
    public R memberCoupons();

}
```
在消费者端程序入口,标记feign接口地址:
```java
@SpringBootApplication
@MapperScan("com.learn.demomarket.member.dao")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.learn.demomarket.member.feign")
public class DemomarketMemberApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemomarketMemberApplication.class, args);
    }

}
```

