---
title: '[测试文章]博客数据库系统从MySQL迁移为H2测试'
slug: -ce-shi-wen-zhang--bo-ke-shu-ju-ku-xi-tong-cong-mysql-qian-yi-wei-h2-ce-shi
date: '2021-12-06T12:09:41.954Z'
categories:
- Random
tags:
- Test
cover: ./69796042-8238546f3c0345509e6d36b186bf13c7.jpg
original_permalink: /archives/-ce-shi-wen-zhang--bo-ke-shu-ju-ku-xi-tong-cong-mysql-qian-yi-wei-h2-ce-shi
---

# 起因
MySQL太吃内存,试用H2数据库

# 经过
1. 下载博客后台源码,本地运行生成H2空白数据库文件;
2. 将本博客数据库维护端口从防火墙暴露,导出各个表格为CSV,下载,然后防火墙封闭端口;
3. 将导出的CSV逐个导入本地H2空白数据库中;
4. SSH上传数据库文件至服务器,改博客后台配置文件中有关数据持久化的内容,使其使用H2数据库;
5. 测试运行,发现数据库只读,经查发现是上传后的数据库文件所属用户为root用户,没有写权限;
6. 收敛该数据库文件的所有权到本博客专属账户;
7. 继续测试.

# 结果
如果这篇博文成功发布,则说明迁移成功.

