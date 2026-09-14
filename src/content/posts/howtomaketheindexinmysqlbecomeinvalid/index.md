---
title: How to make the Index in MySQL become invalid? MySQL索引失效
slug: howtomaketheindexinmysqlbecomeinvalid
date: '2022-05-19T10:27:25.900Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Development
- Notes
- Database
original_permalink: /archives/howtomaketheindexinmysqlbecomeinvalid
---

# 凡例
1. Use `!=` or `<>`
```sql
SELECT * FROM `user` WHERE `name` != 'namename'; 
```
此时会进行全表扫描导致索引失效.

2. 搜索时输入和表字段不一致(隐式类型转换)
```sql
SELECT * FROM `user` WHERE height= 175; 
```
如果height在表中存储的是varchar, 在查询过程中存在隐式类型转换, 导致全表扫描;

3. 搜索的索引字段包了个函数, 不会索引
```sql
SELECT * FROM `user` WHERE DATE(create_time) = '2022-09-03';
```

4. 对索引字段使用运算符, 不会索引
```sql
SELECT * FROM `user` WHERE age - 2 = 20;
```
运算符包括加减乘除

5. OR连接不同字段时, 索引失效 (OR连接同字段, 不会失效)
```sql
SELECT * FROM `user` WHERE `name` = 'zhangsan' OR height = '195';
```

6. NOT IN, NOT EXIST 不走索引
```sql
SELECT s.* FROM `user` s WHERE NOT EXISTS (SELECT * FROM `user` u WHERE u.name = s.`name` AND u.`name` = 'namename')

SELECT * FROM `user` WHERE `name` NOT IN ('namename');
```

7. 通配符在头部的模糊搜索不走索引
```sql
SELECT * FROM `user` WHERE `name` LIKE '%冰';
```

8. IS NULL不走索引, IS NOT NULL走索引
```sql
SELECT * FROM `user` WHERE address IS NULL
```
启示: 如果非必须, 不要让记录里有null, 不然可能有索引失效的问题.


