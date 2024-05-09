---
layout: lecture
title: assignment 1
course: cs234
permalink: /brain/cs234/assignment-1
order: 6
---

**Resources:**
- [Assignment PDF](/assets/files/cs234-assignment1.pdf)

<span style="color:red">**Disclaimer:** My answers may or may not be correct. Please do not rely on these answers as an answer key.</span>

# Optimal Policy for Simple MDP

Consider the simple $n$-state MDP shown in Figure 1. Starting from
state $s_1$, the agent can move to the right ($a_0$) or left ($a_1$)
from any state $s_i$. Actions are deterministic and always succeed (e.g.
going left from state $s_2$ goes to state $s_1$, and going left from
state $s_1$ transitions to itself). Rewards are given upon taking an
action from the state. Taking any action from the goal state $G$ earns a
reward of $r= + 1$ and the agent stays in state $G$. Otherwise, each move
has zero reward ($r=0$). Assume a discount factor $\gamma < 1$.

<img src="/assets/img/cs234-assignment1-q1-1.png" width="70%"/>

1.  The optimal action from any state $s_i$ is taking $a_0$ (right)
    until the agent reaches the goal state $G$. Find the optimal value
    function for all states $s_i$ and the goal state $G$.

    **Answer:** We can apply value iteration to determine the optimal value function for each state
    - $V(G) =  1 + \gamma + \gamma^2 + \gamma^3 \dots \gamma^n = \frac{1}{1-\gamma}$ 
    - $V(s_i) = \gamma^{n - i} +  \gamma^{n - i + 1} \dots \gamma^{n} = \frac{\gamma^{n - i}}{1- \gamma}$

2.  Does the optimal policy depend on the value of the discount factor
    $\gamma$? Explain your answer.

    **Answer:** The optimal policy does not depend on the value of the discount factor when $0 < \gamma < 1$ because this is a finite horizon problem and the relative magnitude of rewards will always be the same. - i.e., we can always "factor out" the discount factor which will result in the same relative magnitudes for non-discounted value and state-value functions. This means that the optimal policy chosen during policy improvement will also be the same

3.  Consider adding a constant $c$ to all rewards (i.e. taking any
    action from states $s_i$ has reward $c$ and any action from the goal
    state $G$ has reward $1+c$). Find the new optimal value function for
    all states $s_i$ and the goal state $G$. Does adding a constant
    reward $c$ change the optimal policy? Explain your answer.

    **Answer:** Adding a constant c to each term results in the following value functions:
    - $V(G) = (1 + c) + \gamma(1+c) + \gamma^2(1+c) \dots = \frac{1+c}{1 - \gamma}$
    - $V(s_i) =  \gamma^{n - i}(1+c) +  \gamma^{n - i+1}(1+c) \dots + \gamma^{n}(1+c) = \frac{ \gamma^{n - i}(1+c)}{1-\gamma}$

    This does not change the optimal policy since the relative magnitudes of the value functions continue to be the same with the addition of a constant.

4.  After adding a constant $c$ to all rewards now consider scaling all
    the rewards by a constant $a$ (i.e. $r_{new} = a(c+ r_{old})$). Find
    the new optimal value function for all states $s_i$ and the goal
    state $G$. Does that change the optimal policy? Explain your answer,
    If yes, give an example of $a$ and $c$ that changes the optimal
    policy.
    **Answer:** Adding a constant c to each term and then scaling by r results in the following value functions:
    - $V(G) = a(1 + c) + \gamma(1+c) + \gamma^2a(1+c) \dots = \frac{a(1+c)}{1 - \gamma}$
    - $V(s_i) =  \gamma^{n - i}a(1+c) +  \gamma^{n - i+1}a(1+c) \dots + \gamma^{n}a(1+c) = \frac{ \gamma^{n - i}(a)(1+c)}{1-\gamma}$

    If a is positive, then the optimal policy does not change because its analgous to just increasing the old reward and the constant added which results in the same policy.

    If a is zero, then any policy is the optimal policy because the value function will be zero for all states.

    If a is negative, then the policy would change because the rewards are inverted and therefore the optimal policy would be to always go left. For example if c = 1 and a = -1 then the rewards are negative and become larger as you get closer to state G. 



# Running Time of Value Iteration

In this problem we construct an example to bound the number of steps it
will take to find the optimal policy using value iteration. Consider the
infinite MDP with discount factor $\gamma < 1$ illustrated in Figure 2. It consists of 3
states, and rewards are given upon taking an action from the state. From
state $s_0$, action $a_1$ has zero immediate reward and causes a
deterministic transition to state $s_1$ where there is reward $+1$ for
every time step afterwards (regardless of action). From state $s_0$,
action $a_2$ causes a deterministic transition to state $s_2$ with
immediate reward of $\gamma^2/(1-\gamma)$ but state $s_2$ has zero
reward for every time step afterwards (regardless of action).

<img src="/assets/img/cs234-assignment1-q2-1.png" width="50%"/>

1.  What is the total discounted return
    ($\sum_{t=0}^{\infty}\gamma^t r_t$) of taking action $a_1$ from
    state $s_0$ at time step $t=0$?

    **Answer:** We know the discounted return is the immediate reward + the discounted sum of future rewards. Therefore we get the following as our discounted return: $0 + \gamma + \gamma^2 \dots = \frac{\gamma}{1-\gamma}$

2.  What is the total discounted return
    ($\sum_{t=0}^{\infty}\gamma^t r_t$) of taking action $a_2$ from
    state $s_0$ at time step $t=0$? What is the optimal action?

    **Answer:** Similar to what we did in part 1, we get the following for our discounted return: $\frac{\gamma^2}{1-\gamma} + 0 + 0 \dots = \frac{\gamma^2}{1-\gamma}$

3.  Assume we initialize value of each state to zero, (i.e. at iteration
    $n=0$, $\forall s: V_{n=0}(s) = 0$). Show that value iteration
    continues to choose the sub-optimal action until iteration $n^*$
    where,

    $$n^* \geq \frac{\log(1-\gamma)}{\log\gamma} \geq \frac{1}{2} \log (\frac{1}{1-\gamma})\frac{1}{1-\gamma}$$

    Thus, value iteration has a running time that grows faster than
    $1/(1-\gamma)$. (You just need to show the first inequality)

    **Answer:** 

    

# Approximating the Optimal Value Function

Consider a finite MDP $M=\langle S, A, T, R, \gamma \rangle$, where $S$
is the state space, $A$ action space, $T$ transition probabilities, $R$
reward function and $\gamma$ the discount factor. Define $Q^\ast$ to be the
optimal state-action value $Q^\ast(s,a) = Q_{\pi^\ast}(s,a)$ where $\pi^\ast$ is
the optimal policy. Assume we have an estimate $\tilde{Q}$ of $Q^\ast$, and
$\tilde{Q}$ is bounded by $l_{\infty}$ norm as follows:

$$\vert\vert\tilde{Q} - Q^\ast\vert\vert _{\infty} \leq \varepsilon$$

Where $\vert\vert x\vert\vert_{\infty} = max_{s,a} |x(s,a)|$.\
Assume that we are following the greedy policy with respect to
$\tilde{Q}$, $\pi(s) = argmax_{a\in \mathcal{A}} \tilde{Q}(s,a)$. We
want to show that the following holds:

$$\label{eq:Q3} 
V_{\pi}(s) \geq V^*(s) - \frac{2\varepsilon}{1-\gamma}$$ 

Where
$V_{\pi}(s)$ is the value function of the greedy policy $\pi$ and
$V^*(s)=max _{a \in A} Q^\ast(s,a)$ is the optimal value function. This
shows that if we compute an approximately optimal state-action value
function and then extract the greedy policy for that approximate
state-action value function, the resulting policy still does well in the
real MDP.

1.  Let $\pi^*$ be the optimal policy, $V^\ast$ the optimal value function
    and as defined above $\pi(s) = argmax _{a\in A} \tilde{Q}(s,a)$. Show
    the following bound holds for all states $s \in S$.

    $$V^\ast(s) - Q^\ast(s, \pi(s)) \leq 2 \varepsilon$$

2.  Using the results of part 1, prove that
    $V_{\pi}(s) \geq V^*(s) - \frac{2\varepsilon}{1-\gamma}$.

Now we show that this bound is tight. Consider the 2-state MDP
illustrated in figure 3. State $s_1$ has two actions, \"$stay$\" self
transition with reward 0 and \"$go$\" that goes to state $s_2$ with
reward $2\varepsilon$. State $s_2$ transitions to itself with reward
$2\varepsilon$ for every time step afterwards.

<img src="/assets/img/cs234-assignment1-q3-1.png" width="50%"/>

1.  Compute the optimal value fucntion $V^\ast(s)$ for each state and the
    optimal state-action value function $Q^\ast(s,a)$ for state $s_1$ and
    each action.

2.  Show that there exists an approximate state-action value function
    $\tilde{Q}$ with $\varepsilon$ error (measured with $l_{\infty}$
    norm), such that
    $V_{\pi}(s_1) - V^*(s_1) = - \frac{2\varepsilon}{1-\gamma}$, where
    $\pi(s) = argmax_{a \in A} \tilde{Q}(s,a)$. (You may need to define
    a consistent tie break rule)

# Frozen Lake MDP 

Now you will implement value iteration and
policy iteration for the Frozen Lake environment from [OpenAI
Gym]("https://gym.openai.com/envs/FrozenLake-v0"). We have provided
custom versions of this environment in the starter code.

1.  **(coding)** Read through `vi_and_pi.py` and implement
    `policy_evaluation`, `policy_improvement` and `policy_iteration`.
    The stopping tolerance (defined as
    $\max_s |V_{old}(s) - V_{new}(s)|$) is tol = $10^{-3}$ . Use
    $\gamma = 0.9$. Return the optimal value function and the optimal
    policy.

2.  **(coding)** Implement `value_iteration` in `vi_and_pi.py`. The
    stopping tolerance is tol = $10^{-3}$ . Use $\gamma = 0.9$. Return
    the optimal value function and the optimal policy.

3.  **(written)** Run both methods on the
    Deterministic-4x4-FrozenLake-v0 and

    Stochastic-4x4-FrozenLake-v0 environments. In the second
    environment, the dynamics of the world are stochastic. How does
    stochasticity affect the number of iterations required, and the
    resulting policy?
