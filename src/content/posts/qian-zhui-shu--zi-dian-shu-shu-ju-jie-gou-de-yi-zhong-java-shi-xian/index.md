---
title: 前缀树/字典树数据结构的一种Java实现
slug: qian-zhui-shu--zi-dian-shu-shu-ju-jie-gou-de-yi-zhong-java-shi-xian
date: '2022-01-11T01:13:32.329Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Data Structure
- Algorithm
- Improvement
- Notes
original_permalink: /archives/qian-zhui-shu--zi-dian-shu-shu-ju-jie-gou-de-yi-zhong-java-shi-xian
---

# 前缀树
**Trie**（发音类似 "try"）或者说**前缀树**, 或者说**字典树**是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。

这一数据结构有相当多的应用情景，例如自动补完和拼写检查。

# 数据结构

## 节点
Trie，又称前缀树或字典树，是一棵有根树，其每个节点包含以下字段：

- 指向子节点的指针数组`children`. 可以让数组长度为 
26, 即小写英文字母的数量。
- 一个布尔字段`isEnd`, 标记是否是一个字符串的结尾;


## 插入
我们从字典树的根开始，插入字符串。对于当前字符对应的子节点，有两种情况：

- 子节点存在。沿着指针移动到子节点，继续处理下一个字符。
- 子节点不存在。创建一个新的子节点，记录在 `children` 数组的对应位置上，然后沿着指针移动到子节点，继续搜索下一个字符。

重复以上步骤，直到处理字符串的最后一个字符，然后将当前节点标记为字符串的结尾。

## 查找前缀

我们从字典树的根开始，查找前缀。对于当前字符对应的子节点，有两种情况：

- 子节点存在。沿着指针移动到子节点，继续搜索下一个字符。
- 子节点不存在。说明字典树中不包含该前缀，返回空指针。

重复以上步骤，直到返回空指针或搜索完前缀的最后一个字符。

若搜索到了前缀的末尾，就说明字典树中存在该前缀。此外，若前缀末尾对应节点的 `isEnd` 为真，则说明字典树中存在该字符串(全量匹配)。


# 实现

今天实现了一个Trie 类：

- Trie() 初始化前缀树对象。
- void insert(String word) 向前缀树中插入字符串 word 。
- boolean search(String word) 如果字符串 word 在前缀树中，返回 true（即，在检索之前已经插入）；否则，返回 false 。
- boolean startsWith(String prefix) 如果之前已经插入的字符串 word 的前缀之一为 prefix ，返回 true ；否则，返回 false 。

```
/**
 * Trie object will be instantiated and called as such:
 * Trie obj = new Trie();
 * obj.insert(word);
 * boolean param_2 = obj.search(word);
 * boolean param_3 = obj.startsWith(prefix);
 */
```


# 码
```java
class Trie {

    // 记录前缀树的根节点
    TreeNode root;
    // 定义前缀树节点
    class TreeNode{
        TreeNode[] next;
        boolean isEnd;

        public TreeNode (){
            next = new TreeNode[26];
        }
    }

    // 初始化前缀树
    public Trie() {
        root = new TreeNode();

    }
    
    /** Inserts a word into the trie. */
    public void insert(String word) {
        TreeNode cur = root;
        for(char ch : word.toCharArray()){
            // 判断对应节点是否为空，如果为空，则直接插入
            if(cur.next[ch - 'a'] == null){
                cur.next[ch - 'a'] = new TreeNode();
            }
            // 继续插入下一个节点
            cur = cur.next[ch - 'a'];
        }
        // 将最后一个字符设置为结尾
        cur.isEnd = true;
    }
    
    // 查找单词, 全量匹配
    public boolean search(String word) {
        TreeNode cur = root;
        for(char ch : word.toCharArray()){
            // 如果对应节点为空，则表明不存在这个单词，返回false
            if(cur.next[ch - 'a'] == null)
                return false;
            cur = cur.next[ch - 'a'];
        }
        // 检查最后一个字符是否是结尾
        return cur.isEnd;
    }
    
    // 查找单词, 前缀匹配
    public boolean startsWith(String prefix) {
        TreeNode cur = root;
        for(char ch : prefix.toCharArray()){
            if(cur.next[ch - 'a'] == null)
                return false;
            cur = cur.next[ch - 'a'];
        }
        return true;
    }
}
```

输入/输出:
```
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // 返回 True
trie.search("app");     // 返回 False
trie.startsWith("app"); // 返回 True
trie.insert("app");
trie.search("app");     // 返回 True
```
