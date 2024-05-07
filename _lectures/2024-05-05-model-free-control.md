---
layout: lecture
title: lecture 4 - model free control
course: cs234
permalink: /brain/cs234/model-free-control
order: 5
---

**Resources:**
- [Lecture Video](https://youtu.be/j080VBVGkfQ?feature=shared)

### Control Objectives
- **Optimization:** Find policy with high expected rewards 
- **Delayed Consequences:** May take many time steps to see if an earlier decision was good
- **Exploration:** Need to try different actions to learn what actions can lead to high rewards

### On Policy vs Off Policy Learning
- On Policy: Use direct experience from the world to estimate and evaluate a policy by following that policy
- Off Policy: Learn to estimate and evaluate a policy using experience gathered from following a different policy

### Model Free Policy Iteration
- Revisit [policy iteration from lecture 2](http://localhost:4000/brain/cs234/given-a-model-of-the-world#mdp-policy-iteration)
- Model Free Policy Iteration Alogrithm
  - Initialize policy $\pi$
  - Repeat
    - Policy Evaluation: Compute $Q^\pi$ directly
    - Policy Improvement: Update $\pi$ given $Q^\pi$
- Monte Carlo On Policy Q Evaluation
  - Initialize $N(s, a) = 0, G(s, a) = 0, Q^\pi(s, a) = 0 \forall s \in S, \forall a \in A$
  - Loop
    - Using policy $\pi$, sample episode $i = s _{i,1}, a _{i, 1}, r _{i, 1}, s _{i,2}, a _{i, 2}, r _{i, 2}, \dots s _{i,T}$
    - Define $G _{i, t} = r _{i, t} + \gamma r _{i, t+1} + \dots$
    - For each state, action pair $(s, a)$ visited in episode i
      - For the **first or every** time t that $(s, a)$ is visited in episode i
        - $N(s,a) = N(s,a) + 1, G(s, a) = G(s, a) + G _{i,t}$
        - Update Estimate: $Q^{\pi}(s, a) = G(s, a)/N(s, a)$  
- Model Free Policy Improvement: $\pi _{i+1}(s) = argmax_a Q^{\pi i}(s, a)$
- Issue: If $\pi$ is deterministic, can't compute $Q(s,a)$ for any $a \neq \pi(s)$ (no exploration occurring so we can't evaluate it for actions not taken)

### Policy Evaluation with Exploration
- $\epsilon$ greedy policies: Balance exploration and exploitation
- Let $\vert A \vert$ be number of actions
  - With a probability of $1 - \epsilon$ take $argmax_a$
  - Else take action $a$ with probability $\frac{\epsilon}{\vert A \vert}$ (a random action)
- Monotonic $\epsilon$ greedy policy improvement: for any $\epsilon$ greedy polcicy with respect to $Q^{\pi i}, \pi _{i+1}$ is a monotonic improvement $V^{\pi i + 1} \geq V^{\pi}$
  - Assumes that the value of $Q^{\pi i}$ is being calculated exactly, not an estimate

### Greedy Limit of Infinite Exploration (GLIE)
- All state action pairs are visited an infinite number of times: $\lim _{i \rightarrow \infty} N_i(s, a) \rightarrow \infty$
  - Behavior policy converges to greedy policy
    - $\lim _{i \rightarrow \infty} \pi(a/s) \rightarrow argmax_a Q(s, a)$ with probability 1
- One way to implement this is to decay $\epsilon$ to 0 at a rate of $\epsilon_i = \frac{1}{i}$
- Will converge to Q value function to the optimal function: $Q(s, a) \rightarrow Q^*(s, a)$

### Monte Carlo Online / On Policy Control
- **Algorithm:**
  - Initialize $N(s, a) = 0, Q(s, a) = 0 \forall s \in S, \forall a \in A$ and set $\epsilon = 1, k = 1$
  - $\pi_k = \epsilon\text{-Greedy}(Q)$ // Create initial $\epsilon$-greedy policy
  - Loop
    - Sample k-th episode ($s _{k,1}, a _{k, 1}, r _{k, 1}, s _{k,2}, a _{k, 2}, r _{k, 2}, \dots s _{k,T}$)  given $\pi_k$
    - Compute $G _{k, t} = r _{k, t} + \gamma r _{k, t+1} + \dots$
    - for $t = 1 \dots T$
      - if first visit (or every visit) to $(s, a)$ in episode k
        - $N(s,a) = N(s,a) + 1$
        - $Q(s+t,a_t) = Q(s_t,a_t) + \frac{1}{N(s,a)}(G _{k, t} - Q(s_t, a_t))$
    - $k = k + 1, \epsilon = \frac{1}{k}$
    - $\pi_k = \epsilon\text{-Greedy}(Q)$

### Model Free Policy Iteration with Temporal Difference Methods
- Process:
  - Initialize policy $\pi$
  - Repeat:
    - Policy Evaluation: Compute $Q^\pi$ using TD updating with $\epsilon-\text{Greedy}$ policy
    - Policy Improvement: Same as Monte Carlo policy improvement, set $\pi$ to  $\epsilon-\text{Greedy}(Q^\pi)$
- **SARSA Algorithm:**
  - Set Initial $\epsilon\text{-Greedy}$ policy $\pi$ randomly, $t = 0$, initial state $s_t = s_0$
  - Sample an action from the policy $a_t \tilde \pi(s_t)$
  - Observe $(r_t, s _{t+1})$
  - Loop
    - Take action $a _{t+1} \tilde \pi(s _{t+1})$
    - Observe $(r _{t+1}, s _{t+2})$
    - Update Q given $(s_t, a_t, r_t, s _{t+1}, a _{t+1})$
      - $Q(s_t, a_t) = Q(s_t, a_t) + \alpha(r_t + \gamma Q(s _{t+1}, a _{t+1}) - Q(s_t, a_t))$
    - Perform policy improvement
      - $\pi(s_t) = argmax_a Q(s_t, a)$ (or random depending on $\epsilon\text{-Greedy}$)
    - $t = t+1$
- SARSA Convergence Properties
  - $Q(s, a) \rightarrow Q^*(s,a)$ (the optimal state-action value function) under the following conditions:
    - $\pi_t(a \vert s)$ satisfies GLIE
    - Step size, $\alpha_t$, needs to Robbins-Munro satisfy the sequence
      - $\sum _{t=1}^\infty \alpha_t = \infty$
      - $\sum _{t=1}^\infty \alpha_t^2 < \infty$
        - Theoretically fine to use this but empirically do not want to use this
- **Q-Learning:** Similar to SARSA but instead of looking at the next action, we look at the optimal action
  - $Q(s_t, a_t) = Q(s_t, a_t) + \alpha(r_t + \gamma max _{a^{'}}Q(s _{t+1}, a') - Q(s_t, a_t))$
  - **Q-Learning Algorithm:**
    - Initialize $Q(s, a) \forall s \in S, \forall a \in A, t= 0, s_t = s_0$
    - Set Initial policy $\pi_b$ to be $\epsilon\text{-Greedy}$ with respect to Q 
    - Sample an action from the policy $a_t \tilde \pi(s_t)$
    - Observe $(r_t, s _{t+1})$
    - Loop
      - Take action $a _{t+1} \tilde \pi(s _{t+1})$
      - Observe $(r _{t+1}, s _{t+2})$
      - Update Q given $(s_t, a_t, r_t, s _{t+1}, a _{t+1})$
        - $Q(s_t, a_t) = Q(s_t, a_t) + \alpha(r_t + \gamma max _{a^{'}}Q(s _{t+1}, a') - Q(s_t, a_t))$
      - Perform policy improvement
        - Set $\pi_b$ to be $\epsilon\text{-Greedy}$ with respect to Q 
        - $\pi(s_t) = argmax_a Q(s_t, a)$ (or random depending on $\epsilon\text{-Greedy}$)
      - $t = t+1$
  - Convergence Conditions
    - $Q^*$: Visit $s,a$ infinitely often + same $\alpha$ conditions from SARSA
    - $\pi^*$: GLIE

### Maximization Bias
- **Maximization Bias:** Bias that occurs when the estimate of a value function is greater than the true value
  - For example:
    - $\hat{V}^{\hat{\pi}} = E[max(\hat{Q}(a_1), \hat{Q}(a_2))] \geq max[E((\hat{Q}(a_1)), E(\hat{Q}(a_2)))] = max[0, 0] = 0 = V^{\pi}$
      - Note: For full context, watch [this slide of the lecture](https://youtu.be/j080VBVGkfQ?feature=shared&t=4464)

### Double Q-Learning
- Greedy policy with respect to estimated Q values can lead to maximization bias
- Avoid using the max estimate as an estimate of true value
- Use 2 Q functions instead
  - $Q_1(s_1, a)$: Used to select the max action $a^* = \rightarrow argmax_a Q_1(s_1, a)$
  - $Q_2(s_2, a^*)$: Used to estimate the value of $a^*$
  - Yields an unbiased estimate: $E[Q_2(s, a^*)] = Q(s, a^*)$
- **Algorithm:**
  - Loop
    - Select $a_t$ using $\epsilon\text{-Greedy} \pi(s) = argmax_a Q_1(s_t, a) + Q_2(s_t, a)$
    - Observe $(r_t, s _{t+1})$
    - With 50% probability Update:
      - $Q_1(s_t, a) \leftarrow Q_1(s_t, a_t)  + \alpha(r_t + \gamma max _{a^{'}}Q_1(s _{t+1}, a') - Q_1(s_t, a_t))$
    - Else:
      - $Q_2(s_t, a) \leftarrow Q_2(s_t, a_t)  + \alpha(r_t + \gamma max _{a^{'}}Q_2(s _{t+1}, a') - Q_2(s_t, a_t))$
    - $t = t+1$  