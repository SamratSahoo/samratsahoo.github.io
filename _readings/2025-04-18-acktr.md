---
layout: post
title: Scalable trust-region method for deep reinforcement learning using Kronecker-factored approximation
description: A paper about a trust region optimization using Kronecker-factored approximation
summary: A paper about a trust region optimization using Kronecker-factored approximation
tags: [research]
---

# Resources
- [Paper](https://arxiv.org/abs/1708.05144)

* **Introduction**
    * SGD and first-order methods explore the weight space inefficiently
        * Takes deep RL days to learn continuous control tasks
    * Training time can be reduced with parallel environments but diminishing returns as parallelism increases
    * To improve sample efficiency, techniques like natural policy gradient follow steepest descent direction using Fisher metric as the underlying metric (looks at manifold)
        * Intractable due to fisher matrix inversion
        * TRPO avoids inversion via Fisher-vector products + using many conjugate gradient iterations for update
            * Requires large number of samples per batch to estimate curvature
            * Impractical for large models + sample inefficient
    * Kronecker Factored Approximation (K-FAC)
        * Each update is comparable to 1 SGD update
        * Keeps track of running average of curvature; allows small minibatches
            * Implies improves sample efficiency
* **Background**
    * **Reinforcement learning and actor-critic methods**
        * Paper follows policy gradient method with advantage function with k-step returns which is learned through function approximation 
            * Performs temporal difference updates with MSE
    * **Natural gradient using Kronecker-factored approximation**
        * Using gradient descent, we find $\delta \theta$ that minimizes $J(\theta + \delta \theta)$ such that $\vert\vert \delta \theta \vert\vert _B \lt 1$
            * $\vert\vert x \vert\vert_B = (x^TBx)^{\frac{1}{2}}$ and B is a positive semidefinite matrix
            * Solution: $\delta \theta \propto -B^{-1}\nabla _\theta J$
                * When norm is euclidean, $B = I$ (used in gradient descent)
                * Euclidean norm depends on parameterization
                    * Not favorable because parameterization is arbitrary + shouldn't affect optimization trajectory
                    * Natural gradients constructs norm based on fisher information matrix (approximation of KL)
                        * Independent of model parameterization; more stable updates
                        * Impractical for modern neural nets with millions of parameters; need approximations
        * Kronecker-factored approximation to Fisher matrix allows approximate + efficient natural gradient updates
            * Let $p(Y \vert x)$ be output distribution
            * Let $L = \log p(y \vert x)$ be the log-likelihood
            * Let $W$ be the weight matrix of a layer with $C _{in}$ and $C _{out}$ as the number of input and output neurons
            * Let $a$ be the input activation vector to the layer
            * Let $s = Wa$ be the pre-activation vector for the next layer
            * Let $\nabla _{W} L = (\nabla _{s}L)a^T$ be the weight gradient
            * K-FAC Fisher Information Approximation: $F _l = \mathbb{E}[vec (\nabla _W L) vec (\nabla _W L)^T] = \mathbb{E}[aa^T \otimes \nabla_s L (\nabla_s L)^T]$
                * $\approx \mathbb{E}[aa^T] \otimes \mathbb{E}[ \nabla_s L (\nabla_s L)^T] = A \otimes S$
                * Where $A =\mathbb{E}[aa^T]$ and $S = \mathbb{E}[ \nabla_s L (\nabla_s L)^T]$
                * Assumes 2nd order statistics of activations + gradients uncorrelated
            * K-FAC is approximate natural gradient update
                * $vec(\Delta W) = \hat{\mathbb{F _l}}^{-1} vec(\nabla _W J) = vec(A^{-1} \nabla _W JS^{-1})$
                * Only requires computations of matrix sizes of W
            * Distributed K-FAC reaches 2 - 3x speed up
            * K-FAC has been extended to handle CNNs
* **Methods**
    * **Natural gradient in actor-critic**
        * ACKTR: actor-critic using Kronecker-factored trust region
            * Use kronecker factorization to compute natural gradient update and apply it to actor and critic
            * Fisher information matrix for policy:
                * $F = \mathbb{E} _{p(\tau)}[(\nabla _{\theta} \log \pi(a_t \vert s_t))(\nabla _{\theta} \log \pi(a_t \vert s_t))^T]$
                * Where $p(\tau)$ is the trajectory distribution
            * Fisher information matrix for critic:
                * Define it to be a gaussian distribution $p(v \vert s_t) \sim \mathbb{N}(v; V(s_t), \sigma^2)$
                * Setting $\sigma = 1$, equivalent to vanilla gauss-newton method (extension of newton's method).
            * Usually beneficial to have architecture where lower level representation is shared but has distinct output layers
                * Can define a joint distribution: $p(a,v \vert s) = \pi (a \vert s)p(v \vert s)$ and construct fisher information matrix with respect to this
                * Apply K-FAC for approximation and apply updates
    * **Step-size Selection and trust-region optimization**
        * Usually natural gradient uses SGD like updates: $\theta = \theta - \eta F^{-1}\nabla _{\theta}L$
            * Can result in large updates, causing premature convergence to deterministic policy
        * Trust Region Approach
            * Update scaled down to modify policy distribution by at most a specified amount
            * Step size: $\eta = min(\eta _{max}, \sqrt{\frac{2 \delta}{\Delta \theta^T F \Delta \theta}})$
            * learning rate $\eta _{max}, trust region radius \delta$ are hyperparameters
* **Experiments**
    * **Discrete Control**
        * ACKTR signficantly outperforms A2C and TRPO in terms of sample efficiency
        * ACKTR got 12 times the performance of humans
        * On par with Q learning methods for sample efficiency with less computation time
    * **Continuous Control**
        * ACKTR outperforms or is on par with A2C on most mujoco tasks 
        * ACKTR achieves a specified threshold faster on all but 1 mujoco task where TRPO outperforms it
        * Learning from raw pixel data, ACKTR outperforms A2C in episodic reward 
    * **A better norm for critic optimization?**
        * Regardless of which norm is used for critic, applying ACKTR for actor brings improvements compared to baseline
        * Using Gauss-Newton norm for critic is more substantial for sample efficiency and rewards than euclidean
            * Also helps stabilize training (larger variance with euclidean norm)
            * Gauss-Newton sets $\sigma = 1$. Adaptive Gauss-Newton Using variance of bellman error instead
                * Results in no signficant improvement 
    * **How does ACKTR compare with A2C in wall-clock time?**
        * Only increases computing time by at most 25% relative to A2C
    * **How do ACKTR and A2C perform with different batch sizes**
        * ACKTR performed equally well with batch sizes of 160 and 640 
        * With larger batch size, A2C experienced worse sample efficiency
        * Larger batch sizes work better with ACKTR than A2C