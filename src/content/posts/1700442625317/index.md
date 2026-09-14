---
title: Migrating NextCloud docker volume Data to Amazon EFS
slug: '1700442625317'
date: '2023-11-20T01:18:50.996100209Z'
categories:
- Notes
tags:
- AWS
- Utils
original_permalink: /archives/1700442625317
---

# Intro
When working with cloud-based services like NextCloud on Amazon EC2, one challenge is the limited space available on the EBS of my machine (I want to save money). 

This issue becomes particularly evident when dealing with large files, such as video uploads, as NextCloud uses the `/tmp` directory on the local file system, which can quickly consume available disk space. Even if I already configured the primary storage strategy to AWS S3.

A practical solution to this is to utilize Amazon Elastic File System (EFS), which offers scalable file storage.

## Why Use Amazon EFS?

Amazon EFS provides a simple, scalable, elastic file system for Linux-based workloads. It can scale on demand to petabytes without disrupting applications, making it perfect for applications like NextCloud that can experience varying storage requirements.

In this specific use case, EFS is employed to manage the data volume for NextCloud Docker containers, encompassing configurations, metadata, and NextCloud apps, among others. **However, for the actual storage of files within NextCloud, I utilize AWS S3**. This approach leverages S3's cost-efficiency and scalability, ensuring a more economical and robust storage strategy for files.

## Prerequisites

Before proceeding, ensure that:
- You have an EC2 instance running with NextCloud in Docker.
- Amazon EFS is set up and mounted on your EC2 instance (e.g., at `/mnt/efs`).

## Step-by-Step Guide

### 0. Create AWS EFS & Attach it to EC2
Please refer to documents below:
- [Install EFS Helper on EC2 - AWS](https://docs.aws.amazon.com/efs/latest/ug/efs-mount-helper.html);
- [Create an Amazon EFS File System and Mount to an EC2 Instance - Article](https://medium.com/devops-cloud-it-career/create-an-amazon-efs-file-system-and-mount-to-an-ec2-instance-a1bb3c341914).

### 1. Stop NextCloud Docker Container

Ensure data integrity by stopping the NextCloud container:

```bash
sudo docker stop [NextCloud_Container_Name]
```

### 2. Copy Data to EFS

We'll use the `cp` command to copy data. It's simple and effective for a one-time migration:

```bash
sudo cp -a /home/ubuntu/app/nextcloud/data/. /mnt/efs/nextcloud_data/
```

This command preserves file permissions and ownership.

### 3. Update Docker Configuration

Modify your Docker configuration to use the new EFS mount:

In your `docker-compose.yml`:

```yaml
volumes:
  - /mnt/efs/nextcloud_data:/var/www/html/data
```

It will mount the EFS volume to the docker container.

### 4. Restart NextCloud Container

With the data migrated, restart your NextCloud container:

```bash
sudo docker start [NextCloud_Container_Name]
```

### 5. Testing and Verification

Ensure that NextCloud functions correctly with the new data location. Check file uploads, downloads, and general performance.

## Conclusion

Migrating NextCloud data to Amazon EFS is a straightforward solution for overcoming the limitations of EBS volume size. By following these steps, you can enhance your NextCloud deployment to handle larger files more efficiently in a Small server.

