---
title: '[Note]Introduction to Software Testing'
slug: noteintroductiontosoftwaretesting
date: '2021-08-01T13:56:47.291Z'
categories:
- Learning
tags:
- Development
- Testing
- Notes
cover: ./images-86f70cf6761d4e31a84ac0bbd805b0f6.jpeg
original_permalink: /archives/noteintroductiontosoftwaretesting
---

# Introduction to Software Testing

## Copright
It is a note from the subject SWEN90006 @ University of Melbourne. Only for self-study.

SWEN90006 © Copyright 2021.

## Learning outcomes of this chapter

At the end of this chapter, you should be able to:

-   Discuss the purpose of software testing.

-   Present an argument for why you think software testing is useful or not.

-   Discuss how software testing achieves its goals.

-   Define faults and failures.

-   Specify the input domain of a program.


## Chapter Introduction


Recall from *Software Processes and Management* that the word *assurance* means having confidence that a program or document or some other artifact is fit for purpose. Later in these notes we will  try and translate the informal and vague notion of *confidence* into a measure of probability or strict bounds.

Testing is an integral part of the process of *assuring*\[1\] that a system, program or program module is suitable for the purpose for which it was built. In most textbooks on software engineering, *testing* is described as part of the process of *validation* and *verification*. The definitions of validation and verification as described in *IEEE-Std. 610.12-1990* are briefly described below：



- **Validation** is the process of evaluating a system or component during or at the end of the development process to determine if it satisfies the requirements of the system. In other words, validation aims to answer the question:

<center>
Are we building the correct system?
</center>

- **Verification** is the process of evaluating a system or component at the end of a phase to determine if it satisfies the conditions imposed at the start of that phase. In other words, verification aims to answer the question:

<center>
Are we building the system correctly?
</center>



In this subject, testing will be used for much more than just validating and verifying that a program is fit for purpose. We will use testing, and especially random testing methods, to *measure* the attributes of programs. **Note** that not all attributes of a program can be quantified.

Some attributes, like reliability, performance measures, and availability are straightforward to measure. Others, such as usability or safety must be estimated using the engineer's judgement using data gathered from other sources. For example, we may estimate the safety of a computer control system for automated braking from the reliability of the braking computers and their software.

Before looking at testing techniques we will need to understand something of the *semantics* of programs as well as the *processes* by which software systems are developed.

It is necessary to understand the *semantics* of programs so that, as a tester, we can be more confident that we have explored the program thoroughly. We discuss programs briefly in Section [](programs).

(programs)=
## Programs

To be a good tester, it is important to have a sound conceptual understanding of the *semantics of programs*. When it comes to software there are a number of possibilities, each of which has its own set of complications.

Firstly, lets consider the simple function given in Figures [1.1](f_1_1) written in an imperative programming language like C.

(f_1_1)=
```c
void squeeze(char s[], int c)
{
    int i,j;
    for (i = j = 0; s[i] != '\0'; i++) {
    	if (s[i] != c) {
    		s[j++] = s[i];
    	}
    }
    s[j] = '\0';
}
```
<p style="text-align: center;">Figure 1.1: The squeeze function from Kernighan and Ritchie implemented in C.</p>


The function **squeeze** removes any occurrence of the character denoted by the variable **c** from the array **s**, and squeezes the resulting array together. The semantics of C are such that integers and characters are somewhat interchangeable, in that an element of the type **int** can be treated as a **char**, and vice-versa.

If the squeeze function were written in Haskell then its type would be

$squeeze ~:~ string \times char - string$

The input type is $string \times char$ and the output type is string. The output type is implicit because the parameter to squeeze is a call by reference parameter.

The set of values in the input type is called the *input domain* and the set of values in the output type is called the *output domain*. For functions like the squeeze function, the input domain is the set of values in the input type, and the output domain is the set of values in the output type.


````{margin}
```{admonition} Footnotes
:class: tip
\[2\]: The Fibonacci numbers is a sequence of numbers given by $1~1~2~3~5~\ldots~f_{n}~\ldots$ where $\sf f_n = f_{n-1}+f_{n-2}$.
```
````

The fibonacci function, shown in Figure [1.2](f_1_2), takes an integer N and returns the sum of the first N Fibonacci numbers \[2\].

(f_1_2)=
```c
unsigned int fibonacci(unsigned int N) {
	unsigned int a = 0, b = 1;
	unsigned int sum = 0;
	while (N > 0) {
		unsigned int t = b;
		b = b + a;
		a = t;
		N = N - 1;
		sum = sum + a;
	}
	return sum;
}
```
<p style="text-align: center;">Figure 1.2: A function to sum the first N Fibonacci numbers implemented in C.</p>




Again, if the fibonacci function were written in Haskell its type would be 
$\sf fibonacci ~:~ unsigned\ int - unsigned\ int$

and so the input domain for the **fibonacci** function is the set of values of type **unsigned int**. Likewise, the output domain for the **fibonacci** function is also the set of values of type **unsigned int**.

The *input domain* to a program is the set of values that are accepted by the program as inputs. For example, if we look at the parameters for the squeeze function they define the set of all pairs $\sf (s,~c)$ where s has type array of char and c has type int.

Not all elements of an input domain are relevant to the specification. For example, consider a program that divides a integer by another. If the denominator is 0, then the behaviour is undefined, because a number cannot be divided by 0.

**Note** The input domain can vary on different machines. For example, the input domain to the fibonacci function is the set of values of type unsigned int but this can certainly vary on different machines. Table [1.1](t_1_1) shows how the set of values for parameters of type unsigned int and int respectively differ for different machine word sizes.

(t_1_1)=

| Word Size | unsigned int Set of Values | int Set of Values         |
|-----------------|----------------------------------------|---------------------------------------|
| 8 Bit Integers  | 0 .. 255                         | -127 .. 128                     |
| 16 Bit Integers | 0 .. 65,535                      | -32,767 .. 32,768               |
| 32 Bit Integers | 0 .. 4,294,967,295               | -2,147,483,647 ..  2,147,483,648 |



<p style="text-align: center;">Table 1.1: The set of values for different word sizes.</p>



The output domain for the **fibonacci** function is identical. The design specification of the **fibonacci** function should specify the range of integers that are *legal* inputs to the function.

Determining the input and output domains of a program, or function is not as easy as it looks, but it is a skill that is vital for effectively selecting test cases. That is why we will spend a good deal of time on input/output domain analysis.

Notice also that in the squeeze and **fibonacci** functions, for any input to the function (an element in the input domain) there exists a unique output (element output domain) computed by the function.

The function in question is *deterministic*. A function is deterministic if for every input to the function there is a unique output --- the output is completely determined by the input\[3\]. In this case it is easier to test the program because if we choose an input there is only one output to check.

**BUT**, we do not always have deterministic programs. If a program can return one of a number of possible outputs for any given input then it is *non-deterministic*. Concurrent and distributed programs are often non-deterministic. Non-deterministic programs are harder to check because for a given input there is a set of outputs to check.

Programs may *terminate* or *not terminate*. The squeeze and **fibonacci** functions both terminate. In the case of **fibonacci** an output is returned to the calling program and so to test **fibonacci** we can simply execute it and examine the returned value. The function squeeze returns a void value so even if it terminates we must still examine the array that was passed as input, because its value may change.

On the other hand a classic example of a non-terminating program is a control loop for an interactive program or an embedded system. Control loops effectively execute until the system is shutdown. In the same way as the squeeze function and the **fibonacci** function a non-terminating program may:

- generate observable outputs; or
- not generate any observable outputs at all.

In the former case we can test the program or function by testing that the sequence of values that it produces is what we expect. In the second case we need to examine the internal state somehow.

(what_is_software_testing)=
### What is software testing?

Testing, at least in the context of these notes, means *executing* a program in order to measure its attributes. Measuring a program's attributes means that we want to work out if the program *fails* in some way, work out its response time or through-put for certain data sets, its mean time to failure (MTTF), or the speed and accuracy with which users complete their designated tasks.

Our point of view is closest to that of IEEE-Std. 610.12-1990, but there are some different points of view. For comparison we mention these now.

-   Establishing confidence that a program does what it is supposed to
    do (W. Hetzel, *Program Test Methods*, Prentice-Hall)

-   The process of executing a program with the intent of finding errors
    (G.J. Myers, *The Art of Software Testing*, John-Wiley)

-   The process of analysing a software item to detect the difference
    between existing and required conditions (that is, bugs) and to
    evaluate the features of the software item (IEEE Standard for
    Software Test Documentation, IEEE Std 829-1983)

-   The process of operating a system or component under specified
    conditions, observing or recording the results, and making an
    evaluation of some aspect of the system or component (IEEE Standard
    Glossary of Software Engineering Terminology, IEEE Std 610.12-1990)

The viewpoint in these notes is deliberately chosen to be the broadest of the definitions above, that is, the last item in the list above. The theme for this subject is that testing is not just about detecting the presence of faults, but that testing is about *evaluating attributes of system and its components*. This means software testing methods are used to *evaluate* and *assure* that a program meets all of its requirements, both functional and non-functional.

To be more specific, software testing means executing a program or its components in order to assure:


1. The correctness of software with respect to requirements or intent;

2. The performance of software under various conditions;

3. The robustness of software, that is, its ability to handle erroneous inputs and unanticipated conditions;

4. The security of software, that is, the absence of vulnerabilities and its robustness against different kinds of attack;

5. The usability of software under various conditions;

6. The reliability, availability, survivability or other dependability measures of software; or

7. Installability and other facets of a software release.


```{admonition} Remark
- Testing is based on *executing* a program, or its components. Therefore, testing can only be done when parts (at least) of the system have been built.

- Some authors include V&V activities such as audits, technical reviews, inspections and walk-throughs as part of testing. We do not take this view of testing and consider reviews, inspections, walk-throughs and audits as part of the V&V process but not part of testing.
```



### The Purpose of Testing

````{margin}
```{admonition} Footnotes
:class: tip
\[4\]: In *Notes on Structured Programming*.
```
````

> "*Program testing can be used to show the presence of bugs, but never to show their absence!*"
> 
> --- Edsger W. Dijkstra\[4\]

This quote states that the purpose of testing it to demonstrate that their is a discrepancy between an implementation and its specification, and that it cannot be used to show that the implementation is correct. The aim of most testing methods is to systematically and actively find these discrepancies in the program.

*Testing and debugging are NOT the same activity*. *Debugging* is the activity of: (1) determining the exact nature and location of a suspected fault within the program; and (2) fixing that fault. Usually, debugging begins with some indication of the existence of an fault. The purpose of debugging is to locate fault and fix them.

Therefore, we say that the aim of testing is to demonstrate that there is faults in a program, while the aim of debugging is to locate the cause of these faults, and remove or repair them.

The aim of *program proving* (aka *formal program verification*) is to show that the program does not contain any faults. The problem with program proving is that most programmers and quality assurance people are not equipped with the necessary skills to prove programs correct.

(the-language-of-failures-faults-and-errors)=
### The Language of Failures, Faults, and Errors

To begin, we need to understand the language of *failures*, *faults* and
*errors*.



```{admonition} Definition

- **Fault:** A fault is an incorrect step, process, or data definition in a computer program. In systems it can be more complicated and may be the result of an incorrect design step or a problem in manufacture.

- **Failure:** A failure occurs when there is a deviation of the observed behaviour of a program, or a system, from its specification. A failure can also occur if the observed behaviour of a system, or program, deviates from its intended behaviour which may not be captured in any specification .

- **Error:** An incorrect internal state that is the result of some fault. An error may not result in a failure -- it is possible that an internal state is incorrect but that it does not affect the output.


```

*Failures and errors are the result of faults* -- a fault in a program can trigger a failure and/or an error under the right circumstances. In normal language, software faults are usually referred to as "bugs", but the term "bug" is ambiguous and can mean to faults, failures, or errors; as such, as will avoid this term.

````{margin}
```{admonition} Footnotes
:class: tip
\[5\]: We will not worry about the range just yet.
```
````

Consider the following simple program specification: for any integer \[5\] n, $square(n) = n*n$; and an (incorrect) implementation of this specification in Figure 1.3

(f_1_3)=
```c
int square(int x)
{ 
	return x*2; 
}
```
<p style="text-align: center;">Figure 1.3: A faulty squaring function written C.</p>



Executing square(3) results in 6 -- a *failure* -- because our specification demands that the computed answer should be $9$. The *fault* leading to failure occurs in the statement return x\*2 and the first *error* occurs when the expression x\*2 is calculated.

However, executing square(2) would not have resulted in a failure even though the program still contains the same fault. This is because the behaviour of the **square** function of under the input 2 behaves correctly. This is called *coincidental correctness*. If $2$ was chosen as the test input, then by *coincidence*, this happens to exhibit the correct behaviour, even though the function is implemented incorrectly.

The point here is there are some inputs that reveal faults and some that do not. While the above example is trivial, any non-trivial piece of software will display coincidental correctness for many test inputs.

*In testing we can only ever detect failures*. Our ability to find and remove *faults* in testing is closely tied to our ability to detect failures. The discussion above leads naturally to the following three steps when testing and debugging software components.


- Detect system failures by choosing test inputs carefully;

- Determine the faults leading to the failures detected;

- Repair and remove the faults leading to the failures detected; and

- Test the system or software component again.


This process is itself error-prone. We must not only guard against errors that can be made at steps (2) and (3) but also note that new faults can be introduced at step (3). It is important to realise here that steps (2) and (3) must be subject to the same quality assurance activities that one may use to develop code.

### Test Activities

Ultimately, testing comes down to the selecting and executing *test cases*. A test case for a specific component consists of three essential pieces of information:

- a set of test inputs, or if the program under test is non-terminating, a set of sequences of test inputs;

- the expected results when the inputs are executed; and

- the execution conditions or execution environment in which the inputs are to be executed.

A collection of test cases is a *test suite*.

As part of the process of testing, there are several steps that need to be performed. These steps remain the same from unit testing to system testing.

#### Test Case Selection

Given the above definition of a test case, there are two generic steps to test case selection. Firstly, one must select the test inputs. This is typically performed using a *test input select technique*, which aims to achieve some form of *coverage criterion*. Test input selection is covered in Chapters 2--5 of these notes.

Secondly, one must provide the expected behaviour of every test input that is generated. This is referred to as the *oracle* problem. In many cases, this oracle can be derived in a straightforward manner from the requirements of the program being tested. For example, a test case that assesses performance of a system may be related to a specific requirement about performance in the requirements specification of that system.

Despite the amount of research activity on software testing, the oracle problem remains a difficult problem, and it is difficult to automate oracles or to assess their quality.

Like any good software engineering process, test case selection is typically performed at a high level to produce abstract test case, and these are then refined into executable test cases.

#### Test Execution

Once executable test cases are prepared, the next step is to execute the test inputs on the program-under-test, and record the actual behaviour of the software. For example, record the output produced by a functional test input, or measure the time taken to execute a performance test input.

Test execution is one step of the testing process that is generally able to be automated. This not only saves the tester time, but allows for regression testing to be performed at minimal case.

#### Test Evaluation

Compare the actual behaviour of the program under the test input with the expected behaviour of the program under that test input, and determine whether the actual behaviour satisfies the requirements. For example, in the case of performance testing, determine whether the time taken to run a test is less than the required threshold.

As with test execution, test evaluation can generally be automated.

#### Test Reporting

The final step is the report the outcome of the testing. This report may be returned to developers so they can fix the faults that relate to the failures, or it may be to a manager to inform them that this stage of the testing process is complete.

Again, certain aspects of test reporting can be automated, depending on the requirements of the report.

### Test Planning

Testing is part of quality assurance for a software system, and as such, testing must be *planned* like any other activity of software engineering. A *test plan* allows review of the adequacy and feasibility of the testing process, and review of the quality of the test cases, as well as providing support for maintenance. As a minimum requirement, a test plan should be written for every artifact being tested at every level, and should contain at least the following information:


- *Purpose*: identifies what artifact is being tested, and for what purpose; for example, for functional correctness;

- *Assumptions*: any assumptions made about the program being tested;

- *Strategy*: the strategy for test case selection;

- *Supporting artifacts*: a specification of any of the supporting
artifacts, such as test stubs or drivers; and

- *Test Cases*: an description of the abstract test cases, and how they
were derived.


Other information can be included in a test plan, such as the estimate of the amount of resources required to perform the testing.

### Testability

The *testability* of software can have a large impact on the amount of testing that is performed, as well as the amount of time that must be spent on the testing process to achieve certain test requirements, such as achieving a coverage criterion.

Testability is composed of two measures: *controllability* and *observability*.



```{admonition} Definition: *Controllability* and *Observability*
1. The *controllability* of a software artifact is the degree to which a tester can provide test inputs to the software.

2. The *observability* of a software artifact is the degree to which a tester can observe the behaviour of a software artifact, such as its outputs and its effect on its environment.
```

For example, the squeeze from Figure 1.1 highly controllable and observable. It is a function whose inputs are restricted to parameters, and whose output is restricted to a return value. This can be controlled and observed using another piece of software.

Software with a user interface, on the other hand, is generally more difficult to control and observe. Test automation software exists to *record* and *playback* test cases for graphical user interfaces, however, the first run of the tests must be performed manually, and expected outputs observed manually. In addition, the record and playback is often unreliable due to the low observability and controllability.

Embedded software is generally less controllable and observable than software with user interfaces. A piece of embedded software that receives inputs from sensors and produces outputs to actuators is likely to be difficult to monitor in such an environment --- typically much more difficult than via other software or via a keyboard and screen. While the embedded software may be able to be extracted from its environment and tested as a stand-alone component, testing software in its production environment is still necessary.

Controllability and observability are properties that are difficult to measure, and are aspects that must be considered during the design of software --- in other words, software designers must consider *designing for testability*.

## The Psychology of Software Testing

Testing is more an art form than a science. In this subject, we look at techniques to make it as scientific as possible, but skill, experience, intuition and psychology all play an important part of software testing.

Psychology? How does this impact software testing?

We will look at two things related to psychology: (1) the purpose of software testing; and (2) what a successful test case is.

### The purpose of software testing

In Section [](what_is_software_testing), we defined testing and looked at its purpose. The famous Dijkstra quote that testing shows the presence of faults, but not their absence, is important.

What are some other commonly stated goals of software testing?:

-   To show that our software is correct.

-   To find ALL the faults in our software.

-   The prove that our software meets its specification.

These may seem like great things to achieve, but should they be our goal
in software testing?

Let's face some facts about software. *Software is complex -- exceedingly complex*. Even medium-scale software applications are so much more complex than the very largest of other engineering projects. As such, every piece of software has faults. Even the most trivial programs contains faults; perhaps not ones that are likely to occur or have a large impact, but they do. Consider the standard binary search algorithm that we use in lectures throughout the semester. This algorithm was printed in textbooks, used, discussed, and presented for over four decades before it was noted that it contained a fault. The program contains about 10 logical lines of code! It is naive to think that modern web applications could have less than hundreds if not thousands of faults that the developers don't know about.

Further to this, another fact is that almost every program has an infinite number of possible inputs. Think of a program that parses HTML documents: there are an infinite number of HTML documents, but it needs to parse them ALL. No matter how many tests were run on this program, there is no guarantee that the very next test will not fail. As such, Dijkstra's quote is clear: we cannot test every possible input except for the most trivial program (even then, a program that takes two integers as input will take several years to test every combination), so, we cannot *prove* that a program is correct with testing. All we can do is prove that faults are in the software by running tests that fail. Then, we find and fix the faults, trying not to introduce new faults in the process, and hopefully the quality of our software has increased.

Why does psychology matter here? Let's take these two points: (1) *we can't prove a program is correct with testing*; and (2) *any program we test will have faults, and will continue to after we finish testing*.

If our goal is to find all faults or to show our program has no faults, then we are destined to fail at our goal. What is the point of aiming for a goal that we know that we cannot achieve? Psychologically, we know that people perform poorly when asked to do things they know are impossible.

If you task a team to "show that your software is fault free", what would the response be? Most likely, they would select tests that they know pass. This does not improve software quality at all. Quality is only improved when we find faults and fix them.

Psychologically, a much better goal is: *try to break our program*. If we assume that there are faults in the program and set out to find them, we will do a much better job of our goal. Further to this, we will be motivated each time we find a fault, because that was our goal.

*Testing should improve quality. By finding no faults, quality is not improved.*

Testing is a *destructive* process. We try to break our program.

Testing is **NOT** proof.

*Summary*: We must aim to find the faults are present. If we test to show correctness, we will subconsciously steer towards this goal. In addition, we will fail, because testing to show correctness is impossible.

### What is a "successful" test case?

This is an interesting question. Our first response may be: "a test is successful if it passes".

But given what we have just learnt, I hope you agree that: *a test is successful if is fails*.

Any test that does not find a fault is almost a waste. Of course, this is an exaggeration. If we are doing a good job of testing and trying to break our program, a passed test gives us some confidence that our program is working for some inputs. Further, we can keep our tests and run them later after debugging to make sure we do not introduce any new faults. This is called *regression testing* (Section 7.3).

Any test that fails (that is, any test that finds a fault), is a chance to improve quality. This is a successful test. A successful test is a more valuable investment than an unsuccessful test. Much of this subject deals with the question: how do we select tests that are more likely to fail than others.

Consider an analogy of medical diagnosis. If a patient feels unwell, and a doctor runs some tests, the successful test is one that diagnosis the problem. Anything that does not reveal a problem is not valuable. We must consider programs as sick patients -- they contain faults whether we want them to or not!

*Summary*: A successful test is one that fails. This is how testing can be used to improve quality. Psychologically, we should be pleased when a test fails. It is not a bad thing when a test fails. The fault was there before the test was run, the test just found it!

### Principles of software testing psychology

In the *The Art of Software Testing* (see reference below), Myers lists 10 principles of software testing. In this section, we will discuss three of these principles, as they are related to the psychology of software testing.

**Principle 1** --- A necessary part of a test case is a definition of
the expected output or result.

This means that a test case is not just an input. *Before* we run the test, we must also know what the expected output should be. It is not sufficient to run the test, see the output, and only then decide whether that output is correct.

Why not? Psychologically, we run into a problem. An erroneous result can be interpreted as correct because the mind sees what it wants to see. We may have a desire to see the correct behaviour because we don't want to do any debugging. Or, we may consider that the person who wrote the code is much smarter than us, so surely they wouldn't have made this error. Or, we may just convince ourselves that this is the correct answer somehow.

On the other hand, if we have the expected output before the test, we compare the actual output with the expected output, and now whether the test fails or not is completely objective. Either the observed output is the same as the expected, or it is not.

Of course, the expected output may be incorrect itself -- we make mistakes in testing too. But at the very least, we will now check both the expected output and the program to see which is incorrect.

**Principle 2** --- A programmer should avoid attempting to test his or her own program.

This is perhaps the most important of all principles!

First, let me say that I completely disagree with this principle. *A programmer should absolutely test their own code*! They should not be committing code to repositories that has never been testing. However, what the principle really means is: a programmer should avoid being the *only* person to test his or her own program.

Why? There are three main reasons for this; all linked to the psychology of software testing:

-   If a programmer missed important things when coding, such as failing to consider a null pointer, or failing to check a divide by zero, then it is quite likely they will also not think of these during testing.

    However, another person is less likely to make exactly the same mistakes. So, this duplication helps to find these types of 'oversight' faults.

-   If a programmer misunderstands the specification they are programming to (e.g. they misunderstand a user requirement), they will implement incorrect code. When it comes to testing, they will still misunderstand the specification, and will therefore write an incorrect test using this misunderstanding. Both the code and the test are wrong, and in the same way. To the test will pass.

    However, another person brings an opportunity to interpret the specification correctly. Of course, they may interpret it incorrectly in the same way, but it is less likely that both people will do this rather than just one.

-   Finally, recall that testing is a *destructive* process. We aim to find faults; that is, showing that the software is 'broken'.However, programming is a a *constructive* process. We create the software and we try to make it correct.

    As a programmer, once we create something that we work so hard on, we do not then want to turn around a break it! Consider some programming assignments that you have worked on. When you were running tests for it, did you hope they pass, or did you hope they fail? Now consider that you were running tests on someone else's assignment. Would you care so much whether they pass or fail?

    Put simply: someone testing their own code will struggle to switch from the constructive process of coding to the destructive process of testing if the code is their own. Psychologically, they will semi-consciously try to avoid testing parts of the code they think are faulty.

This principle works on a team level too. I have talked with software engineering teams in an organisation who test each others code. They take it competitively! They get great pleasure at breaking other teams' code. They are motivated to find as many problems as possible. Could a team be so pleased at breaking their own code? I would say not.

**Principle 8** --- The probability of the existence of more errors in a section of a program is proportional to the numbers already found in that section.

Faults seem to come in clusters. This is for several reasons: complex bits of code are harder to get right, some parts of code are written hurriedly due to time constraints, and just some software engineers are not as good as others, so their parts will be more faulty.

What does this mean? It means that as we test, we find many faults in one part of a program and fix them, and find comparatively fewer in another part and fix them. We should then invest our time in the more faulty regions.

This *may* seem counter-intuitive. After all, if we find only 1-2 faults in one section, there must be so many more out there than in the section we find 25! However, empirical evidence suggests this is not the case. Therefore, best investment is made in these error/fault-prone sections.

(input-domains)=
## Input Domains

To perform an analysis of the inputs to a program you will need to work out the sets of values making up the input domain. There are essentially two sources where you can get this information:


- the software requirements and design specifications; and

- the external variables of the program you are testing.


In the case of white box testing, where we have the program available to us, the input domain can be constructed from the following sources.

- Inputs passed in as parameters;

- Inputs entered by the user via the program interface;

- Inputs that are read in from files;

- Inputs that are constants and precomputed values;

- Aspects of the global system state including:

    - Variables and data structures shared between programs or components;

    - Operating system variables and data structures, for example, the state of the scheduler or the process stack;

    - The state of files in the file system;

    - Saved data from interrupts and interrupt handlers.

In general, the inputs to a program or a function are stored in *program
variables*. A program variable may be:


- A variable declared in a program as in the *C*  declarations

```c
	int base; 
	char s[];
```

- Resulting from a read statement or similar interaction with the environment, for example,

```c
	scanf("%d\n", x);
```



Variables that are inputs to a function under test can be:


- *atomic data* such as integers and floating point numbers;

- *structured data* such as linked lists, files or trees;

- a reference or a value parameter as in the declaration of a function; or

- constants declared in an enclosing scope of the function under test, for example:


```c
#define PI 3.14159

double circumference(double radius)
{
	return 2*PI*radius;
}
```



We all try running our programs on a few test values to make sure that we have not missed anything obvious, but if that is all that we do then we have simply not covered the full input domain with test cases. Systematic testing aims to cover the full input domain with test cases so that we have assurance -- confidence in the result -- that we have not missed testing a relevant subset of inputs.

## Black-Box and White-Box Testing

If we do have a clear requirements or design specification then we choose test cases using the specification. Strategies for choosing test cases from a program or function's specification are referred to as *specification-based* test case selection strategies. Both of the following are specification-based testing strategies.

**Black-box Testing** where test cases are derived from the functional specification of the
system; and

**White-box Testing**  where test cases are derived from the internal design specifications or actual code for the program (sometimes referred to as *glass-box*).


Black-box test case selection can be done without any reference to the program design or the program code. Black-Box test cases test only the functionality and features of the program but not any of its internal operations.


````{margin}
```{admonition} Footnotes
:class: tip
\[6\]: COTS stands for **C**ommercial **O**ff **T**he **S**helf
```
````


- The real advantage of black-box test case selection is that it can be done *before* the implementation of a program. This means that black-box test cases can help in getting the design and coding correct with respect to the specification.

    Black-box testing methods are good at testing for missing functions and program behaviour that deviates from the specification. They are ideal for evaluating products that you intend to use in a system such as COTS \[6\] products and third party software (including open source software).

- The main disadvantage of black-box testing is that black-box test cases cannot detect additional functions or features that have been added to the code. This is especially important for systems that are safety critical (additional code may interfere with the safety of the system) or need to be secure (additional code may be used to break security).


White-box test cases are selected using requirements and design specifications and the code of the program under test. This means that the testing team needs access to the internal designs and code for the program.

The chief advantage of white-box testing is that it tests the internal details of the code and tries to check all the paths that a program can execute to determine if a problem occurs. As a result of this white-box test cases can check any additional code that has been implemented but not specified.

The main disadvantages of white-box testing is that you must wait until after designing and coding the program under test in order to select test cases. In addition, if some functionality of a system is not implemented, using white-box testing may not detect this.

The term "black-box testing" and "white-box testing" are becoming increasingly blurred. For example, many of the white-box testing techniques that have been used on programs, such as control-flow analysis and mutation analysis, are now being applied to the specifications of programs. That is, given a formal specification of a program, white-box testing techniques are being used on that specification to derive test cases for the program under test. Such an approach is clearly black-box, because test cases are selected from the specified behaviour rather than the program, however, the techniques come from the theory of white-box testing.

In these notes, we deliberately blur the distinctions between black-box and white-box testing for this reason.

## Error Guessing

Before we dive into the world of systematic software testing, it is worth mentioning one highly-effective test strategy that is always valuable when combined with any other strategy in these notes. This technique is known as *error guessing*.

Error guessing is an *ad-hoc* approach based on intuition and experience. The idea is to identify test cases that are considered likely to expose errors.

The general technique is to make a list, or better a taxonomy (a hierarchy), of possible errors or error-prone situations and then develop test cases based on the list.

The idea is to document common error-prone or error-causing situations and create a defect history. We use the defect history to derive test cases for new programs or systems. There are a number of possible sources for such a defect history, for example:


- **The Testing History of Previous Programs** --- develop a list of faults detected in previous programs together with their frequency;

- **The Results of Code Reviews and Inspections** --- inspections are not the same as code reviews because they require much more detailed defect tracking than code reviews; use the data from inspections to create


Some examples of common faults include test cases for empty or null strings, array bounds and array arithmetic expressions (such as attempting to divide by zero), and blank values, control characters, or null characters in strings.

Error guessing is not a testing technique that can be assessed for usefulness or effectiveness, because it relies heavily on the person doing the guessing. However, it takes advantage of the fact that programmers and testers both generally have extensive experience in locating and fixing the kinds of faults that are introduced into programs, and can use their knowledge to guess the test inputs that are likely to uncover faults for specific types of data and algorithm.

Error guessing is ad-hoc, and therefore, not *systematic*. The rest of the techniques described in these notes are systematic, and can therefore be used more effectively as quality assurance activities.

## Some Testing Laws

Here are some interesting "laws" about software testing. They are not really laws per se, but rules of thumb that can be useful for software testing.

**Dijkstra's Law:** Testing can only be used to show the presence of errors, but never the absence of errors

**Hetzel-Myers Law:** A combination of different V&V methods out-performs and single method alone.

**Weinberg's Law:** A developer is unsuited to test their own code.

**Pareto-Zipf principal:** Approximately 80% of the errors are found in 20% of the code.

**Gutjar's Hypothesis:** Partition testing, that is, methods that partition the input domain or the program and test according to those partitions, is better than random testing.

**Weyuker's Hypothesis:**   The adequacy of a test suite for coverage criterion can only be defined intuitively.

## Bibliography


G.J. Myers, *The Art of Software Testing*,  John Wiley & Sons, 1979.

D.E. Knuth, *The Art of Computer Programming, vol. 2: Semi-numerical Algorithms*, 2nd Ed., Addison Wesley, 1981.

B. Beizer, *Software Testing Techniques*, 2nd ed., van Nostrand Reinhold, 1990.

E. Kit, *Software Testing in the Real World*, Addison-Wesley, 1995.

R. Hamlet, Random Testing, In *Encyclopedia of Software Engineering*, J. Marciniak ed., pp. 970--978, Wiley, 1994.

A. Endres and D. Rombach, *A Handbook of Software and Systems Engineering*, Addison-Wesley, 2003.

J. A. Whittaker, *How to Break Software: A Practical Guide to Testing*, Addison-Wesley, 2002.
