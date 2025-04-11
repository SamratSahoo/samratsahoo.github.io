---
layout: post
title: Exploration Critique Networks
description: Using cross attention between recent and past state transitions to guide exploration  
summary: Using cross attention between recent and past state transitions to guide exploration
tags: [research]
---

<b>Codebase:</b> In Progress

<b>Abstract:</b> Exploration remains a fundamental challenge in reinforcement learning, especially in environments with sparse rewards. We introduce the Exploration Critique Network (ECN), an architectural component that evaluates the exploratory merit of an action. Unlike traditional critic networks that solely evaluate the Q-value of a given state-action pair, ECNs assign an intrinsic score that quantifies the novelty of a state, action, next state transition relative to past transitions using a transformer-based cross-attention module. Integrating this with the actor-critic framework, ECN enables a dual-objective learning scheme that balances exploitation and pursuing novel states. We hope to demonstrate that agents augmented with the ECN achieve superior state-space coverage and faster convergence compared to standard exploration strategies

<b>Paper:</b> In Progress