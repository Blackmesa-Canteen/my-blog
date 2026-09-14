---
title: 克服商城超卖的一种思路
slug: ke-fu-shang-cheng-chao-mai-de-yi-zhong-si-lu
date: '2022-06-26T09:25:28.900Z'
categories:
- Notes
- Improvement
- Learning
- Utilities
tags:
- Development
- Improvement
- Notes
- Database
original_permalink: /archives/ke-fu-shang-cheng-chao-mai-de-yi-zhong-si-lu
---

# 0. Copyright
[原文](https://blog.csdn.net/cpongo5/article/details/95944058?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase)

# 1. Keywords
超卖现象, 秒杀模块，高并发.

# 2. 思路
锁.

# 3. 注意
不可以简单使用InnoDB的事务+行锁,因为写入也很多, 高并发下容易争抢行锁, 造成数据库连接数不够, 造成无法连接或者超时.

# 4. 尝试解决
## 4.1 使用Redis分布式锁, 分发token
同一个锁key，同一时间只能有一个客户端拿到锁，其他客户端会陷入无限的等待来尝试获取那个锁，只有获取到锁的客户端才能执行下面的业务逻辑。

i.e. 只有一个订单系统实例可以成功加分布式锁，然后只有他一个实例可以查库存、判断库存是否充足、下单扣减库存，接着释放锁。释放锁之后，另外一个订单系统实例才能加锁，接着查库存，一下发现库存只有2台了，库存不足，无法购买，下单失败。不会将库存扣减为-8的。

**缺点:** 并发大的情况下，锁的争夺会变多，导致响应越来越慢，假设加锁之后到释放锁之前，的一系列操作“查库存 -> 创建订单 -> 扣减库存”全过程消耗20毫秒，那同一个商品在多用户同时下单的情况下，会基于分布式锁串行化处理，导致没法同时处理同一个商品的大量下单的请求。

**优化:** 使用**分段加锁**技术方案，把数据分成很多个段，每个段是一个单独的锁，所以多个线程过来并发修改数据的时候，可以并发的修改不同段的数据。假设场景：假如你现在iphone有1000个库存，那么你完全可以给拆成20个库存段，在数据库的表里建20个库存字段，比如stock_01，stock_02，类似这样的，也可以在redis之类的地方放20个库存key。然后写一个简单的随机算法，每个请求都是随机在20个分段库存里，选择一个进行加锁。这样每次就能够处理20个请求.

但有个坑需要解决：当某段锁的库存不足，一定要实现自动释放锁然后换下一个分段库存再次尝试加锁处理。

## 4.2 redis队列
将要促销的商品数量以队列的方式存入redis中，每当用户抢到一件促销商品则从队列中删除一个数据，确保商品不会超卖。

**代码思路:**

1. 当增加商品或修改商品库存时,将库存数据存入缓存;

2. 如果用户下单,则在缓存的该商品库存key进行删除操作(判断删除后值不小于0);

3. 通过缓存获取商品库存数据显示在前端;

4. 逻辑判断,当库存等于0时,数据持久化操作,并对商品下架处理;

