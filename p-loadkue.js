var queues = [];
/*setInterval(function () {
    queues.forEach(function (queue) {
        queue.printStatus();
    });
}, 60000);*/

var LIMIT_EXCEEDED = "Limit exceeded";
var UNDEFINED_CALLBACK_FUNCTION = "Callback function should be defined";

function createQueue(params) {
    var self = {};
    queues.push(self);
    self.concurrent = params.concurrent || 1;
    self.limit = params.limit;
    self.name = params.name || ("Queue" + queues.length);
    self.queue = [];
    self.running = 0;
    onLimitExceededCallbacks = [];
    onQueueChangeCallbacks = [];

    function push(callback) {
        if (!callback) return Promise.reject(new Error(UNDEFINED_CALLBACK_FUNCTION));
        if (typeof (self.limit) === 'number' && self.queue.length >= self.limit) {
            onLimitExceededCallbacks.forEach(function (callback) {
                callback();
            });
            return Promise.reject(new Error(LIMIT_EXCEEDED));
        }
        var resolverInstance = resolver();


        var promise = new Promise(resolverInstance.register);
        self.queue.push({
            callback: callback,
            resolver: resolverInstance
        });
        change();
        return promise;
    }

    function change() {
        while (self.queue.length && self.running < self.concurrent) {
            var first = self.queue.splice(0, 1)[0];
            self.running++;
            try {
                first.resolver.resolve(first.callback().then(onFinish).catch(onFinishError));
            } catch (err) {
                first.resolver.reject(err);
                lastly();
            }

        }
        onQueueChangeCallbacks.forEach(function (callback) {
            callback(self.queue.length);
        });
        //self.printStatus();
    }

    function onFinish(resp) {
        lastly();
        return resp;
    }

    function onFinishError(err) {
        lastly();
        throw err;
    }

    function lastly() {
        self.running--;
        change();
    }

    self.printStatus = function () {
        var limitString = self.limit ? " (limit: " + self.limit + ") " : "";
        console.log("QUEUE (" + self.name + "):\t running " + self.running + "\t of " + self.concurrent + "\t concurrent and there are " + self.queue.length + "\t in queue" + limitString + ".");
    };

    function onLimitExceeded(callback) {
        onLimitExceededCallbacks.push(callback);
    }

    function onQueueChange(callback) {
        onQueueChangeCallbacks.push(callback);
    }

    return {
        push: push,
        onLimitExceeded: onLimitExceeded,
        onQueueChange: onQueueChange,
        printStatus: self.printStatus
    };
}

function resolver() {
    var resolveFunction, rejectFunction;

    function register(resolveP, rejectP) {
        resolveFunction = resolveP;
        rejectFunction = rejectP;
    }

    function resolve(resp) {
        resolveFunction(resp);
    }

    function reject(resp) {
        rejectFunction(resp);
    }
    return {
        register: register,
        resolve: resolve,
        reject: reject
    };
}


module.exports = {
    LIMIT_EXCEEDED: LIMIT_EXCEEDED,
    UNDEFINED_CALLBACK_FUNCTION: UNDEFINED_CALLBACK_FUNCTION,
    queues: queues,
    createQueue: createQueue
};
