---
title: 使用trojan-go冲浪技术的相关实践要点
slug: shi-yong-trojan-go-chong-lang-ji-shu-de-xiang-guan-shi-jian-bei-wang
date: '2021-12-29T05:23:53.983Z'
categories:
- Notes
- Utilities
tags:
- 墙
- 网上冲浪
- Notes
original_permalink: /archives/shi-yong-trojan-go-chong-lang-ji-shu-de-xiang-guan-shi-jian-bei-wang
---

# 敬告读者

使用Trojan-go技术网上冲浪只为海外学子在凶险可怖的西方国家居住时,提供如同国内一般安全祥和的网络学习环境, 请勿将其用作非法获得海外数据的手段, 或者发布, 传播与居住地区法规相悖的信息. 

中国大陆用户请严格遵守中华人民共和国政府颁布的《互联网信息服务管理办法》第十五条「九不准」规定以及「七条底线」等相关法律法规。对于含有以下内容的信息，必须予以杜绝：

>反对宪法所确定的基本原则的；
危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
损害国家荣誉和利益的；
煽动民族仇恨、民族歧视，破坏民族团结的；
侮辱、滥用英烈形象，否定英烈事迹，美化粉饰侵略战争行为的；
破坏国家宗教政策，宣扬邪教和封建迷信的；
散布谣言，扰乱社会秩序，破坏社会稳定的；
散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
煽动非法集会、结社、游行、示威、聚众扰乱社会秩序的；
侮辱或者诽谤他人，侵害他们合法权益的；
含有法律、行政法规禁止的其他内容的。

# 服务端部署

1. 为了快速游泳, 可以采用懒人脚本:
[GitHub链接](https://github.com/Blackmesa-Canteen/one_click_script). Fork自别人的开源项目, 安全性请自行确认.

当然, 你会发现如果不是纯净的空服务器, 其实用脚本帮助不是很大...存在很多的手工操作空间.

2. 如果是纯净的空服务器, 就十分省事了, 无脑按照脚本提示来就行. 如果服务器里已经部署了nginx服务器, 并且已有网站占用了443端口, 推荐使用trojan-go, ws+CDN, 无nginx安装方式. 使用了ws+CDN能够通过Websocket进行CDN转发,和抵抗中间人攻击.

3. 首先输入trojan部署的网址, 如果这个网址已经有了网站内容和证书, 安装中可以不用再自动申请证书了, 可以自行将你的ssl证书塞到`/root/website/cert`目录下, 文件名分别为`fullchain.cer`和`private.key`. 后缀名不用太担心, 假如你原来的证书是`.pem`后缀的也没关系, 只要文件里的内容一样就行. 
如果你使用了BT panel管理ssl, 可以从`/www/server/panel/vhost/ssl`目录下找到你对应网站的ssl证书文件, 再使用`ln`命令做个硬链接到`/root/website/cert`.

4. 会提示检查IP, IP地址也不用检查了(因为你原本网站就能正常访问, 说明DNS解析没错, 可以保持CDN代理). 然后默认端口别设置为443(已经有nginx占用了), 先弄成其他的, 比如8888. 到后期咱们通过SNI多路径分流使其能够和其他网站分享443端口.

5. 等待安装自动完成了. 提示信息保存好. 如果不小心抹除了控制台提示信息, 也可以在你的`/root`目录下找到:`readme_trojan_v2ray.txt`.

6. 建议开启shadowsocks AEAD二次加密. 咱们知道, trojan是通过TLS进行数据传输的, 虽然传输过程是安全的, 但对于CDN中介, 消息是透明的. 假如CDN不可靠, 或者被劫持伪造, 透明的信息就明显不合适.
服务端开启shadowsocks很简单, 脚本安装完成后, 请进入到`/root/trojan-go/server.json`里增加一条额外的JSON项:

```JSON
{
    ...
    ,
    "shadowsocks": {
        "enabled": true,
        "method": "AES-128-GCM",
        "password": "你的密码"
    },
    ...
}
```

一般`AES-128-GCM`就够了, 可选算法:
- CHACHA20-IETF-POLY1305
- AES-128-GCM (默认)
- AES-256-GCM

注意设置应用后, 在客户端也要对接. 这个在后文中讨论.


7. 脚本结束后:
- Trojan-go 服务器端配置路径 `/root/trojan-go/server.json` 
- Trojan-go 运行日志文件路径: `/root/trojan-access.log` 
- Trojan-go 查看日志命令: `journalctl -n 50 -u trojan-go.service` 
- Trojan-go 停止命令: `systemctl stop trojan-go.service`  启动命令: `systemctl start trojan-go.service`  重启命令: `systemctl restart trojan-go.service`
- Trojan-go 查看运行状态命令:  `systemctl status trojan-go.service` 
- Trojan-go 服务器 每天会自动重启, 防止内存泄漏. 运行 `crontab -l` 命令 查看定时重启命令

8. Nginx配置
如果已有网页, 需要手工配置Nginx. 
一般情况下, 443端口早已经被其他网页占用了, 所以之前我们把trojan-go被安排在了另一个罕见端口. 但是直接公网访问这个罕见端口并不安全, 因为其容易被模式识别导致封禁(非常见端口, 大流量, 单一IP访问). 今天介绍一种给trojan-go复用443端口的**唯一**方案 -- **一种基于SNI代理的多路径分流中继方案**, 使我们的trojan-go能够和其他网站分享443端口.

**注意: 不得开启网页的强制跳转SSL 443端口的配置, 不然会无限重定向.**

在nginx.conf主配置里配置示例:
```
# 在 /etc/nginx/nginx.conf 加入這段, 原先的內容不要刪
stream {
	map $ssl_preread_server_name $backend_name {
		daili.example.com trojan;
		example.com web;
		
		default web;
	}

	upstream web {
		server 127.0.0.1:4433;
	}

	upstream trojan {
		server 127.0.0.1:8888;
	}

	server {
		listen 443 reuseport;
		listen [::]:443 reuseport;
		proxy_pass  $backend_name;
		ssl_preread on;
	}
}
```

然后其余的网站里配置:
```
# 其他網站全部監聽 127.0.0.1:4433, 在這個端口進行 TLS 握手
server {

    # 和trojan共享网址的网站另外还需要监听80: listen 80;
    listen 127.0.0.1:4433 ssl http2;
    
    ...
}
```

以此类推, 以后新的nginx网站, 凡是有SSL的, 都请设置监听4433端口.

# 客户端推介

1. 台式机:`qv2ray`. 配置方法: [Qv2ray配置并使用trojan-go进行网上冲浪](https://blog.996workers.icu/archives/qv2ray-pei-zhi-bing-shi-yong-trojan-go-jin-xing-wang-shang-chong-lang);
2. Android手机: [SagerNet](https://github.com/SagerNet/SagerNet), 搭配安装插件[trojan-go-plugin](https://github.com/SagerNet/SagerNet/releases/tag/trojan-go-plugin-0.10.6). 插件最好开启开机自动运行的权限.
3. 傻逼苹果牌儿手机: [小火箭](https://shadowsockshelp.github.io/ios/).

对于qv2ray, 配置shadowsocket AEAD二次加密对接: 在出站设置的`Encryption`输入框里写:`ss;aes-128-gcm:你的密码`即可. 
手机端有对应的UI/UX实现, 以手机端应用界面为准.








