---
title: 'Understanding Module Syntax Conflict in Node.js: CommonJS vs ES6'
slug: understanding-module-syntax-conflict-in-node.js-commonjs-vs-es6
date: '2023-12-15T05:50:00Z'
categories:
- Learning
- Notes
tags:
- Notes
original_permalink: /archives/understanding-module-syntax-conflict-in-node.js-commonjs-vs-es6
---

# Intro
Node.js, a popular JavaScript runtime, has traditionally used the CommonJS module system for managing dependencies. However, with the evolution of JavaScript standards, ES6 (ECMAScript 6) introduced a new module system. 

This difference often leads to confusion and bugs I met today, especially when developers try to mix these two systems in their projects. 
```
2024-01-02T05:27:56.173Z	undefined	ERROR	Uncaught Exception 	{
    "errorType": "Runtime.UserCodeSyntaxError",
    "errorMessage": "SyntaxError: Cannot use import statement outside a module",
    "stack": [
        "Runtime.UserCodeSyntaxError: SyntaxError: Cannot use import statement outside a module",
        "    at _loadUserApp (file:///var/runtime/index.mjs:1084:17)",
        "    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1119:21)",
        "    at async start (file:///var/runtime/index.mjs:1282:23)",
        "    at async file:///var/runtime/index.mjs:1288:1"
    ]
}
```

In this article, we'll explore the causes of the `SyntaxError: Cannot use import statement outside a module` error and how to resolve it.
## CommonJS vs ES6 Modules: The Key Differences
**CommonJS** is the standard used in Node.js for a long time. It uses `require` and `module.exports` to handle dependencies and modules. It's designed for server-side development and is synchronous in nature. A typical CommonJS import looks like this:
```javascript
const express = require('express');
```
**ES6 Modules**, on the other hand, are part of the ECMAScript standard and are designed with both server and client-side JavaScript in mind. They use `import` and `export` statements and are asynchronous. An ES6 import example is:
```javascript
import express from 'express';
```
## The SyntaxError Issue
The issue arises when developers try to mix these two module systems in the same file. Node.js treats files as CommonJS modules by default, so using ES6 `import` statements directly leads to the "Cannot use import statement outside a module" error.
### Scenario and Error Message
Consider the following code snippet:
```javascript
const express = require('express');
// Other CommonJS require statements
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
```
This mixture results in a runtime error:
```plaintext
SyntaxError: Cannot use import statement outside a module
```
## Resolving the Syntax Conflict
### Option 1: Stick to CommonJS
If you're working in an environment that predominantly uses CommonJS, the simplest solution is to convert all ES6 imports to CommonJS `require`:
```javascript
const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
```
### Option 2: Switch to ES6 Modules
For environments supporting ES6 modules (like recent versions of Node.js), you can convert all `require` statements to `import`. Additionally, you'll need to add `"type": "module"` in your `package.json`.
```javascript
import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
```
## Conclusion
Understanding the difference between CommonJS and ES6 modules is crucial for Node.js developers. While the transition to ES6 modules offers many benefits, it's important to use them consistently within a project to avoid syntax errors. Depending on your project's requirements and environment, choose the module system that best suits your needs.
