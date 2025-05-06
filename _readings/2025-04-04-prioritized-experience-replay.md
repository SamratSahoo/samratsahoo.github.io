---
layout: post
title: Prioritized Experience Replay
description: A paper about prioritizing experience in replay buffers
summary: A paper about prioritizing experience in replay buffers
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1511.05952)
<br><br/>

* **Introduction**  
  * Without experience replay, we get temporally correlated updates  
    * Loses IID assumption  
    * Forgetting potentially rare experiences is more useful  
  * With experience replay, we break temporal correlations  
    * Stabalizes value function training  
    * Reduces amount of experience needed to learn  
  * By prioritizing which experiences are replayed, we can make experience replay even more efficient  
    * RL agent can learn from some experiences effectively than others  
      * Some transitions more more/less surprising or redundant  
      * Some transitions not immediately relevant but relevant later on  
  * Prioritized Experience Replay replays transitions with high expected learning progress → measured by magnitude of TD error  
    * Prioritization can lead to loss of diversity  
    * Use stochastic prioritization + bias and correct with importance sampling for diversity   
* **Background**  
  * In neuroscience, experience replay is found in hippocampus of rodents  
    * Sequences with high TD error or rewards replayed more  
  * In value iteration, prioritizing updates makes planning more efficient  
    * Prioritized sweeping prioritizes updating state based on change in value of state  
    * TD error also can be used  
    * PER uses similar prioritization (TD error) but for model-free RL instead of model-based  
    * Stochastic prioritization more robust when using function approximators  
  * TD errors tell us where we should focus exploration  
  * When dealing with imbalanced datasets, we can resample  
    * Separate experience into two buckets (positive and negative rewards)  
    * Choose fixed fraction from each bucket to replay  
    * Only applicable for domains with positive and negative experiences  
  * DQN + DDQN are SOTA on atari  
* **Prioritized Replay**  
  * PER can be implemented in two ways  
    * Which experiences to store  
    * Which experiences to replay (paper does this)  
  * **Motivating Example**  
    * If we could experience replay with an oracle that tells us what order to use, we could get an optimal policy in far less updates   
  * **Prioritizing with TD-Error**  
    * TD error is a reasonable proxy for the amount the RL agent can learn from a transition  
      * Tells us how surprising a transition is by measuring how far value is from next step bootstrap estimate  
    * TD error prioritization algorithm  
      * Store TD error along with transition in memory  
      * Play transition with highest TD error  
      * New transitions without a known TD error are given maximum priority  
    * Implemented using a binary heap  
  * **Stochastic Prioritization**  
    * Issues with greedy prioritization  
      * TD errors only updated for replayed transitions  
        * First visit low TD errors may never be replayed for long periods of time  
      * Sensitive to noise spikes which is exacerbated with bootstrapping  
      * Focuses on small subset of experience  
        * Errors shrink over time → initially high error transitions get replayed more frequently → prone to overfitting  
    * Stochastic Sampling: interpolates between greedy and uniform sampling  
      * Probability of sampling a transition: $P(i) = \frac{p_i^\alpha}{\sum_k p_k^\alpha}$  
        * $\alpha$ is a parameter which determines degree of prioritization ($\alpha = 0$) means using uniform sampling  
    * Proportional Prioritization: $p_i = \vert\delta_i\vert + \epsilon$ where $\epsilon$ is a small positive constant to prevent 0 probability transitions  
      * Implemented with a sum-tree data structure  
    * Rank based prioritization: $p_i = \frac{1}{rank(i)}$ where $rank(i)$ is rank of transition $i$ when sorted by $\delta_i$  
      * P becomes a power law distribution  
      * Insensitive to outliers  
      * Implemented with an approximate CDF with piecewise linear function with k segments of equal probability  
        * Sample a segment and then sample transitions along it  
        * Choose k to be size of minibatch (one transition / segment)  
  * **Annealing the Bias**  
    * Estimation of expected value with stochastic updates requires update distribution = expectation distribution  
    * PER introduces bias because it changes distribution in uncontrolled fashion  
      * Changes solution estimates converge to  
      * Since we are sampling based on importance, our updates to Q networks are not following the transitions they generated and are instead from a different distribution  
        * Use importance sampling to adjust how much we change weights by  
    * Use weighted importance sampling:  
      * $w_i = (\frac{1}{N} \cdot \frac{1}{P(i)})^\beta$  
      * Compensates for non-uniform probabilities if $\beta=1$  
      * Weights can be folded into Q-learning update  
      * Normalize weights by $1/max_i w_i$ for stability  
    * In RL, unbiased updates important near convergence (process tends to be very non-stationary anyways)  
      * Bias can generally be ignored  
      * Annealing level of importance sampling over time such that $\beta$ reaches 1 near end → i.e., linear annealing  
    * Large steps disruptive because first order approximation only accurate locally → prevent with small step size  
      * With PER, high error transitions seen many times → importance sampling reduces gradient magnitudes + taylor expansion constantly re-approximated  
* **Atari Experiments**  
  * PER leads to substantial score improvements on majority of games  
  * Aggregate learning is about twice as fast  
  * PER is complementary to DDQN → increases performance another notch  
* **Discussion**  
  * Rank based is more robust because not impacted by outliers nor error magnitudes  
    * Heavy-tail = diverse samples  
    * Stratified sampling = stable gradient magnitude  
  * Rank-based blind to error scales  = performance drop when there is structure in the error distribution  
    * Clipped rewards + TD errors in DQN = similar empirical performance  
  * With regular experience replay some experience slides out of window before ever replayed  
    * With PER, the bonus given to unseen transitions ensures this doesn’t happen  
  * When using PER with representations of transitions, representation with good transitions replayed much less and learning focuses on where representation is poor → more resources into distinguishing aliased states  
* **Extensions**  
  * Prioritized Supervised Learning: We can use PER to replay samples where we can still learn much  
  * Off policy Replay: PER is analogous to using off policy RL with rejection sampling or importance sampling  
  * Feedback for Exploration: The number of times a transition is replayed is feedback for how useful it was to an agent → signal can be fed back for exploration  
    * Sample exploration hyperparameters from parameterized distribution  
    * Monitor usefulness of experience  
    * Update distribution towards generating more useful experience for exploration  
  * Prioritized Memories  
    * Controlling which memories to store and erase reduce redundancy  
    * When erasing, we need to have stronger considerations of diversity (i.e., age of memory) to preserve old memories and prevent cycles  
    * Also flexible enough to incorporate experience from external sources