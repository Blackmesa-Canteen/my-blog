---
title: 使用动态规划解背包问题
slug: shi-yong-dong-tai-gui-hua-jie-bei-bao-wen-ti
date: '2021-07-30T01:28:02.345Z'
categories:
- Improvement
tags:
- Algorithm
- Improvement
cover: ./placeholder.png
original_permalink: /archives/shi-yong-dong-tai-gui-hua-jie-bei-bao-wen-ti
---

# 题干
今天有一个可装载重量为 W 的背包和 N 个物品，每个物品有重量和价值两个属性。其中第 i 个物品的重量为 wt[i]，价值为 val[i]，现在让你用这个背包装物品，最多能装的价值是多少？

# 思路
艹，典型动态规划(状态变化，每次变化择最优)，所以，要思考：
- 状态是啥？
- 选择是啥？
- 状态转移方程是啥？

## 1. 寻找`状态`和`选择`
`状态`是要变化的量，有两个：**背包当前容量**和**当前可选择的物品数**。
`选择`是每次状态转移时，择优在哪些选择里择：在两个里择，分别是**装入包**和**不装包**。

今天我们可以套框架了, 以下是我们之前提过的动态规划框架的伪代码：
```python
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 择优(选择1，选择2...)
```

## 2. 明确dp数组，并细化框架
具体到问题，我们可以定义dp数组的含义。一般dp数组存的就是你要解出的量，为`价值`，所以，今天我们`dp[i][w]`的含义是:**在当前可选的i个物品下，背包当前容量为w的状态下，包包中能装下的价值**。 

我们还要找个基类情况，比如当`i=0`，即没有物品可选时，dp为0，或者`w=0`，即当包没有余下容量时，dp为0

所以，添加基类，并具体化框架，伪代码结果为：

```python
int[][] dp[N+1][W+1]
dp[0][...] = 0;
dp[...][0] = 0;
for i in [1 .. N]:
  for w in [1 .. W]:
    dp[i][w] = max (装物品i，不装物品i);

return dp[N][W]
```

## 3.明确状态转移的选择逻辑，进一步细化框架

即用状态转移方程描述`max (装物品i，不装物品i)`。

对于`dp[i][w]`,`wt[i]`代表物品i重，`val[i]`代表物品i价值：
**今天，我选择把物品i装包**：
`dp[i][w] = dp[i-1][w-wt[i-1]] + val[i-1]`
*之所以用`i-1`表示第i个物品，因为i从1开始,所以索引i-1用到wt，val数组里时，代表了第i个物品的重量和价值.*

**今天，我选择不装包**：
`dp[i][w] = dp[i-1][w]`
*之所以i-1，可选物品减少，是说明排除了一个物品的选择。*

可以写出状态转移方程，细化伪代码：
```python
int[][] dp[N+1][W+1]
dp[0][...] = 0;
dp[...][0] = 0;
for i in [1 .. N]:
  for w in [1 .. W]:
    dp[i][w] = max (dp[i-1][w],
                    dp[i-1][w - wt[i-1]] + val[i-1]
               );

return dp[N][W]
```

## 4. 伪代码的实际代码实现

**注意： w - wt[i-1] 可能小于 0 导致数组索引越界,需要小心边界条件。物理意义是装下去直接爆背包重量，所以选择不放入。**

```C++
int pack(int W, int N, vector<int>& wt, vector<int>& val) {
    
    // base case 初始化
    vector<vector<int>> dp(N + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= N; i++) {
        for (int w = 1; w <= W; w++) {
            if (w - wt[i-1] < 0) {
                // 这种情况下只能选择不装入背包
                dp[i][w] = dp[i - 1][w];
            } else {
                // 装入或者不装入背包，择优
                dp[i][w] = max(dp[i - 1][w - wt[i-1]] + val[i-1], 
                               dp[i - 1][w]);
            }
        }
    }
    
    return dp[N][W];
}
```


# Copyright

思路基于[fucking-algorithm.](https://labuladong.gitee.io/algo/1/13/)
