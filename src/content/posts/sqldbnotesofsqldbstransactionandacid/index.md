---
title: Notes of SQL DB''s Transaction and ACID
slug: sqldbnotesofsqldbstransactionandacid
date: '2021-07-03T05:39:11Z'
categories:
- Notes
tags:
- Database
cover: ./1625298152335-564eabd11def4e12bf7df3964482cd7f.png
original_permalink: /archives/sqldbnotesofsqldbstransactionandacid
---


# Transaction
## What:
A Transaction is **a set of operations** that satisfy ACID, either committed through a COMMIT or rolled back with ROLLBACK.
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625298152335.png -->
## ACID:
### 1. Atomicty 原子性
Transactions are treated as the smallest indivisible unit, and all operations of a transaction are either committed successfully or rolled back if they fail.
>要么全完成，要么直接白给

### 2. Consistency 一致性
The database remains in a consistent state before and after the transaction is executed. In a consistent state, all transactions read the same data.

*eg. let's say there is a constraint `a+b==10`, if one transaction changes `a`, then `b` should be changed to match the constraint.*

### 3. Isolation 隔离性
Before one transaction commits his changes, other transactions can not know these changes. Operations between transactions are independent.

### 4. Durability 持久性
Once we commit a transaction, changes it makes will be persistently stored in database, even though a system crash occurs.

### Relationships:
- The execution result of a transaction is correct **only if consistency is satisfied.**
- In the case of **no concurrency**, transactions execute serially, isolation will be satisfied automatically. In this case, if you can satisfy atomicity, then you can satisfy consistency.
- In the case of **concurrency**, where multiple transactions are executed in parallel, transactions must not only meet atomicity, but also need to meet isolation in order to meet consistency.
- Transactions are persisted, in order to handle database crashes.
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625298897390.png -->

# Concurrency Problem (隔离级别)

## 脏读（Read Uncommitted）
A transaction reads uncommitted data from another transaction during processing.
>你的东西都还没操作完，别人就读到了你正操作的数据，万一你回滚了怎么办，你说这数据脏不脏。

## 幻读  (Phantom Read)
Transaction A reads data according to A certain condition, during which transaction B inserts new data of the same search condition, and when transaction A reads again according to the original condition, it finds the newly inserted data of transaction B, which is called A magic read
>你今天用同一种事务A，同一种条件查询数据库。期间，别人的事务B增加/删除了符合你查询条件的数据，当你的事务A再次执行同一条件时出现不一致

## 不可重复读（Non-repeatable Read）
Multiple queries on only one specific data tuple within one transaction will return different results.

# How to Solve these bullshit?
## Lock
Lock, that is, to lock a critical zone, so that it can not be modified by other transactions.

1. Pessimistic lock悲观锁: It refers to the conservative attitude that the data is modified by the outside world (including other current transactions of the system, as well as transaction processing from the external system), so that **the data is locked during the whole process of data processing**
   
- Exclusive lock: When a transaction locked a block, the other can not read/edit.
- Shared lock: When a transaction T locked a block, it can ONLY read the block，while the other transaction can also lock the block with shared locks and read the block. Before T release the shared lock, everyone, include T, can NOT edit the block.

2. Optimistic locking: Assuming no concurrency conflicts occur, **only check for data integrity violations when the operation is committed**. **Optimistic locks do not solve the problem of** `Read Uncommitted脏读`.
