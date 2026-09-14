---
title: 降低Demo用的MySQL数据库内存占用
slug: jiang-di-demo-yong-de-mysql-shu-ju-ku-nei-cun-zhan-yong
date: '2021-12-09T02:01:27.915Z'
categories:
- Utilities
tags:
- Development
- Database
original_permalink: /archives/jiang-di-demo-yong-de-mysql-shu-ju-ku-nei-cun-zhan-yong
---

# 方法
1. 关闭performance_schema, 和
2. 调整msyql的参数。

# 实施
## 关闭performance_schema

**1.简介**

MySQL 5.5开始新增一个数据库：PERFORMANCE_SCHEMA，主要用于收集数据库服务器性能参数。

并且库里表的存储引擎均为PERFORMANCE_SCHEMA，而用户是不能创建存储引擎为PERFORMANCE_SCHEMA的表。

MySQL5.5默认是关闭的，需要手动开启，**但从MySQL5.6开始，默认打开**.

**2.关闭之**
1. 进入MySQL查看其是否被开启:
登录: `mysql -u root -p`
查看: `mysql> show variables like 'performance_schema';`
退出: `mysql> exit`

2. 找到配置文件所在地:
`mysql --help|grep 'my.cnf'`
此时会列出几个地址,用cat去看看是不是存在的,存在的就进去用vim编辑.

3. 在`my.cnf`里添加配置
```text
[mysqld]

performance_schema = off
```

4. 重启MySQL
`mysql.server stop`
`mysql.server start`

## 参数调优
修改上述的配置文件,追加:
```text
performance_schema_max_table_instances=150

table_definition_cache=150

table_open_cache=64

innodb_buffer_pool_size=2M
```

如下是5.6的默认配置,可以参考:
```text
5.6默认的设置

performance_schema_max_table_instances = 12500

table_definition_cache = 1400

table_open_cache = 2000

innodb_buffer_pool_size=128M
```

# 结果

一套组合拳下来,可以节省几百MB的内存.
