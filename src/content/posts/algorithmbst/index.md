---
title: 'BST '
slug: algorithmbst
date: '2021-07-03T07:41:12Z'
categories:
- Improvement
tags:
- Algorithm
cover: ./v2-a61ac9099288c68cfb50f23eb2a5ac8c_720w-ba72ad827ca84b82ab5bbe3c9d9c129b.jpg
original_permalink: /archives/algorithmbst
---


# Definition
In a Binary Search tree:
- If the left subtree of any node is not empty, then the value of all the nodes in the left subtree is less than the value of its root node;
- The right subtree of any node is not empty, then the value of all nodes in the right subtree is greater than the value of its root node;
- The left and right subtrees of any node are binary search trees respectively.
  
# Implementation with Java
## Node
```java

public class BSTree<T extends Comparable<T>> {
    private BSTNode<T> mRoot;

    public class BSTNode<T extends Comparable<T>> {
        T key;
        BSTNode<T> left;
        BSTNode<T> right;
        BSTNode<T> parent;
    }
    public BSTNode(T key, BSTNode<T> parent, BSTNode<T> left, BSTNode<T> right) {
                this.key = key;
                this.parent = parent;
                this.left = left;
                this.right = right;
            }
}

```

# Traverse
## In-Order
```java
    private void inOrder(BSTNode<T> treeRoot) {
        if(treeRoot != null) {
            inOrder(treeRoot.left);
            print(treeRoot.key)
            inOrder(treeRoot.right);
        }
    }
```

## Pre-Order
```java
    private void preOrder(BSTNode<T> treeRoot) {
        if(treeRoot != null) {
            print(treeRoot.key)
            preOrder(treeRoot.left);
            preOrder(treeRoot.right);
        }
    }
```

## post-Order
```java
    private void postOrder(BSTNode<T> treeRoot) {
        if(treeRoot != null) {
            postOrder(treeRoot.left);
            postOrder(treeRoot.right);
            print(treeRoot.key)
        }
    }
```

## example:
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625305877519.svg -->
Result:
- pre: 8 3 1 6 4 7 10 14 13
- in: 1 3 4 6 7 8 10 13 14
- post: 1 4 7 6 3 13 14 10 8

# Search
## recursive
```java
private BSTNode<T> search(BSTNode<T> x, T key) {
    if (x == null) {
        return x
    }

    int cmp = key.compareTo(x.key);
    if (cmp < 0) {
        return search(x.left, key)
    }
    else if (cmp > 0) {
        return search(x.right, key)
    }
    else
        return x;
}
```
## Non-recursive
```java
private BSTNode<T> iterativeSearch(BSTNode<T> x, T key) {
    while (x != null) {
        int cmp = key.compareTo(x.key);
        if(cmp < 0) {
            x = x.left;
        }
        else if (cmp > 0) {
            x = x.right
        }
        else
            return x;
}
```

# Find max-min
```java
/* 
 * 查找最大结点: 返回tree为根结点的二叉树的最大结点。
 */
private BSTNode<T> maximum(BSTNode<T> tree) {
    if (tree == null)
        return null;

    while(tree.right != null)
        tree = tree.right;
    return tree;
}

/* 
 * 查找最小结点: 返回tree为根结点的二叉树的最小结点。
 */
private BSTNode<T> minimum(BSTNode<T> tree) {
    if (tree == null)
        return null;

    while(tree.left != null)
        tree = tree.left;
    return tree;
}
```

# Predecessor & successor

```java
* 
 * 找结点(x)的前驱结点。即，查找"二叉树中数据值小于该结点"的"最大结点"。
 */
public BSTNode<T> predecessor(BSTNode<T> x) {
    // 如果x存在左孩子，则"x的前驱结点"为 "以其左孩子为根的子树的最大结点"。
    if (x.left != null)
        return maximum(x.left);
    // 如果x没有左孩子。则x有以下两种可能: 
    // (01) x是"一个右孩子"，则"x的前驱结点"为 "它的父结点"。
    // (01) x是"一个左孩子"，则查找"x的最低的父结点，并且该父结点要具有右孩子"，找到的这个"最低的父结点"就是"x的前驱结点"。
        BSTNode<T> y = x.parent;
        while ((y!=null) && (x==y.left)) {
            x = y;
            y = y.parent;
        }

        return y;
}

/* 
 * 找结点(x)的后继结点。即，查找"二叉树中数据值大于该结点"的"最小结点"。
 */
public BSTNode<T> successor(BSTNode<T> x) {
    // 如果x存在右孩子，则"x的后继结点"为 "以其右孩子为根的子树的最小结点"。
    if (x.right != null)
        return minimum(x.right);

    // 如果x没有右孩子。则x有以下两种可能: 
    // (01) x是"一个左孩子"，则"x的后继结点"为 "它的父结点"。
    // (02) x是"一个右孩子"，则查找"x的最低的父结点，并且该父结点要具有左孩子"，找到的这个"最低的父结点"就是"x的后继结点"。
    BSTNode<T> y = x.parent;
    while ((y!=null) && (x==y.right)) {
        x = y;
        y = y.parent;
    }

    return y;
}
```

# Insert & remove

## Insert
```java
/* 
 * 将结点插入到二叉树中
 *
 * 参数说明: 
 *     tree 二叉树的
 *     z 插入的结点
 */
private void insert(BSTree<T> bst, BSTNode<T> z) {
    int cmp;
    BSTNode<T> y = null;
    BSTNode<T> x = bst.mRoot;

    // 查找z的插入位置
    while (x != null) {
        y = x;
        cmp = z.key.compareTo(x.key);
        if (cmp < 0)
            x = x.left;
        else
            x = x.right;
    }

    z.parent = y;
    if (y==null)
        bst.mRoot = z;
    else {
        cmp = z.key.compareTo(y.key);
        if (cmp < 0)
            y.left = z;
        else
            y.right = z;
    }
}

/* 
 * 新建结点(key)，并将其插入到二叉树中
 *
 * 参数说明: 
 *     tree 二叉树的根结点
 *     key 插入结点的键值
 */
public void insert(T key) {
    BSTNode<T> z=new BSTNode<T>(key,null,null,null);

    // 如果新建结点失败，则返回。
    if (z != null)
        insert(this, z);
}
```

## remove
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625310200578.png -->
```java


/*
 * 删除结点(z)，并返回被删除的结点
 *
 * 参数说明：
 *     bst 二叉树
 *     z 删除的结点
 */
private BSTNode<T> remove(BSTree<T> bst, BSTNode<T> z) {
    //这里没起个好名字，让人看着默默奇妙，实际上 x 就是子节点 child
    BSTNode<T> x=null;
    //这里的 y 节点就是要删除的节点 delete
    BSTNode<T> y=null;
    //这个写法理解比较绕，不如反转后容易理解
    //只有一个节点或者没有节点时
    if ((z.left == null) || (z.right == null) )
        //z 就是要删除的节点
        y = z;
    else
        //当有两个子节点时，删除后继结点
        // 上述图例是删除前驱节点
        y = successor(z);
    //获取需要删除的节点的子节点，不管是左是右
    if (y.left != null)
        x = y.left;
    else
        x = y.right;
    //如果存在子节点，就关联被删节点的父节点
    if (x != null)
        x.parent = y.parent;
    //如果父节点是空，说明要删的是根节点
    if (y.parent == null)
        //设置根为 child（此时根只有一个或没有节点）
        bst.mRoot = x;
    else if (y == y.parent.left)//要删的是左节点
        y.parent.left = x;//左节点关联子节点
    else//要删的是右节点
        y.parent.right = x;//右节点关联子节点
    //如果要删的节点和一开始传入的不一样，就是后继的情况
    if (y != z)
        z.key = y.key;//后继的值传给本来要删除的节点
    //返回被删除的节点
    return y;
}
```
