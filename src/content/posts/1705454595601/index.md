---
title: Managing Multiple SSH Keys for Different Git Hosts
slug: '1705454595601'
date: '2024-01-17T01:26:37.137503638Z'
categories:
- Notes
tags:
- Mac
- Utils
original_permalink: /archives/1705454595601
---

# Introduction
For developers working with multiple Git repositories across various hosts, managing SSH keys efficiently is crucial. This article will guide you through organizing SSH keys in a custom folder and configuring each key for a specific Git host.
>Custom SSH Key Directory: `git_keys`:
Instead of storing SSH keys directly in `~/.ssh`, you might prefer to organize them in a custom subdirectory, like `~/.ssh/git_keys`. This approach helps in managing multiple keys clearly and systematically.
# Steps
## Step 1: Generating SSH Keys
If you haven't already, generate a new SSH key for each Git host:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/git_keys/git_host_key
```
Replace `your_email@example.com` with your email and `git_host_key` with a descriptive name for each key. This creates a new key in the `git_keys` folder.
## Step 2: Adding Keys to the SSH Agent
To use these keys, add them to your SSH agent:
```bash
ssh-add ~/.ssh/git_keys/git_host_key
```
Replace `git_host_key` with the name of your key file.
## Step 3: SSH Config for Multiple Git Hosts
Configure your SSH client to use different keys for different hosts by editing the `~/.ssh/config` file:
```bash
# Configuration for GitHost1
Host githost1.com
HostName githost1.com
User git
IdentityFile ~/.ssh/git_keys/githost1_key
# Configuration for GitHost2
Host githost2.com
HostName githost2.com
User git
IdentityFile ~/.ssh/git_keys/githost2_key
```
Replace `githost1.com` and `githost2.com` with your actual Git server addresses, and `githost1_key`, `githost2_key` with the respective key filenames.
## Step 4: Adding Your SSH Key to the Git Server
For each Git server:
1. Copy the public SSH key from `~/.ssh/git_keys/your_key.pub`.
2. On the Git server's website, navigate to SSH key settings in your user profile.
3. Add your SSH key.
# Conclusion
By organizing SSH keys into a custom `git_keys` directory and configuring each key for specific Git hosts, you can manage multiple repositories across different platforms efficiently and securely.
