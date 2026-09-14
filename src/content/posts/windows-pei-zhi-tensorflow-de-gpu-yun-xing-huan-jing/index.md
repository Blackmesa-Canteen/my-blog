---
title: Windows配置Tensorflow的GPU运行环境
slug: windows-pei-zhi-tensorflow-de-gpu-yun-xing-huan-jing
date: '2023-01-02T23:59:28.714Z'
categories:
- Notes
- Random
- Utilities
tags:
- Development
- Notes
- Machine Learning
original_permalink: /archives/windows-pei-zhi-tensorflow-de-gpu-yun-xing-huan-jing
---

# Details

草泥马CSDN等等垃圾网误导人，说什么配置GPU环境要手动安装各种CUDA，cudnn之类的， 一旦版本配对不上就直接寄。

**傻逼。**

其实，搞出来GPU运行环境，只需要几步。

# Steps

1. 安装 Conda， Anaconda;
2. 去找需要的tensorflow-gpu版本：https://anaconda.org/search?q=tensorflow-gpu;
3. 打开anaconda prompt;
4. 以安装tensorflow 2.6于conda环境tf为例，在anaconda prompt输入"conda create -n tf tensorflow-gpu=2.6.0"；
5. 等待安装完成；
6. 测试GPU是否可用：

```python
from tensorflow.python.client import device_lib
print(device_lib.list_local_devices())
```

# 结论
配置GPU环境其实很简单，去你大爷的CSDN和灌水博客。
