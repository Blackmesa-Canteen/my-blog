---
title: '[算法]单调栈'
slug: -suan-fa--dan-diao-zhan
date: '2022-03-30T06:23:21.814Z'
categories:
- Improvement
- Utilities
tags:
- Algorithm
- Improvement
- Java
original_permalink: /archives/-suan-fa--dan-diao-zhan
---

# 介绍
## 概念
单调栈实际上就是栈，只是限制要比普通的栈更严格而已了。

要求是每次入栈的元素必须要有序（如果新元素入栈不符合要求，则将之前的元素出栈，直到符合要求再入栈），使之形成单调递增/单调递减的一个栈。

- 单调递增栈：只有比栈顶小的才能入栈，否则就把栈顶出栈后，再入栈。出栈时可能会有一些计算。适用于求解第一个大于该位置元素的数。
- 单调递减栈：与单调递增栈相反。适用于求解第一个小于该位置元素的数.

## 判断
单调递增/递减栈是根据出栈后的顺序来决定的。例如，栈内顺序[1, 2, 6]，出栈后顺序[6, 2, 1]，这就是单调递减栈。

## 适用场景
- 单调栈一般用于解决 第一个大于 xxx 或者 第一个小于 xxx 这种题目。
- 适用于那种, 感觉要预测未来一样, 当遍历到一个新元素, 比大小导致之前的元素都要发生些变化的问题

## 参考实现
```java
int[] ans = new int[T.Length];
LinkedList<int> stack = new LinkedList<int>();

for(int i = 0; i < T.Length; i++) {
    while(stack.Count > 0 && T[i] > T[stack.peek()]) {
        int curI = stack.pop();
        ans[curI] = i - curI;
    }
    stack.push(i);
}
```


# 例题

请根据每日 气温 列表 temperatures ，重新生成一个列表，要求其对应位置的输出为：要想观测到更高的气温，至少需要等待的天数。如果气温在这之后都不会升高，请在该位置用 0 来代替。

 

**示例 1:**
```
输入: temperatures = [73,74,75,71,69,72,76,73]
输出: [1,1,4,2,1,1,0,0]
```
**示例 2:**
```
输入: temperatures = [30,40,50,60]
输出: [1,1,1,0]
```
**示例 3:**
```
输入: temperatures = [30,60,90]
输出: [1,1,0]
```

**题解**
```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        // 单调栈
        int[] ans = new int[temperatures.length];
        LinkedList<Integer> st = new LinkedList<>();

        for (int i=0;i<ans.length;++i) {
            // 只要栈不为空，并且当前元素大于栈顶元素，就可以计算出距离，否则就加入栈
            while (!st.isEmpty() && temperatures[st.peek()] < temperatures[i]) {
                ans[st.peek()] =  i - st.peek();
                st.pop();
            }
            st.push(i);
        }
        return ans;
    }
}
```
 


