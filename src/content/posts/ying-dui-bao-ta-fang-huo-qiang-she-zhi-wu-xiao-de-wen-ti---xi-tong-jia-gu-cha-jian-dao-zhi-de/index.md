---
title: 应对宝塔防火墙设置无效的问题 -- 系统加固插件导致的
slug: ying-dui-bao-ta-fang-huo-qiang-she-zhi-wu-xiao-de-wen-ti---xi-tong-jia-gu-cha-jian-dao-zhi-de
date: '2021-12-27T13:50:02.527Z'
categories:
- Notes
- Utilities
tags:
- Utils
original_permalink: /archives/ying-dui-bao-ta-fang-huo-qiang-she-zhi-wu-xiao-de-wen-ti---xi-tong-jia-gu-cha-jian-dao-zhi-de
---

# 起因

设置放行端口, 无效. 确定服务器安全组设置是正确的.

# 经过
经查, 宝塔使用的是`firewalld.service`这个服务下的防火墙.

首先检查服务状态`systemctl status firewalld.service`, 发现挂了. 

试着重启此服务, 但还是无效!

检查了白名单:`firewall-cmd --permanent --list-port`, 发现firewall的白名单和宝塔面板里显示的白名单不一致. firewall白名单没有跟着宝塔面板里的防火墙设置更新, 出现了数据不一致问题.

# 解决

猜想, 宝塔面板这东西设置防火墙, 其实就是自动化地执行相关的shell命令, 比如批量放行`firewall-cmd --zone=public --add-port=4400-4600/udp --permanent`, 或者关闭端口`firewall-cmd --zone=public --remove-port=80/tcp --permanent`.

另外,回忆起服务器里安了个插件, 叫做**系统加固**. 这个B玩意儿防君子不防小人, 很有可能是我宝塔里设置了新的放行, 被这个东西拦截了下来, 然后还把防火墙服务搞炸了.

现在, 尝试关闭系统加固插件, 然后把新添加的宝塔面板上的端口删了, 再添加上.

# 结果

发现成功地添加了防火墙记录, 端口成功放行. WDNMD系统加固插件, 防君子不防小人, 你大爷的我还以为服务器被墙了.


