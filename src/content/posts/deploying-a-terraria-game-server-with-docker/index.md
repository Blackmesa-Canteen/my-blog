---
title: Deploying a Terraria Game Server with Docker
slug: deploying-a-terraria-game-server-with-docker
date: '2023-10-15T12:10:42.098856397Z'
categories:
- Notes
tags:
- Docker
- Notes
original_permalink: /archives/deploying-a-terraria-game-server-with-docker
---

# Deploying a Terraria Game Server with Docker

Terraria is a popular sandbox game that offers a rich multiplayer experience. In this guide, we'll walk through setting up a Terraria server using Docker, which allows for a clean and simple deployment.

## Prerequisites

- Docker installed on your system

- Basic understanding of Docker commands

- Terraria game server Docker image (we're using the ryshe/terraria image in this guide)

## Setting Up the Docker Container

Start by deploying the Docker container using the following command:

```bash

sudo docker run -it -p 7777:7777 \

-v $HOME/terraria/world:/root/.local/share/Terraria/Worlds \

-v $HOME/terraria/ServerPlugins:/plugins \

-v $HOME/terraria/logs:/tshock/logs \

-e LANG=C.UTF-8 \

--name tshock \

ryshe/terraria:latest

```


**Explanation of the Docker Command**

- `-p 7777:7777`: Map the host port 7777 to the container's port 7777.

- `-v [local_path]:[container_path]`: Bind mount a volume, which maps a local path to a path inside the container.

- `-e LANG=C.UTF-8`: Set environment variable to ensure proper encoding.

- `--name tshock`: Name the container "tshock" for easier reference.

- `ryshe/terraria:latest`: Use the latest version of the Terraria server Docker image from ryshe.

## Modifying the World and Configuration

### Modifying the Existing World

The world data is stored in the mounted volume specified by the -v option in the Docker command. To modify the existing world:

1. Locate the world file: $HOME/terraria/world

2. Make sure to create a backup before making any changes.

3. Use a Terraria world editor to modify the world file as desired.

4. Save the changes and restart the Docker container.

### Managing Server Configurations

The configuration files for the Terraria server can typically be found in the bound volumes, which allow you to modify them directly from your host system.

1. Locate the configuration file (e.g., serverconfig.txt) within your volume.

2. Edit the file with a text editor to update server settings like world size, difficulty, and more.

3. Save the changes and restart the Docker container.

### Managing Plugins

To add or remove server plugins:

1. Navigate to $HOME/terraria/ServerPlugins

2. Add or remove TShock plugin files (.dll) as desired.

3. Restart the Docker container to apply the changes.

### Viewing Logs

Logs provide useful information about server events and potential issues.

- View the logs in real-time using the Docker command: docker logs -f tshock

- The logs are also saved to $HOME/terraria/logs, allowing for easy review and troubleshooting.

## Conclusion

Using Docker to deploy a Terraria game server simplifies many aspects of server management, providing a smooth and consistent gaming experience. Make sure to back up important data regularly and keep your setup secure to enjoy countless hours of multiplayer fun!

## Next Steps

- Set up automated backups for server data.

- Explore and implement additional plugins to enhance your Terraria server.
