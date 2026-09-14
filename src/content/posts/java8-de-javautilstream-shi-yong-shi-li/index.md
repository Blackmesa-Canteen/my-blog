---
title: Java 8的java.util.Stream使用实例
slug: java8-de-javautilstream-shi-yong-shi-li
date: '2022-02-06T10:38:27.306Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
original_permalink: /archives/java8-de-javautilstream-shi-yong-shi-li
---

# 绍介
java 8开始新增了 java.util.stream 包，它和之前的流大同小异。

之前接触最多的是资源流，比如java.io.FileInputStream，通过流把文件从一个地方输入到另一个地方，它只是内容搬运工，对文件内容不做任何CRUD。 Stream依然不存储数据，不同的是它可以检索(Retrieve)和逻辑处理集合数据、包括筛选、排序、统计、计数等。可以想象成是 Sql 语句。 它的源数据可以是 Collection、Array 等。

由于它的方法参数都是函数式接口类型，所以一般和 Lambda 配合使用。

Stream有以下特点:

- 通过简单的链式编程，使得它可以方便地对遍历处理后的数据进行再处理;
- 方法参数都是函数式接口类型;
- 一个 Stream 只能操作一次，操作完就关闭了，继续使用这个 stream 会报错;
- Stream 不保存数据，不改变数据源.

# 示例
## 常用操作
```java
@Test
public void test() {
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
    //返回符合条件的stream
    Stream<String> stringStream = strings.stream().filter(s -> "abc".equals(s));
    //计算流符合条件的流的数量
    long count = stringStream.count();

    //forEach遍历->打印元素
    strings.stream().forEach(System.out::println);

    //limit 获取到1个元素的stream
    Stream<String> limit = strings.stream().limit(1);
    //toArray 比如我们想看这个limitStream里面是什么，比如转换成String[],比如循环
    String[] array = limit.toArray(String[]::new);

    //map 对每个元素进行操作返回新流
    Stream<String> map = strings.stream().map(s -> s + "22");

    //sorted 排序并打印
    strings.stream().sorted().forEach(System.out::println);

    //Collectors collect 把abc放入容器中
    List<String> collect = strings.stream().filter(string -> "abc".equals(string)).collect(Collectors.toList());
    //把list转为string，各元素用，号隔开
    String mergedString = strings.stream().filter(string -> !string.isEmpty()).collect(Collectors.joining(","));

    //对数组的统计，比如用
    List<Integer> number = Arrays.asList(1, 2, 5, 4);

    IntSummaryStatistics statistics = number.stream().mapToInt((x) -> x).summaryStatistics();
    System.out.println("列表中最大的数 : "+statistics.getMax());
    System.out.println("列表中最小的数 : "+statistics.getMin());
    System.out.println("平均数 : "+statistics.getAverage());
    System.out.println("所有数之和 : "+statistics.getSum());

    //concat 合并流
    List<String> strings2 = Arrays.asList("xyz", "jqx");
    Stream.concat(strings2.stream(),strings.stream()).count();

    //注意 一个Stream只能操作一次，不能断开，否则会报错。
    Stream stream = strings.stream();
    //第一次使用
    stream.limit(2);
    //第二次使用
    stream.forEach(System.out::println);
    //报错 java.lang.IllegalStateException: stream has already been operated upon or closed

    //但是可以这样, 连续使用
    stream.limit(2).forEach(System.out::println);
}
```

## 延迟执行
在执行返回 Stream 的方法时，并不立刻执行，而是等返回一个非 Stream 的方法后才执行。因为拿到 Stream 并不能直接用，而是需要处理成一个常规类型。这里的 Stream 可以想象成是二进制流，拿到这个二进制流咱们也看不懂。 

今天分析下filter方法:
```java
@Test
public void laziness(){
  List<String> strings = Arrays.asList("abc", "def", "gkh", "abc");
  Stream<Integer> stream = strings.stream().filter(new Predicate() {
      @Override
      public boolean test(Object o) {
        System.out.println("Predicate.test 执行");
        return true;
        }
      });

   System.out.println("count 执行");
   stream.count();
}
/*-------执行结果--------*/
// count 执行
// Predicate.test 执行
// Predicate.test 执行
// Predicate.test 执行
// Predicate.test 执行
```

按执行顺序应该是先打印 4 次「Predicate.test 执行」，再打印「count 执行」。实际结果恰恰相反。说明 filter 中的方法并没有立刻执行，而是等调用count()方法后才执行。

# Copyright

整理自Guide哥。
链接: https://javaguide.cn/java/new-features/java8-common-new-features



