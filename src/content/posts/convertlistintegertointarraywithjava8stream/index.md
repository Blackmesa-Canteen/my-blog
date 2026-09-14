---
title: Convert List＜Integer＞to int[] array with Java 8 stream.
slug: convertlistintegertointarraywithjava8stream
date: '2023-01-29T00:10:32.170Z'
categories:
- Notes
- Utilities
tags:
- Java
original_permalink: /archives/convertlistintegertointarraywithjava8stream
---

# Intro

To convert List with foundamental data type such as int, we can use stream feature of the Java 8:

```java
public int[] getLeastNumbers(int[] arr, int k) {
        if (k == 0 || arr.length == 0) {
            return new int[0];
        }

        PriorityQueue<Integer> pq = new PriorityQueue<>();

        for (int num : arr) {
            pq.add(num);
        }

        List<Integer> list = new LinkedList<>();

        for (int i = 0; i < k; i++) {
            list.add(pq.poll());
        }

        return list.stream().mapToInt(Integer::intValue).toArray();
    }
```

In the other hand, we can also achieve this with loop:
```java
public int[] toIntArray(List<Integer> list) {
	int[] ret = new int[list.size()];
    for (int i = 0; i < ret.length; i++) {
    	ret[i]= list.get(i);
     }
     return ret;
}
```
