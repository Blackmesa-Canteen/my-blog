---
title: 滑动窗口与子串、子数组问题
slug: algo滑动窗口与子串子数组问题
date: '2021-07-14T09:30:20Z'
categories:
- Improvement
tags:
- Algorithm
- Improvement
cover: ./v2-a61ac9099288c68cfb50f23eb2a5ac8c_720w-ba72ad827ca84b82ab5bbe3c9d9c129b.jpg
original_permalink: /archives/algo%E6%BB%91%E5%8A%A8%E7%AA%97%E5%8F%A3%E4%B8%8E%E5%AD%90%E4%B8%B2%E5%AD%90%E6%95%B0%E7%BB%84%E9%97%AE%E9%A2%98
---


#1. Copyright
[fucking-algorithm](https://labuladong.gitee.io/algo/1/7/)

#2. 框架
其实，滑动窗口是[双指针](https://labuladong.gitee.io/algo/2/21/50/)的一个应用.
滑动窗口题是中等或困难。
算法复杂度O(n).
框架如下:
```java
/* 滑动窗口算法框架 */
void slidingWindow(string s, string t) {
    unordered_map<char, int> need, window;
    for (char c : t) need[c]++;
    
    int left = 0, right = 0;
    int valid = 0; 
    while (right < s.size()) {
        // c 是将移入窗口的字符
        char c = s[right];
        // 右移窗口
        right++;
        // 进行窗口内数据的一系列更新
        ...

        /*** debug 输出的位置 ***/
        printf("window: [%d, %d)\n", left, right);
        /********************/
        
        // 判断左侧窗口是否要收缩
        while (window needs shrink) {
            // d 是将移出窗口的字符
            char d = s[left];
            // 左移窗口
            left++;
            // 进行窗口内数据的一系列更新
            ...
        }
    }
}
```
**所以今天我就写一套滑动窗口算法的代码框架，我连再哪里做输出 debug 都给你写好了，以后遇到相关的问题，你就默写出来如下框架然后改三个地方就行，还不会出 bug.**

**其中两处 ... 表示的更新窗口数据的地方，到时候你直接往里面填就行了。**

而且，这两个 ... 处的操作分别是右移和左移窗口更新操作，等会你会发现它们操作是完全对称的。

言归正传，下面就直接上四道 LeetCode 原题来套这个框架，其中第一道题会详细说明其原理，后面四道就直接闭眼睛秒杀了。

因为滑动窗口很多时候都是在处理字符串相关的问题，Java 处理字符串不方便，所以本文代码为 C++ 实现。不会用到什么编程方面的奇技淫巧，但是还是简单介绍一下一些用到的数据结构，以免有的读者因为语言的细节问题阻碍对算法思想的理解：

unordered_map 就是哈希表（字典），它的一个方法 count(key) 相当于 Java 的 containsKey(key) 可以判断键 key 是否存在。

可以使用方括号访问键对应的值 map[key]。需要注意的是，如果该 key 不存在，C++ 会自动创建这个 key，并把 map[key] 赋值为 0。

所以代码中多次出现的 map[key]++ 相当于 Java 的 map.put(key, map.getOrDefault(key, 0) + 1)。

# 3. 例题

## 3.1 最小覆盖子串
LeetCode 76 题，Minimum Window Substring，难度 Hard：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1626262514794.png -->
滑动窗口算法的思路是这样：

1、我们在字符串 S 中使用双指针中的左右指针技巧，初始化 left = right = 0，把索引左闭右开区间 [left, right) 称为一个「窗口」。

2、我们先不断地增加 right 指针扩大窗口 [left, right)，直到窗口中的字符串符合要求（包含了 T 中的所有字符）。

3、此时，我们停止增加 right，转而不断增加 left 指针缩小窗口 [left, right)，直到窗口中的字符串不再符合要求（不包含 T 中的所有字符了）。同时，每次增加 left，我们都要更新一轮结果。

4、重复第 2 和第 3 步，直到 right 到达字符串 S 的尽头。

这个思路其实也不难，**第 2 步相当于在寻找一个「可行解」，然后第 3 步在优化这个「可行解」，最终找到最优解，**也就是最短的覆盖子串。左右指针轮流前进，窗口大小增增减减，窗口不断向右滑动，这就是「滑动窗口」这个名字的来历。

**现在开始套模板，只需要思考以下四个问题:**

1. 当移动 right 扩大窗口，即加入字符时，应该更新哪些数据？

2. 什么条件下，窗口应该暂停扩大，开始移动 left 缩小窗口？

3. 当移动 left 缩小窗口，即移出字符时，应该更新哪些数据？

4. 我们要的结果应该在扩大窗口时还是缩小窗口时进行更新？

如果一个字符进入窗口，应该增加 window 计数器；如果一个字符将移出窗口的时候，应该减少 window 计数器；当 valid 满足 need 时应该收缩窗口；应该在收缩窗口的时候更新最终结果。

代码：
```java
public String minWindow(String s, String t) {
        // 一个记住需要什么的数据结构
        Map<Character, Integer> need = new HashMap<>();

        // 一个充当记住滑动窗口内部内容的数据结构
        Map<Character, Integer> window = new HashMap<>();

        // 初始化需要的东西们
        for(int i = 0; i < t.length(); i++) {
            char ch = t.charAt(i);
            need.put(ch, need.getOrDefault(ch, 0) + 1);
        }

        // sliding window 定义
        // [left, right)
        int left = 0;
        int right = 0;

        // 记录已满足need记录数目的字符个数
        // eg：某个need要3个char，window里对应char
        // 的记录有3个，则valid++
        int valid = 0;

        // 结果最小字串的起始点和长度
        int start = 0;
        // 长度可以用来到时候截取字符串
        int len = Integer.MAX_VALUE;

        // 先移动右指针
        while(right < s.length()) {
            // 即将放进窗口的字符
            char ch = s.charAt(right);
            // 移动有指针
            right++;
            // 对窗口数据进行更新
            // 如果needs里有这个字符，记录之
            if(need.containsKey(ch)) {
                window.put(ch, window.getOrDefault(ch, 0) + 1);
                // 当前字符是不是满足need的数目要求了？
                if(window.get(ch).equals(need.get(ch))) {
                    valid++;
                }
            }

            // 先让它循环着，如果valid达到了need的长度，
            // 即need每个字符的要求数目都和window里的想等了
            // 就开始收紧窗口左边界了。
            while (valid == need.size()) {
                // 更新答案值
                // 如果答案区间收更小了，用更小的答案
                if (right - left < len) {
                    start = left;
                    len = right - left;
                }

                // chOut 为在窗口收缩中即将被踢出窗口的字符
                char chOut = s.charAt(left);

                // 窗口向右收束
                left++;

                // 如果该字符是需要的，更新窗口window内的值
                if (need.containsKey(chOut)) {
                    // 只有当前字符刚好满足need需要的数目时，减少valid--
                    // 不然就减多了
                    // 其实就是之前的逆运算
                    if (window.get(chOut).equals(need.get(chOut))) {
                        valid--;
                    }
                    window.put(chOut,window.getOrDefault(chOut,0) - 1);
                }
            }
        }

        if (len != Integer.MAX_VALUE) {
            // 找到了匹配的
            return s.substring(start, len + start);
        } else {
            return "";
        }
    }
```
需要注意的是，当我们发现某个字符在 window 的数量满足了 need 的需要，就要更新 valid，表示有一个字符已经满足要求。而且，你能发现，两次对窗口内数据的更新操作是完全对称的。

当 valid == need.size() 时，说明 T 中所有字符已经被覆盖，已经得到一个可行的覆盖子串，现在应该开始收缩窗口了，以便得到「最小覆盖子串」。

移动 left 收缩窗口时，窗口内的字符都是可行解，所以应该在收缩窗口的阶段进行最小覆盖子串的更新，以便从可行解中找到长度最短的最终结果。

至此，应该可以完全理解这套框架了，滑动窗口算法又不难，就是细节问题让人烦得很。以后遇到滑动窗口算法，你就按照这框架写代码，保准没有 bug，还省事儿。

## 3.2 字符串排列
LeetCode 567 题，Permutation in String，难度 Medium：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1626262774397.png -->

```java
public boolean checkInclusion(String t, String s) {
        Map<Character, Integer> buffer = new HashMap<>();
        Map<Character, Integer> needs = new HashMap<>();

        // 初始化所需东西
        for (int i = 0; i < t.length(); i++) {
            char ch = t.charAt(i);
            needs.put(ch, needs.getOrDefault(ch, 0) + 1);
        }

        // 初始化窗口
        int left = 0;
        int right = 0;
        int valid = 0;

        // 先移动右指针，满足一定条件后，暂停右针，移动左指针
        // 右指针移动的边界？
        // [left, right]
        while(right < s.length()) {
            // 更新
            char willIn = s.charAt(right);

            right++;

            // 如果这个字符满足条件，放入存储
            if(needs.containsKey(willIn)) {
                buffer.put(willIn, buffer.getOrDefault(willIn, 0) + 1);
                // 假如这个字符满足了need里的数量条件
                if(buffer.get(willIn).equals(needs.get(willIn))) {
                    valid++;
                }
            }



            // 收缩左窗口的条件
            while(right - left >= t.length()) {
                // 满足收缩左窗口条件了：窗口大小为t长度了
                // 查查这个窗户是不是满足了？
                if(valid == needs.size()) {
                    return true;
                }

                // 即将被提出的值
                char willOut = s.charAt(left);
                left++;

                if(needs.containsKey(willOut)) {

                    // 假如这个字符满足了need里的数量条件
                    if(buffer.get(willOut).equals(needs.get(willOut))) {
                        valid--;
                    }
                    // 注意！！下面语句写到下面！
                    buffer.put(willOut, buffer.getOrDefault(willOut, 0) - 1);
                }

            }
        }

        // 转完了，球都没有
        return false;
    }
```

## 3.3 找所有字母异位词
 LeetCode 第 438 题，Find All Anagrams in a String，难度 Medium：
 ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1626262840899.png -->

 ```java
public List<Integer> findAnagrams(String s, String p) {
        Map<Character, Integer> buffer = new HashMap<>();
        Map<Character, Integer> needs = new HashMap<>();

        for (int i = 0; i < p.length(); i++) {
            char ch = p.charAt(i);
            needs.put(ch, needs.getOrDefault(ch, 0) + 1);
        }

        // 初始化窗口
        int left = 0;
        int right = 0;
        int valid = 0;

        List<Integer> res = new LinkedList<>();

        // [left, right]
        while(right < s.length()) {
            char willIn = s.charAt(right);
            right++;

            if(needs.containsKey(willIn)) {

                buffer.put(willIn, buffer.getOrDefault(willIn, 0) + 1);

                if(needs.get(willIn).equals(buffer.get(willIn))) {
                    valid++;
                }
            }

            // 何时需要收缩左窗口
            while(right - left >= p.length()) {
                if(valid == needs.size()) {
                    res.add(left);
                }

                // 即将被提出的值
                char willOut = s.charAt(left);
                left++;

                if(needs.containsKey(willOut)) {

                    // 假如这个字符满足了need里的数量条件
                    if(buffer.get(willOut).equals(needs.get(willOut))) {
                        valid--;
                    }
                    // 注意！！下面语句写到下面！
                    buffer.put(willOut, buffer.getOrDefault(willOut, 0) - 1);
                }
            }
        }

        return res;
    }
 ```

 ## 3.4 最长无重复子串(阿里面试)
 LeetCode 第 3 题，Longest Substring Without Repeating Characters，难度 Medium：
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1626262899754.png -->

```java
public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> windowElements = new HashMap<>();
        int res = 0;

        int left = 0;
        int right = 0;

        while(right < s.length()) {
            char ch = s.charAt(right);
            right++;

            windowElements.put(ch, windowElements.getOrDefault(ch, 0) + 1);

            while(windowElements.get(ch) > 1) {
                char drop = s.charAt(left);
                left++;

                windowElements.put(drop, windowElements.getOrDefault(drop, 0) - 1);
            }
            
            res = Math.max(res, right - left);
        }
        
        return res;
    }
```

# 4. 总结
背诵并默写这套框架，使用滑动窗口应对子串，子数组问题。
