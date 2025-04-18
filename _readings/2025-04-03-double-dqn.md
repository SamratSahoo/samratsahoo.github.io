---
layout: post
title: Deep Reinforcement Learning with Double Q-learning
description: A paper about mitigating maximization bias using double q learning
summary: A paper about mitigating maximization bias using double q learning
tags: [research]
---

# Resources
- [Paper](https://arxiv.org/abs/1509.06461)

* **Introduction**  
  * Q learning learns unrealistically high action-values due to maximization step  
    * Even though approximations are imprecise during learning, overestimations become far more common  
  * Uniform overestimation in theory is fine → policy stays the same  
    * Overoptimism can usually be used as an exploration technique too  
  * If overoptimism isn’t unique, can impact policy negatively  
  * Double DQN: more accurate value estimates + higher scores on games  
* **Background**  
  * **Deep Q Networks**  
    * Main contributions: Target network + experience replay  
  * **Double Q Learning**  
    * Max operator in Q learning and DQN both use select and evaluate actions → leads to overestimation  
    * Decouple evaluation from selection  
      * Two Q value networks  
      * One network used to select greedy action  
      * Another network used to estimate Q value for state and action  
      * Roles of network switched symmetrically to ensure both networks get updated weights  
* **Overoptimism due to overestimation errors**  
  * If action values contain random errors uniformly distributed in $\[-\epsilon, \epsilon\]$ then target overestimated by $\gamma\epsilon\frac{m-1}{m+1}$ where $m$ is the number of actions  
  * Noise from environment can lead to overestimations  
  * Theorem:  
    * Let $\sum_a Q_t(s,a)  - V_{\*} = 0$ but $\frac{1}{m}\sum_a (Q_t(s,a)  - V_{\*})^2 = C \> 0$   
    * Then we know $max_a Q_t(s,a) \geq V_{\*}(s) + \sqrt{\frac{C}{m-1}}$  
    * Shows that even if on average value estimates are correct, estimation errors of any source can drive estimates up away from true optimal values  
    * Under this theorem, lower bound decreases with more actions but empirically lower bound increases with more actions  
  * Found that overestimations occur even when samples of true action values exist at certain states  
    * With bootstrapping, these estimations deteriorate even more  
    * In practice, overestimation is not uniform   
* **Double DQN**  
  * Decompose max operation into action selection and evaluation  
  * Extend the way DQN works  
    * Use online network to evaluate greedy policy  
    * Use target network to estimate value  
    * Target for TD methods: $Y_t^{DoubleDQN} = R_{t+1} + \gamma Q(S_{t+1}, argmax_a Q(S_{t+1}, a; \theta_t); \theta_t^-)$  
* **Empirical Results**  
  * **Results on Overoptimism**  
    * With DQN, values were vastly overoptimistic  
    * DDQN much closer to true value → better policies  
      * Learning is more stable with DDQN  
  * **Quality of the learned policies**  
    * Overestimation doesn’t necessarily mean bad policies → however, we usually get better learning stability without it  
    * Evaluated by randomizing start position with 30 No op actions  
    * DDQN generally improves massively on most games  
  * **Robustness to Human Starts**  
    * With deterministic games, agent could memorize sequences without needing to generalize  
    * Starting randomly ensured generalization of policy  
* **Discussion**  
  * Q-learning is overoptimistic  
  * Overestimations are more common and severe in practice  
  * Double Q learning reduces this overestimation  
  * DDQN is a deep learning approach to double Q learning  
  * DDQN finds better policies
