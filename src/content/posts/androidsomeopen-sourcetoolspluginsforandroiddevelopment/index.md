---
title: Some open-source tools/plugins for android development
slug: androidsomeopen-sourcetoolspluginsforandroiddevelopment
date: '2021-07-03T00:06:50Z'
categories:
- Notes
tags:
- Android
cover: ./1625278077288-93d34342abdc45c691399b43065ff507.jpeg
original_permalink: /archives/androidsomeopen-sourcetoolspluginsforandroiddevelopment
---


![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625278077288.jpeg -->
# These are some open source tools i am using recently, just write them down.


## 1. Firstly, in mainland China, I need to use maven mirror.
``` json
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google/' }
        maven { url 'https://maven.aliyun.com/repository/public/' }
        maven { url "https://s01.oss.sonatype.org/content/groups/public" }
        google()
        mavenCentral()
    }
```

## 2. Some Tools：

- Glide: Can be used when I get image or video URLs from server, it can load them to the View. [GitHub Address](https://github.com/bumptech/glide)
- okhttp: Handle GET/POST [GitHub Address](https://github.com/square/okhttp)
- Banner: A rotating container that can be customized. [GitHub Address](https://github.com/youth5201314/banner)
- lombok: Don't need to talk more. pojo.
- fastjson: Convert Java Objects into their JSON representation. It can also be used to convert a JSON string to an equivalent Java object. [GitHub Address](https://github.com/alibaba/fastjson)

## 3. Some plugins:
- GsonFormatPlus: IntelliJ and Android Studio. Automatically generate model class from Json string. Install in IDE.
