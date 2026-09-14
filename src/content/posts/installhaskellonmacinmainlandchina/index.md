---
title: 在中国特色网络环境下安装Mac的Haskell开发环境
slug: installhaskellonmacinmainlandchina
date: '2021-07-26T07:18:55.321Z'
categories:
- Notes
tags:
- Haskell
cover: ./1501481039138714.jpg-a84e5bdf7b5c4abea8f3b635d80728f3.png
original_permalink: /archives/installhaskellonmacinmainlandchina
---

# Intro

Thanks to GFW, it is extremely hard for Chinese people to get access to package resources on the Internet. After suffering, I managed to deploy Haskell development environment on my Mac.

感谢墙，我们国内人在访问外网资源上体验到了无与伦比的体验。我费了九牛二虎之力在Mac里安装上了Haskell开发环境，特此记录。

# Steps

## 1. Install the Homebrew
安装Homebrew包管理器，如果没有的话...
 
```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

*Homebrew supports breakpoint continuingly, which is important in a bad network condition.*

*这货能支持断点续传，尤其适合网络不稳定的地方。*


## 2. Change Homebrew's package mirror

```shell
git -C "$(brew --repo)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git
git -C "$(brew --repo homebrew/cask)" remote set-url origin https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask.git
```

*Tsinghua University's*
*清华NB*

## 3. Install with homebrew
```shell
brew install ghc
brew install cabal-install
brew install haskell-stack
```

*They are Haskell Compiler, package management and integration tools.*
*这仨分别是Haskell编译器，和俩包管理器之类的东西。*

## 4. Change cabal mirror
At first, run:
```shell
cabal update
```

After the shell generated the `~/.cabal/config` configuration file,  proceed to the next step. 
等你执行了上个命令，就会生成config文件，继续下一步。


Edit `~/.cabal/config`，add:
使用vim编辑之：

```text
repository mirrors.tuna.tsinghua.edu.cn
  url: http://mirrors.tuna.tsinghua.edu.cn/hackage
```
To speed up downloading, we can comment out the official repository.
考虑下把原镜像源也注释掉吧。

## 5. Change stack mirror

At first, run:
```shell
stack update
```

Then go to `~/.stack`

Edit `~/.cabal/config.yaml`，add:


```text
package-indices:
  - download-prefix: http://mirrors.tuna.tsinghua.edu.cn/hackage/
    hackage-security:
        keyids:
        - 0a5c7ea47cd1b15f01f5f51a33adda7e655bc0f0b0615baa8e271f4c3351e21d
        - 1ea9ba32c526d1cc91ab5e5bd364ec5e9e8cb67179a471872f6e26f0ae773d42
        - 280b10153a522681163658cb49f632cde3f38d768b736ddbc901d99a1a772833
        - 2a96b1889dc221c17296fcc2bb34b908ca9734376f0f361660200935916ef201
        - 2c6c3627bd6c982990239487f1abd02e08a02e6cf16edb105a8012d444d870c3
        - 51f0161b906011b52c6613376b1ae937670da69322113a246a09f807c62f6921
        - 772e9f4c7db33d251d5c6e357199c819e569d130857dc225549b40845ff0890d
        - aa315286e6ad281ad61182235533c41e806e5a787e0b6d1e7eef3f09d137d2e9
        - fe331502606802feac15e514d9b9ea83fee8b6ffef71335479a2e68d84adc6b0
        key-threshold: 3 # number of keys required

        # ignore expiration date, see https://github.com/commercialhaskell/stack/pull/4614
        ignore-expiry: no
```

## 6. Done
F*** the GFW.
我爱你，墙。
