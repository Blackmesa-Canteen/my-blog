---
title: MySQL `EXPLAIN` command notes
slug: mysqlexplaincommandnotes
date: '2022-06-26T00:15:59.866Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Development
- Notes
- Theories
- Database
original_permalink: /archives/mysqlexplaincommandnotes
---

# Intro
我们常常用到`explain`这个命令来查看一个这些SQL语句的执行计划，查看该SQL语句有没有使用上了索引，有没有做全表扫描，这都可以通过explain命令来查看。所以我们深入了解MySQL的基于开销的优化器，还可以获得很多可能被优化器考虑到的访问策略的细节，以及当运行SQL语句时哪种策略预计会被优化器采用。e.g.
```sql
-- 实际SQL，查找用户名为Jefabc的员工
select * from emp where name = 'Jefabc';
-- 查看SQL是否使用索引，前面加上explain即可
explain select * from emp where name = 'Jefabc';
```

# Description
expain出来的信息有10列，分别是id、select_type、table、type、possible_keys、key、key_len、ref、rows、Extra

- id:选择标识符
- select_type:表示查询的类型。
- table:输出结果集的表
- partitions:匹配的分区
- type:表示表的连接类型
- possible_keys:表示查询时，可能使用的索引
- key:表示实际使用的索引
- key_len:索引字段的(最大)长度
- ref:列与索引的比较
- rows:扫描出的行数(估算的行数)
- filtered:按表条件过滤的行百分比
- Extra:执行情况的描述和说明

## id
SELECT识别符。这是SELECT的查询序列号, 是SQL执行的顺序标识, id不同时,执行从大到小; id相同时, 从上到下执行. 

## select_type
表示查询中每个select的查询类型.

1. SIMPLE: 简单select, 无union或子查询操作;
2. PRIMARY: 子查询中的最外层查询;
3. UNION: UNION中的第二个及其后面的select子句;
4. DEPENDENT UNION: UNION中的第二个及其后面的select子句, 取决于外层查询;
5. UNION RESULT: UNION的结果, union语句中第二个select开始后面所有select;
6. SUBQUERY: 子查询中第一个select, 不依赖于外部查询;
7. DEPENDENT SUBQUERY: 子查询中第一个select, 依赖于外部查询
8. DERIVED: from里的派生表
9. UNCACHEABLE SUBQUERY: 一个子查询的结果不能被缓存，必须重新评估外链接的第一行;

## table
显示表名, 有可能是简称.

## type
显示对表访问方式, 访问类型.

- all: 全表遍历
- index: 只遍历所有索引
- range: 使用索引检索指定范围内的行
- ref: 哪些列或常量被用于查找索引列上的值
- eq_ref: 类似ref，区别就在使用的索引是唯一索引，对于每个索引键值，表中只有一条记录匹配，简单来说，就是多表连接中使用primary key或者 unique key作为关联条件
- const、system: 当MySQL对查询某部分进行优化，并转换为一个常量时，使用这些类型访问。如将主键置于where列表中，MySQL就能将该查询转换为一个常量，system是const类型的特例，当查询的表只有一行的情况下，使用system.
- null: MySQL在优化过程中分解语句，执行时甚至不用访问表或索引，例如从一个索引列里选取最小值可以通过单独索引查找完成。

## possible_keys
指出MySQL能使用哪个索引在表中找到记录，查询涉及到的字段上若存在索引，则该索引将被列出，但不一定被查询使用（该查询可以利用的索引，如果没有任何索引显示 null.

**如果该列是NULL，则没有相关的索引。在这种情况下，可以通过检查WHERE子句看是否它引用某些列或适合索引的列来提高你的查询性能。如果是这样，创造一个适当的索引并且再次用EXPLAIN检查查询**.

## key
ey列显示MySQL实际决定使用的键（索引），必然包含在possible_keys中

**如果没有选择索引，键是NULL。要想强制MySQL使用或忽视possible_keys列中的索引，在查询中使用FORCE INDEX、USE INDEX或者IGNORE INDEX。**

## key_len
索引最大可能长度, 根据定义计算而得. **越短越好**.

## ref
列与索引的比较，表示上述表的连接匹配条件，即哪些列或常量被用于查找索引列上的值

## rows
**估算**结果集行数/所需要读取的行数.

## extra
该列包含MySQL解决查询的详细信息,有以下几种情况：

- Using where:不用读取表中所有信息，仅通过索引就可以获取所需数据，这发生在对表的全部的请求列都是同一个索引的部分的时候，表示mysql服务器将在存储引擎检索行后再进行过滤
- Using temporary：表示MySQL需要使用临时表来存储结果集，常见于排序和分组查询，常见 group by ; order by
- Using filesort：当Query中包含 order by 操作，而且无法利用索引完成的排序操作称为“文件排序”
- Using join buffer：改值强调了在获取连接条件时没有使用索引，并且需要连接缓冲区来存储中间结果。如果出现了这个值，那应该注意，根据查询的具体情况可能需要添加索引来改进能。
- Impossible where：这个值强调了where语句会导致没有符合条件的行（通过收集统计信息不可能存在结果）。
- Select tables optimized away：这个值意味着仅通过使用索引，优化器可能仅从聚合函数结果中返回一行
- No tables used：Query语句中使用from dual 或不含任何from子句

# Others
- EXPLAIN不会告诉你关于触发器、存储过程的信息或用户自定义函数对查询的影响情况
- EXPLAIN不考虑各种Cache
- EXPLAIN不能显示MySQL在执行查询时所作的优化工作
- 部分统计信息是估算的，并非精确值
- EXPALIN只能解释SELECT操作，其他操作要重写为SELECT后查看执行计划。
