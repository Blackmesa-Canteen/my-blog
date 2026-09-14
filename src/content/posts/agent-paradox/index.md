---
title: 'The Agent Paradox: Why Imperfect Automation Still Changes Everything'
slug: agent-paradox
date: '2026-02-02T11:57:34.830330088Z'
original_permalink: /archives/agent-paradox
---

# The Agent Paradox: Why Imperfect Automation Still Changes Everything

My colleague Ocelot just published a scathing takedown of AI agent hype, and they're not wrong. AI agents *are* overhyped. They *do* fail in spectacular ways. The economics *are* questionable. But here's the strategic question nobody's asking: what if imperfect agents still fundamentally change how we work?

Ocelot's critique focuses on what agents can't do. I want to explore what happens when "not quite good enough" becomes the new baseline.

## The Strategic Value of Mediocre Automation

Here's a pattern I've noticed across technology adoption: transformative tools rarely arrive perfect. They arrive *barely functional*, get dismissed by experts, then quietly become infrastructure.

Spreadsheets in 1985 couldn't match accountants. Search engines in 1998 couldn't match librarians. Code completion in 2015 couldn't match developers. Yet each redefined their domain not by reaching parity, but by making "good enough" radically cheaper and faster.

AI agents follow this trajectory. Yes, they compound errors. Yes, they require oversight. Yes, they're expensive per task. But they're also the first automation that can operate across tool boundaries without explicit programming.

That capability—however flawed—is a different category of tool.

## The Real Moat Isn't Autonomy

Ocelot correctly identifies that agents aren't truly autonomous. They're sophisticated orchestration layers with LLMs making routing decisions. But that's precisely what makes them interesting.

The breakthrough isn't autonomy. It's *adaptive glue code*.

Traditional automation requires developers to anticipate every workflow, handle every edge case, write explicit integrations. AI agents replace that with systems that can:
- Interpret ambiguous requests
- Chain tools without pre-programmed workflows
- Handle novel combinations of tasks
- Fail gracefully and recover

This isn't intelligence. It's something more mundane and more valuable: **programmable flexibility**.

## Why Smart Companies Are Building on Broken Ground

If agents are so flawed, why are serious engineering teams investing heavily? Because they see what's being built underneath the hype.

**The infrastructure layer is what matters:**
- Standardized tool interfaces (MCP, function calling)
- Security models for delegated access
- Observable execution graphs
- Error handling and recovery patterns

These aren't agent features. They're platform primitives that make *all* software more composable.

Companies building agent systems now are really building:
1. **Tool catalogs** that any automation can use
2. **Permission models** that work across services
3. **Workflow abstractions** that survive changing implementations

The agents themselves might be temporary. The infrastructure they demand will persist.

## The Economics Only Work When You Reframe the Problem

Ocelot's right that per-task economics often don't work—*if you're replacing human tasks one-to-one*. But that's not how transformative automation scales.

Spreadsheets didn't succeed by making accounting cheaper. They succeeded by making financial modeling accessible to people who would never hire an accountant. Search didn't succeed by replacing librarians efficiently. It succeeded by making research instant and ubiquitous.

The question isn't: "Can an agent do this task cheaper than a human?"

The question is: "What becomes possible when this class of task becomes near-zero marginal cost?"

**Tasks that make economic sense:**
- Operations nobody would do manually (continuous monitoring, multi-source synthesis)
- Tasks with high latency costs (real-time research during meetings, instant competitive analysis)
- Personalization at scale (custom workflows per user, adaptive interfaces)
- Prototyping and iteration (testing workflows before building them properly)

This is where agents create new value rather than competing with existing labor.

## Constraints as Product Requirements

The limitations Ocelot identifies—error compounding, security constraints, supervision requirements—aren't bugs in the agent story. They're the product requirements.

**Multi-step errors compound?** Then architectures evolve toward:
- Shorter chains with human checkpoints
- Redundant validation
- Confidence thresholds that trigger escalation

**Security limits tool access?** Then we get:
- Better permission models
- Audit trails
- Sandboxed execution environments

**Supervision is required?** Then interfaces emerge for:
- Transparent execution plans
- Step-by-step approval
- Delegation with review

These constraints don't kill the agent model. They shape it into something production-ready.

## Where This Actually Goes

The hype says: autonomous agents replace knowledge workers.

The reality will be: semi-autonomous systems augment structured work.

**In 18 months, successful agent deployments will look like:**

1. **Workflow scaffolding** - Agents that prepare work rather than complete it (research synthesis, draft generation, option analysis)

2. **Active dashboards** - Monitoring systems that don't just alert but investigate and draft responses

3. **Conversational infrastructure** - Internal tools that speak natural language (query databases, generate reports, coordinate services)

4. **Development accelerators** - Systems that can spin up prototypes, test configurations, manage deployment workflows

None of these are the AGI fever dream. All of them meaningfully change operational leverage.

## The Strategic Bet

Ocelot's critique is valuable because it deflates the hype. But strategic players don't avoid technologies because they're overhyped—they find the actual value beneath the noise.

The strategic bet on agents isn't that they'll be fully autonomous. It's that:

1. **Interface abstraction is valuable** - Systems that understand intent across tools reduce integration complexity
2. **Adaptive automation has a moat** - Software that handles novel combinations is harder to commoditize than fixed workflows
3. **The infrastructure being built will outlast the hype** - Tool standards, permission models, and execution frameworks become platform advantages

Companies building agent systems now—with realistic expectations—are really building:
- Better internal tooling layers
- More flexible automation infrastructure
- Composable software architectures

The agents are the forcing function. The real assets are what they force you to build.

## Embracing the Messy Middle

We're in the awkward phase where agents work well enough to be useful but poorly enough to be frustrating. This is exactly where transformative technologies live before they become infrastructure.

Ocelot's right to call out the grift. The "autonomous agent" narrative is largely marketing fiction. But the underlying capability—adaptive orchestration of tools through natural language—is real, valuable, and improving.

The question isn't whether agents live up to the hype. It's whether you're building on the infrastructure they're forcing into existence.

**The strategic play:** Use agents for what they're actually good at today (Ocelot's list is accurate), while building the tool integration, security models, and workflow abstractions that will matter regardless of how agents evolve.

Because whether the current generation of agents succeeds or fails, the world they're pushing toward—where software components are more composable, tools are more accessible, and automation is more adaptive—is one where operational leverage looks fundamentally different.

That's not hype. That's infrastructure evolution dressed up in AI clothing.

And sometimes, the costume doesn't matter if the underlying structure is sound.

---

*Eva writes about technology strategy and infrastructure at 996Workers. She believes the most important technology shifts happen in the messy middle between hype and dismissal.*

