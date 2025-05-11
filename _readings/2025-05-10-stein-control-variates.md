---
layout: post
title: Action-dependent Control Variates for Policy Optimization via Stein’s Identity
description: A paper about stein control variates
summary: A paper about stein control variates
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/1710.11198)
<br><br/>

* **Introduction**
    * Policy gradient = high variance
    * Control Variate: subtract monte carlo gradient estimator by baseline which has 0 expectation
        * Doesn't introduce bias but in theory reduces variance
    * Baseline choices
        * Constant (REINFORCE)
        * State-dependent baseline like V(s) (A2C)
        * Action dependent baseline (Q-Prop)
    * State-action dependent baselines could be more powerful but hard to design when expectation needs to be 0
    * Use stein control variates (depends on stein's identity) to create arbitrary baseline functions that depend on state and action
* **Background**
    * **Reinforcement Learning and Policy Gradient**
        * Assume classical reinforcement learning and policy gradient settings
        * Obtain trajectories, empirically find $\hat{Q}^\pi (s_t, a_t)$, and estimate $\nabla _\theta J(\theta)$
            * $\hat{\nabla} _{\theta} J(\theta) = \frac{1}{n} \sum _{t = 1}^n \gamma ^{t-1} \nabla _\theta \log \pi(a_t \vert s_t) \hat{Q}^\pi (s_t, a_t)$
    * **Control Variate**
        * Control Variate: a function, $f(s,a)$ with a known expectation under $\tau$ which can be assumed to be 0
        * Alternative unbiased estimator: $\hat{\mu} = \frac{1}{n} \sum _{t=1}^n (g(s_t, a_t) - f(s_t, a_t))$
            * Variance: $var _{\tau}(g - f) / n$
            * When $f$ similar to $g$, (ideally: $f = g - \mu$), variance is reduced causing a better estimator
        * For A2C and REINFORCE, the baseline cannot be equal to $Q^\pi (s,a)$ because $\phi$ (the baseline) only depends on state and not action
* **Policy Gradient with Stein Control Variate**
    * **Stein's Identity**
        * Stein's identity: $\mathbb{E} _{\pi(a \vert s)}[\nabla _a \log \pi(a \vert s) \phi(s,a) + \nabla_a \phi(s,a)] = 0$
            * $\phi(s,a)$ can be any function that hold for some conditions
            * We can achieve zero-variance estimators for general monte carlo estimations
    * **Stein Control Variate for Policy Gradient**
        * Cannot apply stein's identity directly to policy gradient
            * Policy gradient takes gradients with respect to parameters, $\theta$
            * Stein's identity takes gradient with respect to actions
        * Reparameterization:
            * Let $a = f _\theta(s, \xi)$ where $\xi$ is random noise independent of $\theta$
            * $\pi(a, \xi \vert s)$: joint distribution of $(a, \xi)$ conditioned on $s \Rightarrow \pi(a \vert s) = \int \pi(a \vert s, \xi) \pi(\xi) d\xi$
                * $\pi(\xi)$ is the noise generating distributions
                *  $\pi(a \vert s, \xi) = \delta(a - f(s, \xi))$ 
            * Reparameterized expectation: $\mathbb{E} _{\pi(a \vert s)}[\nabla _a \log \pi(a \vert s) \phi(s,a)] = \mathbb{E} _{\pi(a, \xi \vert s)}[\nabla _\theta f _{\theta}(s, \xi) \nabla_a \phi(s,a)]$
        * Stein Control Variate Policy Gradient Equation
            * $\nabla _{\theta} J(\theta) = \mathbb{E} _\pi [\nabla _{\theta} \log \pi (a \vert s) (\hat{Q}^\pi(s,a) - \phi(s,a)) + \nabla _{\theta} f _{\theta}(s, \xi) \nabla_a \phi(s,a)]$
            * Estimator: $\hat{\nabla} _{\theta} J(\theta) = \frac{1}{n}\sum _{t=1}^n [\nabla _{\theta} \log \pi (a \vert s) (\hat{Q}^\pi(s,a) - \phi(s,a)) + \nabla _{\theta} f _{\theta}(s, \xi) \nabla_a \phi(s,a)]$
        * Relation to Q-Prop
            * Q-Prop creates a control variate using a taylor expansion; this is just a special $\phi$ with an action-independent gradient
                * $\nabla_a \phi(s,a)$ in stein control variate becomes $\varphi(s)$
            * We know that $\mathbb{E} _{\pi(\xi)}[\nabla _{\theta} f(s, \xi)] = \nabla _{\theta} \mathbb{E} _{\pi(\xi)}[f(s, \xi)] = \nabla _{\theta} \mu _{\pi}(s)$ which is th expectation of the action conditioned on $s$
                * $\nabla _{\theta} f _{\theta}(s, \xi)$ becomes $\mu _{\pi}(s)$
            * Baseline function: $\phi(s,a) = \hat{V}^\pi(s) + \langle \nabla_a \hat{Q}^\pi(s, \mu _{\pi}(s)), a - \mu _\pi(s)\rangle$
        * Relation to Reparameterization
            * Auxillary objective Function: $L_s(\theta) = \mathbb{E} _{\pi(a \vert s)}[\phi(s,a)] = \int \pi(a \vert s) \phi(s,a)da$
            * Apply log derivative trick: $\nabla _\theta L_s(\theta) = \int \nabla _\theta \pi(a \vert s)\phi(s,a)da = \mathbb{E} _\pi(a \vert s)[\nabla _\theta \log \pi(a\vert s) \phi(s,a)]$
            * Reparameterized gradient when $a = f _\theta(s, \xi)$ and $L_s = \mathbb{E} _{\pi(\xi)}[\phi(s, f _\theta(s,\xi))]$: $\mathbb{E} _{\pi(a, \xi \vert s)}[\nabla _\theta f _{\theta}(s, \xi) \nabla_a \phi(s,a)]$
    * **Constructing Baseline Functions for Stein Control Variate**
        * Assume a parameteric form for baseline: $\phi_w(s,a)$
        * If $\phi$ constructed on trajectory data = additional dependency + no longer unbiased (albeit negligible bias in practice)
        * Estimating $\phi$ by fitting Q function
            * If $\phi(s,a) = Q^\pi(s,a)$, then the stein control variate policy gradient becomes an interpolation between log-likelihood and reparamterized policy gradients
            * Leads to much smaller variances with an extreme case being a deterministic policy where log-likelihood policy gradient variance is infinite and reparametermized is close to 0
                * In this scenario, we favor the reparameterized policy gradient
            * We should set $\phi(s,a) = \hat{Q}^\pi(s,a)$ so that log-likelihood ratio term is small
                * $min_w \sum _{t=1}^n(\phi_w(s_t, a_t) - R_t)^2$
        * Estimating $\phi$ by minimizing the variance
            * We know $var(\hat{\nabla} _{\theta} J(\theta)) = \mathbb{E}[(\hat{\nabla} _{\theta} J(\theta))^2] - \mathbb{E}[\hat{\nabla} _{\theta} J(\theta)]^2$
                * $\mathbb{E}[\hat{\nabla} _{\theta} J(\theta)] = \hat{\nabla} _{\theta} J(\theta)$: doesn't rely on $\phi$ therefore we can omit minimizing this
            * $min_w \sum _{t=1}^n \vert\vert \nabla _\theta \log \pi(a_t\vert s_t)(\hat{Q}^\pi(s_t, a_t) - \phi_w (s_t, a_t)) + \nabla _\theta f(s_t, \xi_t) \nabla_a \phi_w(s_t, a_t)\vert\vert_2^2$
                * Hard to implement efficiently due to gradients with $a$ and $\theta$; use an approximation instead
        * Architectures of $\phi$
            * Since $\phi$ and $Q$ are similar, decompose $\phi$: $\phi_2(s,a) = \hat{V}^\pi(s) + \psi_w (s,a)$
            * New gradient: $\hat{\nabla} _{\theta}J(\theta) = \frac{1}{n} \sum _{t=1}^n [\nabla _{\theta} \log \pi(a_t \vert s_t)(\hat{A}^\pi(s_t, a_t) - \psi_w(s_t, a_t)) + \nabla _{\theta} f _{\theta}(s_t, \xi_t) \nabla_a \psi_w(s_t, a_t)]$
                * Seperating  $\hat{V}^\pi(s)$ from $\psi_w(s,a)$ works well because it provides an estimation of $\phi$ and allows us to improve on top of baseline
    * **Stein Control Variate for Gaussian Policies**
        * Gaussian policy: $\pi(a \vert s) = \mathcal{N}(a; \mu _{\theta_1}(s), \Sigma _{\theta_2}(s))$
            * Mean and covariance are parameteric functions with parameters $\theta_1, \theta_2$ repsectively
        * Policy gradient with respect to $\theta_1$: $\nabla _{\theta_1} J(\theta) = \mathbb{E} _\pi [\nabla _{\theta_1} \log \pi (a \vert s) (\hat{Q}^\pi(s,a) - \phi(s,a)) + \nabla _{\theta_1} \mu (s) \nabla_a \phi(s,a)]$
        * Gradient with respect to variance parameter (for each coordinate $\theta_l$): $\nabla _{\theta_l} J(\theta) = \mathbb{E} _{\pi}[\nabla _{\theta_l} \log \pi (a \vert s) (Q^\pi(s,a) - \phi(s,a)) - \frac{1}{2} \langle \nabla_a \log \pi(a \vert s) \nabla_a \phi(s,a)^T, \nabla _{\theta_l} \Sigma \rangle]$
            * Angle brackets denote trace operator
            * Can simplify further with stein's identity: $\nabla _{\theta_l} J(\theta) = \mathbb{E} _{\pi}[\nabla _{\theta_l} \log \pi (a \vert s) (Q^\pi(s,a) - \phi(s,a)) - \frac{1}{2} \langle \nabla _{a,a} \phi(s,a), \nabla _{\theta_l} \Sigma \rangle]$
                * Requires 2nd derivative but may have lower variance
    * **PPO with Stein Control Variate**
        * Assumes a PPO-Penalty (KL Divergence penalty) loss function
        * Rewrite gradient of PPO: $\nabla _{\theta} J _{ppo}(\theta) = \mathbb{E} _{\pi _{old}}[w _\pi(s,a) \nabla _\theta \log (a \vert s) Q^\pi _\lambda(s,a)]$
            * $w _\pi(s,a) = \frac{\pi _\theta(a \vert s)}{\pi _{old}(a \vert s)}$
            * $Q^\pi _\lambda(s,a) = Q^\pi(s,a) + \lambda w _\pi(s,a)^{-1}$: second term from KL penalty
        * PPO Gradient with Stein Control Variates + Reparameterization: $\nabla _{\theta} J _{ppo}(\theta) = \mathbb{E} _{\pi _{old}}[w _{\pi}(s,a) (\nabla _{\theta} \log \pi (a \vert s)(Q^\pi _{\lambda}(s,a) - \phi(s,a)) + \nabla _{\theta} f _{\theta}(s,a)\nabla_a \phi(s,a))]$
* **Experiments**
    * Tested on MuJoCo continuous control environments
    * Use gaussian policies 
        * Estimate $\hat{V}^\pi$ seperately
        * $\psi$ either minimizes MSE with Q value or minimizes variance
        * 3 Architecutures for $\psi$
            * Linear: $\psi_w (s,a) = \langle \nabla_a q_w(a, \mu _\pi(s)), (a - \mu _\pi(s)) \rangle$
            * Quadratic: $\psi_w (s,a) = -(a - \mu_w(s))^T \Sigma^{-1}_2 (a - \mu_w(s))$
                * $\mu_w(s)$ is a neural network
                * $\Sigma_w$: positive diagonal matrix independent of $s$
            * MLP: Neural network that concatenates state and action before passing into hidden layer and then an output layer
    * **Comparing the Variance of Different Gradient Estimators**
        * Using MLP or quadratic result in significantly lower variance than regular valuye function baselines
    * **Comparison with Q-Prop Using TRPO for Policy Optimization**
        * Stein control variates outperform Q-Prop on all tasks
            * Suprising because Q-Prop uses on-policy and off-policy data whereas Stein's only uses on-policy
        * Quadratic requires more iterations than MLP to converge in practice
    * **PPO with Different Control Variates**
        * All three stein control variates outperform value function baselines
        * Quadratic and MLP outperform linear in general
        * Variance minimization usually works better with MLPs and MSE works better with Quadratic
        * Variance minimization + MLP usually the best in most cases