---
title: Practice for deploying Node.js on Heroku
slug: nodejsherokupracticefordeployingnodejsonheroku
date: '2021-07-03T00:39:51Z'
categories:
- Notes
tags:
- Javascript
cover: ./u=4104387483,4024841696&fm=26&fmt=auto&gp=0-70c3093b5cfe4bd9a8a1cadf165cf8d6.jpg
original_permalink: /archives/nodejsherokupracticefordeployingnodejsonheroku
---



# 1. In app.js:
Import Express framework
Listen to the right port.

``` javascript
    app.listen(process.env.PORT || 8080, () => {
    // process.env.PORT is for Heroku's port
    if (process.env.PORT) {
        console.log('port: ' + process.env.PORT);
    } else {
        console.log('port: 8080')
    }
})
```

# 2. Create a file called `Procfile`
inside:   web: npm start

# 3. Publish it to github, then attach this repository to the Heroku platform. Done.
