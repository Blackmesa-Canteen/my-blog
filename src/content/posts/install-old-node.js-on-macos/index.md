---
title: Install old Node.js on MacOS
slug: install-old-node.js-on-macos
date: '2025-05-16T13:18:46.965166120Z'
original_permalink: /archives/install-old-node.js-on-macos
---

# Issue

Install old version node failed. Terminal outputs:

```
nvm install 14
Downloading and installing node v14.21.3...
Downloading https://nodejs.org/dist/v14.21.3/node-v14.21.3-darwin-arm64.tar.xz...
curl: (22) The requested URL returned error: 404                                                                                                                                                         

Binary download from https://nodejs.org/dist/v14.21.3/node-v14.21.3-darwin-arm64.tar.xz failed, trying source.
grep: /Users/xli/.nvm/.cache/bin/node-v14.21.3-darwin-arm64/node-v14.21.3-darwin-arm64.tar.xz: No such file or directory
Provided file to checksum does not exist.
Binary download failed, trying source.
Clang v3.5+ detected! CC or CXX not specified, will use Clang as C/C++ compiler!
Local cache found: ${NVM_DIR}/.cache/src/node-v14.21.3/node-v14.21.3.tar.xz
Checksums match! Using existing downloaded archive ${NVM_DIR}/.cache/src/node-v14.21.3/node-v14.21.3.tar.xz
Reverting to nvm default version
N/A: version "default -> v20.11.0" is not yet installed.

You need to run `nvm install default` to install and use it.
$>./configure --prefix=/Users/xli/.nvm/versions/node/v14.21.3 <
Node.js configure: Found Python 3.11.7...
Please use python3.10 or python3.9 or python3.8 or python3.7 or python3.6 or python3.5 or python2.7.
nvm: install v14.21.3 failed!
```

# Cause

Older versions of Node.js lack builds for ARM architecture!

# Solution

If you have installed nvm​ using homebrew​ and are trying to install the node using command nvm install <some\_version>​, you will face errors on apple silicon machines (ARM) for versions lower than 15. Node versions older than 15 do not work on apple silicon machines (ARM) because ARM architecture is not supported. For anything under v15, you will need to install node using Rosetta 2.

1. How to open terminal in Rosetta2 mode: Go to Application -> Right click on terminal app -> Get Info -> Select "Open using Rosetta" -> Restart Terminal
2. In Terminal, write -> arch -x86\_64 zsh​

Now you will able to install any version of node (even multiple versions).
