---
title: Solved - Amplify Hosted Angular PWA can not prefetch and cache resources in
  offline mode
slug: '1717417085651'
date: '2024-06-03T12:44:40.030586272Z'
categories:
- Notes
tags:
- AWS
- Angular
- PWA
original_permalink: /archives/1717417085651
---

# Solved - Amplify Hosted Angular PWA can not prefetch and cache resources in offline mode

## Problems

When deploying an Angular PWA on AWS Amplify Host Environment, I encountered an issue where the PWA could not prefetch and cache all the required resources. If the application went offline, resource requests always resulted in a '504 Gateway Time-out' error. we can confirm that service worker is running, because there is no error message in Applications/service worker section.

![image.png](./placeholder.png)
<!-- original image (unavailable): https://blog.cdn.996workers.org/halo/2024/6/image.png -->

However, when testing this PWA in a local environment, it worked correctly and could cache all the resources configured in ngsw-config.json, indicating that the prefetch configuration was correct.

Here is a code snippet from ngsw-config.json:
```
{
  "$schema": "../../node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/index.html", "/manifest.webmanifest", "/*.css", "/*.js", "/assets/**/*"]
      }
    },
    {
      "name": "assets",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"]
      }
    },
    {
      "name": "icons",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/svg/information-circle-outline.svg",
          "/svg/alert-circle-outline.svg",
          "/svg/checkmark-circle-outline.svg",
          "/svg/ellipsis-horizontal-outline.svg",
          "/svg/person-outline.svg",
          "/svg/search-outline.svg",
          "/svg/settings-outline.svg",
     ...
```


This blog post discusses about one possible reason and how to resolved the problem.

## Identifying the Issue

To troubleshoot the issue, I used the browser's developer tools to inspect the network requests. The PWA service worker will prefetch resources configured as mentioned in the previous section. However, there was a prefetch URL `/assets/fonts/VIC-Regular.eot?ngsw-cache-bust=0.28887324739935116` returning the following body:

`Please enable JavaScript to continue using this application.` 

This response was incorrect, as it was not the expected font file but `index.html`. For example, the correct service worker fetching response for `/ngsw.json?ngsw-cache-bust=0.21715704710914063 would be different`:

![SCR-20240603-trwc.png](./placeholder.png)
<!-- original image (unavailable): https://blog.cdn.996workers.org/halo/2024/6/SCR-20240603-trwc.png -->


## Cause Analysis

Upon further investigation, I realized that our configuration for making the Angular single-page application work on Amplify Hosting included a redirection rule:

`</^[^.]+$|.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|webmanifest)$)([^.]+$)/>`

This rule redirects all requests that do not match the specified file extensions to `index.html`, so that guarantee the single page app runs correctly. 

But, in the project, there was a special font file in the `assets` folder with the `.eot` extension that needed to be prefetched. Since `.eot` was not included in our redirection rule, the service worker was receiving `index.html` instead of the actual font file. 

The prefetch workflow was disrupted without displaying any explicit error messages. After examining the Angular-generated ngsw-worker.js service worker source code, I found that the fetch logic only handles exceptions when the status code is not 200. 

## The Solution

To resolve this issue, I updated the redirection rule to include the `.eot` extension:

`</^[^.]+$|.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|eot|map|json|webp|webmanifest)$)([^.]+$)/>`

By adding `.eot` to the list of allowed extensions, the service worker was able to correctly prefetch the font file and cache it offline. After implementing this change, the prefetch and offline caching issues were resolved. As is shown in the image below:


![SCR-20240603-tvua.png](./placeholder.png)
<!-- original image (unavailable): https://blog.cdn.996workers.org/halo/2024/6/SCR-20240603-tvua.png -->

## Conclusion

When working with AWS Amplify hosted single-page apps, it is crucial to ensure that all necessary file types are correctly handled by redirection rules.

Interestingly, even if just one font file is mistakenly redirected to index.html, the entire prefetch workflow will be disrupted. Not sure whether this is a bug from Service Worker implementation or not.





