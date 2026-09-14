---
title: 给Gradle项目打jar包,书写build.gradle
slug: gei-gradle-xiang-mu-da-jar-bao--shu-xie-buildgradle
date: '2021-10-28T05:31:59.286Z'
categories:
- Notes
- Utilities
tags:
- Java
cover: ./黑海海军陆战队-f7348021615347a9a0cf1f8ee32a55be.jpg
original_permalink: /archives/gei-gradle-xiang-mu-da-jar-bao--shu-xie-buildgradle
---

# 起因
我想给一个java的gradle项目打jar包. 不想使用IDEA的Build Artifacts, 而是直接用gradle jar.
# 经过
请写build.gradle文件. 如下是一个实例:
```gradle
plugins {
    id 'java'
    id 'java-library'
}

group 'org.team54'
version ''

sourceCompatibility = 1.11

repositories {
    mavenCentral()
}

dependencies {

    // https://mvnrepository.com/artifact/com.google.code.gson/gson
    implementation group: 'com.google.code.gson', name: 'gson', version: '2.8.8'

    // https://mvnrepository.com/artifact/com.alibaba/fastjson
    implementation group: 'com.alibaba', name: 'fastjson', version: '1.2.78'

    // https://mvnrepository.com/artifact/org.projectlombok/lombok
    compileOnly group: 'org.projectlombok', name: 'lombok', version: '1.18.20'
    annotationProcessor group: 'org.projectlombok', name: 'lombok', version: '1.18.20'

    // https://mvnrepository.com/artifact/args4j/args4j
    implementation group: 'args4j', name: 'args4j', version: '2.32'

    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
}

tasks.named('jar') {
    manifest {
        attributes('Implementation-Title': project.name,
                'Main-Class': 'org.team54.app.ChatPeer'
        )
    }

    // fat jar with all dependencies
    from {
        configurations.runtimeClasspath.collect { it.isDirectory() ? it : zipTree(it)}
    }
}

test {
    useJUnitPlatform()
}
```

# 结果
打jar包, 请.
