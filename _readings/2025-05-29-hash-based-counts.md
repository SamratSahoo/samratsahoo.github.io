---
layout: post
title: >
    #Exploration: A Study of Count-Based Exploration for Deep Reinforcement Learning
description: A paper about hash based counts
summary: A paper about hash based counts
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1611.04717)
<br><br/>

* **Introduction**
    * Current RL algorithms use simple exploration strategies
        * Uniform sampling
        * IID / Correlated Gaussian noise
    * More advanced exploration strategies
        * Using an ensemble of Q networks
        * Intrinsic motivation methods with pseudo-counts
        * Variational Maximation Exploration to maximize information gain
    * Classical + theoretically justified strategies
        * Counting state-action visitations
        * Upper confidence bounds to choose action that maximizes $\hat{r}(a_t) + \sqrt{\frac{2 \log t}{n(a_t)}}$ where $n(a_t)$ is the number of times $a_t$ was chosen and $\hat{r(a_t)}$ is the estimated reward
        * Model based interval estimation exploration bonus (MBIE-EB): Counts state-action pairs with table $n(s,a)$ and applies bonus $\frac{\beta}{\sqrt{n(s,a)}}$
        * Only practical for small state spaces
    * Hash based counts
        * Discretize state space using hash function
        * Apply bonus based on state-visitation count
        * Hash function needs to balance generalization across states and distinguish between states
* **Methodology**
    * **Notation**
        * Assume standard RL MDP setting
    * **Count-Based Exploration via Static Hashing**
        * Discretize state space with hash function: $\phi : \mathcal{S} \rightarrow \mathbb{Z}$
        * Reward bonus: $r^+(s) = \frac{\beta}{\sqrt{n(\phi(s))}}$
            * $\beta$: Bonus coefficient
            * $n(\phi(s))$ is increased at every step by 1
            * Agent trained with reward $r+ r^+$
        * Performance of the method depends on hash function
            * Similar states should be merged; distant states counted seperately
        * Locally sensitive hashing converts high dimensional data to hash codes
            * SimHash measures simiarlity by angular distance; retrives binary code
                * $\phi(s) = sgn(Ag(s)) \in set(-1, 1)^k$
                    * $g: \mathcal{S} \rightarrow \mathbb{R}^D$: optional preprocessing function
                        * $A: k x D$ matrix with IID entries from gaussian 
                            * k: controls granularity (larger values = fewer collisions)
    * **Count-Based Exploration via Learned Hashing**
        * Hard to cluster with SimHash from raw pixels
        * Instead use an autoencoder to learn hashcodes
            * Input state
            * Hidden layer contains $D$ sigmoid units which round activations to closest binary number
                * Issue is same hashcodes for two different units can be reconstructed perfectly
                * Can't backprop through rounding function either
                * Instead inject uniform noise into sigmoid: $\mathcal{U}(-a, a)$
                    * When $a > \frac{1}{4}$, autoencoder reconstructs distinct state inputs
                    * Learns to spread sigmoid outputs such that $\vert b(s_i) - b(s_j) \vert > \epsilon$ to counteract injected noise
                * Loss function overcollected states: $L((s_n) _{n=1}^N) = -\frac{1}{N}\sum _{n=1}^N[\log p(s_n) - \frac{\lambda}{K} \sum _{i=1}^D min((1 - b_i(s_n))^2, b_i(s_n)^2)]$
                    * $p(s_n)$: Autoencoder output
                    * NLL term + term that presures binary code layer to take on binary values
                        * Without this, there might be a state where sigmoid not used, causing value to fluctuate around 0.5
            * Binary code is large to reconstruct the input; downsample the binary code to a lower dimensional space via SimHash
            * Need mapping from state to code to be consistent
                * Difficult due to non-stationary training data
                    * Either downsample binary code
                    * Or slow the training process down
            * Also need code to be sufficiently unique
                * Done by the 2nd term of the loss function + by saturating sigmoid units
                * Saturating sigmoids causes loss gradients to be close to 0 $\rightarrow$ minimal change in code
* **Experiments**
    * **Continuous Control**
        * SimHash is on par with VIME on MountainCar, worse than VIME on HalfCheetah, and better than VIME on SwimmerGather
        * Capable of reaching the goal in all environments
    * **Arcade Learning Environment**
        * Compare autoencoder-based learned hash code with Basic Abstraction of ScreenShots (BASS)
            * BASS is a static preprocessing with hand designed feature transformations for images
            * They modify BASS to divide RGB screen into square cells, compute average intensity of each channel, and assign resulting values to bin that partition the range
                * $feature(i,j,z) = \lfloor \frac{B}{255C^2} \sum _{(x,y) \in cell(i,j)} I(x,y,z) \rfloor$
                    * $C$: cell size
                    * $B$: number of bins
                    * $(i,j)$: cell location
                    * $(x,y)$: pixel location
                    * $z$: channel
                * Resulting feature converted to hashcode with SimHash
        * BASS performs better than baseline and autoencoder performs better than BASS; autoencoder is SOTA
        * Static/adaptive preprocessing with BASS could be good for a good hash function
        * Does not achieve SOTA on all games because TRPO doesn't reuse off-policy experience
            * Less efficient in harnessing sparse rewards