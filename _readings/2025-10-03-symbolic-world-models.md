---
layout: post
title: >
   From Pixels to Predicates: Learning Symbolic World Models via Pretrained Vision-Language Models
description: A paper about using VLMs to create symbolic world models
summary: A paper about using VLMs to create symbolic world models
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/2501.00296)
<br><br/>

* **Introduction**
    * Model free imitation learning = doesn't generalize well
    * Instead, from demonstrations, learn symbolic world models which includes properties and object relations (predicates)
        * Grounded directly in low-level inputs (i.e., pixels)
    * Captures task-agnostic world dynamics
        * Enables cross-embodiment learning and generalizes across tasks
    * Models represented in Planning Domain Definition Language (PDDL), enabling using PDDL planners
    * Compositional behavior is difficult for model free imitation
        * With predicates, model can compose them into unseen tasks
    * For training, assume no prior knowledge of predicates; number, structure, and meaning must be discovered
        * Use VLMs to propose ground candidate predicates
        * Use VLMs to then ground and evaluate predicate based on images associated with state
    * Raw set of predicates doesn't generalize due to evaluation noise + overfitting world model
        * Instead generate large pool of candidates and subselect predicates with efficient + effective planning
        * Use a program synthesis method that learns action models as an operator on predicates to search over pixel based predicates and be robust to VLM output noise
            * Selects from synonymous predicates -- can be labeled accurately by VLM and useful for downstream decision making
        * pix2pred: Creates compact but semantically meaningful predicate set + symbolic world model
* **Background and Problem Setting**
    * **States, Actions, and Objects**
        * State consists of multiple images, $s_t^{img}$ (potentially from multiple cameras) + an object centric state, $s_t^{obj}$ which is a set of vectors for each unique object in the images
        * Each object in the state $o \in \mathcal{O}$ consists of a name, optional type, and descriptor
            * Descriptors = user provided phrases for an object
                * Enable disambiguation
        * Action defined by a set of skills, $\mathcal{C}$ with each skill being a sequence of low level commands
            * Each skill ($C((\lambda_1 \dots \lambda_v), \theta) \in \mathcal{C}$)has a semantically meaningful name, policy function, and optional discrete parameters ($\lambda_1 \dots \lambda_v$)
            * Each action is a skill with discrete + continuous arguments: $a = C((o_1 \dots o_v), \theta)$
    * **Predicates and Symbolic World Models**
        * Predicate characterized by 1) name, 2) ordered list of $m$ arguments $(\lambda_1 \dots \lambda_m)$ and classifier function $c_\psi: S \times A \rightarrow True/False$
            * Ground atom ($\underline{\psi}$): Consists of predicate ($\psi$) + objects ($o_1 \dots o_m$)
                * Example: Holding(spot, apple) = true if apple being held by the spot
            * Feature-based predicates: Operate exclusively over object-centric state
            * Visual predicates: Operate on image based state
        * Set of predicates ($\psi$) induce abstract state space ($S^\psi$)
        * For planning, we need action model, $\Omega$ that specifies abstract transition model $S^\psi$
            * Action model learned through PDDL styled operators
            * For skills with continuous paramters, symbolic operator uses a generative sampler for paramters
            * Predicates + operators = world model!
        * High Level Algorithm
            * Start at initial state $s_0$
            * Evaluate all provided predicates ($\psi$) to get abstract state
            $ Use PDDL planner to achieve goal from abstract state
    * **Learning and Deployment**
        * Learning Phase
            * Learn from $n$ demonstrations $\mathcal{D}$ starting with initial predicates $\psi^{init}$
            * Each demonstration consists of objects $\mathcal{O}^d$, a k-step trajectory, and a goal expression $g^d$
                * $g^d$ = conjunction of ground atoms with predicates from $\psi^{init}$ and objects from $\mathcal{O}^d$
        * Deployment Phase
            * Given: set of new objects $\mathcal{O}^{test}$, novel initial state $s_0$, and novel goal $g^{test}$
            * Output: Set of $m$ actions (the plan) that achieves a state $s_m$ where $g^{test}$ holds
* **Learning Symbolic World Models from Pixels**
    * Given demonstrations, $\mathcal{D}$, we learn symbolic world model $\mathcal{W}^D$
    * Need to learn new predicates $\psi^{\mathcal{D}}$, operators for these predicates and initial predicates, and a set of generative samplers
    * **Proposing an Initial Pool of Visual Predicates**
        * Prompt VLM on each demonstration
            * Get image at each timestep
            * Add text heading to image
            * Pass images + actions executed + descriptors directly to VLM
            * Prompt VLM for set of proposals for ground atoms
        * Parse ground atoms that are syntactically incorrect
            * I.e., remove object names not in demonstration
        * Create typed variables for predicates
        * Remove duplicate atoms; add only unique predicates to pool for final list of predicates
    * **Implementing Visual Predicates with a VLM**
        * Pass the ground atom (predicates with arguments replaced) into a VLM prompt and ask it evaluate it 
        * Provide previous state too f state is not initial state
    * **Learning Symbolic World Models via Optimization**
        * Hill climbing procedure to select predicates
        * Generate initial pool of predicates
        * Combine visual predicates with feature based predicates
        * Perform operator learning
            * Introduce regularization with early stopping via hyperparameter ($J _{thresh}$) + by deleting operators from operator learning procedure that model small set of transitions
                * Prevents overfitting on noisy outlier data
        * Outputs subset of predicates
* **Experiments** 
    * 2 Questions
        * How does pix2pred generalize to novel + complex goals compared to imitation approach that doesn't use planner
        * How necessary is score-based optimization needed for subselection of predicates
    * Domains: Kitchen, Burger, Coffee, Cleanup, Juice (See paper for details on each)
    * Approaches:
        * Pix2pred: This method
        * VLM Subselect: VLM selects compact set of visual predicates
        * No Subselect: No hill climbing to select predicates; uses all predicates
        * No invent: no new predicates beyond $\psi^{init}$
        * No visual only feature based predicates
        * No feature: only visual based predicates
        * VLM feat. pred: VLM invents feature based predicates
        * ViLa: VLM plans without abstractions
    * Experimental Setup:
        * 5 Domains
        * All demonstrations from POV of a human
            * No object centric state available
        * GPT-4o as VLM for training, gemini flash for real world
    * Results and Analysis:
        * Pix2pred outperforms other methods on 4/5 domains by wide margins
        * Generalizes better to complex tasks than ViLa
        * ViLa tends to pattern match and struggles on tasks requiring true generalization
        * Pix2pred outperforms ViLa on real world domains
        * Hill climbing improves test performance significantly
        * No subselect baseline fails entirely 
        * In many domains, VLM proposes over 100 predicates; learning operators causes overfitting
        * Pix2pred fails due to noise in VLM labeling
* **Limitations**
    * Objects need to be specified with unambiguous descriptors
        * Currently done manually and can be time consuming
    * Assumes full observability of objects in all states
    * Hill climbing algorithm is slow
    * Hill climbing sensitive to hyperparamters
    * Approach assumes demonstrations segmented in terms of paramterized skills with names corresponding to function