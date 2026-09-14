---
title: 常用位运算
slug: chang-yong-wei-yun-suan
date: '2021-11-16T00:07:16.650Z'
tags:
- Notes
cover: ./download (1)-c590c816437c45beab46dfd06c54e19f.jpeg
original_permalink: /archives/chang-yong-wei-yun-suan
---

# 记录
1. 从低位到高位获得第i位的二进制数字: `(a >> i) & 1`
2. 乘2: `n << 1`
3. 除以2: `n >> 1`
4. 奇偶判断(当为奇数/(n%2 != 0), 为true): `(n & 1) == 1`
