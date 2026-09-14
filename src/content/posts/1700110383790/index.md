---
title: 'Resolving `dial unix /var/run/docker.sock: connect: permission denied` Issue
  on AWS Cloud9 IDE'
slug: '1700110383790'
date: '2023-11-16T04:58:41.257346351Z'
categories:
- Notes
tags:
- AWS
original_permalink: /archives/1700110383790
---

## Introduction
When working with Cloud9 IDE on an AWS EC2 instance, you might encounter a permission denied error (`dial unix /var/run/docker.sock: connect: permission denied`) while trying to access the Docker daemon socket. This blog post provides a solution to resolve this issue without restarting services or altering group memberships.

## Problem
When I try to run a Lambda function in Cloud9 IDE with SAM, the error appeared as this:

```bash
2023-11-16 15:36:51 [INFO]: Starting Build inside a container

2023-11-16 15:36:51 [INFO]: Building codeuri: /home/ec2-user/test-aws-config runtime: python3.10 metadata: {} architecture: x86_64 functions: testawsconfig

2023-11-16 15:36:51 [INFO]: 
Build Failed

2023-11-16 15:36:51 [INFO]: Error: Docker is unreachable. Docker needs to be running to build inside a container.

2023-11-16 15:39:39 [INFO]: Preparing to debug locally: Lambda "lambda_function.lambda_handler"
2023-11-16 15:39:39 [INFO]: Building SAM application...
2023-11-16 15:39:41 [INFO]: Command: (not started) [/usr/local/bin/sam build --build-dir /tmp/aws-toolkit-vscode/vsctkEEjHOc/output --template /tmp/aws-toolkit-vscode/vsctkEEjHOc/app___vsctk___template.yaml --base-dir /home/ec2-user/test-aws-config --use-container --manifest /tmp/aws-toolkit-vscode/vsctkEEjHOc/debug-requirements.txt]
2023-11-16 15:39:45 [INFO]: Starting Build inside a container

2023-11-16 15:39:45 [INFO]: Building codeuri: /home/ec2-user/test-aws-config runtime: python3.10 metadata: {} architecture: x86_64 functions: testawsconfig

2023-11-16 15:39:45 [INFO]: 
Build Failed

2023-11-16 15:39:46 [INFO]: Error: Docker is unreachable. Docker needs to be running to build inside a container.
```

And also, if I run `docker ps` in terminal, the error info occured:
```bash
dial unix /var/run/docker.sock: connect: permission denied
```

This indicates that Cloud9 IDE user does not have the necessary permissions to access the Docker socket.

## Solution: Using `setfacl`
The `setfacl` command can be used to modify the access control list for the Docker socket, granting specific permissions to a user. 

This method is secure and **doesn't require a system restart.**

### Step 1: Apply the `setfacl` Command
Run the following command in your terminal:

```bash
sudo setfacl --modify user:ec2-user:rw /var/run/docker.sock
```

This command grants the `ec2-user` read and write access to the Docker socket.

### Step 2: Test the Configuration
After applying the command, test it by running a Docker command, such as:

```bash
docker ps
```

If the command executes successfully without permission errors, the issue is resolved.

## Conclusion
Using `setfacl` to adjust file permissions is an efficient and secure way to resolve Docker permission issues on AWS EC2 instances. This approach is especially useful as it avoids altering group memberships or user ownerships and doesn't require system restarts.

