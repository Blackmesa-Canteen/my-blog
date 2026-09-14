---
title: 基于最大公约数判断两数互质
slug: ji-yu-zui-da-gong-yue-shu-pan-duan-liang-shu-hu-zhi
date: '2022-02-10T07:51:25.362Z'
categories:
- Improvement
- Utilities
tags:
- Data Structure
- Algorithm
- Improvement
original_permalink: /archives/ji-yu-zui-da-gong-yue-shu-pan-duan-liang-shu-hu-zhi
---

# 步骤
1. 若两数相等则一定不互质
2. 若两数不等，分别为a和b，不妨设a>b
3. 则a和b的最大公约数就是b和a%b的最大公约数
4. 递归进行，若 a%b=0时，则返回b
5. 最终得到最大公约数为1, 则两数互质.

# 示例代码
```java
 public static int gcd(int a, int b) {
        if (a % b == 0) {
            return b;
        }
        return gcd(b, a % b);
    }
```

# 例题
## 化简分数

给你一个整数 n ，请你返回所有 0 到 1 之间（不包括 0 和 1）满足分母小于等于  n 的 最简 分数 。分数可以以 任意 顺序返回。

 

示例:
```

输入：n = 2
输出：["1/2"]
解释："1/2" 是唯一一个分母小于等于 2 的最简分数。
示例 2：

输入：n = 3
输出：["1/2","1/3","2/3"]
```

**核心代码:**
```java
class Solution {
    public List<String> simplifiedFractions(int n) {

        List<String> res = new LinkedList<>();

        if (n == 1) {
            return res;
        }


        for (int fenMother = 2; fenMother <= n; fenMother++) {
            int fenSon = 1;

            while (fenSon < fenMother) {
                if (gcd(fenMother, fenSon) == 1) {
                    res.add(String.valueOf(fenSon) + "/" + String.valueOf(fenMother));
                }

                fenSon++;
            }
        }

        return res;
    }

    // 求分子分母公约数, x: mother, y: son
    // 公约数为1, 说明两数互质,是最简分数
    public static int gcd(int a, int b) {
        if (a % b == 0) {
            return b;
        }
        return gcd(b, a % b);
    }

}
```


