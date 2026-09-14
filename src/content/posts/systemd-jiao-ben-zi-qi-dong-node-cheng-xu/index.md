---
title: systemd脚本自启动node程序
slug: systemd-jiao-ben-zi-qi-dong-node-cheng-xu
date: '2021-12-19T03:23:29.154Z'
categories:
- Notes
- Utilities
tags:
- Notes
original_permalink: /archives/systemd-jiao-ben-zi-qi-dong-node-cheng-xu
---

# 步骤

以服务名pano为例.

1. `vim /usr/lib/systemd/system/pano.service`
2. 插入以下文字并保存:
```text
[Unit]
Description=pano - main site of site_name.com
Documentation=http://www.site_name.com/docs/

[Service]
ExecStart=/usr/local/bin/node /www/www.site_name.com/node/bin/www
ExecStop=/bin/kill -s QUIT $MAINPID
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nobody
User=nobody
Group=nobody
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
3. 重载服务
`systemctl enable pano`
`systemctl start pano`

