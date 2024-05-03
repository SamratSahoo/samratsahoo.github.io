---
layout: lecture
title: lecture 2 - given a model of the world
course: cs234
permalink: /brain/cs234/given-a-model-of-the-world
order: 3
---

**Resources:**
- [Lecture Video](https://youtu.be/E3f2Camj0Is?feature=shared)

### Markov Process and Markov Chains
- Memoryless / random sequence of events which satisfies the markov property
- No rewards, no actions
- Dynamics model specifies the probability of the next state given the previous state. This is expressible as a matrix:
$$
\begin{pmatrix}
P(s_1 \vert s_1) & P(s_1 \vert s_2) & \dots & P(s_1 \vert s_N)\\
\\ \vdots & \vdots & \ddots & \vdots
\\ P(s_N \vert s_1) & P(s_N \vert s_2) & \dots & P(s_N \vert s_N)
\end{pmatrix}
$$ 