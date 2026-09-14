---
title: Java 1.8 CompletableFuture的使用
slug: java18completablefuture-de-shi-yong
date: '2021-12-18T06:36:29.395Z'
categories:
- Notes
tags:
- Development
- Java
original_permalink: /archives/java18completablefuture-de-shi-yong
---

# 应用场景

假设今天有一个商品详情页面, 有图片, 有文字, 有大量的参数组合. 这种大量数据都要同步运行查询的话, 等待时间长, 不好. 倘若任务之间没有先后联系, 异步完成就能省时间. 但是如果有些任务之间有关系, 使用CompletableFuture可能更好点.

# 代码案例

CompletableFuture提供四个静态方法执行异步任务.

```java
System.out.println("main......start.....");
        CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
            System.out.println("当前线程：" + Thread.currentThread().getId());
            int i = 10 / 2;
            System.out.println("运行结果：" + i);
        }, executor);

        /**
         * 方法完成后的处理
         */
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            System.out.println("当前线程：" + Thread.currentThread().getId());
            int i = 10 / 0;
            System.out.println("运行结果：" + i);
            return i;
        }, executor).whenComplete((res, exception) -> {
            //虽然能得到异常信息，但是没法修改返回数据
            System.out.println("异步任务成功完成了...结果是：" + res + "异常是：" + exception);
        }).exceptionally(throwable -> {
            //可以感知异常，同时返回默认值
            return 10;
        });

        /**
         * 方法执行完后端处理
         */
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            System.out.println("当前线程：" + Thread.currentThread().getId());
            int i = 10 / 2;
            System.out.println("运行结果：" + i);
            return i;
        }, executor).handle((result, thr) -> {
            if (result != null) {
                return result * 2;
            }
            if (thr != null) {
                System.out.println("异步任务成功完成了...结果是：" + result + "异常是：" + thr);
                return 0;
            }
            return 0;
        });


        /**
         * 线程串行化
         * 1、thenRunL：不能获取上一步的执行结果
         * 2、thenAcceptAsync：能接受上一步结果，但是无返回值
         * 3、thenApplyAsync：能接受上一步结果，有返回值
         *
         */
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            System.out.println("当前线程：" + Thread.currentThread().getId());
            int i = 10 / 2;
            System.out.println("运行结果：" + i);
            return i;
        }, executor).thenApplyAsync(res -> {
            System.out.println("任务2启动了..." + res);
            return "Hello" + res;
        }, executor);
        System.out.println("main......end....." + future.get());

```



