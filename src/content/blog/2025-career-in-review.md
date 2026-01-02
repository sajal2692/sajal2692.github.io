---
title: "2025: Career in Review"
author: "Sajal Sharma"
pubDatetime: 2026-01-02T00:00:00Z
slug: 2025-career-in-review
featured: true
draft: false
tags:
  - career
  - reflections
  - ai-engineering
  - teaching
description: "A reflection on a year of building AI products at a venture studio, teaching courses on O'Reilly, writing a viral blog post, and figuring things out."
canonicalURL: ""
---

_A reflection on a year of building, teaching, and figuring things out._

## Table of contents

## A Year of Building at a Venture Studio

I began 2025 working as an AI Engineer at Liminal (formerly known as Menyala), a Venture Studio in Singapore. In 2024, I'd shipped an internal AI copilot tool—a full stack system built to help analysts do competitive analysis and market research from proprietary data sources. It wasn't a glamorous product, but working together with my product manager, we managed to implement some novel UX and agentic application ideas to envision how this type of research could benefit from going beyond just English language instructions to LLMs.

I also worked on two potential ventures throughout the year. The first was a search system for AI agents, building an agentic RAG pipeline before the term really took off. The idea was to build a platform where data providers would be fairly compensated from the AI Agents accessing their data through traditional web search mechanisms. Unfortunately the project did not get funded in the end, but I still cherish the learnings I got out of it, especially on the business and commercial side: brainstorming potential business models, thinking about product and user experience, speaking to potential customers and suppliers of data - and working with a fantastic cross-functional team. I'm thankful for all those experiences.

The second project was Lana, an AI-driven underwriting platform. Along with my team, I built an end-to-end solution using TypeScript/Next.js on the frontend, Python/FastAPI on the backend, LangGraph multi-agent workflows orchestrating the intelligence, Celery and Redis handling the async workloads, Supabase for data, and AWS for infrastructure. We built a data extraction pipeline to pull specific data points from financial reports, both structured and unstructured, that downstream data science models would use for credit evaluation. We also built the foundations and frameworks for agents that could analyse loan applications for green projects, each agent examining a different dimension of the application with its own slice of data, calling specialized data science models, and contributing to a holistic assessment. It was complex orchestration work, and I learned a lot about what it would take to make multi-agent systems work in production.

With tools like Claude Code becoming absurdly capable, the nature of my work shifted. I found myself spending less time writing code line-by-line and more time thinking about _scaffolding_—the DevOps, the infrastructure, the systems that would let my team ship clean, efficient code at a pace that would have been impossible two years ago. When delivery speed increases by an order of magnitude, the bottleneck moves upstream. That became my job: making sure we could actually handle the velocity without constantly breaking things and contributing to technical debt.

The second challenge was making sure what you're building is worthwhile. The velocity of development now makes it possible to try and build multiple things and see what sticks, but there's even more concern for the technical debt that accumulates when you move from one idea to another quickly. This technical debt pollutes an LLM's context since your code is the source of truth for your product now, and even the best coding agents can falter when there are multiple possible interpretations of your feature and remnants of older designs. Maintaining this debt takes a lot of work.

---

## An Unexpected Foray into Teaching

In the middle of 2024, I was approached by O'Reilly to teach an online course on AI Agents. They had read my blog posts and considered me a good fit to make the transition to teaching through video or live content.

I've always loved taking online courses. There's something about "just in time" learning that clicks for me: finding exactly what you need, when you need it, and applying it immediately. At the time I thought it would be a good experience to learn how to curate content and record videos. Worst case scenario I pick up a new skill, best case scenario someone actually finds the course useful. I decided to give it a shot.

In early 2025, my first course went live: [_Building AI Agents with LangGraph_](https://learning.oreilly.com/course/building-ai-agents/0642572077884/). The first few months were slow. A trickle of students. But every now and then, someone would reach out on LinkedIn to say thank you and provide feedback. Things picked up through the year and by December 2025, it was in the **top 2 on-demand AI courses on O'Reilly**.

![O'Reilly Course Ranking](@assets/images/blog/2025-career-in-review/oreilly-course-ranking.jpeg)
_Building AI Agents with LangGraph - ranked #2 in on-demand AI courses on O'Reilly_

I didn't expect the course to be as popular as it is. It's not perfect of course, too introductory for some, and too advanced for others (can't make everyone happy!). My delivery is also stiff in the recorded videos, and I understand that it can make it less engaging. But the fact that people found it helpful enough to reach out personally means more to me than any rating.

This opened doors to other teaching opportunities. I delivered two sessions on "[Agentic RAG using LangGraph](https://learning.oreilly.com/live-events/agentic-rag-with-langgraph/0642572176174/)", with a third one scheduled soon. More than 200+ students in each session with incredibly positive feedback. Talking in front of (a virtual room of) that many people, teaching something I'd built expertise in through months of building and experimentation felt like a new version of myself clicking into place. It's funny that teaching a course live feels more comfortable to me than recording videos, while I expected it to be the other way around.

In the end, I love building products and solving engineering problems (both technical and human), but teaching has a different kind of gratification. I believe both experiences feed into each other: building things helps me derive insights I can share with my students, and teaching helps me become a better communicator at work.

Now I'm working on an expanded version of the AI agents course, targeting Q1 2026. A [Claude Agent SDK course](https://learning.oreilly.com/live-events/getting-started-with-claude-agent-sdk/0642572273255/0642572273248/) is also in development. Excited to see where this goes in 2026!

---

## A Blog Post That Took Off

I don't share on my blog often. It's something I strive to improve, but I find it boring to write tutorials, more so when you can just ask an LLM to read some documentation and do it for you.

I've been keeping notes about my experiences with AI engineering, updating them during commutes or while daydreaming. In July, I consolidated my notes and wrote a blog post about working effectively with AI coding tools, specifically Claude Code. I'd been using it heavily for the Lana project, and I had thoughts.

I shared the post on Reddit and got some engagement. Then it got picked up by the TLDR newsletter, featured on its front page, and it took off.

I'm mostly an unknown quantity in the software engineering blogosphere, but the post got around **10,000 views** and rocketed my blog to around 25,000 views in total for the year. More heartfelt were the emails and LinkedIn messages I got from people who found my post useful. Turns out, people love seeing behind-the-scenes experiences more than coding tutorials!

---

## The Systems That Kept Me Sane

Somewhere in the chaos of projects, courses, and the general uncertainty of building new things, I spent some time improving my personal productivity system.

I use [Things](https://culturedcode.com/things/) for task management and [Obsidian](https://obsidian.md/) for notes and reflection, and started utilizing MCP integrations to tie it all together with Claude. I try to write brief daily notes, and feed them to Claude to do AI-assisted weekly reviews that help me see patterns I'd otherwise miss. I don't follow any of it rigidly - I find it impossible. But it grounds me. When I feel lost, which happens more than I'd like to admit, I have somewhere to return to that helps me reset and prioritise within a few minutes.

I tried having a maximum of 5 active projects at any time, but found that outside of work, I can only do my best if I stick to 2 (including learning / building projects) at a time. That constraint has been freeing. I've also started treating my ever-growing list of things I want to do as a menu to pick from, rather than a checklist I have to accomplish in some arbitrary period of time. That shift in mindset has improved my focus and quality of my output.

---

## Looking Forward to 2026

Teaching has become part of my career identity now. I have more courses in the pipeline, and I'm excited to see where this path leads. There's something deeply satisfying about taking years of building experience and distilling it into something that helps others.

As I reach a decade of working, starting as a Data Scientist and then moving to an applied AI engineering space, I want to be the kind of engineer who understands things deeply, who can reason about systems from first principles, who doesn't just know how to ship but understands why things work the way they do. I'm keen to spend some time reviewing the fundamentals I learnt at Uni, and updating myself on the latest in AI Engineering.

And I want to keep building. The tools we have now make it possible to turn ideas into reality faster than ever before. Claude Code, AI-assisted everything. There's never been a better time to just make things. I have a long menu of ideas I want to explore, and I would count 2026 as a success if I can ship just one.

2026 feels like a year of foundations. Filling gaps. Staying curious. Paying it forward. Seeing what happens when you keep showing up.
