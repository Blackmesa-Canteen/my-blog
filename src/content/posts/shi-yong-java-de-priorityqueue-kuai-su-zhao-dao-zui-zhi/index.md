---
title: 使用java的PriorityQueue快速找到最值
slug: shi-yong-java-de-priorityqueue-kuai-su-zhao-dao-zui-zhi
date: '2021-09-26T07:08:46.618Z'
categories:
- Improvement
tags:
- Algorithm
cover: ./download (1)-c590c816437c45beab46dfd06c54e19f.jpeg
original_permalink: /archives/shi-yong-java-de-priorityqueue-kuai-su-zhao-dao-zui-zhi
---

# Priority Queue
>PriorityQueue（优先队列），一个基于优先级堆的无界优先级队列。

**代码**

```java
//小顶堆
PriorityQueue<Integer> minHeap = new PriorityQueue<Integer>(); 
//大顶堆，容量11
PriorityQueue<Integer> maxHeap = new PriorityQueue<Integer>(11,new Comparator<Integer>(){ 
    @Override
    public int compare(Integer i1,Integer i2){
        return i2-i1;
    }
});
```


PriorityQueue的常用方法:
- 插入方法（offer()、poll()、remove() 、add() 方法）时间复杂度为O(log(n)) ；
- remove(Object) 和 contains(Object) 时间复杂度为O(n)；
- 检索方法（peek、element 和 size）时间复杂度为常量。


# 例题
23. 合并K个升序链表 [**困难**]

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

*示例 1：*
- 输入：`lists = [[1,4,5],[1,3,4],[2,6]]`
- 输出：`[1,1,2,3,4,4,5,6]`
- 解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
`1->1->2->3->4->4->5->6`

**解:**
合并 k 个有序链表的逻辑类似合并两个有序链表，难点在于，如何快速得到 k 个节点中的最小节点，接到结果链表上？

这里我们就要用到**优先级队列**这种数据结构，把链表节点放入一个小顶堆，就可以每次获得 k 个节点中的最小节点：

```java
ListNode mergeKLists(ListNode[] lists) {
    if (lists.length == 0) return null;
    // 虚拟头结点
    ListNode dummy = new ListNode(-1);
    ListNode p = dummy;
    // 优先级队列，小顶堆默认
    PriorityQueue<ListNode> pq = new PriorityQueue<>(
        lists.length, (a, b)->(a.val - b.val));
    // 将 k 个链表的头结点加入最小堆
    for (ListNode head : lists) {
        if (head != null)
            pq.add(head);
    }

    while (!pq.isEmpty()) {
        // 获取最小节点，接到结果链表中
        ListNode node = pq.poll();
        p.next = node;
        if (node.next != null) {
            pq.add(node.next);
        }
        // p 指针不断前进
        p = p.next;
    }
    return dummy.next;
}
```

