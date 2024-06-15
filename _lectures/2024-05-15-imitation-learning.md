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
    - If a different action deviates from the one found in the expert example, then we come across a state space that was likely never seen before $\rightarrow$ compounds to larger errors
      - Error at time $t$ has probability of $\epsilon \rightarrow E[\text{Total Errors}] \leq \epsilon(T + (T-1) + (T-2) \dots) \approx \epsilon T^2$

### DAGGER: Dataset Aggregation
- Idea: Get more data from expert along the path taken by the policy computed by behavior cloning
  - For every state you encounter in a trajectory, you ask the expert
- **Algorithm:**
  - Initialize $D \leftarrow \emptyset$, $\hat{\pi}_1$ to any policy
  - for i = 1 to N
    - Let $\pi_i = \beta_i\pi^\ast + (1-\beta)\hat{\pi}_i$
    - Sample T trajectories using $\pi_i$
    - Get dataset $D_i = \{(s, \pi^\ast(s))\}$ of visited states by $\pi_i$ and actions given by expert
    - Aggregate datasets: $D \leftarrow D \cup D_i$
    - Train classifier $\hat{\pi} _{i+1}$ on $D$
  - Return best $\hat{\pi}_i$ during validation

### Feature Based Reward Function
- Given a state space, action space, and transition model
- Not given a reward function
- There exists a set of teacher demonstrations $(s_0, a_0, s_1, a_1 \dots)$ based on the teacher's policy
- We want to infer the reward function 
  - Teacher's policy should be optimal because we cannot infer anything when its not optimal (i.e., random behavior)
  - There can be multiple reward functions (not unique)

### Linear Feature Reward Inverse RL
- Rewards can be linear over the features: $R(s) = w^Tx(s)$ where $w \in \mathbb{R}^n ,  x: S \rightarrow \mathbb{R}^n$
  - We want to identify the weights given a set of demonstrations
  - Value Function for a policy: $V^\pi = \mathbb{E}[\sum _{t=0}^\infty \gamma^t R(s_t)] = \mathbb{E}[\sum _{t=0}^\infty \gamma^t w^T x(s_t) \vert \pi]$
    - $=  w^T \mathbb{E}[\sum _{t=0}^\infty \gamma^t x(s_t) \vert \pi] =  w^T \mu(\pi)$
      - $\mu(\pi)(s)$: discounted weighted frequnecy of state features under policy $\pi$

### Apprenticeship Learning
- $V^\ast = \mathbb{E}[\sum _{t=0}^\infty \gamma^t R^\ast(s_t) \vert \pi^\ast] \geq V^\pi =  \mathbb{E}[\sum _{t=0}^\infty \gamma^t R^\ast(s_t) \vert \pi]$
  - Therefore we can find weights such that $w ^{\ast T} \mu(\pi^\ast) \geq w ^{\ast T} \mu(\pi) \forall \pi \neq \pi^\ast$
- **Feature Matching:**
  - We want to find a reward function that the expert policy outperforms all other policies
  - For a policy to perform as well as the expert, it suffices we have a policy where its discounted sum of feature expectations match the expert policy
    - $\vert\vert \mu(\pi) - \mu(\pi^\ast) \vert \vert \leq \epsilon$
    - $\vert w^T\mu(\pi) - w^T\mu(\pi^\ast) \vert \leq \epsilon$ 
- **Algorithm:**
  - Assume: $R(s) = w^T x(s)$
  - Initialize policy: $\pi_0$
  - For $i = 0, 1, 2 \dots$
    - Find a reward function such that the teacher maximally outperforms all previous controllers
      - $argmax_w max_\gamma s.t. w^T\mu(\pi^\ast) \geq w^T\mu(\pi) + \gamma \forall \pi$
    - s.t. $\vert \vert w \vert \vert \leq 1$
    - Find optimal control policy $\pi_i$ for the current $w$
    - Exit if $\gamma \leq \epsilon / 2$ 
- Ambiguity: Infinite number of reward and policies; which one should we pick?