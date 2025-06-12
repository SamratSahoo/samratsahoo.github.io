---
layout: post
title: >
    Progressive Neural Networks
description: A paper about progressive networks
summary: A paper about progressive networks
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1606.04671)
<br><br/>

* **Introduction**
    * Fine tuning: model is trained on source domain and output layers trained on target layers
        * Doesn't work well when there are multiple tasks
            * Which model should initialize subsequent models
            * Need to support transfer learning without catastrophic forgetting
    * Distillation is a solution but requires persistent data for all tasks
    * Progressive Networks: Architecture with support for transfer across tasks
        * Retain pool of pretrained models throughout training
        * Learn lateral connections to extract features for new tasks
        * Accumulate experience + immune to catastrophic forgetting
* **Progressive Networks**
    * Instantiates new neural network for each task being solved
        * Transfer enabled via lateral connections to prior layers
    * Architecture:
        * $L$ layers
            * Hidden activations in layer $i$: $h^{(1)}_i \in \mathbb{R}^{n_i}$
                * $n_i$: number of units in layer $i$
                * Converged parameters: $\Theta^{(1)}$
        * Training a second task means $\Theta^{(1)}$ is frozen and new parameters $\Theta^{(2)}$ instantiated
            * $h^{(2)}_i$ gets input from both $h^{(2)} _{i-1}$ and $h^{(1)} _{i-1}$
            * Generalizing to $K$ tasks: $h_i^{(k)} = f(W_i^{(k)} h _{i-1}^{(k)} + \sum _{j < k} U_i^{(k:j)}h _{i-1}^{(j)})$
    * Classical pre-train + fine-tune paradigm
        * Parameters only need to adjusted slightly to target domain
        * Assumes overlap between tasks
    * Progressive Networks make no assumptions about relationship between tasks
        * Allows them to reuse, modify, or ignore previously learned features via lateral connections
        * Previous connections not impacted by newly learned features in forward pass (due to lateral connection + frozen parameters)
            * Ensures no catastrophic forgetting
    * Application to RL
        * Each column of progressive network trains a seperate MDP
        * $\pi^{(k)}(a \vert s)$: Policy for kth column
    * Adapters: Augment progressive network with non-linear lateral connections
        * Improve initial conditioning + perform dimensionality reduction
        * Replace lateral connection with single layer MLP + multiply it by a learned scalar
            * Adjust scales for different inputs
            * Its a projection onto a subspace
            * As $k$ grows, this ensures number of parameters growing from lateral connections is same order as $\vert \Theta^{(1)} \vert$
        * $h_i^{(k)} = \sigma(W_i^{(k)} h _{i-1}^{(k)} + U_i^{(k:j)} \sigma(V_i^{(k:j)}\alpha _{i-1}^{(< k)} h _{i-1}^{(k)}))$
            * $V_i$: The projection matrix
            * $\alpha$: the learned scalar
    * Limitations of Progressive Networks
        * Number of parameters increases with number of tasks but only fraction of capacity used
            * Growth can be addressed with fewer layers or online compression during learning
        * Choosing which column to use for inference requires knowledge of task label
* **Transfer Analysis**
    * Average Perturbation Sensitivity: Inject gaussian noise at points in architecture and see impact of perturbation on performance
        * Drop in performance indicates reliance on feature map for prediction
    * Average Fisher Sensistivity: Compute modified diagonal fisher ($\hat{F}$) of policy ($\pi$) network with respect to normalized activations ($\hat{h}_i^{(k)}$) at each layer
        * Represents sensistivity of policy to small perturbations in representation
        * $\hat{F}_i^{(k)} = \mathbb{E} _{\rho(s,a)} [\frac{\partial \log \pi}{\partial \hat{h}_i^{(k)}} \frac{\partial \log \pi^T}{\partial \hat{h}_i^{(k)}}]$
        * $AFS(i,k,m) = \frac{\hat{F}_i^{(k)}(m,m)}{\sum \hat{F}_i^{(k)}(m,m)}$
            * m: feature
            * i: layer
            * k: column
            * Often useful to consider AFS by layer by summing over features: $AFS(i,k) = \sum_m AFS(i,k,m)$
* **Experiments**
    * **Setup**
        * Use A3C
        * Use average score per epsiode as performance metric
        * Transfer Score: Relative performance of architecture compared with single column baseline
    * **Pong Soup**
        * Variants
            * Noisy: Gaussian noise added to inputs
            * White: White background
            * Zoom: Input scaled by 75% and translated
            * V-Flip/H-Flip/VH-Flip: Input flipped vertically, horizontally, or both
        * Fine-tuning only the output layer (other layers frozen) fails to learn task in most scenarios (negative transfer)
        * Fine-tuning all layers results in much better transfer
        * Progressive networks outperform fine-tuning methods
            * Mean and median scores improve
            * Mean score much higher, indicating that progressive networks can exploit transfer when transfer is possible
        * Pong to H-flip: low and mid level vision layers largely reused by fully connected layers need to be relearned
        * Pong to Zoom: low level vision reused, mid-level vision relearned
        * Pong to Noisy: Low level vision relearned (filter not sufficiently tolerant to added noise)
            * Noisy to Pong: does not require low level vision to be relearned
    * **Atari Games**
        * Train on 3 source games (pong, river raid, and seaquest)
        * Assess if transfer occurs to target games (Alien, Asterix, etc.)
        * Positive transfer occurs in about 8/12 tasks
        * Negative transfer in 2/12
        * With full fine-tuning, transfer only occurs in 5/12 tasks
        * For dissimilar games, there is negative transfer with fine-tuning but not with progressive nets
        * Analysis:
            * Negative Transfer occurs when there is a dependence on convolutional layers of previous columns
                * May be due to fast covergence to a local minima
                    * Inductive bias from learned tasks can both help or hinder in target task
                * Exploration problem: Representation is good enough for a functional but suboptimal policy
            * Positive Transfer occurs when earlier features augmented by new features
    * **Labyrinth**
        * Labyrinth: 3D maze with partial obervability
        * Progressive nets offer more positive transfer than other approaches
        * Less transfer on dense reward sceanrios (easily learned)
        * On easy levels, all transfer learning approaches do well and are stable
        * On hard levels, fine tuning approach struggles but progressive nets do well
