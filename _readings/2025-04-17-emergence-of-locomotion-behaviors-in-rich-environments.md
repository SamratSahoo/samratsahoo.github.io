---
layout: post
title: Emergence of Locomotion Behaviours in Rich Environments
description: A paper that explores generalizing locomotion tasks with dynamic environments
summary: A paper that explores generalizing locomotion tasks with dynamic environments
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1707.02286)
<br><br/>

* **Introduction**
    * In continuous control tasks, like locomotion, we need to carefully handcraft the reward function
    * Reward engineering is brittle + agent should be able to learn from itself
    * Sensitivity to reward functions = type of overfitting (not generalizable)
    * Paper uses procedurelly generated obstacle courses for agent with different difficulties
        * Acts as implicit curriculum
        * Increases difficulty over time improves learning speed
    * Distributed PPO (DPPO): Builds on top of TRPO and PPO + distributes computation like A3C
* **Large scale reinforcement learning with Distributed PPO**
    * Robust policy gradients with PPO
        * Use policy gradients with baselines (advantage function)
        * Use trust region constraint that restricts policy update size (via adaptive PPO KL Penalty)
    * Scalable reinforcement learning with Distributed PPO
        * Data collection + gradient calculation distributed across workers
        * Averaging gradients + applying them synchronously leads to better results
        * Use K-step advantage estimation: $\hat{A}_t = \sum _{i=1}^K \gamma^i r _{t+i} + \gamma V _\phi(s _{t+K}) - V _\phi(s_t)$
        * Uses centralized parameter server
        * Workers synchronize their parameters after every gradient step
* **Evaluation of Distributed PPO**
    * Benchmarked on Planar Walker, Humanoid, and Memory Reacher
    * DPPO achieves similar performance to TRPO but with lower wall clock time. 
    * DPPO is faster than A3C in wall clock time
* **Methods: environments and models**
    * **Training environments**
        * Rewards
            * Rewards are simple and only signal the agent to make progress (i.e., going forward or not deviating from track)
            * Not carefully fine tuned to achieve certain behavior
        * Terrain / Obstacles
            * Hurdles: Agent needs to jump or climb over
            * Gaps: Agent needs to jump
            * Variable Terrain: Different features like hills, ramps, 
            * Slalom Walls: Agent needs to walk around
            * Platform: Agent can jump over or crouch under
            * Trained on different types of courses: single-type, mixtures of single-typed, mixed-terrains, stationary courses, and curriculum courses
        * Observations
            * Agents have sensors on them for proprioceptive and exteroceptive features.
            * Terrain information given too
    * **Policy parameterization**
        * Two subnetworks
            * One for proprioceptive information
            * One for exteroceptive information
* **Results**
    * Planar Walker
        * Trained on hurdles, gaps, platforms, and variable terrain on mixed course and mixture of terrains
        * Acquired emergent behaviors spontaneously without fine-tuned reward function
    * Quadruped
        * Trained on variation of hurdles + obstacles that can be avoided and others that require climbing/jumping
        * Traverses reasonably well despite limitations with its body
    * Agents trained with gradually increasing difficulty improves faster than one trained on stationary terrain
    * Next train on flat and challenging courses to see if policies are robust to unobserved variation in the terrain
    * Humanoid
        * Learning is sensitive to the algorithm + many degrees of freedom
        * More variation with results 
        * Despite this, they achieve a good policy on diverse terrains
* **Discussion**
    * Training on richer environments + broader spectrum of tasks = likely improves quality + robustness of learned behaviors.
