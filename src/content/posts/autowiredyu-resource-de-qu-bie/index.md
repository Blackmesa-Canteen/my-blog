---
title: '@Autowired 与@Resource的区别'
slug: autowiredyu-resource-de-qu-bie
date: '2022-01-10T00:01:10.192Z'
categories:
- Notes
- Utilities
tags:
- Development
- Java
- SpringBoot
original_permalink: /archives/autowiredyu-resource-de-qu-bie
---

# 简介
两种注解的联系:
- @Autowired与@Resource都可以用来装配bean, 进行依赖注入. 都可以写在字段上,或写在setter方法上。@Resource的作用相当于@Autowired.

两种注解的区别:
- @Autowired按byType自动注入，而@Resource默认按 byName自动注入
- @Autowired属于Spring定义的, @Resource属于J2EE规范定义的.

# @Autowired

 @Autowired默认按类型装配（这个注解是属于Spring的），默认情况下必须要求依赖对象必须存在，如果要允许null值，可以设置它的required属性为false.

如：@Autowired(required=false) ，如果我们想使用名称装配可以结合@Qualifier注解进行使用，如下：

```
@Autowired  ()  @Qualifier  (  "baseDao"  )
private  BaseDao baseDao;
```

@Autowired是根据类型进行自动装配的。

如果当Spring上下文中存在不止一个UserDao类型的bean时，就会抛出BeanCreationException异常.

如果Spring上下文中不存在UserDao类型的bean，也会抛出BeanCreationException异常。

我们可以使用@Qualifier配合@Autowired来解决这些问题。如下：

1. 当存在多个UserDao实例:
```
@Autowired   
public void setUserDao(@Qualifier("userDao") UserDao userDao) {   
    this.userDao = userDao;   
}  
```
或者写为:
```
@Autowired   
@Qualifier("userServiceImpl")   
public IUserService userService;   
```

2. 可能不存在的UserDao实例
```
@Autowired(required = false)   
public IUserService userService  
```

# @Resource
@Resource（这个注解属于J2EE的），默认按照名称进行装配，名称可以通过name属性进行指定，如果没有指定name属性，当注解写在字段上时，默认取字段名进行安装名称查找，如果注解写在setter方法上默认取属性名进行装配。

当找不到与名称匹配的bean时才按照类型进行装配。但是需要注意的是，如果name属性一旦指定，就只会按照名称进行装配。

```
@Resource  (name=  "baseDao"  )
private  BaseDao baseDao;
```

# 总结
- @Autowired//默认按type注入
- @Qualifier("cusInfoService")//一般作为@Autowired()的修饰用
- @Resource(name="cusInfoService")//默认按name注入，可以通过name和type属性进行选择性注入
- 一般@Autowired和@Qualifier搭配使用. @Resource可单独用。
- 没有冲突的话@Autowired也可以单独用

# 附录 -- 常用Bean相关注解

## 定义Bean的注解
- @Controller
@Controller("Bean的名称")
定义控制层Bean,如Action

 

- @Service          
@Service("Bean的名称")
定义业务层Bean

 

- @Repository   
@Repository("Bean的名称")
定义DAO层Bean

 

- @Component  
定义Bean, 不好归类时使用.

- @Bean
标在能够返回对象的方法头上, 这个方法返回的实例对象放进容器里.

## 自动装配Bean
- @Autowired  (Srping提供的)
默认按类型匹配,自动装配(Srping提供的)，可以写在成员属性上,或写在setter方法上

 

- @Autowired(required=true)  
一定要找到匹配的Bean，否则抛异常。 默认值就是true 

 

- @Autowired
@Qualifier("bean的名字") 
按名称装配Bean,与@Autowired组合使用，解决按类型匹配找到多个Bean问题。

 

- @Resource   JSR-250提供的
默认按名称装配,当找不到名称匹配的bean再按类型装配.
可以写在成员属性上,或写在setter方法上
可以通过@Resource(name="beanName") 指定被注入的bean的名称, 要是未指定name属性, 默认使用成员属性的变量名,一般不用写name属性.

- @Resource(name="beanName")指定了name属性,按名称注入但没找到bean, 就不会再按类型装配了.


- @Inject   是JSR-330提供的
按类型装配，功能比@Autowired少，没有使用的必要。

## 定义Bean的作用域和生命过程

- @Scope("prototype")
值有:singleton,prototype,session,request,session,globalSession

 

- @PostConstruct 
相当于init-method,使用在方法上，当Bean初始化时执行。

 

- @PreDestroy 
相当于destory-method，使用在方法上，当Bean销毁时执行。
