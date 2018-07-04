'use strict';

const get = require('lodash/get');
const set = require('lodash/set');
const flow = require('lodash/flow');

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
    const identity = i => i;
    const ensureFn = fn => {
        if (typeof fn === 'function') {
            return fn;
        }
        if (!fn) {
            fn = identity;
        } else if (fn.args && fn.body) {
            fn = [ fn.args, fn.body ];
        } else if (typeof fn === 'string') {
            // assume we get just the body
            fn = [ fn ];
        }
        try {
            return new Function(...fn);
        } catch(e) {
            return identity;
        }
    }

    let {
        getPath,
        apply,
        setPath
    } = spec;
    let applyR = ensureFn(apply);
    let origin = get(input, getPath);
    let value  = applyR(origin);
    return set(output, setPath, value);
}

module.exports = hoseFit;
