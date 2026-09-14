---
title: 接口幂等性保证的思路和一个订单后端业务代码实例
slug: jie-kou-mi-deng-xing-bao-zheng-de-yi-dian-si-lu
date: '2021-12-27T02:33:27.190Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
- Redis
original_permalink: /archives/jie-kou-mi-deng-xing-bao-zheng-de-yi-dian-si-lu
---

# 起因

假设今天有个付款或者提交订单的接口, 由于网速慢, 用户点了提交按钮没反应, 于是其愤怒地连击999次. 这种情况下, 预期只调用一次的接口可能会被调用多次, 这就带来了幂等性挑战.

常见挑战情景:
- 多次点击某按钮;
- 成功页面回退后再次重演提交;
- 微服务互相调用, 由于网络延迟导致feign中间件重发;
- 诸如此类...

*注: 不修改数据的操作往往是天然幂等的, 不需要考虑上述挑战.*


# 幂等性保证的思路

>Token机制

服务器会准备一个令牌(放在redis里), 并且,前台用户提交订单也会携带一个同样的令牌(一般放在请求头). 提交成功后令牌从服务器删除. 如果遇到重复无效请求(令牌记录不存在Redis里), 服务器会回应重复信息给前台.

漏洞: 什么时候删除令牌(前删/后删)
    1. 前删: 业务没有执行成功, 重试时token由于已经被删, 请求执行不了;
    2. 后删: 业务处理完成, 但是删除操作失败, 这时一个同样token的重演攻击就能乘虚而入.

要点: 最好设计为前删, 这样如果调用失败, 重新获取token再次请求. 为了客服漏洞, 必须要上同步锁! 获取令牌和删除令牌俩动作必须连贯, 要保证原子性. Redis保证原子操作一般使用lua脚本, 似乎可以用Redisson分布式锁框架, 免得在Java业务代码里写lua脚本.

>各种上锁
1. 数据库悲观锁:当查数据库的时候上锁, 这样在查询时数据不变.
2. 数据库乐观锁: MVCC. 主要用于读多写少的情景.
3. 业务层分布式锁: redisson, 类似于CAS的思路, 检测数据是不是被修改过,修改过了就放弃修改重试.

>各种唯一约束
- 数据库按照唯一索引插入: 比如使插入的订单号是唯一的, 数据库层面不允许两条同样的订单号存在.
- Redis防重: 利用Set数据结构, 计算发送到redis的数据的MD5放入Redis 的Set数据结构. 来了数据, 每次看MD5是否存在, 存在就不处理. 这个策略一般是网盘应用里使用.
- 数据库防重表: 使用唯一值(如订单号)作为防重表. 来了个请求先把唯一值放入表中, 再进行业务, 并且这俩动作在同一事务. 业务失败了, 放重表也可以回滚.

>全局请求唯一ID

每个请求, 都生成唯一的ID, redis中维护一个Set数据结构. 
也可以使用Nginx设置请求的唯一ID(请求头转发时加X-Request-Id), 也能够做链路追踪. 
这策略可用于微服务间feign调用情景.

# 一种订单提交幂等性保证的实例

以下是跳转到确认页的controller:
```java
/**
     * 去结算确认页
     * @param model
     * @param request
     * @return
     * @throws ExecutionException
     * @throws InterruptedException
     */
    @GetMapping(value = "/toTrade")
    public String toTrade(Model model, HttpServletRequest request) throws ExecutionException, InterruptedException {

        OrderConfirmVo confirmVo = orderService.confirmOrder();

        model.addAttribute("confirmOrderData",confirmVo);
        //展示订单确认的数据

        return "confirm";
    }

```

以下是上述Controller中`orderService.confirmOrder()`的业务代码:
```java
/**
     * 订单确认页返回需要用的数据
     * @return
     */
    @Override
    public OrderConfirmVo confirmOrder() throws ExecutionException, InterruptedException {

        //构建OrderConfirmVo
        OrderConfirmVo confirmVo = new OrderConfirmVo();

        //获取当前用户登录的信息
        MemberResponseVo memberResponseVo = LoginUserInterceptor.loginUser.get();

        //TODO :获取当前线程请求头信息(解决Feign异步调用丢失请求头问题)
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

        //开启第一个异步任务
        CompletableFuture<Void> addressFuture = CompletableFuture.runAsync(() -> {

            //每一个线程都来共享之前的请求数据
            RequestContextHolder.setRequestAttributes(requestAttributes);

            //1、远程查询所有的收获地址列表
            List<MemberAddressVo> address = memberFeignService.getAddress(memberResponseVo.getId());
            confirmVo.setMemberAddressVos(address);
        }, threadPoolExecutor);

        //开启第二个异步任务
        CompletableFuture<Void> cartInfoFuture = CompletableFuture.runAsync(() -> {

            //每一个线程都来共享之前的请求数据
            RequestContextHolder.setRequestAttributes(requestAttributes);

            //2、远程查询购物车所有选中的购物项
            List<OrderItemVo> currentCartItems = cartFeignService.getCurrentCartItems();
            confirmVo.setItems(currentCartItems);
            //feign在远程调用之前要构造请求，调用很多的拦截器
        }, threadPoolExecutor).thenRunAsync(() -> {
            List<OrderItemVo> items = confirmVo.getItems();
            //获取全部商品的id
            List<Long> skuIds = items.stream()
                    .map((itemVo -> itemVo.getSkuId()))
                    .collect(Collectors.toList());

            //远程查询商品库存信息
            R skuHasStock = wmsFeignService.getSkuHasStock(skuIds);
            List<SkuStockVo> skuStockVos = skuHasStock.getData("data", new TypeReference<List<SkuStockVo>>() {});

            if (skuStockVos != null && skuStockVos.size() > 0) {
                //将skuStockVos集合转换为map
                Map<Long, Boolean> skuHasStockMap = skuStockVos.stream().collect(Collectors.toMap(SkuStockVo::getSkuId, SkuStockVo::getHasStock));
                confirmVo.setStocks(skuHasStockMap);
            }
        },threadPoolExecutor);

        //3、查询用户积分
        Integer integration = memberResponseVo.getIntegration();
        confirmVo.setIntegration(integration);

        //4、价格数据自动计算

        //TODO 5、防重令牌(防止表单重复提交)
        //为用户设置一个token，三十分钟过期时间（存在redis）
        String token = UUID.randomUUID().toString().replace("-", "");
        redisTemplate.opsForValue().set(USER_ORDER_TOKEN_PREFIX+memberResponseVo.getId(),token,30, TimeUnit.MINUTES);
        confirmVo.setOrderToken(token);


        CompletableFuture.allOf(addressFuture,cartInfoFuture).get();

        return confirmVo;
    }
```

以下是提交按钮的Controller:
```java
/**
     * 下单功能
     * @param vo
     * @return
     */
    @PostMapping(value = "/submitOrder")
    public String submitOrder(OrderSubmitVo vo, Model model, RedirectAttributes attributes) {

        try {
            SubmitOrderResponseVo responseVo = orderService.submitOrder(vo);
            //下单成功来到支付选择页
            //下单失败回到订单确认页重新确定订单信息
            if (responseVo.getCode() == 0) {
                //成功
                model.addAttribute("submitOrderResp",responseVo);
                return "pay";
            } else {
                String msg = "下单失败";
                switch (responseVo.getCode()) {
                    case 1: msg += "令牌订单信息过期，请刷新再次提交"; break;
                    case 2: msg += "订单商品价格发生变化，请确认后再次提交"; break;
                    case 3: msg += "库存锁定失败，商品库存不足"; break;
                }
                attributes.addFlashAttribute("msg",msg);
                return "redirect:http://order.gulimall.com/toTrade";
            }
        } catch (Exception e) {
            if (e instanceof NoStockException) {
                String message = ((NoStockException)e).getMessage();
                attributes.addFlashAttribute("msg",message);
            }
            return "redirect:http://order.gulimall.com/toTrade";
        }
    }
```

以下是上述Controller中`orderService.submitOrder`服务的业务代码:
```
/**
     * 提交订单
     * @param vo
     * @return
     */
    // @Transactional(isolation = Isolation.READ_COMMITTED) 设置事务的隔离级别
    // @Transactional(propagation = Propagation.REQUIRED)   设置事务的传播级别
    @Transactional(rollbackFor = Exception.class)
    // @GlobalTransactional(rollbackFor = Exception.class)
    @Override
    public SubmitOrderResponseVo submitOrder(OrderSubmitVo vo) {

        confirmVoThreadLocal.set(vo);

        SubmitOrderResponseVo responseVo = new SubmitOrderResponseVo();
        //去创建、下订单、验令牌、验价格、锁定库存...

        //获取当前用户登录的信息
        MemberResponseVo memberResponseVo = LoginUserInterceptor.loginUser.get();
        responseVo.setCode(0);

        //1、验证令牌是否合法【令牌的对比和删除必须保证原子性】
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        String orderToken = vo.getOrderToken();

        //通过lure脚本原子验证令牌和删除令牌
        Long result = redisTemplate.execute(new DefaultRedisScript<Long>(script, Long.class),
                Arrays.asList(USER_ORDER_TOKEN_PREFIX + memberResponseVo.getId()),
                orderToken);

        if (result == 0L) {
            //令牌验证失败
            responseVo.setCode(1);
            return responseVo;
        } else {
            //令牌验证成功
            //1、创建订单、订单项等信息
            OrderCreateTo order = createOrder();

            //2、验证价格
            BigDecimal payAmount = order.getOrder().getPayAmount();
            BigDecimal payPrice = vo.getPayPrice();

            if (Math.abs(payAmount.subtract(payPrice).doubleValue()) < 0.01) {
                //金额对比
                //TODO 3、保存订单
                saveOrder(order);

                //4、库存锁定,只要有异常，回滚订单数据
                //订单号、所有订单项信息(skuId,skuNum,skuName)
                WareSkuLockVo lockVo = new WareSkuLockVo();
                lockVo.setOrderSn(order.getOrder().getOrderSn());

                //获取出要锁定的商品数据信息
                List<OrderItemVo> orderItemVos = order.getOrderItems().stream().map((item) -> {
                    OrderItemVo orderItemVo = new OrderItemVo();
                    orderItemVo.setSkuId(item.getSkuId());
                    orderItemVo.setCount(item.getSkuQuantity());
                    orderItemVo.setTitle(item.getSkuName());
                    return orderItemVo;
                }).collect(Collectors.toList());
                lockVo.setLocks(orderItemVos);

                //TODO 调用远程锁定库存的方法
                //出现的问题：扣减库存成功了，但是由于网络原因超时，出现异常，导致订单事务回滚，库存事务不回滚(解决方案：seata)
                //为了保证高并发，不推荐使用seata，因为是加锁，并行化，提升不了效率,可以发消息给库存服务
                R r = wmsFeignService.orderLockStock(lockVo);
                if (r.getCode() == 0) {
                    //锁定成功
                    responseVo.setOrder(order.getOrder());
                    // int i = 10/0;

                    //TODO 订单创建成功，发送消息给MQ
                    rabbitTemplate.convertAndSend("order-event-exchange","order.create.order",order.getOrder());

                    //删除购物车里的数据
                    redisTemplate.delete(CART_PREFIX+memberResponseVo.getId());
                    return responseVo;
                } else {
                    //锁定失败
                    String msg = (String) r.get("msg");
                    throw new NoStockException(msg);
                    // responseVo.setCode(3);
                    // return responseVo;
                }

            } else {
                responseVo.setCode(2);
                return responseVo;
            }
        }
    }

```








