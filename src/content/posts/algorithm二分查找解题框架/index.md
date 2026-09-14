---
title: 二分查找解题框架
slug: algorithm二分查找解题框架
date: '2021-07-10T06:05:21Z'
categories:
- Improvement
tags:
- Algorithm
cover: ./v2-a61ac9099288c68cfb50f23eb2a5ac8c_720w-ba72ad827ca84b82ab5bbe3c9d9c129b.jpg
original_permalink: /archives/algorithm%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE%E8%A7%A3%E9%A2%98%E6%A1%86%E6%9E%B6
---


# 1. 版权
转载并总结自(fucking-algorithm)[https://labuladong.gitee.io/algo/1/6/]

# 2. 解题框架
二分查找框架如下：
```java
int binarySearch(int[] nums, int target) {
    int left = 0, right = ...;

    while(...) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ...
        } else if (nums[mid] < target) {
            left = ...
        } else if (nums[mid] > target) {
            right = ...
        }
    }
    return ...;
}
```
**技巧一：不要出现 else，而是把所有情况用 else if 写清楚，这样可以清楚地展现所有细节。**
**技巧二：算 mid 时需要防止溢出，代码中 left + (right - left) / 2 就和 (left + right) / 2 的结果相同，但是有效防止了 left 和 right 太大直接相加导致溢出。**
其中 ... 标记的部分，就是可能出现细节问题的地方，当你见到一个二分查找的代码时，首先注意这几个地方。后文用实例分析这些地方能有什么样的变化。


## 2.1 二分查找寻找一个数（基本）
```java
int binarySearch(int[] nums, int target) {
    int left = 0; 
    int right = nums.length - 1; // 注意

    while(left <= right) {
        int mid = left + (right - left) / 2;
        if(nums[mid] == target)
            return mid; 
        else if (nums[mid] < target)
            left = mid + 1; // 注意
        else if (nums[mid] > target)
            right = mid - 1; // 注意
    }
    return -1;
}
```
**常见问题**
1. *为什么 while 循环的条件中是 <=，而不是 <？*

答：因为初始化 right 的赋值是 nums.length - 1，即最后一个元素的索引，而不是 nums.length。

这二者可能出现在不同功能的二分查找中，区别是：前者相当于两端都闭区间 [left, right]，后者相当于左闭右开区间 [left, right)，因为索引大小为 nums.length 是越界的。

我们这个算法中使用的是前者 [left, right] 两端都闭的区间。**这个区间其实就是每次进行搜索的区间。**

什么时候应该停止搜索呢？当然，找到了目标值的时候可以终止：
```java
if(nums[mid] == target)
        return mid; 
```
但如果没找到，就需要 while 循环终止，然后返回 -1。那 while 循环什么时候应该终止？搜索区间为空的时候应该终止，意味着你没得找了，就等于没找到嘛。

while(left <= right) 的终止条件是 left == right + 1，写成区间的形式就是 [right + 1, right]，或者带个具体的数字进去 [3, 2]，**可见这时候区间为空**，因为没有数字既大于等于 3 又小于等于 2 的吧。所以这时候 while 循环终止是正确的，直接返回 -1 即可。

while(left < right) 的终止条件是 left == right，写成区间的形式就是 [right, right]，或者带个具体的数字进去 [2, 2]，**这时候区间非空**，还有一个数 2，但此时 while 循环终止了。也就是说这区间 [2, 2] 被漏掉了，索引 2 没有被搜索，如果这时候直接返回 -1 就是错误的。

2. *为什么 left = mid + 1，right = mid - 1？我看有的代码是 right = mid 或者 left = mid，没有这些加加减减，到底怎么回事，怎么判断？*

答：这也是二分查找的一个难点，不过只要你能理解前面的内容，就能够很容易判断。

刚才明确了「搜索区间」这个概念，而且本算法的搜索区间是两端都闭的，即 [left, right]。那么当我们发现索引 mid 不是要找的 target 时，下一步应该去搜索哪里呢？

当然是去搜索 [left, mid-1] 或者 [mid+1, right] 对不对？**因为 mid 已经搜索过，应该从搜索区间中去除。**

3. *此算法有什么缺陷？*

答：至此，你应该已经掌握了该算法的所有细节，以及这样处理的原因。但是，这个算法存在局限性。

比如说给你有序数组 nums = [1,2,2,2,3]，target 为 2，此算法返回的索引是 2，没错。但是如果我想得到 target 的左侧边界，即索引 1，或者我想得到 target 的右侧边界，即索引 3，这样的话此算法是无法处理的。

这样的需求很常见，你也许会说，找到一个 target，然后向左或向右线性搜索不行吗？可以，但是不好，因为这样难以保证二分查找对数级的复杂度了。

我们后续的算法就来讨论这两种二分查找的算法:

## 2.2 寻找左侧边界和右侧边界的二分查找
```java
private int find_left_bound(int[] nums, int target) {
        // 采用闭区间
        // 边界查找，需要添加边界出界检查。
        int left = 0;
        int right = nums.length - 1;

        while(left <= right) {
            int mid = left + (right - left) / 2;
            if(nums[mid] == target) {
                // 找左边界，
                // 找到 target 时不要立即返回，而是缩小「搜索区间」的上界 right，
                // 在区间 [left, mid) 中继续搜索，即不断向左收缩，达到锁定左侧边界的目的。
                // 收缩右侧边界
                right = mid - 1;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            }
        }

        // 使用闭区间的代价：查出界补丁
        // 今天我要返回left，left右扩，所以查left边界是不是溢出的无效边界
        // while跳出条件：left = right + 1， 查left是不是过大的情况
        // 这种情况发生在target很大时
        // ||的条件，是当target非常小时可能发生的。
        if (left >= nums.length || nums[left] != target) {
            return -1;
        }
        return left;
    }

    private int find_right_bound(int[] nums, int target) {
        // 采用闭区间
        // 边界查找，需要添加边界出界检查。
        int left = 0;
        int right = nums.length - 1;

        while(left <= right) {
            int mid = left + (right - left) / 2;
            if(nums[mid] == target) {
                // 找右边界，
                // 找到 target 时不要立即返回，而是增大「搜索区间」的下界 left，
                // 在区间 (mid, right] 中继续搜索，即不断向右收缩，达到锁定右侧边界的目的。
                // 收缩右侧边界
                left = mid + 1;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            }
        }

        // 使用闭区间的代价：查出界补丁
        // 今天我要返回right, right边界左缩，所以查right边界是不是溢出的无效边界
        // while跳出条件：right = left - 1， 查right是不是过小的情况
        // 这种情况发生在target很小时
        // ||的条件，是当target非常大时可能发生的。
        if (right < 0 || nums[right] != target) {
            return -1;
        }
        return right;
    }
```

# 3. 总结

1. 基本二分查找
   ```java
因为我们初始化 right = nums.length - 1
所以决定了我们的「搜索区间」是 [left, right]
所以决定了 while (left <= right)
同时也决定了 left = mid+1 和 right = mid-1

因为我们只需找到一个 target 的索引即可
所以当 nums[mid] == target 时可以立即返回
   ```
2. 寻找左侧边界的二分查找
```java
因为我们初始化 right = nums.length
所以决定了我们的「搜索区间」是 [left, right)
所以决定了 while (left < right)
同时也决定了 left = mid + 1 和 right = mid

因为我们需找到 target 的最左侧索引
所以当 nums[mid] == target 时不要立即返回
而要收紧右侧边界以锁定左侧边界
```
   
3. 寻找右侧边界的二分查找
```java
因为我们初始化 right = nums.length
所以决定了我们的「搜索区间」是 [left, right)
所以决定了 while (left < right)
同时也决定了 left = mid + 1 和 right = mid

因为我们需找到 target 的最右侧索引
所以当 nums[mid] == target 时不要立即返回
而要收紧左侧边界以锁定右侧边界

又因为收紧左侧边界时必须 left = mid + 1
所以最后无论返回 left 还是 right，必须减一
```

对于寻找左右边界的二分搜索，常见的手法是使用左闭右开的「搜索区间」，**我们还根据逻辑将「搜索区间」全都统一成了两端都闭，便于记忆**，只要修改两处即可变化出三种写法：
```java
int binary_search(int[] nums, int target) {
    int left = 0, right = nums.length - 1; 
    while(left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1; 
        } else if(nums[mid] == target) {
            // 直接返回
            return mid;
        }
    }
    // 直接返回
    return -1;
}

int left_bound(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else if (nums[mid] == target) {
            // 别返回，锁定左侧边界
            right = mid - 1;
        }
    }
    // 最后要检查 left 越界的情况
    if (left >= nums.length || nums[left] != target)
        return -1;
    return left;
}


int right_bound(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else if (nums[mid] == target) {
            // 别返回，锁定右侧边界
            left = mid + 1;
        }
    }
    // 最后要检查 right 越界的情况
    if (right < 0 || nums[right] != target)
        return -1;
    return right;
}
```
