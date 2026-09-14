---
title: 解决使用Springboot的Shiro框架时，URL 请求包含中文字符报400错误的问题。
slug: cantusechinesecharactersingetmethodwhileusingshiro17
date: '2021-07-24T15:22:36.317Z'
categories:
- Notes
tags:
- SpringBoot
- Shiro
cover: ./src=http---pic1.zhimg.com-v2-0e96436a999ac26218fc54344799c859_1200x500.jpg&refer=http---pic1.zhimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg-f4aa1ed1bf2948b4963a856ccd30163f.jpg
original_permalink: /archives/cantusechinesecharactersingetmethodwhileusingshiro17
---

# Problem
When I'm using shiro in my springboot blog project, if URL contains Chinese characters, e.g. `/search/搜索文本`, the response will be 400(Bad Request).

很坑哦，使用Springboot的Shiro框架1.7以上版本会有这样的问题，即当URL	请求包含中文字符，传入后台时，会报400错误。

# Reason
Shiro 1.7 + blocks non-ASCII paths
Shiro 1.7以上会阻止非ASCII字符的路径。

# Solution

**STEP 1**
Write my own `ShiroFilterFactoryBean`, where I need also define `MySpringShiroFilter`.
自己重写一个`ShiroFilterFactoryBean`，在其中自定义一个自己的过滤器。


```java
public class CustomShiroFilaterFactoryBean extends ShiroFilterFactoryBean {

    private static final class MySpringShiroFilter extends AbstractShiroFilter
    {
        protected MySpringShiroFilter(WebSecurityManager webSecurityManager, FilterChainResolver resolver)
        {
            if (webSecurityManager == null)
            {
                throw new IllegalArgumentException("WebSecurityManager property cannot be null.");
            }
            else
            {
                this.setSecurityManager(webSecurityManager);
                if (resolver != null)
                {
                    this.setFilterChainResolver(resolver);
                }

            }
        }
    }

    @Override
    public Class<MySpringShiroFilter> getObjectType()
    {
        return MySpringShiroFilter.class;
    }

    @Override
    protected AbstractShiroFilter createInstance() throws Exception
    {

        SecurityManager securityManager = getSecurityManager();
        if (securityManager == null)
        {
            String msg = "SecurityManager property must be set.";
            throw new BeanInitializationException(msg);
        }

        if (!(securityManager instanceof WebSecurityManager))
        {
            String msg = "The security manager does not implement the WebSecurityManager interface.";
            throw new BeanInitializationException(msg);
        }

        FilterChainManager manager = createFilterChainManager();
        // Expose the constructed FilterChainManager by first wrapping it in a
        // FilterChainResolver implementation. The AbstractShiroFilter implementations
        // do not know about FilterChainManagers - only resolvers:
        PathMatchingFilterChainResolver chainResolver = new PathMatchingFilterChainResolver();
        chainResolver.setFilterChainManager(manager);

        Map<String, Filter> filterMap = manager.getFilters();
        Filter invalidRequestFilter = filterMap.get(DefaultFilter.invalidRequest.name());
        if (invalidRequestFilter instanceof InvalidRequestFilter)
        {
            // 此处是关键,设置false跳过URL携带中文400，servletPath中文校验bug
	   // 后续版本可能再也不能设置这个了，因为setBlockNonAscii方法可能要作废
            ((InvalidRequestFilter) invalidRequestFilter).setBlockNonAscii(false);
        }
        // Now create a concrete ShiroFilter instance and apply the acquired SecurityManager and built
        // FilterChainResolver. It doesn't matter that the instance is an anonymous inner class
        // here - we're just using it because it is a concrete AbstractShiroFilter instance that accepts
        // injection of the SecurityManager and FilterChainResolver:
        return new MySpringShiroFilter((WebSecurityManager) securityManager, chainResolver);
    }
}

```

**STEP 2**
Configure my filter factory bean in `ShiroConfig`.
把上述定义好的自定义工厂设置到`ShiroConfig`类中。

```java
//ShiroFilter过滤所有请求
    @Bean
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(DefaultWebSecurityManager securityManager) {

	// 自己定义的那个filter factory bean
        CustomShiroFilaterFactoryBean shiroFilterFactoryBean = new CustomShiroFilaterFactoryBean();
        //给ShiroFilter配置安全管理器
        shiroFilterFactoryBean.setSecurityManager(securityManager);
        Map<String, String> map = new LinkedHashMap<>();
        // 配置不会被拦截的链接 顺序判断
        map.put("/static/**", "anon");
        map.put("/yecgaa/login", "anon");
        map.put("/yecgaa/dist/**", "anon");
        map.put("/yecgaa/plugins/**", "anon");

        // 配置退出 过滤器,其中的具体的退出代码Shiro已经替我们实现了
        map.put("/yecgaa/logout", "logout");
        // authc:所有url都必须认证通过才可以访问; anon:所有url都都可以匿名访问
        map.put("/yecgaa/**","authc");//表示这个资源需要认证和授权
        // 设置认证界面路径
        shiroFilterFactoryBean.setLoginUrl("/yecgaa/login");
        shiroFilterFactoryBean.setSuccessUrl("/yecgaa/index");
        shiroFilterFactoryBean.setUnauthorizedUrl("/404");

        shiroFilterFactoryBean.setFilterChainDefinitionMap(map);

        return shiroFilterFactoryBean;
    }
```
