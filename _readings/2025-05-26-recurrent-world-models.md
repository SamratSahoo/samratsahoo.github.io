---
layout: post
title: >
    Recurrent World Models Facilitate Policy Evolution
description: A paper about world models
summary: A paper about world models
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1809.01999)
<br><br/>

* **Introduction**
    * Humans develop mental model based on perception
        * Predict future sensory data based on actions
    * Use recurrent networks in partially observable scenarios to draw on memories
    * Predictive model (M) exploited by controller (C) to which learns through RL to perform a task
    * Model based RL approaches learn an environment but also train on one
        * We can replace RL environments with generated ones with the M model
    * Use a temperature parameter to control uncertainty
        * Controller trained in more uncertain version of generated environment; prevents controller from taking advantage of imperfections of M
* **Agent Model**
    * Visual sensory component compressed into representation
    * Memory component that makes predictions about future representations based on past observations
    * Decision making component to take actions based on vision and memory
    * Vision Component:
        * VAE converts 2d image to representation
    * Memory Component
        * Compresses what happens over time into representation
        * Output a probabibility density function for stochastic representation
        * Approximate representation through mixture of gaussians
        * Computes: $P(z _{t+1} \vert a_t, z_t, h_t)$
        * Can use temperature ($\tau$) to control uncertainty
        * Called a mixture density network (MDN-RNN)
    * Decision Making Component:
        * Single linear layer model that maps vision representation and memory output to an action output
        * $a_t = W_c [z_t, h_t] + b_c$
        * Can be trained via backprop or evolutionary strategies
* **Car Racing Experiment: World Model for Feature Extraction**
    * Training procedure
        * Collect rollouts
        * Train VAE to encode frames
        * Train MDN-RNN to model $P(z _{t+1} \vert a_t, z_t, h_t)$
        * Evolve controller to maximize episodic reward (via CMA-ES)
    * **Experiment Results**
        * Vision without Memory:
            * Controller network becomes $a_t = W_c z_t + b_c$
            * Agent can still navigate the track but misses on sharp corners and wobbles around
            * Adding another layer to controller helps but isn't sufficient to solve the task
        * Vision and Memory:
            * Combining vision and memory, agent has good representation of the current state and future expectations
            * Can attack sharp corners well + is more stable
            * Doesn't need to plan ahead because RNN representation contains distribution of future which it can use to guide decisions
            * Does not need any preprocessing on frames $\rightarrow$ can take raw RGB pixels
* **VizDoom Experiment: Learning Inside of a Generated Environment**
    * We want to know if an RL agent can learn inside of its generated environment
    * **Experiment Setup**
        * We make the model predict next state and whether the agent terminates
        * Generated environment is more challenging because of our ability to add uncertainty
            * Agent ends up scoring higher on generated environment as a result
            * Higher temperature = prevent agent from taking advantage of imperfections
    * **Cheating the World Model**
        * Agents sometimes discover adversarial policies (i.e., moving in a speciifc way to extinguish fireballs)
        * Since M is probabilistic, it may generate trajectories that don't follow laws of actual environment
        * Controller also has access to all hidden states of M
            * Agent can determine how to manipulate hidden states $\rightarrow$ easier to find an adversarial policy to fool dynamics model
            * Makes it so that previous model based RL methods can't use learned dynamics models to fully replace environments
            * Uncertainty estimates can help mitigate this
            * Recent works combine model-based with model-free to fine tune policies on real environment after the policy has been learned
        * Use MDN-RNN as distribution of possible outcomes rather than predicting a deterministic future
            * Builds in stochasticity and allows us to use temperature to control randomness
            * Using a mixture of gaussians is useful to model discrete events 
            * Too low of a temperature = mode collapse (doesn't generalize well to real environment)
            * Too high of a temperature = too hard for agent to learn
* **Discussion**
    * Agents trained to simulate reality could be useful for sim2real
    * VAE may encode irrelevant parts of the task
        * Training with the MDN-RNN lets it learn task relevant features
        * Would need to retrain VAE to reuse for new tasks
    * Need an iterative training process so that the world model can be improved over time
    * LSTMs have limited memory inside of weights
        * Need to replace the model with higher capacity models
        * Use external memory modules for more complicated worlds
    * Classical Controller-Model systems ignore spatio-temporal details (don't profit from hierarchal planning)
        * Alternative approaches allow controllers to learn to addres subroutines of the world model
        * We can compress the controller and world model into 1 and use behavioral replay to avoid forgetting old prediction + control skills when learning new ones