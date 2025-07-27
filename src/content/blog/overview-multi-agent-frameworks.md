---
title: "An Overview of Multi Agent Frameworks: Autogen, CrewAI and LangGraph"
author: "Sajal Sharma" # Replace with the actual author's name
pubDatetime: 2024-04-08T00:00:00Z
slug: overview-multi-agent-fameworks
featured: false
draft: false
tags:
  - llms
  - ai-engineering
  - langchain
  - agents
  - nlp
description: "A brief look at the components of multi-agent frameworks and the current cutting edge options."
canonicalURL: "" # Add if the article is published elsewhere
---

## Table of Contents

## Introduction

Multi-agent systems are all the rage these days, with them being used to improve both capability and performance of AI based workflows. These systems faciliate complex interactions and processes that mimic, at their best, the collaborative intelligence found in human teams.

This blog post delves into the foundational concepts of AI-driven multi-agent frameworks, discussing the role of large language models (LLMs), agents, tools, and processes in these systems. We'll also explore three leading frameworks—AutoGen, CrewAI, and LangGraph—comparing their features, autonomy levels, and ideal use cases, before concluding with strategic recommendations for adopting these frameworks.

### The Building Blocks of Multi-Agent Systems

Multi-agent systems are akin to a functional team, where each member (agent) plays a distinct role, contributing towards the completion of a pre-defined project. Let's break down the key components that constitute these complex systems.

#### Large Language Models (LLMs)

At the heart of modern multi-agent frameworks are Large Language Models—powerful AI systems adept at understanding and generating human language. These models are the brains behind the agents, enabling them to parse vast datasets, comprehend intricate queries, and produce coherent responses. LLMs empower agents with the reasoning and decision-making capabilities necessary to tackle complex tasks effectively.

#### Agents

Agents are autonomous entities programmed to perform specific tasks, make decisions, and collaborate towards a shared objective. Each agent, with its unique skills and roles, utilizes LLMs as reasoning engines, allowing for advanced decision-making and efficient task completion. Their autonomy and adaptability are crucial for the dynamic interactions and processes within multi-agent systems.

#### Tools

Tools represent specialized functions or skills that agents leverage to execute tasks. Ranging from simple data retrieval (from an API or a knowledge base) to complex analysis, these tools form the operational backbone of agents, enabling them to perform a wide array of actions. The careful selection of these tools is vital in detemining the system's overall functionality and efficiency.

#### Processes or Flows

Processes (or flows) define how tasks should be orchestrated within a multi-agent system, ensuring efficient task distribution and alignment with objectives. Processes can be defined both inter, and intra agent i.e. how an agent interacts with tools, or with outputs of other agents or computational processes.

### Leading Multi-Agent Frameworks

The choice of framework is crucial in determining the system's scalability, autonomy, and the level of control developers have. Below, we compare three prominent frameworks, each with its unique features.

#### AutoGen

[AutoGen](https://microsoft.github.io/autogen/) specializes in conversational agents, providing conversation as a high-level abstraction over multi agent collaboration. Its design ethos revolves around simulating group discussions where agents send and receive messages to initiate or continue a conversation, allowing for tool-use and human intervention as deemed necessary by the reasoning capabilities.

![autogen-agents.png](@assets/images/blog/overview-multi-agent-frameworks/autogen-agents.png)

**Key Features**

- Conversational Engagement: Agents within AutoGen can engage in dialogue, sharing messages and insights to accomplish tasks collectively.
- Customization Through Integration: Allows the integration of various components like LLMs or human inputs, offering some degree of customizability.

#### CrewAI

[CrewAI](https://www.crewai.com/) combines AutoGen's autonomy with a structured, role-playing approach, facilitating sophisticated agent interactions. It's designed for balancing autonomy with structured processes, making it ideal for both development and production phases. From my understanding, AutoGen and CrewAI are similar in terms of both being highly autonomous, while CrewAI provides a bit more flexibility by doing away with the highly opinionated 'interaction through messages' approach of AutoGen.

**Key Features**

- Role-Based Agent Design: Introduces customizable agents with predefined roles and goals, supplemented by toolsets for enhanced capabilities.
- Autonomous Inter-Agent Delegation: Agents can autonomously delegate and consult tasks among themselves, streamlining problem-solving and task management.

#### LangGraph

[LangGraph](https://python.langchain.com/docs/langgraph/) is not as much as a multi-agent-framework, than a graph framework that allows developers to define complex inter-agent interactions as graphs. It focuses on building stateful, multi-actor applications with fine-grained control over agent interactions. Think of it as a framework used for building LLM based workflows, that can be leverage to hand-craft both individual agents and multi-agent interactions.

For now, it's usually preferred for custom-built systems requiring detailed scalability and control. LangGraph is built on top of, and heavily leverages Langchain, expanding the scope of applications that require cycles, or repetitions not usually possible just by using Langchain's [LCEL](https://python.langchain.com/docs/expression_language/).

![langgraph-agents.png](@assets/images/blog/overview-multi-agent-frameworks/langgraph-agents.png)

[Here's a blog post](https://sajalsharma.com/posts/corrective-rag-langgraph/) written by me on using LangGraph for building a Corrective RAG workflow.

**Key Features**

- Stateful Multi-Actor Applications: Supports applications involving multiple interacting agents, maintaining state throughout the process.
- Cyclical Computation Support: Unique in its ability to introduce cycles within LLM applications, essential for simulating agent-like behaviors.

### A Comparative Overview

To better understand the differences and applications of these frameworks, let's examine them in a comparative table:

| Feature               | AutoGen                                                                    | CrewAI                                                            | LangGraph                       |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| **Type of Framework** | Conversational Agents                                                      | Role-Playing Agents                                               | Graph-Based Agents              |
| **Autonomy**          | Highly Autonomous                                                          | Highly Autonomous                                                 | Conditionally Autonomous        |
| **Collaboration**     | Centralized group chat                                                     | Autonomous agents with roles and goals                            | Condition-based, cycling graphs |
| **Execution**         | Managed by a dedicated agent                                               | Dynamic delegation, but possible to define hierarchical processes | All agents perform functions    |
| **Use Cases**         | Experimentation, prototyping, use cases that beget conversational patterns | Development to production                                         | Detailed control scenarios      |

All of the above frameworks allow you to customize which LLMs to use per agent, or in the case of LangGraph, per execution node.

### Strategic Recommendations

CrewAI serves as an excellent entry point for experimenting with diverse agent types and workflows, offering valuable insights into agent interactions and tool usage. This exploration phase is crucial for identifying the complexities of agent behavior, paving the way for a transition to more sophisticated frameworks like LangGraph for finer control and flexibility. LangGraph has a learning curve. Start with CrewAI for exploration, and see if it fits your needs. When you need fine-grained control, learn and switch to LangGraph, or even custom code.

However, it's essential to maintain an extensible architecture for your Generative AI applications, allowing for seamless integration or replacement of agents as the system evolves. Such an approach ensures scalability, adaptability, and future-proofing, maximizing resource utilization and efficiency.

### Conclusion

Multi-agent frameworks represent the cutting edge of AI development, offering scalable and sophisticated solutions for complex problem-solving and decision-making. By understanding the core components and comparing leading frameworks, developers can make informed decisions about the most suitable platform for their needs. As the field continues to evolve, staying adaptable and open to integrating new technologies will be key to harnessing the full potential of AI-driven multi-agent systems.

### References

1. [AutoGen](https://microsoft.github.io/autogen/): An introduction, and tutorials on using AutoGen.
2. [CrewAI](https://www.crewai.com/): Tutorials and documentation for CrewAI.
3. [LangGraph](https://python.langchain.com/docs/langgraph/): Python Documentation for getting started with LangGraph.
4. [Sam Witteveen's Youtube Channel](https://www.youtube.com/@samwitteveenai): Goes deeper into building AI applications using CrewAI (and LangGraph)
5. [Langchain's Youtube Channel](https://www.youtube.com/watch?v=5h-JBkySK34&list=PLfaIDFEXuae16n2TWUkKq5PgJ0w6Pkwtg): Has an excellent playlist for getting started with LangGraph.
