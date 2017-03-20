# p-loadkue
p-loadkue is a module to limit the number of promises running concurrently and limit the number of them in queue. It allow you to create great things without worrying about scheduling your promises to meet your scalability requirements.


```js
var pLoadkue = require("p-loadkue");

var queue = pLoadkue.createQueue({
    name: "QueueName",
    concurrent: 5,
    limit: 3
});
queue.printStatus();
queue.push(function () {
    return new Promise(function (resolve, reject) {
        resolve();
    });
});
```
