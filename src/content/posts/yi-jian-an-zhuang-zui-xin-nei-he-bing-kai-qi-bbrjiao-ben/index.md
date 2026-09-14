---
title: 一键安装最新内核并开启 BBR 脚本
slug: yi-jian-an-zhuang-zui-xin-nei-he-bing-kai-qi-bbrjiao-ben
date: '2022-01-11T08:00:45.477Z'
categories:
- Notes
- Utilities
tags:
- 网上冲浪
- Notes
original_permalink: /archives/yi-jian-an-zhuang-zui-xin-nei-he-bing-kai-qi-bbrjiao-ben
---

# 介绍
2016年, Google 开源了其 TCP BBR 拥塞控制算法，并提交到了 Linux 内核，从 4.9 开始，Linux 内核已经用上了该算法。

今天，可以使用某一个/群大佬制作的一键安装最新内核并开启 TCP BBR 脚本。

# Github地址
[teddysun/across](https://github.com/teddysun/across)

# 指南
## 指南信息
系统支持：CentOS 6+，Debian 8+，Ubuntu 16+
虚拟技术：OpenVZ 以外的，比如 KVM、Xen、VMware
内存要求：≥128M

日期　　：2021 年 1 月 3 日

如果您担心本指南太老, 可以进入之前的Github地址里看作者说明. 一般没啥问题, 毕竟只是运行简单脚本然后检查下安装成果罢了.

## 检查是不是已有BBR拥塞控制了
运行`sysctl net.ipv4.tcp_available_congestion_control`
如果有了bbr控制算法, 返回值里会存在`bbr`这个单词的.

## 服务器备份
做好快照, 出问题好回滚

## 安装
root用户, 运行`wget --no-check-certificate -O /opt/bbr.sh https://github.com/teddysun/across/raw/master/bbr.sh
chmod 755 /opt/bbr.sh
/opt/bbr.sh`

按照提示, 重启

## 检验安装成果
重启完成后，进入 VPS，验证一下是否成功安装最新内核并开启 TCP BBR，输入以下检查：

- No.1
uname -r
查看内核版本，显示为新版内核就表示 OK 了。

- No.2
sysctl net.ipv4.tcp_available_congestion_control
返回值一般为：
net.ipv4.tcp_available_congestion_control = bbr cubic reno
或者：
net.ipv4.tcp_available_congestion_control = reno cubic bbr

- No.3
sysctl net.ipv4.tcp_congestion_control
返回值一般为：
net.ipv4.tcp_congestion_control = bbr

- No.4
sysctl net.core.default_qdisc
返回值一般为：
net.core.default_qdisc = fq

- No.5
lsmod | grep bbr
返回值有 tcp_bbr 模块即说明 bbr 已启动。比如：
tcp_bbr                20480  3
注意：并不是所有的 VPS 都会有此返回值，若没有也属正常。

# 特殊
如果你使用的是 Google Cloud Platform （GCP）更换内核，有时会遇到重启后，整个磁盘变为只读的情况。只需执行以下命令即可恢复：

`mount -o remount rw /`
