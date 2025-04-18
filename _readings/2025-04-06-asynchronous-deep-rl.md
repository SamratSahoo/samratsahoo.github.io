---
layout: post
title: Asynchronous Methods for Deep Reinforcement Learning
description: A paper about asynchronous parallel RL environments and modified algorithms
summary: A paper about asynchronous parallel RL environments and modified algorithms
tags: [research]
---

# Resources
- [Paper](https://arxiv.org/abs/1602.01783)

* **Introduction**  
  * Online RL algorithms thought to be unstable because of non-stationary data → updates highly correlated → use experience replay  
  * Experience replay uses more memory and compute \+ requires off-policy learning   
  * Instead of experience replay, use parallel agents in parallel environments  
    * Decorrelates agent data into stationary process  
    * Agents experience will be very different at any arbitrary timestep  
    * Enables on-policy SARSA, n-step methods, or actor-critic AND off-policy Q learning  
    * Can also be used on multi-core CPU instead of GPU → takes less time than GPU methods  
* **Related Work**  
  * GORILA: Asynchronous training of RL agents in distributed setting  
    * Each process has agent that acts on own environment with separate replay memory  
    * Gradients asynchronously sent to central server which updates central model  
  * Map Reduce for RL: Used parallelism to speed up matrix operations  
  * Parallel SARSA: Seperate actors learn using SARSA and use p2p communication to share experience with other actors  
  * Q Learning Convergence: Q learning is guaranteed to converge even with outdated information as long as it eventually gets discarded  
  * Evolutionary Methods: These can be parallelized  
* **Reinforcement Learning Background**  
  * Value based Methods: Minimize MSE in estimated Q value and actual Q value (from env) → make policy greedy or epsilon greedy with respect to Q value  
  * Policy based Methods: Directly parameterize the policy  
    * REINFORCE: Update policy parameters in direction of $\nabla\_\theta \log \pi(a\_t \vert s\_t; \theta)R\_t$   
    * Reduce variance by subtracting baselines from the return; converts gradient into $\nabla\_\theta \log \pi(a\_t \vert s\_t; \theta)(R\_t \- b\_t(s\_t))$  
      * Common baseline is value function $V^\pi(s\_t)$  
      * Advantage of action: $A(s\_t, a\_t) \= Q(a\_t, s\_t) \- V(s\_t)$  
      * Similar to actor critic where policy is actor and baseline is critic  
* **Asynchronous RL Framework**  
  * Use multiple async actors on one machine’s CPU threads → removes communication costs  
  * Each actor gets a different exploration policy → makes online updates less correlated  
    * No replay memory  
  * Reduction in training time, roughly linear with number of actor-learners  
  * On-policy training is now stable  
  * **Async one-step Q Learning**  
    * Each thread interacts with own copy of environment and computes Q learning loss   
    * Accumulates multiple steps of gradients before applying (similar to using minibatches)  
      * Reduces chance of actors overwriting other actor updates  
      * Trades off computational efficiency for data efficiency  
    * Use epsilon greedy with a sampled epsilon value for each environment  
  * **Async one-step SARSA**  
    * Same algorithm as Q learning except instead of taking max Q, we use SARSA pairs for target  
  * **Async n-step Q Learning**  
    * Computes n-step returns in forward view (instead of backward view like its usually done)  
    * Computes gradients for n-step Q learning updates for each state-action pair encountered since last update  
      * Uses longest possible n-step return  
        * One-step update for last state, two step for second to last, etc.   
      * Accumulated updates applied in single gradient step  
  * **Advantageous Actor Critic (A3C)**  
    * Maintains a policy and value function  
    * Operates in forward view eligibility trace and uses n-step returns to update policy \+ value function  
    * Updated every $t\_{max}$ steps or when a terminal state is reached  
      * Updates based on REINFORCE update step  
      * $\nabla\_\theta^{'}\log \pi(a\_t \vert s\_t; \theta^{'})A(s\_t, a\_t; \theta, \theta\_v)$  
    * Parallel actors improve policy and value  
      * Policy and value likely share some parameters  
    * Added entropy to policy to improve exploration to discourage suboptimal convergence  
      * Gradient with entropy regularization: $\nabla\_\theta^{'}\log \pi(a\_t \vert s\_t; \theta^{'})(R\_t \- V(s\_t; \theta\_v)) \+ \beta\nabla\_\theta^{'} H(\pi(s\_t;\theta))$  
  * **Optimization**  
    * Used non-centered RMSProp   
* **Experiments**  
  * **Atari 2600**  
    * Asynchronous methods faster than synchronous ones  
    * N-step methods faster than one-step ones  
    * Tuned hyperparameters using a search  
    * A3C significantly improves on SOTA average score in half the training time and no GPU for 57 games  
    * Matches human median score of dueling double DQN Almost matches median human score of Gorila  
  * **TORCS Car Racing Simulator**  
    * A3C best performing agent \-- received 75% to 90% of the score obtained by human tester  
  * **Continuous Action Control Using the MuJoCo Physics Simulator**  
    * Found good policies in under 24 hours  
  * **Labyrinth**  
    * Each episode is a new maze → much more challenging  
      * Finds a reasonable strategy for exploring mazes  
  * **Scalability and Data Efficiency**  
    * Parallel workers lead to substantial speed ups  
      * Order of magnitude faster with 16 threads  
    * Async Q Learning \+ SARSA \= superlinear speedups that cannot be explained by computational gains  
    * One-step methods require less data  
      * Reduced bias with multiple threads  
  * **Robustness and Stability**  
    * Large choice of learning rates leads to good scores → async methods are robust   
      * Almost no points with scores of 0  
      * Methods are stable and do not collapse or diverge  
* **Conclusions and Discussions**  
  * Parallel actors has stabalizing effect on learning process  
  * Online q learning possible without experience replay  
    * Although experience replay with async environments could substantially improve data efficiency  
  * Combining other RL methods with async framework could show even more improvements  
  * Can improve A3C using generalized advantage estimation  
  * Can try to use non-linear function approximation with temporal methods  
  * Can use dueling architecture or spatial softmax for more improvements