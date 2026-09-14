---
title: Exposing WSL's SSH to Windows
slug: '1697629832073'
date: '2023-10-18T11:55:29.299229403Z'
categories:
- Notes
tags:
- Notes
- Operating System
original_permalink: /archives/1697629832073
---

# Exposing WSL's SSH to Windows

WSL (Windows Subsystem for Linux) has been an instrumental tool for developers who wish to leverage both Windows and Linux environments on a single machine. One commonly sought feature is the ability to SSH directly into the WSL environment from another device or even from the Windows host itself. This article will guide you through the steps to make this happen.

## 1. Setting up SSH in WSL

### 1.1 Installing the openssh-server

If you've previously installed the openssh-server, remove it first:

```bash
sudo apt remove openssh-server
sudo apt-get remove openssh-server
```

Then, install it:

```bash
sudo apt install openssh-server
```

### 1.2 Adjusting SSH Configuration

Open the SSH configuration file:

```bash
sudo vim /etc/ssh/sshd_config
```

Make the following changes:

- Set the listening port, for example, to `2222`.
- Allow all addresses with `ListenAddress 0.0.0.0`.
- Allow password authentication by setting `PasswordAuthentication yes`.
- Permit root login by setting `PermitRootLogin yes`.

Once you've made the changes, restart the SSH service:

```bash
service ssh restart
```

## 2. SSH Connection from Windows

### 2.1 Testing Local Connection

Test the SSH connection from your Windows terminal:

```bash
ssh your-username@localhost -p 2222
```

### 2.2 Setting Up Port Forwarding and Firewall Rules

To expose the SSH server in WSL to external machines, set up port forwarding from Windows to WSL.

First, find your WSL's IP address:

```bash
ifconfig
```

Then, configure port forwarding:

```bash
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=2222 connectaddress=YOUR_WSL_IP connectport=2222
```

Next, add a firewall rule to allow incoming SSH connections:

```bash
netsh advfirewall firewall add rule name=WSL2 dir=in action=allow protocol=TCP localport=2222
```

You can also set this through the Control Panel's firewall settings.

To connect, use:

```bash
ssh name@your-windows-ip -p 2222
```

## 3. Handling Common Errors

If you encounter the following error:

```bash
ssh_exchange_identification: read: Connection reset by peer
```

Check if the port number in `sshd_config` matches the port you're forwarding in Windows. Adjust as necessary and retry.

## 4. Additional Port Forwarding

To add more port forwarding rules:

```bash
netsh interface portproxy add v4tov4 listenaddress=* listenport=80 connectaddress=YOUR_WSL_IP connectport=80  protocol=tcp
```

To remove or check rules:

```bash
netsh interface portproxy delete v4tov4 listenport=80 protocol=tcp
netsh interface portproxy show v4tov4
```

To change the WSL IP address:

```bash
netsh interface ip add address "vEthernet (WSL)" YOUR_NEW_IP 255.255.0.0
```

---

*This article was inspired by the original post on CSDN by jasneik. The original post can be found [here](https://blog.csdn.net/jasneik/article/details/127993390).*

