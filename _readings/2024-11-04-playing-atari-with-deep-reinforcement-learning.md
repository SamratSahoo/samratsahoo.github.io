---
layout: post
title: Playing Atari With Deep Reinforcement Learning
description: A paper that explores using deep reinforcement learning to play atari
summary: A paper that explores using deep reinforcement learning to play atari
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1312.5602)
<br><br/>

* **Introduction**  
  * Controlling agents with high dimensional sensory inputs is difficult  
    * Without DL: Requires hand-crafted features  
    *  Need to learn from sparse reward signals  
    * RL data distribution changes as algorithm learns new behaviors (many DL methods assume fixed data distributions)  
  * CNNs + Q-Learning can overcome these challenges from raw video data  
    * Uses experience replay for smoothening training distribution  
* **Background**  
  * Emulator internal state not available -- just the video data  
  * Feedback about an action only received after many thousand timesteps  
  * Partially observable task: agent only observes images of the current screen  
    * Perceptual aliasing: impossible to understand situation from only current screen  
  * Assumes discount factor for rewards  
  * Maximize the Q value function  
    * Value Iteration: Iterative update using bootstrapped estimate  
      * Impractical because no generalization  
    * Use function approximation instead  
      * Q-Network estimates q-value  
      * Loss function is MSE between q-value for a trajectory and estimated q-valued  
        * $L_i(\theta_i) = \mathbb{E}_{s, a \sim \rho(\cdot)}\[(y_i - Q(s, a; \theta_i))^2\]$  
          * $\rho(\cdot)$ is the behavior distribution  
  * Algorithm Is:  
    * Model Free: Doesn’t estimate environment  
    * Off-Policy: Uses a greedy policy while following behavior distribution for exploration  
    * Behavior distribution: Epsilon Greedy   
* **Deep Reinforcement Learning**  
  * Goal: Connect a deep RL algorithm to image data   
  * Can estimate an on-policy-based value function from SARSA experience  
  * Utilize experience replay to store agent’s experiences and apply q-learning updates on sampled batches  
    * Selects action based on epsilon greedy policy  
  * Advantages of Deep Q Learning over standard online Q learning  
    * Data efficiency: experience used in many updates  
    * Avoid temporal correlations with learning with consecutive samples  
    * With on-policy (no experience replay) current parameters determine next data sample parameters trained on  
      * Training distribution shifts based on training sample → causes feedback loops  
      * Behavior distribution is smoothened with experience replay  
      * Experience replay is off-policy  
  * Experience replay stores limited experiences with no priority → more sophisticated sampling = emphasize specific transitions  
  * **Preprocessing and Model Architecture**  
    * Preprocessing: Grayscale + downsampling + crop + combine last 4 frames of the history as a stack → processes them  
    * Q-Network parameterization  
      * Input: state/history  
      * Predict Q values of all actions (actions are discrete) in a single forward pass  
        * Better than predicting Q-value for each action in multiple forward passes  
    * Architecture: Convolutional Layers + Nonlinearities + Fully connected layer at the end  
* **Experiments**  
  * **Training and Stability**  
    * Evaluation Metric: total reward / average reward over games  
      * Tends to be noisy because small changes to weights = large changes in the distribution of state visits  
      * Can also look at action-value -- less noisy  
  * **Main Evaluation**  
    * Compare to SARSA for hand-engineered feature sets on atari task  
    * Their RL agents must learn the objects (don’t use color like the SARSA one does)  
    * Also reports human performance  
    * Run an epsilon greedy strategy at epsilon = 0.05  
    * TLDR of results: DQN is better than most other ML + RL Algorithms and, depending on the game, can be better, as good as, or worse than humans  
      * More challenging games = not as good