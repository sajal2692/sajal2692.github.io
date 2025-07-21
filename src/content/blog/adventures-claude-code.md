---
title: "Adventures with Claude Code: Thoughts after Two Months of Daily Use"
author: "Sajal Sharma"
pubDatetime: 2025-07-20T00:00:00Z
slug: adventures-claude-code
featured: true
draft: false
tags:
  - ai-engineering
  - ai-tools
  - software-development
  - productivity
description: "Thoughts after Claude Code for building a full-stack system, covering the productivity gains, challenges, and lessons learned from the frontier of AI-assisted software development."
canonicalURL: ""
---

## Table of contents

## Introduction

I've been using AI coding tools for more than a year now, starting with GitHub Copilot, then jumping to Cursor, from Cursor to Windsurf, and back to Cursor again. I don't pledge allegiance to any particular tool and I'm happy to jump ship if the productivity gains are considerable with the latest updates.

I tried Claude Code for the first time in May 2025. What struck me immediately wasn't the "coding agent that lives in your terminal" spiel, but how the tool approached coding tasks with seemingly simple yet powerful ideas. Before searching for and generating code, it would plan first, building a todo list before starting the code writing loop. Rather than relying on vector search to understand codebases, it used basic bash commands like `grep` and `find` to navigate and search files. These straightforward approaches dramatically enhanced the accuracy of agentic coding compared to other tools I'd used.

Claude Code clicked for me during one specific DevOps moment. I asked it to set up compute resources in my AWS account, and it delivered via Terraform, an Infrastructure-as-Code framework I had no experience with. When I needed a static IP for my backend hosted on an EC2 instance, Claude Code immediately updated my Terraform configuration with an AWS Elastic IP resource and the proper associations. Meanwhile, ChatGPT was giving me step-by-step instructions to manually configure this through the AWS portal.

This contrast changed my entire mindset. Instead of using AI-assisted coding to change parts of my codebase, I started thinking about AI as a partner in building whole systems. If it could handle infrastructure automation for a complete stranger to Terraform, what about architectural design? Refactoring? Design patterns? The answer was yes, it could handle all of these.

### What is Claude Code

Claude Code is Anthropic's AI coding assistant that lives in the developer's terminal. I think of it as an agentic pair programmer. Like other agentic coding tools, you give Claude Code a goal, and it works through the file system, making changes, running commands, and iterating until the task is complete.

What keeps me hooked is the simplicity of having it directly in my terminal and the amount of customization and workflows I can build around it. The bash command approach to codebase interaction has since been adopted by other coding IDEs, but Claude Code's terminal-native design makes it feel like a natural extension of my development environment rather than a separate tool I need to context-switch to.

### The New Reality of AI-Assisted Programming

In my opinion, AI-assisted coding is a necessity now. Adapt or die. It allows you to ship faster, learn faster, and stay competitive. It's akin to how spreadsheets revolutionized number crunching. We've matured from casual "vibe coding" memes to having these tools as indispensable workflow companions.

The adoption in big tech confirms this shift. Talking to friends at major companies, AI-assisted coding is mandated now. Teams are running experiments on how to conduct technical interviews with AI assistance, recognizing that the skill being tested is no longer raw coding ability but how effectively you can work with these tools to solve problems.

Sure, there will always be purists who prefer coding everything themselves, and that's fine. Different people enjoy different aspects of software engineering. For me, it's always been about building cool systems and creative solutions. AI-assisted coding automates the boring bits, letting me focus on architecture, problem-solving, and the parts of engineering that actually excite me.

I've been using Claude Code heavily for the past couple of months, primarily on a project at work where we're building a full-stack risk assessment system. I can't go into specific details about the business logic, but I can share the technical journey & my learnings. Leading an engineering team, I used Claude Code across the entire stack: frontend, backend, data pipelines, infrastructure, and DevOps. I'm not an expert in frontend development or infrastructure, but I still feel like I accomplished a lot and learned significantly while using Claude Code.

## What We Built

We built a proof of concept for a risk assessment system that's now moving into production phases. From the start, we designed the system with future extensions and productionization in mind. The architecture includes several interconnected components that Claude Code helped design and implement, often suggesting architectural patterns and best practices I wouldn't have considered on my own.

![basic_arch.png](@assets/images/blog/adventures-claude-code/basic_arch.png)
_A high level architecture of the POC we built using Claude Code_

### Frontend Journey

Our starting point was code downloaded from a Lovable app that the product manager on our team had created using Vite.js. Claude Code was able to port this to Next.js quite effectively. It's worth noting that services like nextlovable.com are now charging for this specific type of migration, but Claude Code handled it seamlessly as part of our broader development goals. We migrated to Next.js since our comapany uses Vercel for deployments.

### Backend Development

The backend consists of a FastAPI server handling the core application logic. We implemented authentication and session management using Supabase, set up Celery workers for async task processing of AI Agents in our system, and used Redis for job distribution.

We used LangGraph for orchestration and created specialized AI agents for different types of risk assessments. Each agent has its own connections to various data sources including Pinecone for vector search, web search capabilities, and PostgreSQL databases, all connected through the Model Context Protocol (MCP).

### Infrastructure and Data Pipelines

On the infrastructure side, we used AWS EC2 for compute, ECR for container management, Secrets Manager for credential handling, Elastic IPs, CloudWatch for monitoring, and other AWS services.We also integrated Langfuse for tracing our AI workflows.

For data handling, we built separate pipelines for ETL processes, with distinct approaches for structured and unstructured data sources.

The next few sections talk about what worked vs what didn't for me when using Claude Code, but they apply to my experiences with Agent-assisted coding in general.

## The Good: Where Claude Code Shined

### Productivity Multiplier

Claude Code excels at handling boilerplate code and low-stakes tasks, and frankly, it makes coding fun again. The rapid prototyping capabilities are impressive. It automates many parts of software engineering: refactoring, designing factory patterns, writing DevOps scripts, and in some cases even project management tasks.

A perfect example was when I was working with the Lovable app frontend code. The app wasn't using any state management system, and from my familiarity with building React.js apps many years ago, I knew how complex passing state down components using props can become. I asked Claude Code to analyze the codebase and suggest options for a state management library. It gave me multiple options with trade-offs for each, and I settled on using Zustand. Claude Code then performed the entire migration to Zustand without any breaking changes, threading the state management through dozens of components while maintaining all existing functionality.

However, care should be exercised as your codebase becomes complex or as you move toward production. Proper data modelling, strict types, abstractions, and API contracts become more critical. You also need to know when it's going down the wrong path and intervene before it wastes time and tokens - more on this in a moment.

### Knowledge Transfer

Claude Code serves as a learning accelerator for unfamiliar domains. When I was working on the frontend migration, despite not being a frontend expert, I was able to understand the architectural decisions it was making and learn Next.js patterns in the process. Similarly, with infrastructure work, it taught me Terraform concepts while implementing the actual resources.

Will I retain everything I learned from Claude Code? Probably not. But with enough repetition, I aim to retain knowledge about the core frameworks and patterns I use regularly. What's also important is gaining the intuition about when to dig deeper into my AI pair programmer's work and when to let it drive.

The caveat here is that you need to know when it's not telling you the complete truth. Rely on your own judgment and verify its explanations, especially in domains where you have some existing knowledge. In domains where you have no expertise but still need to get the job done, you'll need to invest time asking multiple LLMs for different perspectives or studying up on your own to build that foundational understanding.

### Solving Bugs

I've found Claude Code invaluable as a first responder when issues arise. Rather than immediately trying to fix problems, I use it primarily for data gathering and analysis. When something breaks, Claude Code excels at quickly scanning through logs, tracing error patterns across multiple files, and identifying potential root causes.

For instance, when our API endpoints started returning inconsistent responses, I had Claude Code analyze the request/response flow, examine our middleware chain, and cross-reference recent changes (from Git logs) with the error patterns. Most of the times, it was able to solve the problem without additional inputs from me. Other times, it gathered all the relevant context and presented a clear picture of what was happening. This allowed me to focus on the actual problem-solving rather than spending time building the context in my own head.

This approach works particularly well because Claude Code can process large amounts of code and logs much faster than I can manually, while I retain the critical thinking needed to interpret its findings and determine the actual solution.

### PR Review Assistant

Claude Code makes for a good starting point in PR review processes. You can ask it to analyze changes, spot potential issues, and suggest improvements. However, it's not a replacement for human review. It won't catch everything, particularly business logic issues or subtle architectural problems.

## You're absolutely right! Human expertise is still critical.

### Quick Wins vs Long-term Codebase Health

Lazy prompting or not checking Claude Code's work will lead to misaligned solutions that become headaches in the long run. This is perhaps the most insidious issue because the code often works initially, masking deeper problems that only surface later.

**The "Just Make It Work" Trap**: When you give Claude Code vague instructions like "fix the authentication issue" or "make the API faster," it will find a solution, but not necessarily the right solution for your specific context. In our project, I've seen it try to implement caching mechanisms when the real issue was inefficient database queries, or add authentication middleware that conflicts with existing security patterns. The immediate problem gets solved, but you're left with a system that's harder to understand and maintain.

**Compounding Misalignment**: Things get extra complex when these misaligned solutions build on each other. Each subsequent task assumes the previous implementation was correct, leading you further down a path that doesn't serve your actual needs. I've wasting hours untangling code where Claude Code had made a series of reasonable-seeming but ultimately wrong architectural decisions because I hadn't provided sufficient context about the system's true requirements.

**Pay the Engagement Tax**: You need to think deeply about the changes Claude Code is making and understand the reasoning behind them. More than micromanaging every line of code, it means staying engaged with the architectural decisions and trade-offs being made. Staying engaged when it asks you to review a diff. If you're not actively participating in the process, you'll end up with code that works for the demo but breaks down as your requirements evolve or scale.

### Technical Debt Accumulation

I've seen Claude Code create technical debt in several ways, and understanding these patterns has been crucial for maintaining code quality.

In contrast to the point I made about it erring on the side of quick wins, **Over-engineering simple problems** is also a common issue. Claude Code tends to default to _enterprise-grade_ solutions even when simpler approaches would suffice. For example, I ended up with a complex service layer for making API requests in the frontend, complete with abstract classes, dependency injection, and configuration management, when I could have simply used something like Axios with a few helper functions. The abstraction led to me wasting a few hours - more on that in a second.

**Incomplete cleanup during migrations** is another persistent problem. When migrating approaches or refactoring, Claude Code may miss cleanup tasks or leave behind orphaned code. These stale files don't just clutter your repository; they actively pollute the context for future AI-assisted work. When we ported our frontend app from Vite to Next.js, configuration files, unused imports, and deprecated components remained scattered throughout the codebase. In subsequent tasks, Claude Code would reference these obsolete files and generate code that mixed old and new patterns, creating inconsistencies that took significant effort to untangle.

**Loose typing for expedience** happens when Claude Code prioritizes getting something working over doing it properly. Without explicit instructions to maintain strict typing, it will generate loosely typed code to get the job done with minimal thinking (or tokens). We've all done this under deadline pressure! This leads to defining TypeScript interfaces or Pydantic models in multiple places, using `any` types as escape hatches, and creating runtime issues that could have been caught at compile time. The immediate productivity gain becomes a long-term maintenance burden.

The key insight here is that Claude Code optimizes for immediate task completion rather than long-term codebase health. You need to explicitly guide it toward sustainable patterns and regularly audit its work for these common debt patterns.

### Context Limitations

Even with the 200,000 token limit, Claude Code loses track of the bigger picture when your project grows complex. As your codebase grows, Claude Code starts making decisions that make sense locally but conflict with patterns established elsewhere, or fail to understand the intended boundaries between different parts of your system. It can also sometimes be blind to dependency cascades.

**The solution is you, the architect.** You need to maintain the architectural vision and provide specific instructions about how different parts of the system should interact. This means creating explicit guidelines about module responsibilities, data flow patterns, and integration points. I've started maintaining multiple architecture documents that I reference in prompts, and asking Claude Code to explain how its proposed changes fit into the broader system before implementing them. An approach that one of my friends told me about, is to have multiple Claude.md files for different components of the system, that include knowledge of how the components interact with one another.

### The Schema Validation Story

Here's a specific example of where human expertise proved critical. I was implementing type sharing across my entire codebase and asked Claude Code to use Zod for real-time data validation from APIs. Soon it started hitting issues parsing "complex" Zod schemas to TypeScript. After wasting several dollars worth of tokens trying to fix the schema parsing, I stepped back and thought about why we had complex Zod schemas in the first place.

I realized that using the complex abstract API service layer, mentioned earlier, with abstract expected types for request/responses was causing the issue. Simplifying the API layer fixed the problem entirely. This is not a "fix" for the issue in the traditional sense of writing code that solves the presenting problem. But it made architectural sense, and required understanding the root cause rather than treating the symptoms. This sort of expertise comes from you as the developer. You understand the business rules, the frameworks being used, and can determine the pros and cons when your AI peer programmer can't.

### The Shortest Path Problem

If you're not specific about your goals and instructions, AI-assisted coding tools will take shortcuts. I've seen Claude Code suggest commenting out failing tests when it couldn't figure out the fix in a couple iterations.

It's fine for this to happen if you're being careful about what you're approving and actually reviewing your agent's work. You'll catch these shortcuts early and help it align to solve actual problems instead of papering over them.

## Conclusion

After two months of intensive use, it's clear that tools like Claude Code are force multipliers that are improving at a breathtaking pace. We've seen how they excel at productivity acceleration, knowledge transfer, and handling the mechanical aspects of coding, while also creating new challenges around technical debt, context limitations, and the need for careful oversight. The engineers who will take the best advantage of these tools are those with sound foundations across their domains of expertise. You still need to understand systems design, recognize good code from bad, and maintain the bigger picture that AI tools struggle with.

After my first week with Claude Code, I was genuinely scared for my career. I felt obsolete and worried about my future income-earning capability. I had an identity crisis worse than any I'd experienced before and thought deeply about what the rise of this new paradigm of programming meant.

Instead of protecting my existing skills or mocking "vibe coding" online, instead of looking at these coding tools as competitors, I started using Claude Code day in and day out. This gave me glimpses of where human ingenuity still matters, even in fields like software engineering.

To be honest, with the pace of improvements to LLMs and agentic softwares, some of my complaints above may be invalid in the future. I may spend zero hours helping Claude Code and be 100% confident that it understands me and completes its assigned work perfectly. But this evolution will also open up my time for strategic thinking and systems-wide work, or allow me to focus more on the human side of solving engineering problems.

For now I am filled with hope that the partnership between human insight and AI capability is about amplification rather than replacement. Claude Code handles the mechanical aspects of coding while I focus on architecture, business logic, and strategic decisions. That division of labor feels sustainable and, frankly, more interesting than writing boilerplate code all day.

This experience has left me with thoughts about where software engineering as a profession is heading. In my next post, I'll explore what I think the future holds for software engineers in an AI-assisted world, and some lessons and best practices from the trenches using tools like Claude code, day in day out.
