var ploadkue = require("./p-loadkue.js");

var queue = ploadkue.createQueue({
    name: "QueueName",
    concurrent: 5,
    limit: 3
});


run(1);
function run(number) {
    enqueuPromise(number);
    if(number !== 11){
        setTimeout(function (){
            run(number + 1);
        }, 100);
    }
}

function enqueuPromise(promiseNumber) {
    console.log("Queuing the promise number " + promiseNumber);
    queue.printStatus();
    queue.push(function () {
        return new Promise(function (resolve, reject) {
            console.log("Running promise number " + promiseNumber);
            setTimeout(function () {
                console.log("Finishing promise number" + promiseNumber);
                resolve();
            }, 1000);
        });
    }).catch(function (err) {
        console.log("Error: ", err.message, "for promise number ", promiseNumber);
    });
}
