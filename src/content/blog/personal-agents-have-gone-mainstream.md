---
title: "Personal Agents Have Gone Mainstream"
author: "Sajal Sharma"
pubDatetime: 2026-09-30T00:00:00Z
slug: personal-agents-have-gone-mainstream
featured: true
draft: false
tags:
  - ai-agents
  - personal-ai
  - openclaw
  - consumer-ai
description: "Meta's Muse, OpenAI's Dots, and Instinct brought personal agents to the mainstream within a year of OpenClaw. Most people still use AI to ask questions, and trust now depends on who you let hold your data."
ogImage: "/images/blog/personal-agents-have-gone-mainstream/light/personal-agents-timeline.png"
canonicalURL: ""
---

![A timeline from November 2025 to September 2026. Open-source milestones: OpenClaw, Mac minis selling out, Hermes Agent, and OpenClaw 2.0. Large-company milestones: OpenClaw's creator joining OpenAI, Google Gemini Spark, Meta Muse, OpenAI Dots, and Instinct at a $10B valuation.](/images/blog/personal-agents-have-gone-mainstream/light/personal-agents-timeline.png)
_Personal agents, from hobby project to mainstream_

In the space of three weeks, Meta [launched Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) and watched it [climb to the top of the US App Store](https://techcrunch.com/2026/09/25/meta-is-putting-its-muscle-behind-muse-as-the-ai-app-takes-off/), OpenAI [announced Dots](https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/) at DevDay, and Instinct, a startup whose founder is 23, [raised \$1B at a \$10B valuation](https://fortune.com/2026/09/30/noah-shinn-instinct-ai-assistant-meta-muse-alexandr-wang-tech-series-c-ai-agent-mark-zuckerberg/) for an assistant you text like a friend. All three point to the same shift: from an assistant that answers your questions to one that gets things done for you, like booking travel, cancelling a subscription, or sitting through a phone call while you do something else.

Less than a year ago, that kind of agent mostly lived on the Mac minis of people who enjoy tinkering on weekends. I'm one of them.

## Table of contents

## Where it started

A lot of it started with [OpenClaw](https://github.com/openclaw/openclaw). Peter Steinberger released it in November 2025 as a self-hosted, always-on agent you could message on WhatsApp or Telegram, with skills, local memory, and proactive capabilities that let it take actions on your behalf without being prompted. By late January, [Mac minis were selling out](https://www.macworld.com/article/3043356/the-mac-mini-is-at-the-center-of-the-latest-ai-meme.html) because people wanted a machine to run it around the clock, and in February Steinberger [joined OpenAI](https://steipete.me/posts/2026/openclaw) to work on personal agents. Nous Research's [Hermes Agent](https://hermes-agent.nousresearch.com/) followed with a learning loop that writes and refines its own skills from experience. Both projects now sit above 250,000 GitHub stars.

I've run my own assistant on OpenClaw for most of this year, taught it to a few hundred people on O'Reilly, and I'm currently test driving Hermes on my Mac Mini to see how its self-learning capabilities hold up in real-world use. That experience shapes a lot of what follows.

The big launches take the core idea from these projects, an agent that stays on and has its own computer to work with, and move that computer into the cloud. Getting started no longer involves a Mac mini on a shelf or an afternoon with config files.

## From asking to doing

The bigger hurdle is that most people still use AI to ask questions. OpenAI's own [study of ChatGPT usage](https://www.nber.org/papers/w34255) from last year found that practical guidance, seeking information, and writing make up roughly three quarters of conversations, and that "asking" messages were growing faster than "doing" ones. ChatGPT Agent [reportedly](https://the-decoder.com/chatgpt-agent-reportedly-lost-75-of-its-users-because-nobody-knew-what-it-was-actually-for/) peaked at around 4 million weekly users and fell below a million within months, largely because people couldn't tell what it was for.

That makes sense to me once you look at what delegation involves. Asking a question costs nothing, and if the answer is bad, you close the tab. Getting something done means picking which task to hand over, giving the agent access to your accounts, and living with the result.

More than 900 million people a week have a very capable assistant in ChatGPT, and after nearly four years of chatting, most of them treat it as a better search box and writing helper.

![A spectrum from asking to getting things done. Asking examples: explain this lease clause, rewrite my email, plan a weekend in Victoria. Getting-things-done examples: book the ferry and hotel, cancel my gym membership, sit through the insurance call. Most ChatGPT use sits at the asking end. Getting things done involves three steps: pick the task, grant access, and live with the result.](/images/blog/personal-agents-have-gone-mainstream/light/personal-agents-asking-to-doing.png)
_From asking questions to getting things done_

## Why the cute personas

Both Muse and Dots also introduce the agent as a cute, friendly character, with Dots arriving as a bubbly little avatar. My read is that the personas are aimed squarely at getting people to delegate: handing an errand to a character you chat with feels like asking a favour, which makes the first delegated task feel small. Putting Muse inside WhatsApp and Dots inside Slack and Teams works the same way, since people come across the agent in apps they already use every day.

Proactive features like [ChatGPT Pulse](https://techcrunch.com/2025/09/25/openai-launches-chatgpt-pulse-to-proactively-write-you-morning-briefs) push in the same direction. Once the assistant brings you something useful without being asked, you start to think of it as something that works for you between conversations. Muse's downloads grew at more than twice ChatGPT's daily launch rate over its first ten days, so the approach seems to be helping, at least with downloads.

## Who gets your data

The friendly persona also makes it easy to overlook the amount of access involved. For Muse to book your travel and sort out your bills, it needs your email, your calendar, and a payment method. Would you give Meta access to your whole inbox?

Plenty of people will, since the convenience is real and they already spend their day in WhatsApp, but I think trust in personal agents comes down to which company you're comfortable letting hold that data. Instinct's early terms [gave the company a perpetual licence](https://techcrunch.com/2026/08/24/instincts-powerful-ai-assistant-is-raising-privacy-and-security-concerns/) to user materials, which is easy to miss behind a friendly text thread.

There's also the question of what happens when you want to switch. A year into using Muse, the agent would know your routines, your contacts, your preferences, and the history of every errand it has run; moving to Dots or anything else means rebuilding all of that unless the memory comes with you, and I haven't seen any of these launches say much about memory export.

Part of the appeal of OpenClaw and Hermes for people like me is that the memory and credentials sit on a machine I own, in plain files I can read and move. The tradeoff is that I'm the one managing the risks, from vetting every skill I install to keeping that machine locked down. As these agents take on more of your errands, choosing which company to trust becomes the main decision.

![A comparison of where a personal agent's data lives. On your machine (OpenClaw, Hermes): memory is plain files on a machine you own, logins and keys stay on your machine, you vet every skill and keep the machine locked down, and you take your files to the next agent. In their cloud (Muse, Dots, Gemini Spark): memory is stored on the company's servers, email, calendar, and payments are linked to their agent, the company runs security with isolated VMs and approval checks, and switching means rebuilding what the agent knew about you.](/images/blog/personal-agents-have-gone-mainstream/light/personal-agents-where-your-data-lives.png)
_Where your data lives_

## Where this goes next

My guess is that the pattern from the last ten months continues. Open-source projects like OpenClaw and Hermes will keep acting as the lab for ideas such as self-improving skills, long-term memory, and agents that run on their own schedule, and the large companies will package the ideas that hold up and bring them to a few hundred million people.

The interesting questions now are which company people will trust with their inbox and their card, and what will convince someone who mostly uses ChatGPT for emails to hand an agent their first real errand. I'd be curious whether you've delegated anything meaningful to one of these agents yet, and what made you trust it (or not).

<!-- TODO: link "LinkedIn article" to the article URL. -->

_This post also appeared as a LinkedIn article on September 30, 2026._
