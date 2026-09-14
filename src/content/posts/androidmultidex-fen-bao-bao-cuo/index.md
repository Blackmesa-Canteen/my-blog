---
title: Android multidex分包报错
slug: androidmultidex-fen-bao-bao-cuo
date: '2021-08-15T01:06:54.353Z'
categories:
- Notes
tags:
- Android
cover: ./1625278077288-93d34342abdc45c691399b43065ff507.jpeg
original_permalink: /archives/androidmultidex-fen-bao-bao-cuo
---

# 起因
当我build Andriod 工程，提示multidex错误，报错信息会有65536这个数字。

这是因为，Android APK文件本质上是一个压缩文件，在android5.0之前，每一个android应用中只会含有一个dex文件`classes.dex`,该文件是Dalvik字节码文件，这个dex文件中存放的就是编译后的Java代码。Dalvik可执行文件规范限制了单个.dex文件最多引用的方法数是65536个。这就是**64K(64*1024)事件**。

# 经过

可以查找Android官方文档。

## Step 1. 配置Gradle
在app级build.gradle里增加：
```xml
defaultConfig {
        multiDexEnabled true
}

dependencies {

    implementation "androidx.multidex:multidex:2.0.1"
}
```

## Step 2. 配置Application
- 如果没有重写`Application`，只需修改`Manifest`文件中的内容
```xml
<application
        ...
        android:name="android.support.multidex.MultiDexApplication">
        ...
    </application>
```

- 如果重写了`Application`，可以将继承的`Application`换成`MultiDexApplication`; 或者重写`attachBaseContext()` 方法：
```xml
@Override
 protected void attachBaseContext(Context base) {
     super.attachBaseContext(base);
     MultiDex.install(this);
}
```

# 结果
*Done.*
