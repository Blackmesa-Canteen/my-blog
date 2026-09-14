---
title: Callable和FutureTask使用速记
slug: callable-he-futuretask-shi-yong-su-ji
date: '2021-12-18T06:06:01.259Z'
categories:
- Notes
tags:
- Development
- Java
original_permalink: /archives/callable-he-futuretask-shi-yong-su-ji
---

# Callable介绍

Callable和Thread, Runnable相比, 能带有返回值,可以处理异常. 一般和FutureTask一起使用.

# 基本用法代码

以下代码只是demo, 不推荐生产环境使用. **应该把所有多线程异步任务交给线程池**.
```java
FutureTask<Integer> futureTask = new FutureTask<>(new Callable01());
new Thread(futureTask).start();

// get()方法: 等待线程执行完成获取返回结果
System.out.println(futureTask.get());
``` 

其中, `Callable01`定义为:

```java
public static class Callable01 implements Callable<Integer> {
        @Override
        public Integer call() throws Exception {
            System.out.println("当前线程：" + Thread.currentThread().getId());
            int i = 10 / 2;
            System.out.println("运行结果：" + i);
            return i;
        }
    }
```

# 线程池提交任务代码
生产环境下, 用线程池更高效.

线程池的创建(原生):
```java

// 50: 核心线程数, 一直保存着Thread实例, 来了就干活; 
// 100最大线程数; 
// 10L存活时间, 某些核心线程池空闲超过存活时间后, 释放空间: (最大线程数 - 核心线程数);
// unit 时间单位;
// 阻塞队列: 如果任务有很多, 最大能排队多少个;
// 线程创建工厂;
// 如果阻塞队列满了, 新来的Thread该怎么办(拒绝策略).
ExecutorService threadPool = new ThreadPoolExecutor(
                50,
                100,
                10L,
                TimeUnit.SECONDS,
                new LinkedBlockingDeque<Runnable>(10000),
                Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.AbortPolicy()
        );

        //定时任务的线程池
        ExecutorService service = Executors.newScheduledThreadPool(2);
```

此外还有其他种类的线程池, 可google.
