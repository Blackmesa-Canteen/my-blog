---
title: ACM模式刷题大坑
slug: acm-mo-shi-shua-ti-da-keng
date: '2022-07-20T07:47:17.048Z'
categories:
- Improvement
- Utilities
tags:
- Improvement
- Notes
original_permalink: /archives/acm-mo-shi-shua-ti-da-keng
---

# 起因
今天面试字节跳动，考察算法竟然是ACM模式纯白板编程，和LeetCode的核心代码模式完全不一样。太坑了，还好面试官网开一面。

# ACM模式例题

`翻转链表`

```java
import java.util.*；

public class LinkListInput {
	static class LinkNode {
    	int val;
        LinkNode next;
        LinkNode () {};
        LinkNode(int val) {
        	this.val = val;
        }
    }
    
    public static void main(String[] args) {
    	// 输入一串数字: "1,2,3,4,5"
        Scanner scanner = new Scanner(System.in);
        String str = scanner.next().toString();
        String[] arr = str.split(",");
        
        LinkNode dummyHead = new LinkNode();
        LinkNode ptr = dummyHead;
        for (char c : arr) {
        	ptr。。。
        }
        
        。。。
        
        //输出
        //1,5,2,4,3
        //打印
        while (head != null) {
            if(head.next == null){
                System.out.print(head.val);
            }else{
                System.out.print(head.val + ",");
            }
            head = head.next;
        }
    
    }

}

```

真是恶心。。。得记下常用的IO，将额外开坑介绍ACM里java的常用轮子。

