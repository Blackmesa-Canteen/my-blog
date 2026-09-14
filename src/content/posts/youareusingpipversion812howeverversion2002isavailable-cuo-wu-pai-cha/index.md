---
title: YOU ARE USING PIP VERSION 8.1.2, HOWEVER VERSION 20.0.2 IS AVAILABLE错误排查
slug: youareusingpipversion812howeverversion2002isavailable-cuo-wu-pai-cha
date: '2021-12-13T03:31:11.808Z'
categories:
- Notes
- Utilities
tags:
- Development
- Notes
original_permalink: /archives/youareusingpipversion812howeverversion2002isavailable-cuo-wu-pai-cha
---

# 起因
centOS 7, pip安装docker-compose,发现:
`YOU ARE USING PIP VERSION 8.1.2, HOWEVER VERSION 20.0.2 IS AVAILABLE.`

使用了它推荐的`pip install --upgrade pip`命令依旧无效.

# 经过
终端:
`curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py`;

然后: `sudo python3 get-pip.py --force-reinstall`;

发现没有安装python3, 则运行:`yum install python3`;

最后运行: `pip install django==1.8.2 -i http://pypi.douban.com/simple/ --trusted-host pypi.douban.com`;

又发现pip命令报错/usr/bin/pip: No such file or directory,这说明咱们需要刷新下缓存,请输入命令:
`hash -r`

# 结果
完事后,输入命令`pip -V`,查看pip版本成功更新.
