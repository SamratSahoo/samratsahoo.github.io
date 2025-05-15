---
layout: post
title: Exploration Critique Networks
description: Using cross attention between recent and past state transitions to guide exploration  
summary: Using cross attention between recent and past state transitions to guide exploration
category: research
tags: [research]
---

<b>Codebase:</b> <a href="https://github.com/SamratSahoo/exploration-critique-networks">https://github.com/SamratSahoo/exploration-critique-networks</a>

<b>Abstract:</b> Exploration remains a fundamental challenge in reinforcement learning, especially in environments with sparse rewards. We introduce the Exploration Critique Network (ECN), an architectural component that evaluates the exploratory merit of an action. Unlike traditional critic networks that solely evaluate the Q-value of a given state-action pair, ECNs assign an intrinsic score that quantifies the novelty of a state, action, next state transition relative to past transitions using a transformer-based cross-attention module. Integrating this with the actor-critic framework, ECN enables a dual-objective learning scheme that balances exploitation and pursuing novel states. We hope to demonstrate that agents augmented with the ECN achieve superior state-space coverage and faster convergence compared to standard exploration strategies

<b>Note:</b> Unfortunately the results of this project were unsatisfactory. I've opted to open-source this project in case someone else would like to try making it work. I didn't get the chance to pinpoint the exact cause but some hypotheses I have for why it didn't work well are:
 <ul>
  <li>Small context window / insufficient correlation between past transitions and recent transitions for cross-attention to work well</li>
  <li>Transformer training procedure was inadequate (used a similar procedure that intrinsic curiosity modules used)</li>
  <li>Non-stationarity of the exploration buffer made it difficult to train the exploration critic</li>
</ul> 
