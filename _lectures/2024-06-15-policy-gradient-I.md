---
layout: lecture
title: lecture 8 - policy gradient I
course: cs234
permalink: /brain/cs234/policy-gradient-I
order: 9
---

### Policy Based Reinforcement Learning
- Previously, we approximated the value or action-value function using parameters ($\theta$) 
  - $V _{\theta}(s) \approx V^\pi(s)$
  - $Q _{\theta}(s, a) \approx Q^\pi(s, a)$
  - We then used these approximated functions to derive a policy
- Now we will directly parameterize the policy: $\pi _{\theta}(s, a) = \mathbb{P}[a \vert s;\theta]$
  - We want to find a policy with the highest value function, $V^\pi$

### Value-Based vs Policy-Based RL
- Value Based
  - Learnt value function
  - Implicit policy (i.e., $\epsilon-\text{greedy}$)
- Policy Based
  - No value function
  - Learnt policy
- Actor Critic
  - Learnt value function
  - Learnt policy

### Advantages + Disadvantages of Policy Based RL
- Advantages
  - Better convergence properties
  - Effective in higher-dimensional or continuous action spaces
  - Can learn stochastic policies
    - Useful where deterministic policies are exploitable (i.e., in Rock Paper Scissors)
      - Value based RL leads to near-deterministic policies
    - Also useful when partial aliasing occurs (differents states are indistinguishable) due to partial observability
      - Allows for stochastic polcies in aliased states
- Disadvantages
  - Converge to local rather than global optimum
  - Evaluating a policy is inefficient and high variance

### Policy Objective Functions
- Goal: given a policy $\pi (s,a)$ with parameters $\theta$, find the best $\theta$
  - Maximize J (see below)
- Start value of a policy: 
  - Episodic: $J_1(\theta) = V^{\pi \theta}(s_1)$
    - Find parameterized policy that results in highest value after H steps
  - Continuing environments (infinite horizon): $J_ {avV}(\theta) = \sum_s d^{\pi\theta}(s)V^{\pi \theta}(s)$
    - $d^{\pi\theta}$ is the stationary distribution of the Markov chain for $\pi\theta$
    - Calculates average value reached under a specific policy for infinite horizon cases
- Average reward per time step: $J_ {avR}(\theta) = \sum_s d^{\pi\theta}(s) \sum_a \pi_\theta(s, a)R(s,a)$

### Policy Optimization
- Find the policy paramters that maximize $V^{\pi\theta}$
- Gradient Free Optimization Methods (for non-differentiable functions)
  - Hill Climbing
  - Simplex / Amoeba / Nelder Mead
  - Genetic Algorithms
  - Cross Entropy Methods
  - Covariance Matrix Adaption
  - Benefits: Works with any policy parameterizations including non-differentiable
  - Limitation: Not very sample efficient because it ignores temporal structure 
- Gradient Based Methods
  - Methods
    - Gradient Descent
    - Conjugate Gradient 
    - Quasi-Newton
  - Exploits the sequential structure of MDPs

### Policy Gradient
- Search for a local maximum in $V(\theta)$
- $\Delta \theta = \alpha \nabla _\theta V(\theta)$
  - Policy Gradient = $\delta _\theta V(\theta)$
  - The gradient is with respect to the parameters that define our policy (policy-based) instead of Q function (value-based) 

### Compute Gradients By Finite Differences
- Evaluate Gradient of $\pi_\theta(s,a)$
- For each dimension k in [1, n]
  - Estimate the kth partial derivative of the objective function with respect to $\theta$
  - Do this by perturbing $\theta$ a small amount in the kth dimension
    - $\frac{\delta V(\theta)}{\delta \theta_k} \approx \frac{V(\theta + \epsilon u_k) - V(\theta)}{\epsilon}$
      - Where $u_k$ is a unit vector in the kth dimension (0 in all other dimensions)
  - Use n evaluations to compute policy gradient in n dimensions
    - Sample, noisy, inefficient but sometimes effective
    - Works for nondifferentiable policies

### Compute the Gradient Analytically
- Assume the policy is differentiable and we can compute the gradient ($\delta _\theta V(\theta)$) 

### Likelihood Ratio Policies
- Denote a state-action trajectory as ($s_0, a_0, r_0 \dots s _{T-1}, a _{T-1}, r _{T-1}, s_T$) (reaches a terminal state)
- Let $R(\tau) = \sum_0^TR(s_t, a_t)$ be the sum of rewards for trajectory $\tau$
- Policy Value: $V(\theta) = \mathbf{E} _{\pi\theta}[\sum_0^T R(s_t, a_t); \pi _{\theta}] = \sum _{\tau} P(\tau; \theta)R(\tau)$
  - For each trajectory sum the Probability of a trajectory multiplied by the reward of that trajectory
  - Goal: $argmax_\theta V(\theta) = argmax_\theta \sum _{\tau} P(\tau; \theta)R(\tau)$
    - Take the gradient of this with respect to $\theta$: $\nabla_\theta V(\theta) = \nabla_\theta \sum _{\tau} P(\tau; \theta)R(\tau)$
    - $\nabla _\theta \sum _{\tau} P(\tau; \theta)R(\tau) = \sum _{\tau} \nabla _\theta P(\tau; \theta)R(\tau)$    
    - $= \sum _{\tau} \nabla _\theta \frac{P(\tau; \theta)}{P(\tau; \theta)} P(\tau; \theta)R(\tau)$    
    - $= \sum _{\tau}  \frac{\nabla _\theta*P(\tau; \theta)}{P(\tau; \theta)} P(\tau; \theta)R(\tau)$    
      - Log Likelihood Ratio: $\frac{\nabla _\theta*P(\tau; \theta)}{P(\tau; \theta)}$
    - $= \sum _{\tau}  \nabla _\theta \log{P(\tau; \theta)} P(\tau; \theta)R(\tau)$
  - Approximate the estimate for m sample paths under policy $\pi _\theta$
    - $\nabla _\theta (\theta) \approx \hat{g} = \frac{1}{m} \sum_1^m R(\tau^i)\nabla _\theta \log{P(\tau^i; \theta)}$
      - Intuition: moving in the direction of gradient $\hat{g}_i$ pushes the log probability of the sample in proportion to how good it is based on the reward function
