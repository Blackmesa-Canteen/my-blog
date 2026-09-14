---
title: Install on-my-zsh on Ubuntu
slug: '1699537088501'
date: '2023-11-09T13:44:33.760144826Z'
categories:
- Notes
tags:
- Notes
- Development
original_permalink: /archives/1699537088501
---

# Step 1: Update the System Repository
Update the system package repository to get the latest program version available. Open the terminal and run the following command:
```
sudo apt update
```

Enter the administrator password when prompted and press Enter. Wait for the process to complete.

Updating the package repository ensures that your system has the most up-to-date information about software packages and their dependencies during software installation.

# Step 2: Install Zsh
Run the following command to install Z Shell on Ubuntu:
```
sudo apt install zsh -y
```

# Step 3: Check Installation
After the installation finishes, check if it has been installed correctly by checking the program version. Run the following command:
```
zsh --version
```

# Step 4: Set Zsh as Default Shell
**1. Check which shell is the default one in your system:**
```
echo $SHELL
```
Checking the default shell in Linux.
The output states the value of the $SHELL variable, which is the default shell.

**2. Use the chsh (change shell) command to change the default login shell. The following syntax lets you change the default shell with chsh:**
```
chsh -s [path] [user]
```
- [path] specifies the path to the shell you want to use.
- [user] specifies the user for which you want to change the default shell. Not specifying the user changes the default shell for the current user.
If you are unsure of the shell path, utilize the which command to specify the Zsh path automatically. For example:
```
chsh -s $(which zsh)
```
Enter the root password when prompted and press Enter.

Entering the root password for the Zsh path.
The command changes the default shell to Zsh for the current user. To start using the Z Shell, log out of the terminal and log back in.

# Step 5: Install Oh My Zsh
```
sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```
# Step 6: Config
```
vim ~/.zshrc
```
Locate the following line:
```
ZSH_THEME="robbyrussell"
```
The line defines which theme the terminal uses. The default one is robbyrussell. To use a different theme, change the value to match the name of the theme you want. For example:
```
ZSH_THEME="bira"
```
# Step 7: Common plugins
## Auto-suggestions
Firstly, install the plugin.
```
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```
Then, enable the plugin via config:
```
vim ~/.zshrc
```
Scroll down to the plugins section of the file and activate the auto-suggestion plugin by adding it to the plugins, as shown below:
```
plugins=(git zsh-autosuggestions)
```
## Syntax Highlighting
```
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

```
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```
