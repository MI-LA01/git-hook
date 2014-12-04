Git-Hook.js 
---

A simple daemon allowing to deploy your project thru github webhooks

I git push my code, then on the webserver the master is deployed instantly ! this is the goal. 

Deamon as to be started w/ forever ( better ) such as : 

```
$agruet forever start git-hook.js
```

In the git-hook.js you will see www-data:www-data as the running user. 

Please bare in mind it is was for my specific needs - so tweak the path and the object Config to reflect something
closed to your needs. 

Alexis Gruet <alexis@kroknet.com>