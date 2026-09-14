---
title: Sorting
slug: algorithmsorting
date: '2021-07-04T12:01:08Z'
categories:
- Improvement
tags:
- Algorithm
cover: ./v2-a61ac9099288c68cfb50f23eb2a5ac8c_720w-ba72ad827ca84b82ab5bbe3c9d9c129b.jpg
original_permalink: /archives/algorithmsorting
---


>Let's talk about sorting, which can be helpful when I deal with god damn interviews...

# 1. What?
- Bubble sort
  *It traverses the whole array. At each traverse, it will compares two adjacent numbers from the array head to the array tail. If the former is larger then the latter, they will be swapped.*

- Quick sort
   *One pivot with two pointers...*
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409660988.png -->
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409670547.png -->

- insertion sort
  *Start from the second element (pointer A), compare with the previous one. If the previous one is greater than the latter, swapping. Repeat these steps until previous one is less than or equal to the latter, Move the pointer A to the next element, then repeat all steps.*
  ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409798954.png -->
   
- shell sort
- selection sort
  *Start From the first element (pointer A), then the other pointer (pointer B = A + 1) will traverse the rest of elements to find the minimum value, then put the minimum one to the start pointer A, then the start pointer A +1. Repeat these steps until A = len - 1.*
  ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409817486.png -->

- heap sort
     *Construct a heap (Max heap 大顶堆 or Min head 小顶堆), pop root element, then fix the heap, then pop, then fix..... until no one left.*
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625410066426.png -->
     
- merge sort
   *Divide an conquer*
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409578374.png -->
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409586900.png -->
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625409599405.png -->
- bucket sort
- radix sort

---

![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io/post-images/1625407609657.png -->
  
# 2. When to use?
| 排序场景 | 排序效率 |
| ---- | ---- | ---- |
| Random | 希尔>快排>归并 |
| Few unique | 快排>希尔>归并 |
| Reversed | 快排>希尔>归并 |
| Almost sorted	| 插入排序>基数排序>快排>希尔>归并 |

# 3. How?
[Animation of these sortings](https://www.cs.usfca.edu/~galles/visualization/ComparisonSort.html)
