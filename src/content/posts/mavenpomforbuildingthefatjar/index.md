---
title: Maven pom for building the fat jar
slug: mavenpomforbuildingthefatjar
date: '2022-08-17T11:21:29.299Z'
categories:
- Notes
- Utilities
tags:
- Development
- Notes
- Java
original_permalink: /archives/mavenpomforbuildingthefatjar
---

A quick note of the pom that can build a fat jar for the web app. It workes for me.
```xml
<build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.4.2</version>
                <configuration>
                    <finalName>app</finalName>
                    <archive>
                        <manifest>
                            <mainClass>io.swen90007sm2.app.HotelBookingApplication</mainClass>
                        </manifest>
                    </archive>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                    <appendAssemblyId>false</appendAssemblyId>
                </configuration>
                <executions>
                    <execution>
                        <id>assemble-all</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```
