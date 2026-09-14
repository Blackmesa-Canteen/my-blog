---
title: Haskell语法现象总结(1-基本语法现象)
slug: haskell-yu-fa-xian-xiang-zong-jie
date: '2021-08-04T07:01:37.634Z'
categories:
- Learning
tags:
- Haskell
cover: ./1501481039138714.jpg-a84e5bdf7b5c4abea8f3b635d80728f3.png
original_permalink: /archives/haskell-yu-fa-xian-xiang-zong-jie
---

# 0 Copyright
A Note that **ONLY FOR SELF-STUDY!**
# 1 Haskell基本语法现象
## 1.1 Functional programming
We mentioned before that Haskell is a functional programming language. Functions in Haskell are different from functions in procedural languages like C or object-oriented languages like Java.

1. Functions in Haskell are pure; they contain no state and have no side-effects. This way functions form self-contained units with all connections to the outside world made explicit; the functions are transparent building blocks.

2. Functions in Haskell are defined using expressions, rather than as a sequence of steps. This makes them less akin to the functions we know from from other programming languages, and more like functions from mathematics, like this one:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mi>f</mi>
  <mo>:</mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo stretchy="false">&#x2192;<!-- → --></mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo>,</mo>
  <mtext>&#xA0;</mtext>
  <mi>f</mi>
  <mo stretchy="false">(</mo>
  <mi>x</mi>
  <mo stretchy="false">)</mo>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mn>2</mn>
  </msup>
</math>
 
This also means there is no native concept of sequence, branching, or loops. We'll have some fun throughout the next few modules building these fundamental constructs back up in a pure, functional style.

## 1.2 Defining a function
Let's take a closer look at some mathematical functions, and see how we could define them in Haskell.

For example, the mathematical function:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mi>f</mi>
  <mo>:</mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo stretchy="false">&#x2192;<!-- → --></mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo>,</mo>
  <mtext>&#xA0;</mtext>
  <mi>f</mi>
  <mo stretchy="false">(</mo>
  <mi>x</mi>
  <mo stretchy="false">)</mo>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mn>2</mn>
  </msup>
</math>

It describes a function  
`f` that takes an integer (a number in `Z`) as input, then squares this number and returns the result as its output.

In Haskell, this function would be defined by the code:
```haskell
f :: Int -> Int
f x = x^2
```
To compute f(3), we would write `f 3`. You can try this now! Press the 'Terminal' icon on the above code snippet, and try entering `f 3` to see the result.

## 1.3 Multiple arguments
Functions can of course have multiple arguments. For example:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mi>g</mi>
  <mo>:</mo>
  <msup>
    <mrow class="MJX-TeXAtom-ORD">
      <mi mathvariant="double-struck">Z</mi>
    </mrow>
    <mn>2</mn>
  </msup>
  <mo stretchy="false">&#x2192;<!-- → --></mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo>,</mo>
  <mtext>&#xA0;</mtext>
  <mi>g</mi>
  <mo stretchy="false">(</mo>
  <mi>x</mi>
  <mo>,</mo>
  <mi>y</mi>
  <mo stretchy="false">)</mo>
  <mo>=</mo>
  <mi>x</mi>
  <mi>y</mi>
</math>
This function takes a pair of integers, multiplies them together, and returns this product. In Haskell:

```haskell
g :: Int -> (Int -> Int)
g x y = x * y
```

Notice that * is the operator for multiplication, as it is in many other programming languages.

## 1.4 Quirky conventions
We just pointed out again how Haskell programmers don't follow mathematicians' convention of putting parentheses around function arguments. In general, instead of  
`a(b,c,d)`, we write `a b c d`.
You may also have noticed that the type signature for a function with multiple arguments is slightly different from what you might expect. Take the previous example:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mi>g</mi>
  <mo>:</mo>
  <msup>
    <mrow class="MJX-TeXAtom-ORD">
      <mi mathvariant="double-struck">Z</mi>
    </mrow>
    <mn>2</mn>
  </msup>
  <mo stretchy="false">&#x2192;<!-- → --></mo>
  <mrow class="MJX-TeXAtom-ORD">
    <mi mathvariant="double-struck">Z</mi>
  </mrow>
  <mo>,</mo>
  <mtext>&#xA0;</mtext>
  <mi>g</mi>
  <mo stretchy="false">(</mo>
  <mi>x</mi>
  <mo>,</mo>
  <mi>y</mi>
  <mo stretchy="false">)</mo>
  <mo>=</mo>
  <mi>x</mi>
  <mi>y</mi>
</math>
Implemented in Haskell as:

```haskell
g :: Int -> (Int -> Int)
g x y = x * y
```
Instead of using a domain of 'pairs of integers', e specify the type of g as Int -> (Int -> Int).
This is a quirk that proves incredibly useful when we want to make more advanced use of these functions.

Let's explore what's going on here!

**One argument at a time**
To understand how function application for multiple-argument functions works in Haskell, first note that Haskell has truly higher order functions: Haskell functions can work with functions. In particular, any function can be an argument to another function, and functions can be the return values of other functions too.

When we write g 3 5, Haskell reads that as (g 3) 5, since function application binds very tightly. That is, g 3 5 means 'apply the function g to the argument 3, and then take the result (the result of (g 3)) and apply it to the argument 5'.

Haskell's functions take their arguments one at a time. Each time, the function takes one argument and returns a new function ready to take the next argument. This is higher order functions at work. Eventually, the function that takes the final argument just returns the result.

From this perspective, we might be able to understand g's type signature: Int -> (Int -> Int). g is really a function that takes a single argument (an Int like 3) and returns an '(Int -> Int)'. Of course, an (Int -> Int) is another function. This one is ready to take the 'second' argument (an Int like 5) and, finally, return an Int (the result).

## 1.5 Types of functions
Multi-argument functions all have type signatures of this shape:


`Type1 -> (Type2 -> (Type3 -> ( ... -> ReturnType)))`

Once again, we'll want to avoid so many parentheses. We normally write function type signatures without them instead (we won't really go into the details, but this works because ->, the operator for constructing function types, is right-associative).


`Type1 -> Type2 -> Type3 -> ... -> ReturnType`

Anyway, this means g's type signature would normally be written as g :: Int -> Int -> Int and read as 'g is a function that need to take two Ints before returning an Int.'

## 1.6 Recursion
Recursion plays a big role in Haskell programming. It's probably the only construct remaining from procedural programming.

On top of being used for things that it would normally be used for in a procedural language, it's also the native means of producing iteration, since Haskell has no looping constructs.

Fortunately, writing recursive functions in Haskell couldn't be more simple! Here's an example, a recursive function for calculating the factorial of a non-negative integer:
```haskell
fact :: Integer -> Integer
fact 0 = 1
fact n = n * fact (n-1)
```
>Note: We needed to use parentheses around (n-1). That's because function application has high precedence in Haskell, that is, f n-1 is interpreted as (f n)-1 by default.

>Note: Integer is an infinite precision integer type. That is to say it can store any number, however large (well, until your operating system runs out of memory). Int, on the other hand, is a finite precision integer type (on Grok, it's 32 bits).

## 1.7 Pattern matching
The previous definitions made use of a feature of Haskell called 'pattern matching': we gave multiple equations describing the function, and Haskell chose the right equation to follow each time based on the input.

As a reminder, here's the recursive definition for our factorial function:
```haskell
fact :: Integer -> Integer
fact 0 = 1
fact n = n * fact (n-1)
```
Consider a function call with input x. Roughly speaking, here's what happens:

1. Let's say x is 0. In that case, Haskell notices that the input matches the 'pattern' 0 in the first equation fact 0 = 1. Thus, the first equation applies, and the function returns 1.
2. Alternatively, if x is anything other than 0, then Haskell will fail to match it with the pattern 0, and it will move on to try the next equation (fact n = ...). This pattern match will succeed, and n will be used in the definition with the value of x.
>Note: Patterns are matched in top-down order. So if multiple patterns could potentially match, only the first matching equation will be applied. 

## 1.8 Guards
Pattern matching provides a convenient way to define a function with multiple 'cases', such as recursive functions with a recursive case and a base case.

However, there is a glaring flaw in the previous definition of the factorial function: namely, it will run forever if you ask it for the factorial of a negative number. Can you see why?

To avoid this, we can use another method of defining a function with multiple cases: guards.

With guards, we can specify the expression to use for a particular input based on a sequence of boolean conditions. As an example, assuming we define the factorial of a negative number to be, say, 0, here's the factorial function defined with guards instead of multiple patterns:

```haskell
fact :: Integer -> Integer
fact n
    | n < 0     = 0
    | n == 0    = 1
    | otherwise = n * fact (n-1)
```
>Note: Don't forget `|` that is ahead of the `otherwise`.

## 1.9 Operators
Throughout these exercises we have used many basic operators. Almost all of the operators you are familiar with from other languages are available, including `+, -, *, ^, /, <, <=, ==, >=, >, &&, and ||`.

Some noteworthy special cases are as follows:

- / provides float division, even if its arguments are both integers. For integer division (rounding down), use the div function, as in div 16 3 (which will give 5).
- % is not used as the 'modulo' operator. Use the mod function instead, as in mod 16 3 (which will give 1)
- Using - as a unary negative sign (as in -2) rather than a subtraction operator (as in 5 - 2) can cause problems. Always enclose such a negative number in parentheses: (-2).
- ! isn't for Boolean negation (not). Use the not function instead, as in not True (which will give False).
- != is not defined. For 'not equals', use the /= operator.

**We can use operators as functions**
That is to say, `+` could just as well be a normal function called plus, except that we write 1 plus 2 instead of plus 1 2.

We say that + (and most other operators) are functions using infix notation, rather than prefix notation, as a way of describing where the arguments should be placed.

If needed, we can easily use an infix function as a prefix function, or the other way around.

To use an infix function (like +) as a prefix function, just enclose it in parentheses:
```haskell
f :: Int -> Int -> Int
f x y = (+) x y
```

To use a prefix function (like div) as an infix function, just enclose it in backticks ('`' characters):

```haskell
g :: Int -> Int -> Int
g x y = x `div` y
```

# See next

Lists, recursively defined.

