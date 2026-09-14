---
title: '[Android] Fragment 实现onResume()'
slug: androidfragmentshi-xian-onresume
date: '2021-09-26T04:18:36.574Z'
categories:
- Notes
tags:
- Android
cover: ./1625278077288-93d34342abdc45c691399b43065ff507.jpeg
original_permalink: /archives/androidfragmentshi-xian-onresume
---

# 起因
本来想着Fragment 有生命周期函数 `onResume()`, 想要用其实现当切换回这个fragment的时候，能够自动刷新里头的数据。然而发现，`onResume()`其实是绑定在Fragment所在的Activity里，也就是说，在同一个activity里，切换fragment并不能使其能够刷新.

# 经过

我已经了解到：

> Fragment依托于Activity，其内部的OnResume和OnPause方法真正归属于其依托的Activity，在Activity可见性变化的时候，才会调用这两个方法。

由于我使用FragmentTransaction，`transaction.add`, `transaction.hide`以及`transaction.show`实现Fragment切换，那么：可以使用`onHiddenChanged(boolean hidden)`方法，原理如下：

*hide()跳转新的Fragment时，旧的Fragment回调onHiddenChanged()，不会回调onStop()等生命周期方法，而新的Fragment在创建时是不会回调onHiddenChanged()，所以一般会和onresume（）方法配合使用。*


**实例：**

```java
    @Override
    public void onHiddenChanged(boolean hidden) {
        super.onHiddenChanged(hidden);
        if (!hidden) {
            // equivalent to onResume
            loadData();
        }
    }
```

# 结果
能够在同一个activity里切换Fragment的时候刷新里头的数据了。

