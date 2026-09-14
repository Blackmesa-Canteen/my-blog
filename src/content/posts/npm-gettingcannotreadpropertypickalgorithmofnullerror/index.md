---
title: npm - Getting "Cannot read property 'pickAlgorithm' of null" error
slug: npm-gettingcannotreadpropertypickalgorithmofnullerror
date: '2022-12-07T19:59:46.690Z'
categories:
- Notes
- Random
- Utilities
tags:
- Development
- Javascript
- Web
original_permalink: /archives/npm-gettingcannotreadpropertypickalgorithmofnullerror
---

# Issue
When run `npm install`, the error `npm - Getting "Cannot read property 'pickAlgorithm' of null" error` occurs;

# Solution
```shell
npm cache clear --force

npm install
```
