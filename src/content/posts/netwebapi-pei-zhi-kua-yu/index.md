---
title: .NET WebApi配置跨域
slug: netwebapi-pei-zhi-kua-yu
date: '2022-07-16T04:47:59.454Z'
categories:
- Notes
- Random
- Improvement
- Utilities
tags:
- Development
- Notes
- .NET
original_permalink: /archives/netwebapi-pei-zhi-kua-yu
---

# 步骤
在`Program.cs`书写以下代码, **注意： 写在app.UseAuthorization()之前**：
```c#
app.UseCors(build =>
{
    build.SetIsOriginAllowed(_ => true)
        .AllowCredentials()
        .AllowAnyHeader();
});
```

然后就可以跨域调用Api了。
