---
title: '[Docker] Docker Beginner''''s handbook'
slug: dockerdockerbeginnershandbook
date: '2021-07-03T00:35:11Z'
categories:
- Notes
tags:
- Docker
cover: ./u=2381918978,1148632685&fm=26&fmt=auto&gp=0-95697b870afc4612888be0fbdd6926b3.jpg
original_permalink: /archives/dockerdockerbeginnershandbook
---


** Sorry for Chinese content. These are my notes. **

# Docker 入门

## *镜像基本命令*

---

### 基本的

```shell
docker version # 版本信息
docker info # detailed message
docker [command] --help # help for ###
docker stats # see CPU status
```

---

### About Images

```shell
docker images # see all images locally
docker search [name] # search the image on Hub
docker pull [name] # download the image
docker rmi [name/id] # remove image
```

---

### About Containers

***run***

```shell
docker run [name/id] # run a container
# Arguments
-d # background,
-it # interaction,
-p # assign port # 8080:8080 host port:container port 

# eg: docker run -it centos /bin/bash 

docker ps # see running containers now
# Arguments
-a # see all recently run containers
-n=? # see all containers created recently, ? means showing number
```

***exit***

```shell
exit # when in a container, exit
# hotkeys
control + P + Q # when in a container, exit, but remains background
```

***delete***

```shell
docker rm [id] # remove container
docker rm -f $(docker ps -aq) # rm all containers by their id recursively
docker ps -a -q|xargs docker rm # rm all containers with pipeline command
```

***start and stop***

```shell
docker start [id]
docker restart [id]
docker stop [id]
docker kill [id]
```

---

### Other frequently used commands

***start container from background***

```shell
docker start -d [id]
# CAUTION: if the container doesn't have things to run, it will stop
# we need a process to maintain background running

```

***see logs***

```shell
docker logs -tf [id] # see log of a container
```

***see processes inside the container***

```shell
docker top [id] # see processes inside the container
```

***see META info about container***

```shell
docker inspect [id] # see container META info
```

***enter the running container***

```shell
# 进入后台容器修改配置
# 方式一 commands
docker exec -it [id] [bashshell] 
# eg: docker exec -it 652ad135c225 /bin/bash

# 方式二 
docker attach [id]

# differences: exec will start a new Terminal and do something,
# Meanwhile, attach will not start any new things
```

***copy files from container to host***

```shell
docker cp [containerID]:[containerPath] [targetPath]
# tips: this is a manually method, we can use -v tech to achieve automatically sync
```

---

## *可视化*

### portainer

***what?***

Docker的图形化管理工具。[其实可以用Docker Hub的]

***install&run***

```shell
Docker run -d -p 8088:9000 --restart=always \
-v /var/run/docker.sock:/var/run/docker.sock \
--privileged=true portainer/portainer
```

---

## *联合文件系统*

类似于Git

---

## 镜像提交

```shell
docker commit # commit a container as a new image
docker commit -m="message" -a="author" [id] [ImageName]: [TAG]
```

---

# Docker 进阶

## 容器数据卷

用于实现数据持久化. 一种数据共享技术，可以把docker的数据同步到本地挂载,也可以容器间共享。

***使用***

- 方式一 使用命令

  ```shell
  docker run -it -v hostDir:containerDir
  # eg: docker run -it -v ~/testDir:/home centos /bin/bash
  ```



## MySQL数据持久化问题

```shell
docker run -p 3310:3306 -v ~/mysqlContainer/conf:/etc/mysql/conf.d -v ~/mysqlContainer/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=root -d --name mysql01 mysql:latest
```

就算把容器删除，本地的数据卷不会丢失。

---

## Dockerfile

事用来构建docker镜像的文件，公司交作业要用到

***步骤***

1. 编写dockerfile文件
2. docker build 构建成为一个镜像
3. docker run 运行
4. docker push 发布

***例子：centos的***

```shell
FROM scratch
ADD centos-8-x86_64.tar.xz /
LABEL org.label-schema.schema-version="1.0"     org.label-schema.name="CentOS Base Image"     org.label-schema.vendor="CentOS"     org.label-schema.license="GPLv2"     org.label-schema.build-date="20201204"
CMD ["/bin/bash"]
```

***常用命令图解***

![命令图解](./placeholder.png)
<!-- original image (unavailable): https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3622110164,3202557425&fm=26&gp=0.jpg -->

***Build***

1. 每个保留字必须大写字母
2. 指令从上到下
3. 每一个指令会创造一个镜像层

***具体指令***

```shell
FROM # 基础镜像，一切从这里构建
MAINTAINER # 镜像作者, Name + Email
RUN # 镜像构建的时候需要运行的命令
ADD # 步骤：比如tomcat镜像，添加tomcat压缩包
WORKDIR # 设置镜像的工作目录
VOLUME # 挂载数据卷
EXPOSE # 设置暴露的端口
CMD # 指定容器启动时运行的命令，可被替代
ENTRYPOINT # 指定启动时运行的命令，可以追加
ONBUILD # 当构建一个被继承DockerFile，会运行ONBUILD指令
COPY # 类似ADD，将文件copy到镜像中
ENV # 设置环境变量
RUN
```

***Build ur own centos***

1. 写Dockerfile

```shell
# mycentos Dockerfile
FROM centos
MAINTAINER learner<dagongren@996workers.icu>

ENV MYPATH /usr/local
WORKDIR $MYPATH

RUN yum -y install vim
RUN yum -y install net-tools

EXPOSE 80

CMD echo $MYPATH
CMD echo "---end---"
CMD /bin/bash
```

2. 构建docker镜像

   ```shell
   docker build -f mydockerfile -t mycentos:0.1 .
   ```

***CMD和ENTRYPOINT区别***

```shell
CMD # 指定容器启动时运行的命令，可被替代
# 只有最后一个命令会生效
ENTRYPOINT # 指定启动时运行的命令，可以追加
# 在start时，可以继续追加命令
```

---

## 实例：Tomcat镜像

建立了一个文件夹，内容如下：

```shell
Dockerfile                  jdk-8u281-linux-x64.tar
apache-tomcat-9.0.43.tar.gz readme.txt
```

在Dockerfile里写:

```shell
FROM centos
MAINTAINER learner<dagongren@996workers.icu>

COPY readme.txt /usr/local/readme.txt

ADD jdk-8u281-linux-x64.tar /usr/local/
ADD apache-tomcat-9.0.43.tar.gz /usr/local/

RUN yum -y install vim

ENV MYPATH /usr/local
WORKDIR $MYPATH

ENV JAVA_HOME /usr/local/jdk1.8.0_281
ENV CLASSPATH $JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
ENV CATALINA_HOME /usr/local/apache-tomcat-9.0.43
ENV CATALINA_BASE /usr/local/apache-tomcat-9.0.43
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/lib:$CATALINA_HOME/bin

EXPOSE 8080

CMD /usr/local/apache-tomcat-9.0.43/bin/startup.sh && tail -F /usr/local/apache-tomcat-9.0.43/logs/catalina.out
```

构建

```shell
docker build -t diytomcat .
```

运行

```shell
docker run -d -p 9090:8080 --name learntomcat -v /Users/shaotienlee/dockerFiles/volume/test:/usr/local/apache-tomcat-9.0.43/webapps/test -v /Users/shaotienlee/dockerFiles/volume/logs:/usr/local/apache-tomcat-9.0.43/logs diytomcat
```

发布测试(在本地卷编写就可以发布了)

## 发布

- Docker Hub 

  去那网上注册个账号，然后

  ```shell
  docker login --help
  docker push [username]/[imagename]:[tag]
  ```
