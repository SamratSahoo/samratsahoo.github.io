---
layout: post
title: Playing Atari With Deep Reinforcement Learning
description: A paper that explores using deep reinforcement learning to play atari
summary: A paper that explores using deep reinforcement learning to play atari
tags: [research]
---

# Resources
- [Paper](https://www.cs.toronto.edu/~vmnih/docs/dqn.pdf)

# Abstract
- Model is a CNN trained using Q Learning
- Input: Raw pixel information 
- Output: Value function estimating future rewards

# Introduction
- Traditional approach: Hand selected features combined with linear value function / policy representations.
  - Dependent on quality of features
- We can use deep learning to extract features instead
- Challenges:
  - RL models need to learn from sparse, noisy, and delayed rewards
  - There is a delay between actions and resulting rewards
  - Data samples are not independent
  - Data distribution changes as new behaviors are learnt
- CNNs + SGD can help alleviate all of this
  - Use a experience replay buffer to deal with correlated data and non-stationary distributions
    - Smooths the training distribution over many past behaviors

# Background
-  Agent selects an action at any given timestep and passed into emulator
-  Emulator internal state $\neq$ agent internal state $\rightarrow$ agent state = image of game
-  Reward is change in game score
-  Task is partially observable due to perceptual aliasing (indistinguishable states)
   -  Utilize sequence of observations and actions as state ($s_t = x_1, a_1, x_2, a_2, \dots$)
   -  Sequences terminate in finite steps
-  Future rewards are discounted based on time step
-  Optimal Action Value: $ Q^*(s, a) = max_{\pi} \mathbb{E} [R_t \vert s_t = s, a_t = a, \pi]$ where $\pi$ maps sequences to actions