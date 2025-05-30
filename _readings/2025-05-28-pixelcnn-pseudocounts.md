---
layout: post
title: >
    Count-Based Exploration with Neural Density Models
description: A paper about pixel cnn pseudocounts
summary: A paper about pixel cnn pseudocounts
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1703.01310)
<br><br/>

* **Introduction**
    * Exploration = reducing uncertainty about the environment
    * Bayesian methods work but are intractable in large state spaces
    * Count based approaches aren't applicable for function approximation
        * Pseudo-counts are a generalization using a density model
            * $\hat{N}(x) = \rho(x)\hat{n}(x)$
                * $\rho(x)$: density model
                * $\hat{n}(x)$: total pseudo-count computed on model's recoding probability (probabibility of seeing $x$ after being trained on an $x$)
            * Assumptions on density model  
                * Learning positive (probability of states seen should increase with training)
                * Should be trained online
                * Model step size should decay at rate of $n^{-1}$
            * Mixing MC and Q learning update rule allowed fast propagation of exploration bonuses
    * PixelCNN
        * With pseudo-counts, we compute $\rho(x), \rho'(x)$ which is expensive
            * PixelCNN uses a expressive but simplified architecture
        * Need to be careful with online training because it can cause overfitting + catastrophic forgetting
        * Pseudo counts requires decaying learning rate
            * Optimization of neural models are constrained step size - violating it causes worse effectiveness + stability of training 
* **Background**
    * **Pseudo-Count and Prediction Gain**
        * See [notes](https://samratsahoo.com/2025/05/23/cts-based-pseudocounts) on pseudo-count for notation
        * Prediction Gain: $PG_n(x) = \log \rho_n'(x) - \log \rho_n(x)$
            * Learning positive means $PG \geq 0$
        * Pseudo-count: $\hat{N_n}(x) = \frac{\rho_n(x) (1 - \rho_n'(x))}{\rho_n'(x)- \rho_n(x)} = \hat{n}\rho_n(x)$
            * Approximated via prediction gain of density model: $\hat{N}_n(x) \approx (e^{PG_n(x)} -1)^{-1}$
                * Used as an exploration bonus: $r^+ (x) = \hat{N}_n(x)^{-1/2}$
    * **Density Models for Images**
        * Original pseudo-count paper model based on context tree switches (CTS)
            * Takes in an image and assigns a probability based on product of filters where filters trained on past images
        * PixelCNN
            * Generative model that models pixel probabilities conditioned on previous pixels
    * **Multi-Step RL Methods**
        * Multistep methods interpolate between SARSA and MC methods
        * Can also use a mixed monte carlo update: $Q(x,a) = Q(x,a) + \alpha[(1 - \beta)\delta(x,a) + \beta\delta _{MC}(x,a)]$
        * Retrace($\lambda$): Uses a product of truncated importance sampling ratios to replace $\deta$ with error term
            * $\delta _{RETRACE} = \sum _{t=0}^\infty \gamma^t (\prod _{s=1}^t c_s)\delta (x_t, a_t)$
            * Mixes TD errors from all future timesteps
* **Using PixelCNN for Exploration**
    * Assumptions of density model
        * Trained online
        * Decay at rate of $1/n$
        * Learning-positive
    * Neural density model constraints
        * Drawn randomly from dataset
        * Fixed learning rate schedule 
        * Computationally lightweight to compute prediction gain (2 evaluations + 1 update)
    * **Designing a Suitable Density Model**
        * 16 feature maps + 2 residual blocks
        * Images downsized to 42x42 + quantized to 3 bit grayscale
    * **Training the Density Model**
        * Trained completely online on sequence of experiences
        * Can train on temporally correlated states (just as good as random sequence)
            * Also allows $\rho_n' = \rho _{n+1}$ so the model update doesn't need to be reverted
            * Optimizers like RMSProp track mean / variance
                * Training from minibatches on top of temporal correlation may show different statistical characteristics, leading to unstable training
        * Used a constant learning rate - was more robust
    * **Computing the Pseudo-Count**
        * Learning rate schedule cannot be modified without deteriorating model performance
        * Replace $PG_n$ with $c_n \cdot PG_n$ with a decay sequence $c_n$
            * Best decay sequence: $c_n = c \cdot n^{\frac{1}{2}}$
        * Difficult to ensure learning positiveness for neural nets
            * Threshold the $PG$ value to 0
        * Compute pseudo-count: $\hat{N}_n(x) = (exp(c \cdot n^{-1/2} \cdot (PG_n(x))_+)-1)^{-1}$
* **Exploration in Atari 2600 Games**
    * **DQN with PixelCNN Exploration Bonus**
        * PixelCNN provides an exploration bonus to a DQN agent
        * Used a mixed monte carlo update
        * Compared DQN-PixelCNN to DQN and DQN-CTS
            * CTS and PixelCNN both outperform the baseline agent on Montezuma
            * PixelCNN is SOTA on other hard exploration games
            * PixelCNN outperforms CTS on 52/57 games
    * **A Multi-Step RL Agent with PixelCNN**
        * Combined PixelCNN with Reactor
            * Only perform updates on 25% of steps to reduce computational burden
            * Prediction gain decay is $0.1n^{1/2}$
        * PixelCNN improves baseline reactor which is an improvement on baseline DQN
        * On hard exploration games, Reactor can't take advantage of the full exploration bonus
            * Across long horizons in sparse reward settings, propagation of reward signal is crucial
            * Reactor relies on $\lambda$ and the trucated importance sampling ratio which discards off-policy trajectories $\rightarrow$ cautious learning
                * Cautious learning causes it to not take advantage of the bonus
* **Quality of the Density Model**
    * PixelCNN has lower and smoother prediction gain (lower variance)
        * Shows pronounced peaks at infrequent states
    * Per step prediction gain never vanishes because step size isn't decaying
        * Model reamins mildly suprised by significant state changes
* **Importance of the Monte Carlo Return**
    * We need the learning algorithm to understand the transient nature of exploration bonuses
        * Mixed monte carlo updates help do this
    * MMC also helps in long horizon sparse settings where rewards are far apart
    * Monte carlo return on-policy increases variance in learning algorithm $\rightarrow$ prevents convergence when training off-policy
    * MMC speeds up training + improves final performance when used in PixelCNN over base DQN on some games
    * MMC can also hurt performance in some games when using PixelCNN over base DQN
    * MMC + PixelCNN bonuses have a compounding effect
    * On hard exploration games, DQN fails completely but PixelCNN + DQN does well
        * Reward bonus creates denser rewards
            * Because bonuses are temporary, agent needs to learn the policy faster than 1-step methods $\rightarrow$ MMC is the solution!
* **Pushing the Limits of Intrinsic Motivation**
    * In experiments, prediction gain was clamped to avoid adverse effects on easy exploration games
    * Increasing this scale leads to stronger exploration on hard exploration games
        * Reaches peak performance rapidly
        * Deteriorates stability of training + long term performance too
        * With reward clipping, exploration bonus becomes essentially constant (no prediction gain decay) $\rightarrow$ no longer useful signal for intrinsic motivation
    * Training on exploration bonus only is another way to get a high performing agent!
    