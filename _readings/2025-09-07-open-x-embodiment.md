---
layout: post
title: >
   Open X-Embodiment: Robotic Learning Datasets and RT-X Models
description: A paper about Open X-Embodiment
summary: A paper about Open X-Embodiment
category: reading
tags: [research]
---

* **Resources**
    - [Paper](https://arxiv.org/abs/2310.08864)
<br><br/>

* **Introduction**
    * Large scale + general purpose models outperform task specific models
    * Most effective way to tackle narrow task is to adapt general purpose model
        * Difficult to do in robotics (large datasets hard to come by) 
        * Datasets are narrow along some axes (single set of objects, narrow range of tasks, single environment)
    * X-Embodiment Training: Union of narrow datasets provides better coverage of variation in environments and robots
    * Open X-Embodiment Repository: Dataset with 22 different robotic embodiments
* **The Open-X Embodiment Repository**
    * Contains large scale data + pre-trained model checkpoints
        * Dataset: 1 million+ robot trajectories across 22 robot embodiments
        * Pre-trained Checkpoint: Selection of RT-X model checkpoints
    * **The Open X-Embodiment Dataset**
        * 1M+ Real Robot Trajectories
        * 22 Robots
        * Pools together 60 robot datasets
    * **Dataset Analysis**
        * Franka robot is the most common
        * Data also had language annotations
        * Use PaLM language model to extract objects + behaviors from instructions
        * Most skills belonged to pick-place but some had skills like wiping, assembling, etc.
* **RT-X Design**
    * Trained the policy based on two transformer policies: RT-1, RT-2
    * **Data format consolidation**
        * Observation and action spaces vary across datasets
        * Use a coarsely aligned action + observation space across datasets
        * Model receives history of recent images + language instructions and predicts 7D action vector controlling end effector
            * (x,y,z, roll, pitch, yaw, gripper opening or rates of these quantities)
        * One canonical camera view from each dataset and resize it to common resolution
        * Normalize each dataset's actions prior to discretization
            * Output of model can be denormalized depending on embodiment used
        * Observations still vary widely across datasets (differing camera poses relative to robot or differing camera properties)
        * Actions also vary widely - same action vector can result in very different motions depending on robot (due to values either representing relative or absolute positions/velocities)
    * **Policy architectures**
        * RT-1: Transformer architecture for robotic control
            * Takes history of 15 images + language
            * Each image processed through pretrained EfficientNet
            * Language turned into USE embedding
            * Visual + langauge embedding interwoven via FiLM layers
            * Tokens fed into decoder only transformer for tokenized actions
        * RT-2: Large VLM fine tuned for robotic control
            * Casts tokenized actions to text tokens
            * Use RT-2-PaLI-X variant
                * ViT vision + UL2 language backbone
        * Input: Visual input + natural language instruction
        * Output: Tokenized action
    * **Training and inference details**
        * Use categorical cross-entropy over output space (buckets for RT-1 and language tokens for RT-2)
        * Data mixture from 9 manipulators
        * RT-1-X trained with the data mixture
        * RT-2-X co-fine-tuned with 1 to 1 split between original VLM data and robotics data mixture
        * At inference, model run at required rate for robot (3 - 10 Hz)
* **Experimental Results**
    * 3 Questions:
        * Can policies trained on X-Embodiment enable positive transfer
        * Does co-training models on data from multiple platforms generalize to new tasks
        * What is the influence of different design dimensions on performance and generalization 
    * **In-distribution performance across different embodiments**
        * Split evaluation into two types:
            * Domains with small scale datasets where transfer is expected to improve performance
            * Domains with large scale datasets where transfer is expected to be challenging
        * For small scale datasets, compare performance of RT-1-X model
        * For large scale datasets, consider RT-1-X and RT-2-X
        * Baseline: model developed by creators of dataset ("Original Method") and RT-1 model trained on dataset in isolation
        * Small-scale dataset domains: RT-1 outperforms original method on 4/5 datasets with large average improvement
            * Shows co-training with X-embodiment data is largely beneficial
        * Large scale dataset domains: RT-1-X doesn't outperform RT-1 baseline
            * Indicates underfitting for that model class
            * RT-2-X outperforms both Original method and RT-1
                * X-robot training improves performance in data-rich environments
    * **Improved generalization to out-of-distribution settings**
        * Use RT-2-X model
        * Unseen objects, backgrounds, and environments: RT-2 and RT-2-X perform roughly on par with each other
        * Emergent Skills Evaluation: 
            * Tasks are not in the RT-2 dataset but occur in bridge dataset
            * RT-2-X outperforms RT-2 by 3x
                * Incorporating data from other robots intro training improves range of tasks
                * Co-training with data from other platforms gives RT-2-X controller more skills
            * Removing bridge dataset from RT-2-X training reduces performance on hold-out tasks
                * Transfer is indeed responsible for additional skills
    * **Design Decisions**
        * Including a short history of images improves generalization
        * Web-based pretraining critical for performance
        * Higher model capacity enables greater transfer
* **Discussion, Future Work, and Open Problems**
    * Experiments do not consider robots with very different sensing and acutation modalities
    * Do not study generalization to new robots
    * Does not provide decision criterion for when positive transfer does or doesn't happen