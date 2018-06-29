'use strict';

const get = require('lodash/fp/get');
const set = require('lodash/fp/set');
const flow = require('lodash/fp/flow');

//console.log(get('test')({test: 14}));

// "HYDRANT"
// HOSE-FITTING
// GET-MAP-SET
// gets data
// maps paths to values

(function h() {
    var spec = [{
        name: '',
        // key/path to get from response data obj (using lodash/get supported format)
        getPath: 'proveedores',
        // mappers (defaults to "identity", i.e. function(a) {return a })
        // FIXED ARITY OF 1
        // options:
        // apply: ['proveedores', 'return proveedores.map(p => p.id)'],
        apply: proveedores => proveedores.map(p => p.id),
        // apply: {
        //     args: 'proveedores',
        //     body: 'return proveedores.map(p => p.id)'
        // },
        // path to set in the output object (using lodash/set supported format)
        setPath: 'schema.properties.proveedores.items.enum'
    }];

    var input = {
        proveedores: [{
            id: 1414,
            nombre: "pipi"
        }, {
            id: 11,
            nombre: "pipi 2"
        }]
    };

    let toHydrate = {};
    toHydrate = {
        schema: {
            properties: {
                proveedores: {
                    type: 'string',
                    title: 'Sarasa',
                    default: "1"
                }
            }
        }
    };

    var obj = hoseFit(spec[0], input, toHydrate);

    console.log(JSON.stringify(obj, null, 2));

    console.log('original:');
    console.log(JSON.stringify(toHydrate, null, 2));

    // inputValue = get('input, getPath)
    // value = new Function(apply.args, apply.body)()
    // set({}, )
})();

function hoseFit(spec, input, output = {}) {
    const identity = i => i;
    const ensureFn = fn => {
        if (typeof fn === 'function') {
            return fn;
        }
        if (fn.args && fn.body) {
            fn = [fn.args, fn.body];
        }
        try {
            return new Function(...fn);
        } catch(e) {
            console.log(e);
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
