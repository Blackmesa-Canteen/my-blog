---
title: CentOS 7设置fail2ban缓解SSH端口爆破
slug: centos7-she-zhi-fail2ban-huan-jie-ssh-duan-kou-bao-po
date: '2021-12-29T01:04:27.257Z'
categories:
- Notes
- Utilities
tags:
- Notes
- Web
- Utils
original_permalink: /archives/centos7-she-zhi-fail2ban-huan-jie-ssh-duan-kou-bao-po
---

# 安装
`yum install epel-release -y`
`yum install fail2ban fail2ban-systemd -y`

# 设定
新建配置:
`vim /etc/fail2ban/jail.d/sshd.local`

配置内容示例:
```
[sshd]
enabled = true
filter = sshd
findtime = 120
bantime = 120
maxretry = 3
banaction = iptables-allports
```
常用参数解释, 比如:
```
enabled=true 是否启用
ignoreip = 127.0.0.1 忽略的IP
bantime=86400 封锁时间，单位：秒
findtime=600 统计时间范围，在规定时间内满足条件开始执行封锁，单位：秒
maxretry=5 错误次数
port=26613 端口
logpath=/var/log/secure 检测日志路径 
```

# 操作
```
//启动
systemctl start fail2ban
//重启
systemctl restart fail2ban
//开机启动
systemctl enable fail2ban
//查看状态
systemctl status fail2ban.service
//查看配置状态
fail2ban-client status
//默认配置
vim /etc/fail2ban/jail.conf
 
//查看攻击者
fail2ban-client status sshd

//添加白名单
fail2ban-client set sshd addignoreip IP地址
 
//删除白名单
fail2ban-client set sshd delignoreip IP地址
 
//查看Fail2ban日志
tail /var/log/fail2ban.log
 
//查看被禁止的IP地址
iptables -L -n
 
//确保防火墙已开
systemctl enable firewalld
systemctl start firewalld
```

