---
title: Haskell语法现象总结(2-list及递归)
slug: haskell-list
date: '2021-08-08T08:45:25.082Z'
categories:
- Learning
tags:
- Haskell
cover: ./1501481039138714.jpg-a84e5bdf7b5c4abea8f3b635d80728f3.png
original_permalink: /archives/haskell-list
---

# 1. Lists, recursively defined
## 1.1 defination
Lists—as in linked lists—are pretty much Haskell's most fundamental data structure. We will certainly use them a lot this semester.

Like most things in Haskell, lists are defined entirely recursively:

- Base case: the empty list is written []
- Recursive case: a non-empty list is written x:list where x is the list's first element, and list is the rest of the list (which is itself a list).
In other words, to build a list in Haskell, you start with [] and prepend elements one at a time with : until you are done.

Here's an example of such a list of characters:
```haskell
'h':('e':('l':('l':('o':[]))))
```

Of course, we don't actually write lists recursively like that. Here's an equivalent expression:
```haskell
['h','e','l','l','o']
```

## 1.2 Generate a list
When we get tired of typing out long lists, we can also generate them using range notation.

To generate the list `[1,2,3,4,5,6]`, we could just write `[1..6]`

It also works with characters:

`['a'..'e']` gives `['a','b','c','d','e']`
You can also control the step size by giving the first two elements:

`[1,2..6]` gives `[1,2,3,4,5,6]`
`[1,3..6]` gives `[1,3,5]`
`[5,4..0]` gives `[5,4,3,2,1,0]`
In fact, there's no need to place an upper bound at all. Try entering the following lists into ghci:

`[1..]`
`[2,4..]`

---

# 2. List's pattern matching
## 2.1 Functions with lists
When writing functions with lists (recursive functions, of course), we often find two cases:

- the base case, where we handle the empty list (or, sometimes, a list of one element)
- the recursive case, where we process the first element in the list and recursively process the rest of the list
Since lists themselves are defined recursively, writing such functions is pretty easy using pattern matching and :.

For example, here's a simple recursive function to add together the numbers in a list of integers:

```haskell
sum :: [Int] -> Int
sum []     = 0
sum (x:xs) = x + sum xs
```

See the pattern `(x:xs)` in the second equation? Remember that a list is defined one element at a time using the `:` operator. `x:xs` means a list where the first element is `x` and the remaining elements are another list called `xs`.

Thus, this pattern will match any non-empty list, assigning the first element to `x` and the remaining elements to `xs`.

>Don't forget the parentheses!
If you don't include the parentheses in the recursive case above, Haskell will read the equation as (sum x):xs = x + sum xs, which makes no sense!

## 2.2 Guards
Here's another example of a recursive list function. This time, it finds the maximum element of a non-empty list of integers.

Check out the base case: it's not the empty list this time.
```haskell
maximum :: [Int] -> Int
maximum [x] = x
maximum (x:xs)
    | x > maxxs = x
    | otherwise = maxxs
    where maxxs = maximum xs
```
This example is also the first time we have a chance to show off one of Haskell's nice features for containing complex expressions: `where`.

As you can see, you can use `where` to define 'helper' variables and functions to avoid repetition of code and computation.
>Note:
A common beginner's mistake is to read maximum [x] as "maximum of the list x". However, it is [x] that is a list; it is a list which has just one element, namely x. In the definition above, [x] is a pattern which will match any singleton list (any list of one element), and only such lists.

>Note:
Don't forget | before the otherwise.

---

# 3. List functions
## 3.1 Standard functions
Common list functions like `sum` and `maximum` are already defined for you out of the box. Indeed, if you tried to re-define them, you would see an error, but still be able to run the in-built versions.

Actually, your own function search is provided for us too, but it's called elem.

There are plenty of other such in-built functions; here are a few of the most useful:

- `length` computes the number of elements in a list

- `null` returns True if a list is empty, and False otherwise

- the `!!` operator gets the nth element of a list, as in `[1,2,3,4] !! 2`, which gives us 3 (note zero-based list indexing).

- the `++` operator joins two lists together, as in `[1,2] ++ [3,4]`, which gives us [1,2,3,4]

As you use these in-built functions, you might like to think about how you could implement each of them yourself using a simple recursive Haskell function.

## 3.2 More functions
Some other common list functions are `head`, `tail`, `last`, `init`, `take` and `drop`. These functions provide different ways of taking apart lists, as shown in the examples below. In each example, we'll show the functions applied to the list `[1,2,3,4,5,6,7,8,9,10]`.
- `head` and `tail` separate a list into its first and remaining elements:
```text
1  [2,  3,  4,  5,  6,  7,  8,  9,  10]
head --'   <--------------tail-------------->
```
- `last` and `init` do just the opposite:
```text
[1,  2,  3,  4,  5,  6,  7,  8,  9]  10
 <---------------init------------>   '-- last
```
- `take n` and `drop n` split the list at an arbitrary point. For example, using 4 for n:
```text
[1,  2,  3,  4] [5,  6,  7,  8,  9,  10]
 <--take 4--->   <-------drop 4------->
```
>Note:
These function will not modify the list itself.

---

# 4. Higher-order functions
## 4.1 给函数里传函数
You may remember that in the previous module, we mentioned that in Haskell, you can pass around functions as arguments and return values in just the same way as you can pass around integers, strings or Boolean values. Functions that take other functions as arguments, or return other functions, are called *higher-order functions*. Such functions are used all the time in Haskell programming.

An example of when a Haskell programmer would reach for a higher order function is as follows:

Consider our linear search function from a few exercises ago. It traverses a list of integers and returns True when it finds an integer equal to the search integer, which we provide as an argument.

Let's say I wanted to carry out a linear search in a list, but instead of looking for an instance of a particular integer, I wanted to look for any even integer.

Or maybe I want to look for any integer *greater than* 100.

Or maybe I want to find an integer that *contains* the digit 3.

Or maybe I want to do all of these things! 

A higher-order search function would allow us to provide the function that decides when to stop searching as an argument.

For example, lets say we had the following helper functions available:
```haskell
evn :: Int -> Bool
evn x = (x `mod` 2 == 0)

big :: Int -> Bool
big x = (x > 100)
```
It'd be great if we could pass these functions as arguments to our search function. Something like this:

```haskell
Main> search evn [1, 2, 3, 4, 5]
2
Main> search big [1, 2, 101, 4, 5]
101
Main> search evn [1, 3, 5, 7, 9]
error: search: no matching item found
```
So what we want is a search function that takes two arguments:

1. A function which can test each integer in the list and tell us True if there's a match. Its type should be Int -> Bool. Let's call this argument tst, for 'test function'.
2. A list of integers to search through, of type [Int]

Here we go:
```haskell
search :: (Int -> Bool) -> [Int] -> Int
search tst [] = error "search: no matching number found"
search tst (x:xs)
    | tst x     = x
    | otherwise = search tst xs
```
We just passed around tst like any other argument, and then we used it in the first guard as if it were a normal function: `tst x` will apply the provided test function to `x` and return `True` or `False`, depending on the function.

>Note:
Notice how we give the type as (Int -> Bool) -> [Int] -> Int. This says that search's first argument is of type Int -> Bool. If we forgot the parentheses, that'd give us a function with three arguments (Int, Bool and [Int]).

## 4.2 Filter and abstraction

Higher-order functions like `filter` provide a layer of abstraction above writing the same recursive list traversal code over and over again; by using functions as arguments we can write general recursive code once and reuse it whenever we need. 

Using the higher order function `filter` (or our allsearch function) and a little more Haskell magic (see note below), a Haskell implementation of a naive quicksort clocks in at 5 lines of code:
```haskell
qsort :: [Int] -> [Int]
qsort [] = []
qsort (pivot:others) = (qsort lowers) ++ [pivot] ++ (qsort highers)
    where lowers  = filter (<pivot)  others
          highers = filter (>=pivot) others
```

**What's (<pivot)?**
In the above function there's some never-before-seen stuff happening. Namely, we are passing something that doesn't really look like much of a function to filter:

**What is this (<pivot) thing?**
Well, in Haskell, (<x) is a shortcut for a function that takes one argument and returns True if the argument is less than x, and False otherwise. We might come back to this later, it can prove pretty useful. In the meantime, if you're especially keen, go look up operator sections.

# 5. More list functions
## 5.1 Import Data.List
If you do ever need to sort a list, a pre-implemented `sort` function is available. But it's not there by default; you'll need to import a module to get it.

The module that contains sort is called `Data.List`. You can access it by adding the line import Data.List to your program:
```haskell
import Data.List
```

The Data.List module contains plenty more useful functions for manipulating lists. Here's a short list with a few functions you might find useful this semester, aside from the sort function:

- `group` separates a list into sublists of adjacent, matching numbers. For example, `group [1,1,3,3,2,1]` gives [[1,1],[3,3],[2],[1]].
- `nub` removes all duplicates from a list. That is, `nub [1,1,3,3,2,1]` gives [1,3,2].
- `delete x` removes the first occurrence of x from a list. For example, `delete 3 [2,3,4,3]` gives [2,4,3].
- The operator `\\` deletes each of the elements of one list from another list: `[1,2,3,2] \\ [2,1]` gives [3,2].

Remember, your program needs to **import Data.List** if you want to use these extra list functions.

## 5.2 Map
In all of the functions on the previous slide, we were making a new list by applying a single function to every element of an input list. It simplifies our group of functions quite nicely:

- Instead of `absAll xs`, just write `map abs xs`.
- Instead of `evenAll xs`, just write `map even xs`.
- Instead of `squareAll xs`, just write `map (^2) xs`.

