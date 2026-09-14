---
title: Go Gin安装解决国内因为墙安装超时
slug: gogin-an-zhuang-jie-jue-guo-nei-yin-wei-qiang-an-zhuang-chao-shi
date: '2021-12-22T23:28:29.615Z'
categories:
- Notes
- Random
- Improvement
tags:
- 墙
- Go
original_permalink: /archives/gogin-an-zhuang-jie-jue-guo-nei-yin-wei-qiang-an-zhuang-chao-shi
---

# 解决
- 添加国内代理后再按照官方说明安装.

# 步骤

1. 启动module功能: `go env -w GO111MODULE=on`
2. 设置代理: `go env -w GOPROXY=https://goproxy.cn,direct`
3. 可以安装了: `go get -u github.com/gin-gonic/gin`
4. 项目引入: `import "github.com/gin-gonic/gin"`

# 总结
墙不仅是思想的桎梏, 更是知识的监牢. 感恩.


