---
layout: lecture
title: lecture 7 - imitation learning
course: cs234
permalink: /brain/cs234/imitation-learning
order: 8
---

**Resources:**
- [Lecture Video](https://youtu.be/V7CY68zH6ps?feature=shared)

### Generalization and Efficiency
- For learning in a generic MDP, it requires a large number of samples to learn a good policy $\rightarrow$ generally infeasible.
- Alternative: Use structure + additional knowledge to constrain and speed up reinforcement learning
- Reinforcement Learning: Policies guided by rewards
  - Pros: Simple and cheap form of supervision
  - Cons: High sample complexity
  - Good for simulations where data is easy and parallelization is easy
  - Bad when actions are slow, expensive/intolerable to fail, and want to be safe

### Reward Shaping
- Rewards that are dense in time closely guide the agent
  - Can either manually design them (brittle)
  - Specify them through demonstrations

### Learning from Demonstrations
- Types of Learning from Demonstrations: Inverse RL, Imitation Learning
- Expert Provides a set of demonstration trajectories (sequences of states and actions)
  - Useful when its easier for an expert to demonstrate the desired behavior rather than specifying a reward function to generate the behavior or desired policy directly
- **Problem Setup:**
  - Input:
    - State Space, Action Space
    - Transition Model
    - No Reward Function
    - Set of one or more teacher's demonstrations $(s_0, a_0, s_1, \dots) \rightarrow$ actions from teacher's policy, $\pi^\ast$
  - Behavioral Cloning: Can we directly learn the teacher's policy using supervised learning
  - Inverse RL: Can we recover the reward function
  - Apprenticeship Learning via Inverse RL: Can we use R to generate a good policy

### Behavioral Cloning
- Formulate the problem as a standard machine learning problem
  - Fix a policy class: neural nets, decision trees, etc.
  - Estimate the policy from training examples $(s_0, a_0),(s_1, a_1), \dots$
  - Problem: Compound Errors
    - Supervised Learning assumed Independent + Identically Distributed (IID) Random Variables and ignores temporal structure
      - Error at time $t$ has probability of $\epsilon \rightarrow E[\text{Total Errors}] \leq \epsilon T$ where T is the total number of time steps
    - If a different action deviates from the one found in the expert example, then we come across a state space that was likley never seen before $\rightarrow$ compounds to larger errors
      - Error at time $t$ has probability of $\epsilon \rightarrow E[\text{Total Errors}] \leq \epsilon(T + (T-1) + (T-2) \dots) \approx \epsilon T^2$

### DAGGER: Dataset Aggregation
- 

