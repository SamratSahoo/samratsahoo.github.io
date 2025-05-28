---
layout: post
title: >
    Unifying Count-Based Exploration and Intrinsic Motivation
description: A paper about cts-based pseudocounts
summary: A paper about cts-based pseudocounts
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1606.01868)
<br><br/>

* **Introduction**
    * Exploration looks at reducing uncertainty over environment's reward + dynamics
        * Uncertainty quantified by confidence intervals or posterior
        * Confidence intervals + posterior shrink inversely to square root of visit count $N(x,a)$
    * Model-Based Interval Bonuses with Exploration Bonus solves an augmented bellman equation
        * $V(x) = max _{a \in \mathcal{A}}[\hat{R}(x,a) + \gamma \mathbb{E} _{\hat{P}}[V(x')] + \beta N(x,a)^{- 1/2}]$
    * Count based methods don't work well in large domains where states are rarely visited more than once
    * Intrinsic motivation provides guidance for exploration
        * Learning Progress: Guide based on prediction error
            * $e_n(A) - e _{n+1}(A)$: difference in error over some event A at time $n$ and $n+1$
    * Intrinsic motivation equivalent to count based
        * Information gain (KL between prior + posterior) can be related to confidence intervals
        * Pseudo Count: Connects information gain as learning progress and count based exploration
* **Notation**
    * $\chi$: Countable state space
        * $x _{1:n} \in \chi^n$: Sequence of length n
        * $\chi^\ast$: Set of finite sequences
        * $x _{1:n}x$: concatenation of state to sequence
        * $\epsilon$: Empty sequence
    * $\rho_n (x) = \rho(x; x _{1:n})$: conditional probability of $X _{n+1} = x$ given $X_1 \dots X_n = x _{1:n}$
    * $\mu_n (x) = \mu(x; x _{1:n}) = \frac{N_n(x)}{n}$: Empirical distribution derived from a sequence
        * $N_n$: empirical count function (can be extended to state-action spaces as well; i.e., $N_n(x,a)$)
        * Limit Point (Convergence point): markov chain stationary distribution 
* **From Densities to Counts**
    * $N_n(x)$ almost always 0
        * Doesn't tell us state novelty
    * **Pseudo-Counts and the Recoding Probability**
        * Recoding probability of state $x$: $\rho_n'(x) = \rho(x; x _{1:n}x)$
            * Probability assigned to $x$ after observing new occurence of $x$
        * Two unknowns
            * Pseudo-count function: $\hat{N_n}(x)$
            * Pseduo-count total: $\hat{n}$
            * Constraint 1: $\rho_n(x) = \frac{\hat{N_n}(x)}{\hat{n}}$
            * Constraint 2: $\rho_n'(x) = \frac{\hat{N_n}(x)+1}{\hat{n}+1}$
            * Derive pseduo count: $\hat{N_n}(x) = \frac{\rho_n(x) (1 - \rho_n'(x))}{\rho_n'(x)- \rho_n(x)} = \hat{n}\rho_n(x)$
        * Learning-Positive Density Model
            * Learning Positive: If for all $x _{1:n} \in \chi$ and $x \in \chi$: $\rho_n'(x) \geq \rho_n(x)$
                * $\hat{N_n}(x) \geq 0$ iff $\rho$ is learning positive
                * $\hat{N_n}(x) = 0$ iff $\rho_n(x) = 0$
                * $\hat{N_n}(x) = \infty$ iff $\rho_n(x) = \rho_n'(x)$
            * If $\rho_n = \mu_n$, then $\hat{N}_n = N_n$
            * If model generalizes across states, then so do pesudo counts
    * **Estimating the Frequency of a Salient Event in FREEWAY**
        * Event of interest: Chicken has reached the very top of the screen
        * Apply 250,000 steps of waiting followed by 250,000 steps of going up
        * Pseduo count is almost 0 on first occurrence of salient event
            * Increases slightly during 3rd period
        * Pseudo counts are a fraction of real visit counts
        * Ratio of pseudo-counts is different from ratio of real counts
* **The Connection to Intrinsic Motivation**
    * Information gain in relation to mixture model, $\xi$, over class of density models $\mathcal{M}$
        * $\xi_n(x) = \xi(x; x _{1:n}) = \int _{\rho \in \mathcal{M}} w_n(\rho) \rho(x; x _{1:n})d \rho$
            * $w_n(\rho)$: Posterior weight of $\rho$
                * $w _{n+1}(\rho) = w_n(\rho, x _{n+1})$
                * $w_n(\rho, x) = \frac{w_n(\rho)\rho(x; x _{1:n})}{\xi_n(x)}$
        * Information Gain from observing $x$: $IG_n(x) = IG(x; x _{1:n}) = KL(w(\cdot, x) \vert \vert w_n)$
            * Difficult to compute so compute prediction gain instead: $PG_n(x) = \log \rho_n'(x) - \log \rho_n(x)$
                * If $\rho$ is learning-positive, then prediction gain is non-negative
                * Pseudo-count w.r.t. PG: $\hat{N}_n(x) \approx (e^{PG_n(x)} -1)^{-1}$
    * Theorem: 
        * $IG_n(x) \leq PG_n(x) \leq \hat{N}_n(x)^{-1}$ 
        * $PG_n(x) \leq \hat{N}_n(x)^{-\frac{1}{2}}$
            * Using an exploration bonus proportional to $\hat{N}_n(x)^{-\frac{1}{2}}$ leads to behavior as exploratory as the one derived from information gain bonus
            * Since pseudo counts correspond to empirical counts in tabular setting, this preserves theoretical guarantees
    * For existing intrinsic motivation bonuses
        * Bonuses proportional to IG or PG are insufficient for optimal exploration
        * Too little exploration relative to pseudo-counts
            * Same conclusion for bonuses proportional to L1/L2 distance between $\xi_n', \xi_n$
    * Pseudo counts don't need to learn reward/dynamics model unlike some IM algorithms
        * Learning this model means optimality guarantees can't exist 
* **Asymptotic Analysis**
    * Assumptions: Let $r(x) = \lim _{n \rightarrow \infty} \frac{\rho_n(x)}{\mu_n(x)}$ and $\dot r(x) = \lim _{n \rightarrow \infty}\frac{\rho_n'(x) - \rho_n(x)}{\mu_n'(x) - \mu(x)}$ exist for all $x$ and $\dot r(x) > 0$
        * First assumption tells us there should be a $r(x) < 1$ unless $\rho_n \rightarrow \mu$
        * Second assumption restricts learning rate of $\rho$ relative to $\mu$
        * First assumption tells us $\rho_n(x)$ and $\rho_n'(x)$ have a common limit
    * Theorem: Ratio of pseudo-counts to empirical counts exists for all $x$
        * $\lim _{n \rightarrow \infty} \frac{\hat{N}_n(x)}{N_n(x)} = \frac{r(x)}{\dot r(x)}(\frac{1 - \mu(x)r(x)}{1 - \mu(x)})$
    * Relative rate of change plays role in ratio of pseudo to empirical counts
        * Density model update: $\rho_n(x) = (1 - \alpha_n)\rho _{n-1}(x) + \alpha_n \mathbb{I}(x_n = x)$
        * When $\alpha_n = \frac{1}{n}$, this update rule turns into empirical distribution
        * For $n^{-\fracP{2}{3}}$, it turns into a stochastic approximation
            * $\lim _{n \rightarrow \infty} \rho_n(x) = \mu(x)$
            * $\lim _{n \rightarrow \infty} \frac{\rho_n'(x) - \rho_n(x)}{\mu_n'(x) - \mu(x)} = \infty$ because $\mu_n'(x) - \mu(x) = \frac{1}{n}(1 - \mu_n'(x))$
                * We should require $\rho$ to converge at $\Theta(1/n)$ rate for comparisons to be meaningful
    * Corollary: Count based estimator: $\rho_n(x) = \frac{N_n(x) + \phi(x)}{n + \sum _{x' \in \chi}\phi(x')}$
        * Where $\chi(x) > 0$ and $\sum _{x \in \chi}\phi(x) < \infty$
        * $\hat{N}_n(x) / N(x) \rightarrow 1$ for all $x$ where $\mu(x) > 0$
* **Empirical Evaluation**
    * **Exploration in Hard Atari 2600 Games**
        * Use bonus: $R_n^+ (x,a) = \beta(\hat{N}_n(x) + 0.01)^{-\frac{1}{2}}$
        * Compared to optimistic initialization
        * Trained agents with DQNs (but with mixed double Q learning target with MC return)
        * Count based exploration allows us to make quick progress 
            * Optimistic initialization yields similar performance to DQN
    * **Exploration for Actor-Critic Methods**
        * Compared to A3C with and without exploration bonus
            * Augmented algorithm is called A3C+
        * A3C fails to learn on 15 games whereas A3C+ fails on 10
        * A3C+ has higher median performance and signifcantly outperforms on a quarter of the games
* **Future Directions**
    * Induced Metric: Choice of density model induces a metric over state space
    * Compatible Value Function: There may be mismatch in learning rates between value functions and density model
    * Continuous Case: This paper focuses on countable number of state spaces. We should consider continuous ones