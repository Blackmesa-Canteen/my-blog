---
title: Unsupported class file major version 60问题试解决
slug: solveunsupportedclassfilemajorversion60
date: '2021-11-22T06:48:25.967Z'
categories:
- Notes
cover: ./src=http---pic1.zhimg.com-v2-0e96436a999ac26218fc54344799c859_1200x500.jpg&refer=http---pic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg-f4aa1ed1bf2948b4963a856ccd30163f.jpg
original_permalink: /archives/solveunsupportedclassfilemajorversion60
---

# 起因
配置Eureka 微服务时,提示类加载器有关错误: Unsupported class file major version 60.

# 经过
排查Eureka的pom和父亲pom中的property,发现`java.version`字段不对应,eureka的是16, 而其他的pom是1.8.

设置完pom,刷新,再检查下项目的compiler,SDK的配置:
![image.jpeg](./image-d5409dab58344d2b912e251a5fc9b894.jpeg)

以及project structure:
![image.jpeg](./image-62010839651a48348a9b2efc13f18f8e.jpeg)

# 结果
成功编译并运行.
