---
layout: lecture
title: lecture 2 - given a model of the world
course: cs234
permalink: /brain/cs234/given-a-model-of-the-world
order: 3
---

**Resources:**
- [Lecture Video](https://youtu.be/E3f2Camj0Is?feature=shared)

### Markov Process and Markov Chains
- Memoryless / random sequence of events which satisfies the markov property
- No rewards, no actions
- Dynamics model specifies the probability of the next state given the previous state. This is expressible as a matrix:
$$
\begin{pmatrix}
P(s_1 \vert s_1) & P(s_1 \vert s_2) & \dots & P(s_1 \vert s_N)\\
\\ \vdots & \vdots & \ddots & \vdots
\\ P(s_N \vert s_1) & P(s_N \vert s_2) & \dots & P(s_N \vert s_N)
\end{pmatrix}
$$ 

### Markov Reward Process
- Markov Reward Process: Markov Chains + rewards (no actions)
- $S:$ Finite number of states ($s \in S$)
- $P:$ Dynamics / transition model where $P(s _{t+1} = s' \vert s_t = s)$
- $R:$ Reward function $R(s_t = s) = E[r_t \vert s_t = s]$
  - Tied to immediate state or state and next state
- $\gamma:$ Discount factor [0, 1]

### Return and Value Function
- **Horizon:** The number of time steps in an episodes
  - Can be infinite or finite (finite Markov Process)
- **Return:** Discounted sum of rewards from time step t to horizon
  - $G_t = r_t + \gamma r _{t+1} + \gamma^2 r _{t+2} \dots$
- **Value Function:** Expected return from a state
  - $V(s) = E[G_t \vert s_t = s] = E[r_t + \gamma r _{t+1} + \gamma^2 r _{t+2} \dots \vert s_t = s]$
  - Same as return if the process is deterministic (single next state from a state)
  - Different from return if process is stochastic

### Discount Factor
- Used to avoid inifinite returns and values
- $\gamma = 0:$ Only care about immediate rewards
- $\gamma = 1:$ Future reward and immediate reward equally beneficial
  - Use $\gamma = 1$ for finite episode lengths (for mathematical convenience)

### Computing Value of a Markov Reward Process
- Estimate by simulation by generating a large number of episodes
  - Average the returns
  - Requires no assumption of Markov structure
- Using markov structure
  - MRP Value Function: $V(s) = R(s) + \gamma \sum _{s' \in S}P(s' \vert s)V(s')$ 
    - $R(s):$ Immediate rewards
    - $\gamma \sum _{s' \in S}P(s' \vert s)V(s'):$ Discounted sum of future rewards
- Matrix form of Bellman Equation for MRPs: $V = R + \gamma PV$
  - Simplify equation to: $V - \gamma PV = R = (I - \gamma P)V = R \rightarrow V = (I - \gamma P)^{-1}R$

$$
\begin{pmatrix}
V(s_1)\\
\\ \vdots 
\\ V(s_N)
\end{pmatrix} = 
\begin{pmatrix}
R(s_1)\\
\\ \vdots 
\\ R(s_N)
\end{pmatrix} + \gamma
\begin{pmatrix}
P(s_1 \vert s_1) & P(s_1 \vert s_2) & \dots & P(s_1 \vert s_N)\\
\\ \vdots & \vdots & \ddots & \vdots
\\ P(s_N \vert s_1) & P(s_N \vert s_2) & \dots & P(s_N \vert s_N)
\end{pmatrix}
\begin{pmatrix}
V(s_1)\\
\\ \vdots 
\\ V(s_N)
\end{pmatrix}
$$ 

- Iterative Algorithm for Computing Value of an MRP (Dynamic Programming)
  - Initialize $V_0(s) = 0$ for all s
  - For k = 1 until convergence
    - For all s in S
      - $V_k = R(s) + \gamma \sum _{s' \in S}P(s'\vert s)V _{k-1}(s')$

### Markov Decision Processes
- Markov reward processes with actions ($a \in A$)
- We have a dynamics model that is specified differently for *each action* $\rightarrow P(s _{t+1} = s' \vert s_t = s, a_t = a)$
  - Multiple matrices (one for each action)
- Our reward function can be a function current state, current state + action, or current state + action + next state
  - $R(s_t = s, a_t = a) = E[r_t \vert s_t = s, a_t = a]$
- Can express MDPs as a tuple of $(S, A, R, P, \gamma)$

**Policies**
- Expressed as $\pi(a_t = a \vert s_t = s) = P(a_t = a \vert s_t = s)$
- Specifies which action to take in each state $\rightarrow$ can be deterministic or stochastic
- Markov Reward Process = MDP + Policy $\rightarrow$ specifying a policy induces MRP because it defines the expected rewards and transition model
  - $R^{\pi}(s) = \sum _{a \in A} \pi(a \vert s)R(s,a)$
  - $P^{\pi}(s) = \sum _{a \in A} \pi(a \vert s)P(s'\vert s,a)$

### Policy Evaluation
- Iterative Algorithm (Bellman Backup)
  - Initialize $V_0(s) = 0$ for all s
  - For k = 1 until convergence
    - For all s in S
      - $V^{\pi}_k = r(s, \pi(s)) + \gamma \sum _{s' \in S}P(s'\vert s, \pi(s))V^{\pi} _{k-1}(s')$

### MDP Control
- We want to find the optimal policy
  - $\pi^*(s)  = argmax _{pi} V^{\pi}(s)$
  - There exists a unique optimal value function
- Optimal Policy Characteristics (for infinite horizon MDPs):
  - Deterministic
  - Stationary (doesn't depend on time step)
  - not necessarily unique (there could be ties between policies that get the optimal value function)

### Policy Search
- We know that the number of deterministic policies is $\vert A \vert ^{\vert S \vert}$
- Using enumeration is inefficient (evaluating every policy exhaustively)
- We prefer policy iteration

### [MDP Policy Iteration](#mdp-policy-iteration)
- We take a "guess" of the optimal policy, we evaluate it, and then we try to improve it until we cannot improve it anymore
- Algorithm:
  - Set i = 0
  - Intialize $\pi_{0}(s)$ randomly for all states $s$
  - While i == 0 or $\vert\vert \pi_i - \pi _{i-1}\vert\vert > 0$ (L1 Norm to see if policy changes) 
    - $V^{\pi i} \leftarrow \text{MDP Value Function}$
    - $\pi _{i+1} \leftarrow \text{Policy Improvement}$
    - $i = i + 1$
- **State Value:** $V^{\pi}(s)$
  - *"If you start in state s and follow a policy, what is the discounted sum of rewards"*
- **State-Action Value:** $Q^{\pi}(s, a) = R(s, a) + \gamma \sum _{s' \in S} P(s' \vert s, a)V^{\pi}(s')$ 
  - *"If you start in state s, take an action, and then follow a policy, what is the discounted sum of rewards"*
- **Policy Improvement:**
  - Compute the state action value of a policy 
    - For s in S and a in A
      - Compute $Q ^{\pi i}(s,a) = R(s, a) + \gamma \sum _{s' \in S} P(s' \vert s, a)V^{\pi}(s')$
  - Compute new policy $\pi _{i+1}$ for all $s \in S$
    -  $\pi _{i+1} = argmax _{a} Q^{\pi i}(s, a) \forall s \in S$
- Monotonic Improvement in Policy: The value of the policy is greater than or equal to the old policy for all states
- Once the policy stops changing, you know you are at the global best policy
- There is a maximum of $\vert A \vert ^{\vert S \vert}$ iterations for policy iteration

### Value Iteration
- Maintain the optimal value of starting in a state if we have a finite number of steps left in the episode
- Value function must satisfy the bellman equation
- **Bellman Backup Operator:** Allows us to transform an old value function into a new one to improve it
  - $BV(s) = max_a R(s, a) + \gamma \sum _{s' \in S}P(s' \vert s, a)V(s')$
  - For a particular policy: $B^{\pi}V(s) = R^{\pi}(s) + \gamma \sum _{s' \in S}P^{\pi}(s' \vert s)V(s)$
    - We can do policy evaluation using this operating as follows: $B^{\pi}B^{\pi}B^{\pi}\cdots V$ until it converges
- Value Iteration Algorithm
  - Set k = 1
  - Initialize $V_0(s) = 0$ for all s
  - Loop until finite horizon ends or convergence
    - For each state, s:
      - Compute $V _{k+1} = max_a R(s, a) + \gamma \sum _{s' \in S} P(s' \vert s, a)V_k(s')$ 
      - $V _{k+1} = BV_k$
      - $\pi _{k+1}(s) = argmax_a R(s,a)  + \gamma \sum _{s' \in S} P(s' \vert s, a)V_k(s')$
- Contraction Operator
  - Let $O$ be an operator $\vert x \vert$ be any norm of $x$
  - If $\vert OV - OV' \vert \leq \vert V - V'\vert$ then O is a contraction operator
  - Value iteration converges because the Bellman Backup is a contractor operator when $\gamma < 1$