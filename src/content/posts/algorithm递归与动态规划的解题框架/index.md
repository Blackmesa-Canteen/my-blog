---
title: 递归与动态规划的解题框架
slug: algorithm递归与动态规划的解题框架
date: '2021-07-06T03:52:01Z'
categories:
- Improvement
tags:
- Algorithm
cover: ./v2-a61ac9099288c68cfb50f23eb2a5ac8c_720w-ba72ad827ca84b82ab5bbe3c9d9c129b.jpg
original_permalink: /archives/algorithm%E9%80%92%E5%BD%92%E4%B8%8E%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E7%9A%84%E8%A7%A3%E9%A2%98%E6%A1%86%E6%9E%B6
---


# 1. Intro
我觉得递归难，但是它比较重要，尤其是在动态规划问题（求最值）等情境下经常出现。在此引入动态规划类问题的解题框架 -- 状态转移方程。

# 2. 动态规划问题解析
说白了，动态解析问题的一般形式就是求最值（最长递增子序列，最小编辑距离，etc），尽量最优化，其核心，无非就是穷举。

对于穷举，我们可以暴力枚举出出所有情况，但是，其实可以使用**备忘录**，或者**DP table**来优化复杂度。

当然，说说简单，其实真要写代码就难了。其实咱们想了想，是不是可以找个**部分最优解**，然后进行全局推广呢？我猜比较类似于贪心？即当所有子问题解法最优，则全局最优。

这时候大佬说话了，**状态转移方程**是个好的方法，去应对穷举。构成状态转移方程有三要素：
- 重叠子问题：问题里的解套子问题的解，子问题的解套孙问题的解。
- 最优子结构：子问题求出最优解。
- 状态转移方程：从子问题状态怎么跳到父问题的状态机的。
  
基于[fucking-algorithm](https://labuladong.gitee.io/algo/1/3/), 写出状态转移方程有套路，即：

>明确 base case -> 明确「状态」-> 明确「选择」 -> 定义 dp 数组/函数的含义。

以下内容，将从斐波那契数列和凑零钱问题来讲解如何写出状态转移方程。

# 3. 案例
## 3.1 斐波那契数列
*用斐波那契数列讨论何为重叠子问题。*

如何求出斐波那契数列中任意位置的数值呢？
### 3.1.1 常规暴力递归
```java
int fib(int N) {
    if (N == 1 || N == 2) return 1;
    return fib(N - 1) + fib(N - 2);
}
```
对于递归，画出递归树。当N为20：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.work/post-images/1625551699823.jpg -->

今天你会发现这有大量的重复运算...如标黄的f(18)被算了两次。所以，这就是**重叠子问题**。

试解决重叠子问题：
### 3.1.2 带备忘录的递归
建立备忘录，把已经算过的东西保存下来。
```java
int fib(int N) {
    if (N < 1) return 0;
    // 备忘录全初始化为 0
    vector<int> memo(N + 1, 0);
    // 进行带备忘录的递归
    return helper(memo, N);
}
 
int helper(vector<int>& memo, int n) {
    // base case
    if (n == 1 || n == 2) return 1;
    // 已经计算过
    if (memo[n] != 0) return memo[n];
    memo[n] = helper(memo, n - 1) + helper(memo, n - 2);
    return memo[n];
}
```
试画出递归树：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625551919402.jpg -->
蓝色框和绿色框被跳过了，备忘录实现了减枝。对树整理，得：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625551986252.jpg -->

发现没了冗余计算，时间复杂度收缩为O(n). 不过这个是**自顶向下**的，不属于动态规划。
动态规划，其实是**自底向上**的，即直接从最底下，最简单，问题规模最小的 f(1) 和 f(2) 开始往上推，直到推到我们想要的答案 f(20)。

### 3.1.3 Dp table迭代方法
试进行「自底向上」的推算，即从基础情况推到高的情况。

```java
int fib(int N) {
    if (N < 1) return 0;
    if (N == 1 || N == 2) return 1;
    vector<int> dp(N + 1, 0);
    // base case
    dp[1] = dp[2] = 1;
    // 从base开始上推
    for (int i = 3; i <= N; i++)
        // 推完还能顺便保存结果到dp table里
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[N];
}
```
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625552255469.jpg -->

这个和之前的备忘录类似，不过是从最基础的开始上推。
结合上述内容，引入状态转移方程

![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625552367696.png -->

状态转移方程，其实就是一个状态机f(n)从从f(n-1)和f(n-2)相加转移来的。
其实，我们可以把上述的过程继续优化--**状态压缩**。显而易见地，当前状态只和前两个状态有关，所以不需要一个巨大的DP table来做备忘录。
```java
int fib(int n) {
    if (n < 1) return 0;
    if (n == 2 || n == 1) 
        return 1;
    int prev = 1, curr = 1;
    for (int i = 3; i <= n; i++) {
        int sum = prev + curr;
        prev = curr;
        curr = sum;
    }
    return curr;
}
```
这个技巧就是所谓的「状态压缩」，如果我们发现每次状态转移只需要 DP table 中的一部分，那么可以尝试用状态压缩来缩小 DP table 的大小，只记录必要的数据，上述例子就相当于把DP table 的大小从 n 缩小到 2。

## 3.2 凑零钱
给你 k 种面值的硬币，面值分别为 c1, c2 ... ck，每种硬币的数量无限，再给一个总金额 amount，问你最少需要几枚硬币凑出这个金额，如果不可能凑出，算法返回 -1 。算法的函数签名如下：
```java
// coins 中是可选硬币面值，amount 是目标金额
int coinChange(int[] coins, int amount);
```
比如说 k = 3，面值分别为 1，2，5，总金额 amount = 11。那么最少需要 3 枚硬币凑出，即 11 = 5 + 5 + 1。这是一个典型的求最优问题。

### 3.2.1 常规暴力递归
由于每种硬币数量无限，每次取硬币互相独立。即每个子问题互相独立。
试列出状态转移方程：
 1. 确定Base Case：每次取硬币，剩余目标金额`amount`会减少，当`amount`为0，需要的硬币为0，收敛。
   
 2. 确定状态，即父子两问题间的变量：由于硬币各种无限，所以能够变化的，只需要考虑目标金额`amount`的变化. **可以用状态机帮助确定状态变化，从而确定选择里的dp搭配**
   
 3. 确定选择，即导致「状态」变化的Trigger：这里是指每选择一个硬币，就会发生`amount`跳变。**d在不同的选择中，调用不同的dp()搭配**
   
 4. 明确dp函数/数组定义：我们这里讲的是自顶向下的解法，所以会有一个递归的 dp 函数，一般来说函数的参数就是状态转移中会变化的量，也就是上面说到的「状态」，函数的返回值就是题目要求我们计算的量。**dp(n), 参数是状态，即dp函数返回状态是n下时所产生的结果。**
就本题来说，状态只有一个，即「目标金额」，题目要求我们计算凑出目标金额所需的最少硬币数量。所以我们可以这样定义 dp 函数：

dp(n) 的定义：输入一个目标金额 n，返回凑出目标金额 n 的最少硬币数量。

试写出伪代码解题框架：
```python
# 伪码框架
def coinChange(coins: List[int], amount: int):

    # 定义：要凑出金额 n，至少要 dp(n) 个硬币
    def dp(n):
        # 做选择，选择需要硬币最少的那个结果
        for coin in coins:
            res = min(res, 1 + dp(n - coin))
        return res

    # 题目要求的最终结果是 dp(amount)
    return dp(amount)
```

缺Base Case？来加当amount为0时, 所需硬币为0。当amount小于0，硬币数为-1。
状态转移方程：

![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625554383414.png -->

```python
def coinChange(coins: List[int], amount: int):
    # 定义：要凑出金额 n，至少要 dp(n) 个硬币
    def dp(n):
        if n == 0: return 0;
        if n < 0: return -1;
    
    # 求出最少硬币数， 初始化为极大值
    res = INFINATE_INT;
    # 每个coin为coin 的面值
    for coin in coins:
        # 子问题的结果
        int res_of_subProblem = dp(n - coin);
        # 子问题无解，过
        if res_of_subProblem == -1: continue;

        # 找最少硬币数，第二项为子问题的所需硬币+1个硬币数
        res = min(res, 1 + res_of_subProblem);
    
    return res if res != INFINATE_INT else -1
return dp(amount)
```
列出递归树，发现有重复计算。比如 amount = 11, coins = {1,2,5} 时画出递归树看看：

![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625554475263.jpg -->

收缩状态：备忘录等...

### 3.2.2 带备忘录递归
```python
def coinChange(coins: List[int], amount: int):
    # 备忘录
    memo = dict()
    def dp(n):
        # 查备忘录，避免重复计算
        if n in memo: return memo[n]
        # base case
        if n == 0: return 0
        if n < 0: return -1
        res = float('INF')
        for coin in coins:
            subproblem = dp(n - coin)
            if subproblem == -1: continue
            res = min(res, 1 + subproblem)
        
        # 记入备忘录
        memo[n] = res if res != float('INF') else -1
        return memo[n]
    
    return dp(amount)
```

### 3.2.3 dp table 迭代
可以自底向上使用 dp table 来消除重叠子问题，关于「状态」「选择」和 base case 与之前没有区别，dp 数组的定义和刚才 dp 函数类似，也是把「状态」，也就是目标金额作为变量。不过 dp 函数体现在函数参数，而 dp 数组体现在数组索引：
```python
int coinChange(vector<int>& coins, int amount) {
    // 数组大小为 amount + 1，初始值也为 amount + 1
    vector<int> dp(amount + 1, amount + 1);
    // base case
    dp[0] = 0;
    // 外层 for 循环在遍历所有状态的所有取值
    for (int i = 0; i < dp.size(); i++) {
        // 内层 for 循环在求所有选择的最小值
        for (int coin : coins) {
            // 子问题无解，跳过
            if (i - coin < 0) continue;
            dp[i] = min(dp[i], 1 + dp[i - coin]);
        }
    }
    return (dp[amount] == amount + 1) ? -1 : dp[amount];
}
```

# 4. 总结
第一个斐波那契数列的问题，解释了如何通过「备忘录」或者「dp table」的方法来优化递归树，并且明确了这两种方法本质上是一样的，只是自顶向下和自底向上的不同而已。

第二个凑零钱的问题，展示了如何流程化确定「状态转移方程」，只要通过状态转移方程写出暴力递归解，剩下的也就是优化递归树，消除重叠子问题而已。

# 5. 版权声明
思路和插图来源于Github repository：fucking-algorithm。
