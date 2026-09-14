---
title: A useful util for Python to get project path
slug: ausefulutilforpythontogetprojectpath
date: '2022-03-18T23:00:52.012Z'
categories:
- Notes
- Utilities
tags:
- Python
- Development
- Notes
original_permalink: /archives/ausefulutilforpythontogetprojectpath
---

```python
# desc: get root path

import sys
import os

from src.util.singleton_decorator import singleton


@singleton
class PathUtil(object):
    """tools for get project root path"""

    def __init__(self):
        # 判断调试模式
        debug_vars = dict((a, b) for a, b in os.environ.items()
                          if a.find('IPYTHONENABLE') >= 0)
        # 根据不同场景获取根目录
        if len(debug_vars) > 0:
            """当前为debug运行时"""
            self.__rootPath = sys.path[2]
        elif getattr(sys, 'frozen', False):
            """当前为exe运行时"""
            self.__rootPath = os.getcwd()
        else:
            """正常执行"""
            self.__rootPath = sys.path[1]
        # 替换斜杠
        self.__rootPath = self.__rootPath.replace("\\", "/")

    def get_root_path(self):
        return self.__rootPath


if __name__ == '__main__':
    """test"""
    # path = PathUtil.getPathFromResources("context.ini")
    PathUtil = PathUtil()
    print(PathUtil.get_root_path())

```

Note: `@singleton` is decorator of singleton, the code is below:
```python
# desc: Quick decorator for singleton pattern

def singleton(cls, *args, **kw):
    __instance = {}

    def get_instance():
        if cls not in __instance:
            __instance[cls] = cls(*args, **kw)
        return __instance[cls]

    return get_instance

```
