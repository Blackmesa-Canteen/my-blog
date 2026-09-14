---
title: 干掉阿里云后门进程
slug: gan-diao-a-li-yun-hou-men-jin-cheng
date: '2021-12-26T03:45:09.677Z'
categories:
- Notes
- Random
- Utilities
tags:
- 墙
- Notes
original_permalink: /archives/gan-diao-a-li-yun-hou-men-jin-cheng
---

# 起因

>黄鹤之飞尚不得过, 猿猱欲度愁攀援. 

懂得都懂.

# 步骤

0. 先做机器快照. **备份!**

1. 使用官方脚本卸载云盾/安骑士

```shell
wget http://update.aegis.aliyun.com/download/uninstall.sh
chmod +x uninstall.sh
./uninstall.sh

wget http://update.aegis.aliyun.com/download/quartz_uninstall.sh
chmod +x quartz_uninstall.sh
./quartz_uninstall.sh
```

2. 手动删除残留
```shell
pkill aliyun-service

rm -fr /etc/init.d/agentwatch /usr/sbin/aliyun-service

rm -rf /usr/local/aegis*
```

**大多数网上教程到此为止了, 其实还有.**

3. 深度清理

    1. 干掉相关服务:
    ```shell
    pkill aliyun-service

    systemctl stop agentwatch.service

    systemctl disable agentwatch.service

    rm -rf /usr/sbin/aliyun*

    chkconfig --del cloudmonitor
    ```
    2. 干掉相关文件
    ```shell
    cd /
    
    find . -name 'agentwatch*' -type d -exec rm -rf {} \; && find . -name 'agentwatch*' -type f -exec rm -rf {} \;
    ```
    ```shell
    find . -name 'aliyun*' -type d -exec rm -rf {} \;
    find . -name 'aliyun*' -type f -exec rm -rf {} \;
    find . -name 'aegis*' -type f -exec rm -rf {} \;
    find . -name 'aegis*' -type d -exec rm -rf {} \;
    rm -fr /usr/sbin/aliyun-service /usr/sbin/aliyun_installer

    find /etc/systemd/system/ -name 'cloud-*' | xargs rm -rf
    ```
    3. **风险项**: 如果干掉下面的, 阿里云控制台面板就看不到机器运行状态之类的了, 谨慎决定.
    ```shell
    rm -fr /lib/systemd/system/accounts-daemon.service
    ```

4. 配置本地防火墙屏蔽阿里云后门ip访问:

操作系统为CentOS 7.

先确保安装防火墙服务: `yum install iptables-services`;

然后屏蔽:
```shell
iptables -I INPUT -s 140.205.201.0/24 -j DROP
iptables -I INPUT -s 140.205.201.0/28 -j DROP
iptables -I INPUT -s 140.205.201.16/29 -j DROP
iptables -I INPUT -s 140.205.201.32/28 -j DROP
iptables -I INPUT -s 140.205.225.0/24 -j DROP
iptables -I INPUT -s 140.205.225.192/29 -j DROP
iptables -I INPUT -s 140.205.225.200/30 -j DROP
iptables -I INPUT -s 140.205.225.184/29 -j DROP
iptables -I INPUT -s 140.205.225.183/32 -j DROP
iptables -I INPUT -s 140.205.225.206/32 -j DROP
iptables -I INPUT -s 140.205.225.205/32 -j DROP
iptables -I INPUT -s 140.205.225.195/32 -j DROP
iptables -I INPUT -s 140.205.225.204/32 -j DROP
iptables -I INPUT -s 106.11.224.0/26 -j DROP
iptables -I INPUT -s 106.11.224.64/26 -j DROP
iptables -I INPUT -s 106.11.224.128/26 -j DROP
iptables -I INPUT -s 106.11.224.192/26 -j DROP
iptables -I INPUT -s 106.11.222.64/26 -j DROP
iptables -I INPUT -s 106.11.222.128/26 -j DROP
iptables -I INPUT -s 106.11.222.192/26 -j DROP
iptables -I INPUT -s 106.11.223.0/26 -j DROP
iptables -I INPUT -s 112.124.127.224 -j DROP
iptables -I INPUT -s 112.124.127.44 -j DROP
iptables -I INPUT -s 112.124.127.64 -j DROP
iptables -I INPUT -s 112.124.127.53 -j DROP
iptables -I INPUT -s 120.26.216.168 -j DROP
iptables -I INPUT -s 120.26.64.126 -j DROP
iptables -I INPUT -s 121.43.107.174 -j DROP
iptables -I INPUT -s 121.43.107.176 -j DROP
iptables -I INPUT -s 121.41.117.242 -j DROP
iptables -I INPUT -s 121.40.130.38 -j DROP
iptables -I INPUT -s 121.41.112.148 -j DROP
iptables -I INPUT -s 115.29.112.222 -j DROP
iptables -I INPUT -s 115.28.203.70 -j DROP
iptables -I INPUT -s 42.96.189.63 -j DROP
iptables -I INPUT -s 115.29.113.101 -j DROP
iptables -I INPUT -s 120.27.40.113 -j DROP
iptables -I INPUT -s 115.28.171.22 -j DROP
iptables -I INPUT -s 115.28.189.208 -j DROP
iptables -I INPUT -s 121.42.196.232 -j DROP
iptables -I INPUT -s 115.28.26.13 -j DROP
iptables -I INPUT -s 120.27.47.144 -j DROP
iptables -I INPUT -s 120.27.47.33 -j DROP
iptables -I INPUT -s 112.126.74.55 -j DROP
iptables -I INPUT -s 182.92.148.207 -j DROP
iptables -I INPUT -s 182.92.1.233 -j DROP
iptables -I INPUT -s 112.126.73.56 -j DROP
iptables -I INPUT -s 123.56.138.37 -j DROP
iptables -I INPUT -s 123.57.10.133 -j DROP
iptables -I INPUT -s 112.126.75.174 -j DROP
iptables -I INPUT -s 182.92.157.118 -j DROP
iptables -I INPUT -s 112.126.75.221 -j DROP
iptables -I INPUT -s 182.92.69.212 -j DROP
iptables -I INPUT -s 10.153.174.11 -j DROP
iptables -I INPUT -s 10.153.175.147 -j DROP
iptables -I INPUT -s 10.153.175.146 -j DROP
iptables -I INPUT -s 110.75.0.0/16 -j DROP
iptables -I INPUT -s 42.120.0.0/16 -j DROP
```

最后开启服务:

```shell
service iptables save

service iptables restart
```

# 结果

应该能够干掉后门进程. 但是注意阿里IT部门的高技术力, 依旧不能掉以轻心. 以一小诗自勉: 

>危楼高百尺，手可摘星辰。 
不敢高声语，恐惊天上人。
