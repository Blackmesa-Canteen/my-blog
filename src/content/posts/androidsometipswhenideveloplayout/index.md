---
title: Some tips when I develop layout.
slug: androidsometipswhenideveloplayout
date: '2021-07-04T04:32:15Z'
categories:
- Notes
tags:
- Android
cover: ./1625278077288-93d34342abdc45c691399b43065ff507.jpeg
original_permalink: /archives/androidsometipswhenideveloplayout
---


- 想要悬浮的东西，可以用FrameLayout，越后出现的越靠前，用gravity控制位置之类的。
- Divider： 
  ```xml
    <View
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:background="#eeee"/>
  ```
- If I want some different colors in a single line of words:
  ```xml
    <LinearLayout
                            android:layout_width="match_parent"
                            android:layout_height="wrap_content"
                            android:orientation="horizontal"
                            android:padding="10dp">

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="由"
                                android:textColor="#3c3d40" />

                            <TextView
                                android:id="@+id/tv_good_info_store"
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="红色店铺名"
                                android:textColor="#ff4040" />

                            <TextView
                                android:layout_width="wrap_content"
                                android:layout_height="wrap_content"
                                android:text="发货"
                                android:textColor="#3c3d40" />
                        </LinearLayout>
  ```
- If I want to import other layout:
  ```xml
    <include layout="@layout/more_layout" />
  ```
