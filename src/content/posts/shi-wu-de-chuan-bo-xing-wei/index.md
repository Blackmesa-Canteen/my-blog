---
title: 事务的传播行为
slug: shi-wu-de-chuan-bo-xing-wei
date: '2022-06-27T00:26:58.468Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Development
- Improvement
- Database
- SpringBoot
original_permalink: /archives/shi-wu-de-chuan-bo-xing-wei
---

# 定义
事务传播行为（propagation behavior）指的就是当一个事务方法被另一个事务方法调用时，这个事务方法应该如何运行。

e.g. methodA方法调用methodB方法时，methodB是继续在调用者methodA的事务中运行呢，还是为自己开启一个新事务运行，这就是由methodB的事务传播行为决定的。

# 7种事务传播行为

1. PROPAGATION_REQUIRED: 默认, 当前没事务就创建新的; 反之则加入.

2. PROPAGATION_SUPPORTS: 支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。

3. PROPAGATION_MANDATORY: 支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

4. PROPAGATION_REQUIRES_NEW: 创建新事务，无论当前存不存在事务，都创建新事务。

5. PROPAGATION_NOT_SUPPORTED: 以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

6. PROPAGATION_NEVER: 以非事务方式执行，如果当前存在事务，则抛出异常。

7. PROPAGATION_NESTED: 如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则按REQUIRED属性执行。

# 示例
[7种事务传播行为案例详解](https://blog.csdn.net/weixin_38230747/article/details/118015647)
