const assert = require('assert');
const hoseFit = require('./index');

describe('HoseFit', () => {

    var input = {
        proveedores: [{
            id: 1414,
            nombre: "pipi"
        }, {
            id: 11,
            nombre: "pipi 2"
        }]
    };

    describe('basics', () => {
        it('should get, apply and set', () => {
            var spec = {
                getPath: 'proveedores',
                apply: proveedores => proveedores.map(p => p.id),
                setPath: 'schema.properties.proveedores.items.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.proveedores.items.enum[0], 1414);
            assert.equal(obj.schema.properties.proveedores.items.enum[1], 11);
        });

        it('should merge if given an "output" object', () => {
            var spec = {
                getPath: 'proveedores',
                apply: proveedores => proveedores.map(p => p.id),
                setPath: 'schema.properties.proveedores.items.enum'
            };
            let toHydrate = {
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
            var obj = hoseFit(spec, input, toHydrate);
            assert.equal(obj.schema.properties.proveedores.items.enum[0], 1414);
            assert.equal(obj.schema.properties.proveedores.items.enum[1], 11);
            // and also assert that was merged to the given object toHydrate
            assert.equal(obj.schema.properties.proveedores.title, 'Sarasa');
        });

        it('should not mutate the given "output" object but return a new one', () => {
            // this test actually is redundantly covering lodash's "set" function
            // but I want to double-check the purity of my function
            var spec = {
                getPath: 'proveedores',
                apply: proveedores => proveedores.map(p => p.id),
                setPath: 'schema.properties.proveedores.items.enum'
            };
            let toHydrate = {
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
            var obj = hoseFit(spec, input, toHydrate);
            assert.deepEqual(Object.keys(toHydrate.schema.properties.proveedores), ['type', 'title', 'default']);
        });

        it('should fallback apply to identity/mirror', () => {
            var spec = {
                getPath: 'proveedores',
                setPath: 'schema.properties.proveedores.items.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.proveedores.items.enum[0].id, 1414);
            assert.equal(obj.schema.properties.proveedores.items.enum[1].id, 11);
        });
    });

    describe('apply types', () => {
        it('should take a function', () => {
            var spec = {
                getPath: 'proveedores',
                apply: proveedores => proveedores.map(p => p.nombre),
                setPath: 'schema.properties.proveedores.items.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.proveedores.items.enum[0], 'pipi');
        });
        it('should take an array [args, body] ', () => {
            var spec = {
                getPath: 'proveedores',
                apply: [ 'proveedores', 'return proveedores.map(p => p.id)' ],
                setPath: 'schema.properties.proveedores.items.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.proveedores.items.enum[0], 1414);
        });
        it('should take an object { args , body }', () => {
            var spec = {
                getPath: 'proveedores',
                apply: { args: 'proveedores', body: 'return proveedores.map(p => p.id)' },
                setPath: 'schema.properties.proveedores.items.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.proveedores.items.enum[0], 1414);
        });
    });
});
