'use strict';

const deepmerge = require('deepmerge');

const path2Array = path => path.split(/[\.\[\]]/g).filter(q => q && q !== '');
// this is my own whimsical implementation of lodash.get
const get = (
    haystack, // object to lookup inside
    needle, // path to desired key
    spoon // fallback value if not found
) => path2Array(needle)
        .reduce(
            (obj, key) => obj && obj[key] || false, 
            haystack
        ) || spoon;

const makeHierarchy = (
    path, value
) => path2Array(path)
        .reduceRight((result, key) => {
            let id = parseInt(key), val = [];
            if (isNaN(id)) {
                id = key;
                val = {};
            }
            val[id] = result;
            return val;
        }, value);

// this is my own whimsical mini-implementation of lodash.set
const set = (obj, path, value) => deepmerge(obj, makeHierarchy(path, value));

const isArray = a => Array.prototype.isPrototypeOf(a);
const identity = i => i;
const plucker = prop => list => list.map(item => item[prop]);
/**
 * if its a function just return it, else try to create one with several methods, fallback to "identity"
 * @param {*} fn 
 */
const ensureFn = fn => {
    if (typeof fn === 'function') {
        return fn;
    }
    if (!fn) return identity;
    if (fn.args && fn.body) {
        fn = [ fn.args, fn.body ];
    } else if (typeof fn === 'string') {
        // assume we get just the body
        fn = [ fn ];
    }
    let result = identity;
    try {
        result = new Function(...fn);
    } catch(e) {
    } finally {
        return result;
    }
}
/**
 * "Racor", spanish for raccord, piping and plumbing fittings
 * Given a "spec": 
 *  1) search in "input" object a value indexed by "spec.src" path,
 *  2) make it go through "pipe"
 *  3) set the result at "spec.dst" path in a new object
 * @returns it merged with "base", if given
 * @param {Object|Array} spec :
 *   {String} src source path to read from input
 *   {String} dst destination path to write in base
 *   {Function|Array|String} pipe: fn to pass each value after getting it, supports several ways of providing
 *   {Any} fallback default value if src not found or undefined - will pass thru pipe anyway
 * @param {*} input object to read src(s) from
 * @param {*} base object to merge result into, if provided
 */
function racor(spec, input, base = {}) {
    if (isArray(spec)) {
        return spec.reduce((_base, sp) => racor(sp, input, _base), base);
    }
    let {
            src, // key path from origin object
            dst, // key path in the result object
            pipe = identity, // fn to apply in the middle
            fallback // if no value found a default may be provided (will pass thru pipe anyway)
        } = spec,
        original = get(input, src, fallback),
        value  = ensureFn(pipe)(original);
    return set(base, dst, value);
};

//// abbreviated shortcuts
const expandSpecs = (pipe = identity, spec) => Object.entries(spec).map(([src, dst]) => ({ src, dst, pipe }));
/**
 * minimal/abbreviated way of using
 * @param {Function} fn
 * @param {Object} specs : { src (key): dst (value) }
 */
racor.fn = (pipe, spec, ...args) => racor(expandSpecs(pipe, spec), ...args);

/**
 * minimal/abbreviated way of using
 * @param {Object} specs : { src (key): dst (value) }
 */
racor.min = (spec, ...args) => racor(expandSpecs(null, spec), ...args);

/**
 * minimal/abbreviated way of using - autopluck prop
 * @param {String} prop make a plucker of that prop
 * @see racor.fn
 */
racor.pluck = (prop, ...args) => racor.fn(plucker(prop), ...args);

module.exports = racor;
// export default racor;
