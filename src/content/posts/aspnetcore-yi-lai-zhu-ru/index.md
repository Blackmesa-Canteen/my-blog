---
title: ASP.NET Core依赖注入
slug: aspnetcore-yi-lai-zhu-ru
date: '2022-07-18T05:20:49.782Z'
categories:
- Notes
- Learning
- Utilities
tags:
- Development
- Notes
- .NET
original_permalink: /archives/aspnetcore-yi-lai-zhu-ru
---

# 用途
让.NET框架负责实例化并且注入对象，不用程序员自己手动new对象，从而降低耦合和劳力。
# 步骤
## 1. 注册服务
首先在`Program.cs`里注册自己的对象。例如
```c#
builder.Services.AddSingleton<IUserBll, UserBll>();
```
其中，泛型的第一个是接口，第二个是具体实现类。然后会把该实现类注入到对应接口的字段里。

另外，可以注册三种类型的Bean：
- Singleton： 单例生命周期。单例生命周期服务在它们第一次被请求时创建，并且每个后续请求将使用相同的实例。
- Scoped：作用域生命周期。作用域生命周期服务在每次请求时被创建一次。在同一个页面内多个Scoped是相同的，在不同页面中是不同的.
- Transient：瞬时生命周期。瞬时生命周期服务在它们每次请求时被创建。这一生命周期适合轻量级的、无状态的服务。对象对每个对象和每个请求是相同的. 同一个页面内的Transient也是不同的.

>复习：Java Spring Boot Bean的Scope： singleton - 在Spring的IoC容器中只存在一个对象实例，所有该对象的引用都共享这个实例，适合无状态的bean；prototype - 每次对该bean的请求都会创建一个新的实例。request -  每次http请求将会有各自的bean实例，类似于prototype。session - 每个http session对应一个bean实例。application -  application作用域表示该针对整个web项目生命周期。global session - 类似于标准的HTTP Session作用域，不过它仅仅在基于portlet的web应用中才有意义。

## 2. 注入
在控制器中，框架会通过Controller的构造器实现注入，例如:
```c#
[Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IUserBll userBll;

        public LoginController(IUserBll userBll)
        {
            this.userBll = userBll;
        }
        [HttpGet]
        public string Get(string userNo, string password)
        {
            return userBll.CheckLogin(userNo, password) ? "Success." : "denied.";
        }
    }
```

