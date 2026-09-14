---
title: 'SSH can not login: userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms
  [preauth]'
slug: sshcannotloginuserauthpubkeykeytypessh-rsanotinpubkeyacceptedalgorithmspreauth
date: '2023-03-16T13:00:59.460Z'
categories:
- Notes
- Utilities
tags:
- Development
- Notes
original_permalink: /archives/sshcannotloginuserauthpubkeykeytypessh-rsanotinpubkeyacceptedalgorithmspreauth
---

# Issue
Can not login SSH via public/private key pair, run `systemctl status sshd` on ssh server side, showed a log:
```
userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
```

# Reason
RSA Algorithm is deprecated, especially in new version of Open SSH server.

# Solution
Generate new key pair with another algorithm, such as `ssh-keygen -t ed25519 -C "admin@996workers.icu"`.
