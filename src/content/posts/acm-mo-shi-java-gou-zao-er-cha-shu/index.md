---
title: ACM模式Java构造数据结构
slug: acm-mo-shi-java-gou-zao-er-cha-shu
date: '2022-07-20T07:55:03.328Z'
categories:
- Improvement
- Utilities
tags:
- Algorithm
- Improvement
- Notes
original_permalink: /archives/acm-mo-shi-java-gou-zao-er-cha-shu
---

# 链表
```java
import java.util.*;

public class Main {
    static class Node {
        int val;
        Node next;

        Node(int val) {
            this.val = val;
        }
    }


    private static Node buildList(String[] strs) {
        if (strs == null || strs.length == 0) return null;

        Node dummy = new Node(0);

        Node ptr = dummy;

        for (String str : strs) {
            int num = Integer.parseInt(str);
            ptr.next = new Node(num);

            ptr = ptr.next;
        }

        return dummy.next;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String[] listStr1 = sc.nextLine().split(" ");
        String[] listStr2 = sc.nextLine().split(" ");

        Node list1 = buildList(listStr1);
        Node list2 = buildList(listStr2);

        Node resPtr = combine(list1, list2);

        while (resPtr != null) {
            System.out.println(resPtr.val + " ");
            resPtr = resPtr.next;
        }
    }

    private static Node combine(Node head1, Node head2) {
        Node dummy = new Node(0);
        Node ptr1 = head1;
        Node ptr2 = head2;
        Node ptr = dummy;

        while (ptr1 != null && ptr2 != null) {
            if (ptr1.val <= ptr2.val) {
                ptr.next = ptr1;
                ptr1 = ptr1.next;
            } else {
                ptr.next = ptr2;
                ptr2 = ptr2.next;
            }

            ptr = ptr.next;
        }

        if (ptr1 == null) {
            ptr.next = ptr2;
        } else {
            ptr.next = ptr1;
        }

        return dummy.next;
    }


}

```

# 二叉树(二叉堆数组)
```java
import java.util.*;

public class Tree {
   static class TreeNode{
      int val;
      TreeNode left;
      TreeNode right;
      public TreeNode(){}
      public TreeNode(int val){
         this.val = val;
      }
   }
	//方法入口
   public static void main(String[] args) {
      Scanner scanner = new Scanner(System.in);
      String s = scanner.nextLine();
      String[] split = s.split(" ");
      int[] arr = new int[split.length];
      for(int i = 0; i < arr.length; i++){
         arr[i] = Integer.parseInt(split[i]);
      }
      //构建二叉树
      TreeNode root = build(arr);
      //层序遍历二叉树
      List<List<Integer>> res = help(root);
      //打印结果
      for (List<Integer> ans : res){
         System.out.print(ans);
      }
   }
   //层序遍历二叉树
   private static List<List<Integer>> help(TreeNode root) {
      List<List<Integer>> res = new ArrayList<>();
      LinkedList<TreeNode> queue = new LinkedList<>();
      queue.add(root);
      while(queue.size() > 0){
         List<Integer> tmp = new ArrayList<>();
         int size = queue.size();
         for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            tmp.add(node.val);
            if(node.left != null){
               queue.add(node.left);
            }
            if(node.right != null){
                  queue.add(node.right);
            }
         }
         res.add(tmp);
      }
      return res;
   }
   //构建二叉树
   private static TreeNode build(int[] arr) {
      List<TreeNode> list = new ArrayList<>();
      Collections.fill(list, null);
      TreeNode root = null;
      for(int i = 0; i < arr.length; i++){
         TreeNode node = null;
         if(arr[i] != -1){
            node = new TreeNode(arr[i]);
         }
         list.add(i,node);
         if(i == 0){
            root = node;
         }
      }
      for (int i = 0;  2 * i + 2 < arr.length ; i++) {
         if(list.get(i) != null){
            list.get(i).left = list.get(2 * i + 1);
            list.get(i).right = list.get(2 * i + 2);
         }
      }
      return root;
   }

}

```

# 二叉树(牛客)
**输入要求:**
```
输入描述：第一行两个数n,root，分别表示二叉树有n个节点，第root个节点时二叉树的根。接下来共n行，第i行三个数val_i,left_i,right_i，分别表示第i个节点的值val是val_i,左儿子left是第left_i个节点，右儿子right是第right_i个节点。
节点0表示空。
1<=n<=100000,保证是合法的二叉树
例如
5 1
5 2 3
1 0 0
3 4 5
4 0 0
6 0 0

```

**代码**
```java
import java.util.*;

public class Tree {

    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;
        TreeNode () {

        }
        TreeNode (int val) {
            this.val = val;
        }
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        int len = sc.nextInt();
        int rootNo = sc.nextInt();

        TreeNode[] tree = new TreeNode[len];

        for (int i = 0; i < len; i++) {
            tree[i] = new TreeNode();
        }

        for (int i = 0; i < len; i++) {
            int val = sc.nextInt();
            int left = sc.nextInt();
            int right = sc.nextInt();

            tree[i].val = val;
            if (left != 0) {
                tree[i].left = tree[left - 1];
            }
            if(right != 0) {
                tree[i].right = tree[right - 1];
            }
        }

        long minValue = Long.MIN_VALUE;
        System.out.println(ifBst(tree[rootNo - 1], minValue));
    }

    private static boolean ifBst(TreeNode root, long minValue) {
        if (root == null) return true;
        boolean leftRes = ifBst((root.left), minValue);
        if (!leftRes) return false;

        if(root.val <= minValue) return false;
        minValue = root.val;

        boolean right = ifBst(root.right, minValue);
        return right;
    }
}
```
