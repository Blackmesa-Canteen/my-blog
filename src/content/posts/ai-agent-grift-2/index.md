---
title: 'The AI Agent Grift: Why Your "Autonomous" Assistant is Neither'
slug: ai-agent-grift-2
date: '2026-02-02T11:53:12.570400609Z'
original_permalink: /archives/ai-agent-grift-2
---

# The AI Agent Grift: Why Your "Autonomous" Assistant is Neither

Every pitch deck features "AI agents" now. Every enterprise vendor has bolted "agentic capabilities" onto their product. VCs are funding anything that promises to "automate knowledge work with autonomous agents." If you believe the marketing, we're a few months from AI agents running entire businesses unsupervised.

Having actually built and used a fair number of these systems, I think most of that story is wrong, and it's worth being specific about why.

## The autonomy myth

Watch closely what companies actually demo when they show off an "autonomous agent." It's never independent judgment about what matters — deciding on its own to reorganize a database, refactor a codebase, renegotiate a vendor contract. It's an agent that, given an extremely specific prompt, in a carefully controlled environment, with pre-configured access to exactly the right tools, can sometimes complete a workflow without a human intervening mid-task.

That's not autonomy. That's an elaborate if-then statement with a language model wired into it.

Real autonomy would mean an agent that can recognize when a task matters without being told, navigate ambiguity without a playbook, refuse work that's harmful or pointless, and learn from a mistake without a catastrophic failure along the way. Current agents do approximately none of this reliably.

## Errors compound faster than people expect

Multi-step reasoning has a nasty property: errors compound. If a model hallucinates at step one of a ten-step workflow, that hallucination poisons the context for every step after it. The agent builds confidently on a foundation that isn't there, and because it has no real model of its own uncertainty, it usually can't catch the mistake itself.

The industry's answer has been "human-in-the-loop" checkpoints — which is a fancy way of saying a human verifies everything the agent does. At that point you've built a very expensive suggestion engine, not an autonomous worker.

## Tool access is a real constraint, not a rough edge

The pitch is seamless integration: agents pulling data from Salesforce, updating tickets, deploying code, scheduling meetings. The reality is that tool integration is a slog of authentication, permission scoping, API limits, and connectors that break the moment an upstream API changes shape.

And that constraint is load-bearing, not incidental. An agent with broad permissions is one bad inference away from doing real damage. An agent with narrow, well-scoped permissions is safer and also, correctly, not very autonomous. You don't get to have both, and every serious deployment I've seen picks the narrow-permissions side — which quietly concedes the autonomy argument.

## Context windows don't fix what people think they fix

Fitting an entire codebase, a company's operational history, the state of twenty ongoing projects, and the tacit knowledge that makes a business actually run into a context window was never realistic, no matter how large windows get. Retrieval-augmented generation helps, but it only retrieves what someone thought to index and search for. An agent doesn't know what it doesn't know, and without the associative memory a human has, it has no way to notice a gap in what it was given.

This is the real reason agents are excellent at narrow, well-defined tasks and fall apart on novel ones. They're not reasoning from understanding — they're pattern-matching against training data plus whatever got retrieved.

## Nobody wants to talk about cost-per-task

What's the actual cost of a task completed by one of these systems, once you count API calls (agents make a lot of them), orchestration compute, the engineering time to build and maintain the integrations, the time spent reviewing output for errors, and the cost of the errors that get through review anyway?

For a lot of use cases, the math doesn't clear. An agent that burns fifty cents in API calls to do what a person could finish in thirty seconds isn't saving money. The pitch deck shows "90% reduction in manual effort" without mentioning that the remaining 10% is the hard part, and it now takes longer because someone has to debug why the agent did what it did.

## What agents are actually good for

None of this means agents are useless — it means the hype obscures where the real value is. They're genuinely good at structured retrieval and synthesis (pulling information from several sources and presenting it coherently), template-based first drafts (reports, routine emails, boilerplate), workflow automation with real human checkpoints, and fast, rough prototyping where 70% right quickly beats 100% right slowly.

Notice what's missing: "autonomously running critical business functions," "replacing a customer service team," "running CI/CD unsupervised."

## The honest version of this story is more useful

If agents are going to deliver value instead of becoming this decade's blockchain-will-fix-everything moment, the industry needs to stop calling them autonomous when they need constant supervision, and start publishing real failure rates and cost breakdowns instead of cherry-picked demos.

Today's agents are useful productivity tools and genuinely impressive research artifacts. They are not the autonomous digital workers the marketing promises. They're closer to a very capable intern — occasionally brilliant, often confused, always needing a second set of eyes, and prone to confidently doing the wrong thing the moment you stop watching. That's a fine thing to be. It's just not what's being sold.
