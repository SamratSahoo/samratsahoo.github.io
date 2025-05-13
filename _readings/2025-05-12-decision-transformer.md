---
layout: post
title: >
    Decision Transformer: Reinforcement Learning via Sequence Modeling
description: A paper about the decision transformer
summary: A paper about the decision transformer
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/2106.01345)
<br><br/>

* **Introduction**
    * Want to see if modeling joint distribution of sequence of states, actions, and rewards can replace conventional RL
    * Instead of using TD learning, train a transformer on a sequence modeling objective
        * Bypass bootstrapping (introduces bias)
        * Avoid discounting rewards (which induces short sighted behaviors)
    * Transformers can do credit assignment via self-attention
        * Better than bellman backups (slow propagation + can be distracted)
    * Use for offline RL (agents learning from suboptimal data)
        * Difficult due to error propagation and value overestimation
    * You prompt the transformer with a desired return which will then generate a sequence of actions
* **Preliminaries**
    * **Offline Reinforcement Learning**
        * Assume standard reinforcement learning setting
        * Fixed dataset of trajectory rollouts of arbitrary policies
            * No exploration / feedback collection
    * **Transformers**
        * Standard transformer from attention is all you need
* **Method**
    * We want the model to generate actions based on future desired returns
        * Feed the model with rewards to go (sum of future rewards): $\hat{R}_t = \sum _{t' = t}^T r _{t'}$
        * Trajectory representation: $\tau = (\hat{R_1}, s_1, a_1, \dots, \hat{R_T}, s_T, a_T)$
        * At test time, we specify desired performance (1 for success or 0 for failure) and the starting state of the environment
            * Transformer generates action and we decrement return by achieved reward until episode termination
    * Architecture
        * Feed last $K$ timesteps (total 3K tokens: one for return-to-go, one for state, one for action)
        * Learn a linear (or convolutional) layer + normalization for each token type
        * Embedding for each time step is learned + added to a token (different from standard positional encoding)
        * Tokens fed to GPT to predict actions via autoregressive modeling
    * Training
        * Sample minibatches of sequence length $K$ from offline data 
        * Predict $a_t$ for input $s_t$ with cross-entropy (discrete actions) or MSE loss (continuous actions)
        * Predicting next state / rewards-to-go didn't improve performance
* **Evaluations on Offline RL Benchmarks**
    * Test against TD-learning and imitation learning algorithms
    * **Atari**
        * Compare with Conservative Q learning, Random Expert Mixtures, quatine regression DQN, and behavioral cloning
        * Context length, $K = 30$ (except Pong where they use $K = 50$)
        * Decision transformer performs comparably to conservative Q learning on 3/4 games and performs at baseline levels for all other algorithms
    * **OpenAI Gym**
        * 3 different offline datasets
            * Medium: Dataset from policy that achieves 1/3 score of expert policy
            * Medium-Replay: Replay buffer of agent trained to performance of medium policy
            * Medium-Expert: Medium policy data concatenated with expert policy data
        * Compare to CQL, BEAR, BRAC, AWR
        * Decision transformer achieves the highest scores on most tasks and is competitive with state of the art on other tasks
* **Discussion**
    * **Does Decision Transformer perform behavior cloning on a subset of the data?**
        * Percentile Behavior Cloning (PBC): Run behavior cloning on only top X% of timesteps, ordered by episode returns
            * 100%: Trains on entire dataset
            * 0%: Clones only the best trajectory
            * Trade off between generalization and specialization
        * On most environments, decision transformer competitive with best PBC: can train on entire dataset but hone in on subset
        * In scenarios with low data, DT outperforms PBC: DT uses all data to improve generalization even if trajectories are dissimilar
    * **How well does Decision Transformer model the distribution of returns?**
        * On every task, desired target returns highly correlated with true observed returns
            * On some tasks, trajectories almost perfectly match desired returns
        * We can prompt DT with higher returns than maximum possible; indicates DT can extrapolate
    * **What is the benefit of using a longer context length?**
        * With no context $K = 1$, DT performs terribly
        * When representing a distribution of policies, context allows transformer which policy generated the actions
    * **Does Decision Transformer perform effective long-term credit assignment?**
        * DT and behavioral cloning can create successful policies in long-term credit assignment problems
            * TD learning fails here because it takes a long time to propagate Q values over long horizons
    * **Can transformers be accurate critics in sparse reward settings?**
        * Modify DT to output return tokens too
            * First return token not given but predicted by model
        * Transformer continuously updates reward probabilities based on events during episode
            * Attends to critical events; indicates formation of state-reward associations, enabling accurate value prediction
    * **Does Decision Transformer perform well in sparse reward settings?**
        * TD algorithms require densely populated rewards
        * Transformers don't assume anything about reward density (better performance)
        * Delayed returns minimally impact DT
        * TD learning collapses in delayed reward scenarios
        * Decision transformer and PBC perform well in delayed reward scenarios
    * **Why does Decision Transformer avoid the need for value pessimism or behavior regularization?**
        * In TD learning we optimized a learned function
            * Inaccuracies in function approximation can cause failures in policy improvement
        * DT does not require optimization of learned function and hence doesn't need regularization or conservatism
    * **How can Decision Transformer benefit online RL regimes?**
        * Can act as a model for behavior generation
            * DT can serve as a memorization engine and can model a diverse set of behaviors
        