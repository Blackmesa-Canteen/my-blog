---
title: Troubleshooting AWS Amplify Deployment for Nx Monorepo Angular Projects
slug: troubleshooting-aws-amplify-deployment-for-nx-monorepo-angular-projects
date: '2024-01-01T23:20:49.424150739Z'
original_permalink: /archives/troubleshooting-aws-amplify-deployment-for-nx-monorepo-angular-projects
---

## The Problem
When using AWS Amplify to deploy an Nx monorepo Angular project, you might encounter an error message stating: **Error: Artifact directory doesn't exist**. This issue typically arises because Amplify is unable to locate the correct build folder due to a misconfiguration in the build artifacts settings.

## The Solution
### Adjusting amplify.yml
The root cause of this problem lies in the Amplify configuration file (`amplify.yml`). To resolve this, you need to modify the path to the artifacts in the `amplify.yml` file:
```yaml
artifacts:
baseDirectory: /dist
```
This change directs Amplify to the correct directory where the build artifacts are stored.
**Note: make sure there is a slash before the dist!**
### Configuring Nx for Angular 13 & Nx 14
If you're working with Nx 14 and Angular 13, there's an additional step required. You need to update the Nx configuration to ensure that the distribution (`dist`) directory is correctly set within the app's base directory. The `nx.json` or `angular.json` file should be modified as follows:
```json
"configurations": {
"production": {
"outputPath": "apps/some-project/dist" 
  }
}
```
This adjustment ensures that the output path aligns with the directory specified in the `amplify.yml` file.
## Conclusion
By making these simple yet crucial modifications in the `amplify.yml` and Nx configuration files, you can successfully deploy your Nx monorepo Angular project using AWS Amplify without encountering the "Artifact directory doesn't exist: build" error. Remember, correct path configurations are key to seamless deployments.
