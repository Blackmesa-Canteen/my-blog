---
title: 'Solving Conda Matplotlib import error: version ''GLIBCXX_3.4.29'' not found'
slug: solvingcondamatplotlibimporterrorrootminiconda3binliblibstdcso6versionglibcxx3429notfound
date: '2023-02-06T01:11:43.726Z'
categories:
- Notes
- Utilities
tags:
- Development
- Notes
original_permalink: /archives/solvingcondamatplotlibimporterrorrootminiconda3binliblibstdcso6versionglibcxx3429notfound
---

# Bug Description

After conda install matplotlib and try to import, the bug shows up:
```
ImportError: /root/miniconda3/bin/../lib/libstdc++.so.6: version `GLIBCXX_3.4.29' not found (required by /root/miniconda3/lib/python3.8/site-packages/matplotlib/_path.cpython-38-x86_64-linux-gnu.so)
```

# solution
Stackoverflow: 
[GLIBCXX_3.4.20 not found, how to fix this error?](https://askubuntu.com/questions/575505/glibcxx-3-4-20-not-found-how-to-fix-this-error/764572#764572)
