---
title: 单射，满射和双射
slug: dan-she--man-she-he-shuang-she
date: '2021-09-22T01:51:39.983Z'
categories:
- Learning
tags:
- Notes
cover: ./Screen Shot 2021-09-22 at 11.44.36 AM-c3e640cea8b149b19aa01a333587030b.jpg
original_permalink: /archives/dan-she--man-she-he-shuang-she
---

# 概念

- **单射**（injection）：每一个x都有唯一的y与之对应；

- **满射**（surjection）：每一个y都必有至少一个x与之对应；

- **双射**（又叫**一一对应**，bijection）：每一个x都有y与之对应，每一个y都有x与之对应。

# 例子
今天，把x比作萝卜，y比作坑：

- 单射就是一个萝卜一个坑，有的坑有可能没萝卜；

- 满射就是所有坑都有萝卜，有的坑可能有不止一个萝卜；

- 双射就是严格的一个萝卜一个坑，一个坑一个萝卜，所有萝卜都有坑，所有坑都有萝卜。

![Screen Shot 20210922 at 11.44.36 AM.jpg](./Screen%20Shot%202021-09-22%20at%2011.44.36%20AM-c3e640cea8b149b19aa01a333587030b.jpg)

# 符号化表示

injection: 
$$\displaystyle \forall a,b\in X,\;\;f(a)=f(b)\Rightarrow a=b$$

surjection: 
$$\forall y\in Y,\,\exists x\in X,\;\;f(x)=y$$

bijection: 
$$\displaystyle \forall y\in Y,\exists !x\in X{\text{ such that }}y=f(x)$$

where $\displaystyle \exists !x$ means `there exists exactly one x`.


For all functions, the following holds:
$$\displaystyle \forall x\in X,\exists !y\in Y{\text{ such that }}y=f(x).$$


