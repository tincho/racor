'use strict';

const get = require('lodash/get');
const set = require('lodash/set');
const isArray = a => Array.prototype.isPrototypeOf(a);
const identity = i => i;
const ensureFn = fn => {
    if (typeof fn === 'function') {
        return fn;
    }
    if (!fn) {
        return identity;
    } else if (fn.args && fn.body) {
        fn = [ fn.args, fn.body ];
    } else if (typeof fn === 'string') {
        // assume we get just the body
        fn = [ fn ];
    }
    let outFn = identity;
    try {
        outFn = new Function(...fn);
    } catch(e) {
    } finally {
        return outFn;
    }
}
/**
 * "Hose Fit", in spanish "Acople de mangueras"
 * Given a "spec": 
 *  search in "input" a value indexed by "spec.getPath",
 *  make it go through "apply"
 *  and set the output to "spec.setPath"
 * @returns it merged with "output", set
 * @param {Object} spec 
 * @param {*} input 
 * @param {*} output 
 */
function hoseFit(spec, input, output = {}) {
    if (isArray(spec)) {
        return spec.reduce((out, sp) => hoseFit(sp, input, out), output);
    }

    let {
        getPath,
        apply,
        setPath
    } = spec;
    let origin = get(input, getPath);
    let applyR = ensureFn(apply);
    let value  = applyR(origin);
    return set(output, setPath, value);
};

/**
 * minimal/abbreviated way of using
 * @param {Object} specs : { getPath: setPath }
 * @param {*} input 
 * @param {*} output 
 */
hoseFit.min = function hoseFitMin(spec, input, output) {
    var specs = Object.entries(spec).map(([getPath, setPath]) => ({ getPath, setPath }));
    return hoseFit(specs, input, output);
};
/**
 * minimal/abbreviated way of using
 * @param {Function} apply
 * @param {Object} specs : { getPath: setPath }
 * @param {*} input 
 * @param {*} output 
 */
hoseFit.fn = function hoseFitFn(apply, spec, input, output) {
    var specs = Object.entries(spec).map(([getPath, setPath]) => ({ getPath, setPath, apply }));
    return hoseFit(specs, input, output);
};
/**
 * minimal/abbreviated way of using
 * @param {String} prop
 * @param {*} ...args
 */
hoseFit.pluck = function hoseFitPluck(prop, ...args) {
    var pluck = list => list.map(item => item[prop])
    return hoseFit.fn(pluck, ...args);
};

module.exports = hoseFit;
