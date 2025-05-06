---
layout: post
title: Dueling Network Architectures for Deep Reinforcement Learning
description: A paper about dual stream dqns, one for advantages and one for value functions
summary: A paper about dual stream dqns, one for advantages and one for value functions
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1507.06527)
<br><br/>

* **Introduction**  
  * Complementary approach - can be used with pre-existing algorithms  
  * Dueling Architecture  
    * Separates state-value and state-dependent action advantages into two streams (one network) → ultimately still outputs a Q-value function  
    * Shares a common convolution module  
  * Dueling architecture learns which states are valuable without having to learn effect of action for each state  
    * Good when actions don’t impact the environment in relevant way  
* **Background**  
  * Advantage function: $A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)$  
    * Expectation of advantage is 0  
    * Obtains the relative importance of each action  
  * **Deep Q Networks**  
    * Use a separate target network that gets updates every n iterations  
    * Replay buffer for data efficiency  
  * **Double Deep Q Networks**  
    * DQN faces over-optimism bias because of max operator to select and evaluate action  
    * DDQN target is: $y_i^{DDQN} = r + \gamma Q(s', argmax_{a'}Q(s', a'; \theta_i); \theta^-)$  
  * **Prioritized Replay**  
    * Prioritized Replay increases replay probability based on experience with high expected learning progress (proxy of absolute TD error)  
    * Leads to faster learning and better quality final policies  
* **The Dueling Network Architecture**  
  * Key insight: in many states, unnecessary to estimate value of action choice whereas in others its paramount to know which action to take  
  * In bootstrapping, estimation of state values is important for every state  
  * Two streams, one for advantage and one for value function  
    * Combined to produce estimate of Q-value  
  * Can be used in many classical RL algorithms like SARSA or DDQN  
  * Design  
    * One stream outputs a scalar: $V(s; \theta, \beta)$  
    * Other stream outputs a $\vert A\vert$-dimensional vector: $A(s, a, \theta, \alpha)$   
      * $\theta$: parameters of convolutional layers  
      * $\beta$: parameters of value function layers  
      * $\alpha$: parameters of advantage function layers  
    * We cannot use definition of advantage to compute Q-value: $Q(s, a; \theta, \alpha,\beta) = V(s;\theta,\beta) + A(s, a; \theta\alpha)$  
      * Q is a paramterized estimate of true Q value function  
      * V might not be a good estimator for state-value  
      * A might not be a good estimator for advantage  
    * Q value function is unidentifiable: Cannot decompose A and V from Q  
      * We can force the advantage estimator to have 0 advantage at chosen action → last module of network implements: $Q(s, a; \theta, \alpha,\beta) = V(s;\theta,\beta) + A(s, a; \theta\alpha) - max_{a' \in \vert A\vert}A(s, a';\theta, \alpha)$  
      * By doing this, we can make sure that Q = V when the optimal action is chosen (via identifability)   
      * Alternatively, you can subtract the average advantage → losing semantics of Q and V but stabalizes optimization  
        * Advantages only need to change as fast as mean  
        * Does not change the relative rank of A → preserves greedy policy based on Q-values  
* **Experiments**  
  * **Policy Evaluation**  
    * Use temporal difference learning with expected SARSA but don’t modify behavior policy  
    * Epsilon greedy policy  
    * Architecture  
      * 3 layer MLP with 50 hidden units  
      * Each stream with 2 layers with 25 hidden units  
    *  With 5 actions, both architectures converge at same speed  
    * With more actions, dueling does better  
      * V stream learns general value function shared across many similar actions at S → faster convergence  
  * **General Atari Game Playing**  
    * Architecture:  
      * Shared: 3 convolutional layers, 2 fully connected layers  
      * Streams: 1 fully connected layer with 512 units  
        * Final layer for V: single unit output  
        * Final layer for A: outputs as many units as actions possible  
    * Training:  
      * Rescale gradient by $\frac{1}{\sqrt(2)}$  
      * Clip gradients to have norm less than 10  
    * To test effects of dueling, train DDQN with clipped gradients  
    * Dueling does better than clipped DDQN and regular DDQN  
  * Robustness to Human Starts: Agent performs well simply remembering sequences of actions (because Atari is deterministic)  
    * Even with human starts, duel outperforms clipped DDQN  
  * Combined with prioritized experience replay  
    * Gradient clipping and prioritized replay have adverse interactions (PER samples have high TD error)  
      * Fixed with retuning of learning rate  
  * Saliency Maps: Compute the magnitude of the jacobians of A and V with respect to the inputs   
    * Shows where each stream of the network interacts with the input frames  
* **Discussion**  
  * Dueling architecture learns state-value function efficiently  
    * Each Q value update results in a V value update  
    * Better approximation of V → needed for TD methods  
  * Differences in Q across states small relative to magnitude of Q  
    * Small updates = cause reordering in actions → greedy policy switches abruptly  
    * Dueling architecture with separate stream can counter these effects