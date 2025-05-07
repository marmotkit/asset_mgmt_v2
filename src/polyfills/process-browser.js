var process = module.exports = {};

process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = '';

function noop() { }

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
