---
layout: lecture
title: lecture 5 - value function approximation
course: cs234
permalink: /brain/cs234/value-function-approximation
order: 6
---

**Resources:**
- [Lecture Video](https://youtu.be/buptHUzDKcE?feature=shared)

### Value Function Approximation
- Represet the state / state-action value function as a parameterized function instead of table
  - $\hat{V}(s; w)$
  - $\hat{Q}(s, a; w)$
    - $w$ is a vector of parameters of a deep neural network or something simpler
- This allows for generalization
  - Reduces the memory, computation, and experience needed to find a good $P, R / V / Q / \pi$
  - Trade offs between representational capacity and memory, computation, data
- Possible Function Approximators
  - Linear Combinations
  - Neural Networks
  - Decision Trees
  - Nearest neighbors
  - Fourier/wavelet bases

### Review: Gradient Descent
- Given a function $J(w)$ that is differentiable to $w$ 
  - Find a $w$ that minimizes J
  - Gradient: $\nabla w J(w) = \frac{dJ(w)}{dw_1}\frac{dJ(w)}{dw_2}\dots$
  - Move parameter vector in the direction of the gradient
    - $\overrightarrow{w} = \overrightarrow{w} - \alpha(\nabla w J(w))$
      - $\alpha$ is the learning rate

### Value Function Approximation for Policy Evaluation
- Core Idea: We want to find the best representation in our space for state value pairs $(s_1, V^\pi(s_1))$
- In the context of stochastic gradient descent:
  - Minimize our loss between true value function $V^\pi(s)$ and its approximation $\hat{V}(s; w)$
  - Use mean square error: $J(w) = E_{\pi}[(V^\pi(s) - \hat{V}(s; w))^2]$
    - Perform gradient descent on this: $\Delta w = \frac{-1}{2}\alpha\nabla_w J(w)$
  - Use stochastic gradient descent to calculate $\Delta w$ for a single point
- Issue: we do not have an oracle that will give us the true value function of a state ($V^\pi(s)$)

### Model Free Value Function Approximation
- In model free policy evaluation we:
  - Followed a fixed policy
  - Needed to estimate the state value and state-action value functions
- During the estimate step, we also will now fit the function approximator

### Feature Factors
- If a state vector is partially aliased (no information to estimate an effect once earlier features have been fit), then it is not markov

### Linear Value Function Approximation
- Features encode states for policy evaluation
- We can represent a value function (or state-action value function) for a policy as a weighted linear combination of features
  - $\hat{V}(s; w) = \sum _{j= 1}^n x_j(s)w_j = x(s)^Tw$
  - Objective is to minimize: $J(w) = E_{\pi}[(V^\pi(s) - \hat{V}(s; w))^2]$
  - Update = step size * prediction error * feature value
    - $\Delta w = -\frac{1}{2}\alpha (2(V^\pi(s) - \hat{V^\pi}(s)))x(s)$

### Monte Carlo Value Function Approximation
- Return $G_t$ as a noisy sample (estimate) of the true expected return
- We can supervised learning on (state, return) pairs: $(s_1, G_1), (s_2, G_2) \dots$
  - $\Delta w = \alpha (G_t - x(s_t)^Tw)x(s_t)$
- **Algorithm:**
  - Initialize $w = 0, k = 1$
  - Loop
    - sample kth episode $(s _{k,1}, a _{k,1}, r _{k,1}, s _{k,2}, a _{k,2}, r _{k,2}, \dots)$ given $\pi$
    - for $t = 1 \dots L_k$
      - if First visit or every visit to (s) in episode k then
        - $G_t(s) = \sum _{j=t}^{L_k} r _{k,j}$
        - Update weights
          - $w = w - \alpha(G_t(s) - \hat{V}(s, w))x(s)$
            - $\hat{V}(s, w) = x_s(w)$
    - $k = k+1$

### Convergence Guarantees for Linear Value Function Approximation for Policy Evaluation
- A markov chain with an MDP with a particular policy will converge to a probability distribution over states, $d(s)$
- $d(s)$: Stationary distribution over states of $\pi$
  - $\sum_s d(s) = 1$
  - $d(s') = \sum _{s} \sum _{a} \pi(s\vert a)p(s'\vert s, a)d(s)$
- We want to define the mean squared error of a linear value function approximation for a policy relative to the true value
  - $MSVE(w) = \sum _{s \in S}d(s)(V^\pi(s) - \hat{V^\pi}(s; w))^2$
    - Intuition: if there is a state that is visited rarely, then a bigger error is okay and vice versa
  - $MSVE(w _{MC}) = min_w \sum _{s \in S}d(s)(V^\pi(s) - \hat{V^\pi}(s; w))^2$
    - If you run monte carlo policy evaluation with VFA, this will converge to the best possible weights

### Batch Monte Carlo Value Function Approximation
- You have a set of episodes from a policy
- Analytically solve for best linear approximation that minimizes mean squared error on that dataset
- Let $G(s_i)$ be an unbiased sample of the true return, $V^\pi (s_i)$
  - We can find the weights that minimize the error: $argmin_w\sum _{i=1}^N(G(s_i)-x(s_i)^Tw)^2$
  - Take the derivative and set it equal to 0 and then solve for w: $w = (X^TX)^{-1}X^TG$

### Temporal Difference Learning with Value Function Approximation
- Our target value is $r + \gamma \hat{V}^\pi(s';w)$ - however this is biased estimate of the true value of $V^\pi$
- Instead we can do TD learning with value function approximation on a set of data pairs $(s_1, r_1 + \hat{V}\pi(s_2; w)), (s_2, r_2 + \hat{V}\pi(s_3; w)) \dots$
- Then we find weights to minimize: $J(w) = E _\pi[(r_j + \hat{V}\pi(s _{j+1}; w) - \hat{V}(s_j; w))^2]$
- TD(0) Difference: $\Delta w = \alpha(r + \gamma x(s')^Tw-x(s)^Tw)x(s)$
- **Algorithm:**
  - Initialize $w = 0, k = 1$
  - Loop:
    - Sample a tuple $(s_k, a_k, r_k, s _{k+1})$
    - Update Weights: $w = w + \alpha(r + \gamma x(s')^Tw-x(s)^Tw)x(s)$
    - $k = k+1$
- Convergence:
  - $MSVE(w _{TD}) = \frac{1}{1-\gamma}min_w \sum _{s \in S}d(s)(V^\pi(s) - \hat{V^\pi}(s; w))^2$
  - Weights generateed from convergence is within a constant factor of the minimum MSVE error possible
    - Not quite as good as Monte Carlo

### Control Using Value Function Approximation
- $\hat{Q}^\pi(s, a; w) \approx Q^\pi$
- Approximate policy evaluation using value function approximation
- Perform $\epsilon$-greedy policy improvement
- Can be unstable because of the intersection of function approximation, sampling, bootstrapping, and off-policy learning
  
### Action-Value Approximation with an Oracle
- Minimize the following with stochastic gradient descent: $J(w) = E_{\pi}[(Q^\pi(s, a) - \hat{V}(s, a; w))^2]$

### Linear State Action Value Approximation with an Oracle
- Features encode states and actions
  - $\hat{Q}(s, a; w) = \sum _{j= 1}^n x_j(s, a)w_j = x(s, a)^Tw$
  - Use stochastic gradient descent to update: $\nabla_w J(w) = \nabla_w E_{\pi}[(Q^\pi(s, a) - \hat{V}(s, a; w))^2]$

### Incremental Model-Free Control Approaches
- Similar to policy evaluation: true state-action value for a function is unknown so just substitute a target value
  -  Monte Carlo: $\Delta w = \alpha (G_t - \hat{Q}(s_t, a_t;w))\nabla_w\hat{Q}(s_t, a_t;w)$
  -  SARSA: $\Delta w = \alpha (r + \gamma \hat{Q}^\pi(s', a';w) - \hat{Q}(s_t, a_t;w))\nabla_w\hat{Q}(s_t, a_t;w)$
  -  Q-Learning: $\Delta w = \alpha (r + \gamma max _{a'} \hat{Q}^\pi(s', a';w) - \hat{Q}(s_t, a_t;w))\nabla_w\hat{Q}(s_t, a_t;w)$
 
### Convergence of TD Methods with VFA
- Value function approximation is not necessarily a contraction (like with bellman operators)
  - This means the value can diverge

**Convergence Guarantees:**

|                         | Tabular | Linear VFA               | Nonlinear VFA |
| :---------------------- | :------ | :----------------------- | :------------ |
| **Monte Carlo Control** | ✅       | ✅(might be oscillation)  | ❌             |
| **SARSA**               | ✅       | ✅ (might be oscillation) | ❌             |
| **Q-Learning**          | ✅       | ❌                        | ❌             |
