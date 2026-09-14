---
title: 让IntelliJ IDEA压缩CSS/JS文件
slug: compressjscsswithintellijidea
date: '2021-07-27T14:44:50.879Z'
categories:
- Notes
tags:
- Front-End
- Javascript
original_permalink: /archives/compressjscsswithintellijidea
---

# 起因

最近开始个性化本博客网站的前端。为了提高网页加载速度，需要将写好的JS/CSS代码进行压缩。为了压缩代码，每次我都需要去访问对应的工具网站，非常麻烦。所以我计划让开发工具IntelliJ IDEA自己直接压缩JS/CSS代码

Recently, I started personalizing the front-end resources of this blog. In order to improve the page loading speed, I need to compress JS/CSS codes. It is annoying that each time when I need the compression, I need to visit the corresponding website. So, I plan to make my IDE IntelliJ IDEA compress the JS/CSS code itself.

# 经过

## 1. 找到合适工具
[YUI Compressor](https://github.com/yui/yuicompressor)会是一个很好的压缩工具。下载地址：

[Download YUI Compressor](https://github.com/yui/yuicompressor/releases)

然后把jar包放在一个能找到的目录下，例如:
`~/opt/plugins`
Then put the JAR package in a directory that is easy to find, for instance:
`~/opt/plugins`

## 2. 配置IDEA

### 2.1 安装YUI Compressor到IDEA
`File >> Settings >> Tools >> ExternalTools >> 分别新建js和css压缩`

![Screen Shot 20210728 at 12.36.46 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.36.46%20AM-6a63592def0d4b5cb96aba77f6ed2462.jpg)

Arguments:
`-jar 路径/yuicompressor-2.4.8.jar --type js --charset utf-8 $FilePath$ -o $FileNameWithoutExtension$.min.js`


类似地，对于css压缩：
![Screen Shot 20210728 at 12.40.37 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.40.37%20AM-e8c923f95838487aaabb66269967ac93.jpg)

Arguments:
`-jar 路径/yuicompressor-2.4.8.jar --type css --charset utf-8 $FilePath$ -o $FileNameWithoutExtension$.min.css`

### 2.2 运行
右键js或css文件，执行相应命令就OK了。
Right click js or CSS file, run.
![Screen Shot 20210728 at 12.41.50 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.41.50%20AM-d161a637dc12432aaeca9ad59042c5e6.jpg)


## 3. 压缩执行自动化
每次更改完js和css文件，怎么能让IDEA自动执行压缩工作呢？
How can we make IDEA perform JS/CSS compression automatically every time we change them?

### 3.1 安装IDEA插件 `File Watcher`.
在' File/settings/plugins '，搜索一个叫做' File Watcher '的插件，它允许执行由文件修改触发的任务。

At `File/settings/plugins`, search for a plugin called `File Watcher`, which allows executing tasks triggered by file modifications.

![Screen Shot 20210728 at 12.24.22 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.24.22%20AM-d577902508f64ce981f1d30d54ecc8ce.jpg)

### 3.2 配置File Watchers的YUI Compressor模板

打开设置里的`Tools->File Watchers`，添加`<custom>`


![Screen Shot 20210728 at 12.51.12 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.51.12%20AM-3d45c9a5d89c4cb6b8651a0912dcf55d.jpg)

*配置自动压缩CSS*：
![Screen Shot 20210728 at 12.50.30 AM.jpg](./Screen%20Shot%202021-07-28%20at%2012.50.30%20AM-ea823638869547a1abbae5640ef66493.jpg)
```yaml
# CSS参考
Name: YUI Compressor CSS
File type: Cascading Style Sheet
Scope: Project Files
Program: YUI Compressor 的jar包目录
# 在文件的同目录下生成xxx.min.css
Arguments: $FileName$ -o $FileNameWithoutExtension$.min.css
Output paths to refresh: $FileNameWithoutExtension$.min.css
```

*配置自动压缩JS*：
类似地，只是配置变一下:
Similarly, only a little changes:
```yaml
# JS参考
Name: YUI Compressor JS
File type: JavaScript
Scope: Project Files
Program: YUI Compressor 的jar包目录
# 在文件的同目录下生成xxx.min.js
Arguments: $FileName$ -o $FileNameWithoutExtension$.min.js
Output paths to refresh: $FileNameWithoutExtension$.min.js
```

# 结果

舒服了，不用再专门找网站压缩JS/CSS了。
Cool! I'm really a lazy guy.

