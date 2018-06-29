'use strict';

const get = require('lodash/fp/get');
const set = require('lodash/fp/set');
const flow = require('lodash/fp/flow');

// "HYDRANT"
// HOSE-FITTING
// GET-MAP-SET
// gets data
// maps paths to values

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
        try {
            if (fn.args && fn.body) {
                fn = [ fn.args, fn.body ];
            }
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
    let getR   = get(getPath);
    let applyR = ensureFn(apply);
    let flowR  = flow(getR, applyR);
    let value  = flowR(input);
    let setR   = set(setPath, value);
    return setR(output);
}

module.exports = hoseFit;
