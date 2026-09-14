---
title: Mac删除Git目录下的.DS_Store文件
slug: mac-shan-chu-git-mu-lu-xia-de-dsstore-wen-jian
date: '2021-08-15T01:18:29.492Z'
categories:
- Notes
- Utilities
tags:
- Mac
- Notes
cover: ./apple-7d106e88781f4bf5b459d18f6c3c1e6a.jpg
original_permalink: /archives/mac-shan-chu-git-mu-lu-xia-de-dsstore-wen-jian
---

# 起因
傻苹果。
删除文件后，会有.DS_Store文件冒出来。
放到项目目录里非常不规范，还会泄漏重要数据。

# 经过
在项目Git目录下，终端模拟器:

```shell
# 删除项目中的所有.DS_Store。这会跳过不在项目中的 .DS_Store
find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch
# 将 .DS_Store 加入到 .gitignore
echo .DS_Store >> ~/.gitignore
# 更新项目
git add --all
git commit -m '.DS_Store removed'
```

# 结果
Done.
