const assert = require('assert');
const racor = require('../src/racor');
// to test after transpile
//const racor = require('../lib/racor');
// bundle
//const racor = require('../dist/bundle.js');
// minify
//const racor = require('../dist/bundle.min.js');


describe('racor', () => {

    var input = {
        posts: [{
            id: 1414,
            title: "pipi"
        }, {
            id: 11,
            title: "pipi 2"
        }],
        comments: [{
            id: 16,
            title: 'piriri'
        }, {
            id: 17,
            title: 'piriri 2'
        }]
    };

    describe('basics', () => {

        it('should get and set . no pipe',() => {
            var spec = {
                src: 'key',
                dst: 'some.key.down.thePath'
            };
            var obj = racor(spec, { key: 'pepito' });
            assert.equal(obj.some.key.down.thePath, 'pepito');
        });

        it('should get, pipe and set', () => {
            var spec = {
                src: 'posts',
                pipe: posts => posts.map(p => p.id),
                dst: 'schema.properties.post.enum'
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.post.enum[1], 11);
        });

        it('should get, set and pipe a fixed value',() => {
            var spec = {
                src: 'key',
                dst: 'some.key.down.thePath',
                // will ignore key and always return fixed (pipe, if String will be created as Function)
                pipe: 'return "fixed"'
            };
            var obj = racor(spec, { key: 'pepito' });
            assert.equal(obj.some.key.down.thePath, 'fixed');
        });

        it('should merge if given an "output" object', () => {
            var spec = {
                src: 'posts',
                pipe: posts => posts.map(p => p.id),
                dst: 'schema.properties.post.enum'
            };
            let toHydrate = {
                schema: {
                    properties: {
                        posts: {
                            type: 'string',
                            title: 'Sarasa',
                            default: "1"
                        }
                    }
                }
            };
            var obj = racor(spec, input, toHydrate);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.post.enum[1], 11);
            // and also assert that was merged to the given object toHydrate
            assert.equal(obj.schema.properties.posts.title, 'Sarasa');
        });

        it('should not mutate the given "output" object but return a new one', () => {
            // this test actually is redundantly covering lodash's "set" function
            // but I want to double-check the purity of my function
            var spec = {
                src: 'posts',
                pipe: posts => posts.map(p => p.id),
                dst: 'schema.properties.post.enum'
            };
            let toHydrate = {
                schema: {
                    properties: {
                        posts: {
                            type: 'string',
                            title: 'Sarasa',
                            default: "1"
                        }
                    }
                }
            };
            var obj = racor(spec, input, toHydrate);
            assert.deepEqual(Object.keys(toHydrate.schema.properties.posts), ['type', 'title', 'default']);
            assert.equal(toHydrate.schema.properties.posts.enum, undefined);
            assert.ok(obj.schema.properties.post.enum.length);
        });

        it('should fallback pipe to identity/mirror', () => {
            var spec = {
                src: 'posts',
                dst: 'schema.properties.post.enum'
                // no pipe given
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum[0].id, 1414);
            assert.equal(obj.schema.properties.post.enum[1].id, 11);
        });

        it('should fallback not found values if provided fallback', () => {
            var spec = {
                src: 'posts[0].body',
                dst: 'schema.properties.post.enum',
                fallback: 'empty'
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum, 'empty');
        });
        
        it('should fallback not found values if provided fallback 2', () => {
            var spec = [{
                src: 'notFound.Not.Found',
                dst: 'schema.properties.post.enum',
                fallback: 'empty'
            }, {
                src: 'comments[2][0]',
                dst: 'schema.properties.comments.enum',
                fallback: 'empty'
            }];
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum, 'empty');
            assert.equal(obj.schema.properties.comments.enum, 'empty');
        });
    });

    describe('pipe types', () => {
        it('should take a function', () => {
            var spec = {
                src: 'posts',
                pipe: posts => posts.map(p => p.title),
                dst: 'schema.properties.post.enum'
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 'pipi');
        });
        it('should take an array [args, body] ', () => {
            var spec = {
                src: 'posts',
                pipe: [ 'posts', 'return posts.map(p => p.id)' ],
                dst: 'schema.properties.post.enum'
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
        });
        it('should take an object { args , body }', () => {
            var spec = {
                src: 'posts',
                pipe: { args: 'posts', body: 'return posts.map(p => p.id)' },
                dst: 'schema.properties.post.enum'
            };
            var obj = racor(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
        });
    });

    describe('multiple specs', () => {
        it('should take multiple specs to same input', () => {
            var specs = [{
                src: 'posts',
                pipe: { args: 'posts', body: 'return posts.map(p => p.id)' },
                dst: 'schema.properties.post.enum'
            }, {
                src: 'comments',
                pipe: { args: 'comments', body: 'return comments.map(c => c.id)' },
                dst: 'schema.properties.comment.enum'
            }];
            var obj = racor(specs, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.comment.enum[0], 16);
        });
        it('should take multiple specs to same input and output', () => {
            var specs = [{
                src: 'posts',
                pipe: { args: 'posts', body: 'return posts.map(p => p.id)' },
                dst: 'schema.properties.post.enum'
            }, {
                src: 'comments',
                pipe: { args: 'comments', body: 'return comments.map(c => c.id)' },
                dst: 'schema.properties.comment.enum'
            }];

            var out = {
                schema: {
                    properties: {
                        post: {
                            title: "Post"
                        }
                    }
                }
            };
            var obj = racor(specs, input, out);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.comment.enum[0], 16);
        });

        it('abbreviated/minimal mode (no pipe, default identity)', () => {
            var specs = {
                'data.posts': 'schema.properties.post.enum',
                'data.comments':  'schema.properties.comment.enum'
            };
            var obj = racor.min(specs, { data: input });
            assert.equal(obj.schema.properties.post.enum[0].id, 1414);
            assert.equal(obj.schema.properties.comment.enum[0].id, 16);
        });

        it('abbreviated/minimal mode (pipe one given fn for all paths)', () => {
            var specs = {
                'data.posts': 'schema.properties.post.enum',
                'data.comments':  'schema.properties.comment.enum',
            };
            var fn = data => data.map(item => item.id + 'test');
            var obj = racor.fn(fn, specs, { data: input });
            assert.equal(obj.schema.properties.post.enum[0], '1414test');
            assert.equal(obj.schema.properties.comment.enum[0], '16test');
        });

        it('abbreviated/minimal mode (pipe one given fn for all paths) + composed/pipeline', () => {
            const compose = (...fs) => (x) => fs.reduce((p,f) => f(p), x);
            var specs = {
                'data.posts': 'schema.properties.post.enum',
                'data.comments':  'schema.properties.comment.enum',
            };
            var fn1 = data => data.map(item => item.id + 'test');
            var fn2 = data => data.map(item => item + ' 2');
            var fn3 = data => data.map(item => item.toUpperCase());
            var obj = racor.fn(compose(fn1,fn2,fn3), specs, { data: input });
            assert.equal(obj.schema.properties.post.enum[0], '1414TEST 2');
            assert.equal(obj.schema.properties.comment.enum[0], '16TEST 2');
        });

        it('abbreviated/minimal mode autopluck', () => {
            var paths = {
                'data.posts': 'schema.properties.post.enum',
                'data.comments':  'schema.properties.comment.enum',
            };
            var obj = racor.pluck('id', paths, { data: input });
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.comment.enum[0], 16);
        });

    });
});
