---
title: 尝试使用Docker搭建Mailu个人邮局
slug: chang-shi-shi-yong-docker-da-jian-mailu-ge-ren-you-ju
date: '2021-12-20T13:43:03.860Z'
categories:
- Notes
- Utilities
tags:
- Notes
- Mail
original_permalink: /archives/chang-shi-shi-yong-docker-da-jian-mailu-ge-ren-you-ju
---

# 必要条件

- 主机**必须支持开启25端口**, 否则免谈.
- 主机必须是纯净的, 自己不能带有Nginx.
- 主机至少2GB总内存.

# 准备
- 为了有能开启25端口的, 租了个俄罗斯最垃圾的VPS, 配置好, 安装好docker和docker-compose.

- DNS规则书写: 
  - A记录: 名称`mail.demo.org`, 内容`xxx.xxx.xxx.xxx`
  - MX记录: 名称 `demo.org`, 内容`mail.demo.org`

- 本文提到的demo.org只是示例域名, 实际上是你自己用自己的域名设置的.


# 步骤

## 文档和项目仓库
[Mailu](https://github.com/Mailu/Mailu)事一个保守的邮件分发-服务项目, 可以通过docker-compose部署.

说明书链接在此:[Mailu说明书](https://mailu.io/1.8/)

## 安装

1. Docker配置文件的生成: 访问[配置文件生成网页](https://setup.mailu.io/1.8/submit_flavor), 设置细节如下
  - Step 1: 选择Compose
  - Step 2: 
    - storage Path: 默认
    - Main mail domain and server display name: demo.rg
    - Postmaster local part: admin
    - letsencrypt
    - 默认...
    - Website name: demo
    - Linked Website URL: https://mail.demo.org
    - 可以勾选
  - Step 3:
    - 可以选择一个喜欢的
    - Enable the antivirus service: 看配置吧
    - 剩下两个可不要
  - Step 4:
    - IPv4 listen address: 你服务器公网ip
    - Subnet of the docker network: 默认就ok
    -  IPv6可不开
    - Enable unbounded resolver可不开
    - public hostnames: mail.demo.org, 如果发现你的/admin页面进不去, 就设成demo.org重新生成配置试试.

  - Database preferences: 我是垃圾服务器, 所以选了sqlite.
  
**接下来生成配置文件**

2. 按照提交后的第二个页面的指示执行就好, 会下载配置文件. 注意下载配置文件后核对下有没有被插入了恶意的代码.

3. 按照指示的运行;

4. **坑点**: 有一个mailu_front_1容器会报错, 关于端口`:::25::`被占用啥啥的, 解法:
    1. 排查端口是不是真的被占用了, **注意Mailu需要部署在没有Nginx的服务器上**;
    2. 排查防火墙安全组, 所需端口在生成的`docker-compose.yml`里都有, 有80, 443, 25, 465, 587, 110, 995, 143, 993.
    3. **删除`docker-compose.yml`有关IPv6的设置条目**: 在配置文件20多行有个`ports:`配置下面有好多端口映射配置, 你把包含你主机公网ip地址的配置项保留, 其余的类似于`::::80::`啥的都删了. 这种类似于`::::`写法的是IPv6的记录, 咱们不需要.

5. 重新运行试试, 应该就能正常启动了;
6. 配置管理员口令:
`docker-compose -p mailu exec admin flask mailu admin admin demo.org PASSWORD`
注意PASSWORD里先暂时不要出现特殊字符, 不然终端里敲了回车, 特殊字符(比如管道符|, > 什么的)会触发奇怪的问题.

7. 登录你的`mail.demo.org/admin`试试吧. 我反正这样走下来是没有啥问题的.

# 总结

- 25端口国内的一般不给开;
- 有问题读他的文档, 更详细, 实在不行给那个Github里发Issue问问.


# 附录: 给QQ邮箱发送邮件被退信

## 症状
今天测试QQ邮箱给个人邮局发邮件, 能够收到. 但是个人邮局给QQ邮箱发邮件, 退信, 报错`550 Domain may not exist or DNS check failed`.

## 原因
直译是QQ邮箱反查我们的域名说**域名不存在或者DNS检查失败**. 这其实是一种防垃圾邮件的机制, 人家会反查一下我们的域名SPF记录.

>SPF，是(Sender Policy Framework)的缩写
SPF记录的目的是为了拦截垃圾邮件，它用于登记某个域名拥有的用来外发邮件的所有IP地址，将提高该域名的信誉度，同时可以防止垃圾邮件伪造该域的发件人发送垃圾邮件。

>SPF是向收信者表明，哪些邮件服务器是经过某个域名认可会发送邮件的

>SPF记录就是我们常说的TXT记录

>SPF记录，是一种以IP地址认证电子邮件发件人身份的技术，是非常高效的垃圾邮件解决方案。接收邮件方会首先检查域名的SPF记录，来确定发件人的IP地址是不是被包含在SPF记录里面，如果在里面，就认为这是一封正确的邮件，如果不在里面，就会认为是一封伪造的邮件进行退回。

>没有设置SPF记录的话，别人可以不用你的密码就冒用你的邮箱发邮件，设置TXT记录后，别人不能这么做，因为TXT记录里限制了邮件发送的固定服务器地址，即只有通过被允许的服务器地址才能发邮件。


所以一个安全稳定的企业邮箱，SPF记录是必不可少的。

## 解法
尝试设置域名DNS的SPF记录, SPF记录值, 之前的退信里应该有提到.
spf写法:
![image.jpeg](./image-67dce056e7ee44dfbae36fd6099e846c.jpeg)

**为了IP地址隐蔽, IP4:XXX 这个改成 ~all**.

