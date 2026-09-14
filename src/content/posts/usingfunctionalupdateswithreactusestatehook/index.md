---
title: Using Functional Updates with React useState Hook!
slug: usingfunctionalupdateswithreactusestatehook
date: '2023-07-31T00:00:31.235Z'
categories:
- Notes
- Random
- Utilities
tags:
- React.js
original_permalink: /archives/usingfunctionalupdateswithreactusestatehook
---

# Intro
React has made it super easy to manage state in functional components with the `useState` hook. However, it can behave unexpectedly if we don't use it correctly, particularly when our state updates depend on the previous state values. Today, we're going to discuss how we can effectively use functional updates to prevent state inconsistencies in our React applications.

# What's The Issue?

Let's illustrate this problem with an example. We have a React component with a state `count` initialized to `0`, and a function that attempts to increment `count` by `1`, three times:

```javascript
const App = () => {
  const [count, setCount] = useState(0);

  const handleParamClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
};
```

You might expect `count` to be incremented by `3` after `handleParamClick` is called. But if you run this code, you'll find that `count` only increments by `1`. Why does this happen?

# Understanding State Updates in React

In React, state updates are asynchronous. This means that the update doesn't take effect immediately. Instead, React batches these updates and applies them later as part of the re-rendering process.

In our example, all three `setCount` calls happen in the same rendering cycle. When `setCount` is called, all three see the same `count` value, and they all set `count` to `count + 1`, which results in a net increment of just `1`.

## The Solution: Functional Updates

React provides a solution to this problem in the form of functional updates. When you pass a function to the state setter function returned by `useState`, React will call that function with the current state value, and this function is expected to return the new state value.

Let's modify our `handleParamClick` function to use a functional update:

```javascript
const handleCbClick = () => {
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
};
```

Now, each `setCount` call correctly increments the latest `count` value by `1`, resulting in a net increment of `3`.

## Functional Updates and Closures

This principle is even more important when using JavaScript closures, for instance, inside a `useEffect` hook with a timer:

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // This won't work as expected
  }, 500);
  return () => clearInterval(timer);
}, []);
```

The `count` value inside `setInterval` is captured from the closure at the time `useEffect` runs, which leads to unexpected results because `count` doesn't get updated with each timer tick.

However, by using a functional update inside `setInterval`, we get the correct, current `count` value each time:

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count => count + 1); // This works correctly
  }, 500);
  return () => clearInterval(timer);
}, []);
```

# Conclusion

Functional updates are crucial when dealing with state that depends on previous state values in React, particularly when making multiple state updates in the same event handler. By understanding and using functional updates, we can ensure our React applications behave as expected, providing a better user experience.
