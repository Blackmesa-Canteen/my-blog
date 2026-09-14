---
title: Can not find python modules while running python project in console
slug: cannotfindpythonmoduleswhilerunningpythonprojectinconsole
date: '2022-04-29T02:04:42.204Z'
categories:
- Notes
- Random
- Utilities
tags:
- Python
- Development
- Notes
original_permalink: /archives/cannotfindpythonmoduleswhilerunningpythonprojectinconsole
---

# Problem

I can run my python project in PyCharm, but if I try to run the project with console, like `python app.py`, I got "modules not found" errors. 

I can ensure that all dependencies are installed via `pip install -r requirements.txt`.

# Solution

Add code snippts below at the start of the entrance `app.py` file of the project.

```python
import sys
import os

curPath = os.path.abspath(os.path.dirname(__file__))
rootPath = os.path.split(curPath)[0]
sys.path.append(rootPath)
```

Then I can run the python project in console.
