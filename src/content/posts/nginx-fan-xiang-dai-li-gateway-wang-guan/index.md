---
title: Nginx反向代理Gateway网关
slug: nginx-fan-xiang-dai-li-gateway-wang-guan
date: '2021-12-11T03:37:07.870Z'
categories:
- Notes
- Utilities
tags:
- Development
- Web
- SpringCloud
original_permalink: /archives/nginx-fan-xiang-dai-li-gateway-wang-guan
---

# 起因
想要使用Nginx方向代理到Spring Cloud Gateway网关.

# 经过
假设我们的域名是`demomarket`

0. 在`/etc/nginx/nginx.conf`里配置上游服务器地址:

```JSON
http {
    # 这些东西都是本来就有的,需要配置的在最下面
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;
    
    # 需要配置的在这里!!! 前面定义上游服务器名,server字段指向你网关地址
    upstream demomarket{
        server 192.168.1.6:88;
    }
    include /etc/nginx/conf.d/*.conf;
}

```


1. 在nginx`conf.d`目录下面新建`demomarket.conf`配置文件 (复制default.conf即可);

2. [**重要**] 打开`demomarket.conf`,编辑:
```JSON
server {
    listen       80;
    listen  [::]:80;
    # 你域名
    server_name  demomarket.com;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        # 定义转发时,让header里继续携带Host信息,nginx在转发时会默认会丢掉很多东西!$
        proxy_set_header Host $host;
	# 这里指向的就是之前配置的上游服务器名
        proxy_pass http://demomarket;
    }

# 以下省略
}
```

3. 配置Gateway网关
```yaml
spring:
    gateway:
      routes:
        - id: demomarket_host_route
          uri: lb://demomarket-product
          predicates:
            # 这个Host字段会读请求header里的Host字段,如果之前在nginx里没配置proxy_set_header Host, 就无法取出host信息,就走不到这个路由
            - Host=**.demomarket.com
```

# 总结
- 注意nginx conf书写的格式,四个空格;
- 注意配置proxy_set_header Host $host,让请求转发后继续携带Host字段,这样Gateway的Host工厂就能读取之.
