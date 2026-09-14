---
title: 方便地使用Java 8 Stream把Entity封装为VO
slug: fang-bian-de-shi-yong-java8stream-ba-entity-feng-zhuang-wei-vo
date: '2021-12-08T05:19:54.023Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
cover: ./download-7341bb97a50540c5be57844016d95358.jpeg
original_permalink: /archives/fang-bian-de-shi-yong-java8stream-ba-entity-feng-zhuang-wei-vo
---

# 起因

今天,我们从数据库查到一集合的entity,信息比较详细.

但是,前台只显示一点点信息,所以就考虑把查出的entity封装为vo们,然后传给前台.

# 代码
今天使用Java 8 新特性来解决这个业务需求,实例代码:
```java
@GetMapping(value = "/brands/list")
    public R relationBransList(@RequestParam(value = "catId",required = true) Long catId) {

        List<BrandEntity> vos = categoryBrandRelationService.getBrandsByCatId(catId);

        List<BrandVo> collect = vos.stream().map(item -> {
            BrandVo brandVo = new BrandVo();
            brandVo.setBrandId(item.getBrandId());
            brandVo.setBrandName(item.getName());
            return brandVo;
        }).collect(Collectors.toList());

        return R.ok().put("data",collect);
    }
```

# 结果
通过Stream能够简洁地实现遍历后把VO们封装到collection的操作.
