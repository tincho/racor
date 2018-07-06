const assert = require('assert');
const hoseFit = require('./index');

describe('HoseFit', () => {

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

        it('should get and set . no apply',() => {
            var spec = {
                getPath: 'key',
                setPath: 'some.key.down.thePath'
            };
            var obj = hoseFit(spec, { key: 'pepito' });
            assert.equal(obj.some.key.down.thePath, 'pepito');
        });

        it('should get, apply and set', () => {
            var spec = {
                getPath: 'posts',
                apply: posts => posts.map(p => p.id),
                setPath: 'schema.properties.post.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.post.enum[1], 11);
        });

        it('should get, set and apply a fixed value',() => {
            var spec = {
                getPath: 'key',
                setPath: 'some.key.down.thePath',
                apply: 'return "fixed"'
            };
            var obj = hoseFit(spec, { key: 'pepito' });
            assert.equal(obj.some.key.down.thePath, 'fixed');
        });

        it('should merge if given an "output" object', () => {
            var spec = {
                getPath: 'posts',
                apply: posts => posts.map(p => p.id),
                setPath: 'schema.properties.post.enum'
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
            var obj = hoseFit(spec, input, toHydrate);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.post.enum[1], 11);
            // and also assert that was merged to the given object toHydrate
            assert.equal(obj.schema.properties.posts.title, 'Sarasa');
        });

        it('should not mutate the given "output" object but return a new one', () => {
            // this test actually is redundantly covering lodash's "set" function
            // but I want to double-check the purity of my function
            var spec = {
                getPath: 'posts',
                apply: posts => posts.map(p => p.id),
                setPath: 'schema.properties.post.enum'
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
            var obj = hoseFit(spec, input, toHydrate);
            assert.deepEqual(Object.keys(toHydrate.schema.properties.posts), ['type', 'title', 'default']);
        });

        it('should fallback apply to identity/mirror', () => {
            var spec = {
                getPath: 'posts',
                setPath: 'schema.properties.post.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.post.enum[0].id, 1414);
            assert.equal(obj.schema.properties.post.enum[1].id, 11);
        });
    });

    describe('apply types', () => {
        it('should take a function', () => {
            var spec = {
                getPath: 'posts',
                apply: posts => posts.map(p => p.title),
                setPath: 'schema.properties.post.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 'pipi');
        });
        it('should take an array [args, body] ', () => {
            var spec = {
                getPath: 'posts',
                apply: [ 'posts', 'return posts.map(p => p.id)' ],
                setPath: 'schema.properties.post.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
        });
        it('should take an object { args , body }', () => {
            var spec = {
                getPath: 'posts',
                apply: { args: 'posts', body: 'return posts.map(p => p.id)' },
                setPath: 'schema.properties.post.enum'
            };
            var obj = hoseFit(spec, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
        });
    });

    describe('multiple specs', () => {
        it('should take multiple specs to same input', () => {
            var specs = [{
                getPath: 'posts',
                apply: { args: 'posts', body: 'return posts.map(p => p.id)' },
                setPath: 'schema.properties.post.enum'
            }, {
                getPath: 'comments',
                apply: { args: 'comments', body: 'return comments.map(c => c.id)' },
                setPath: 'schema.properties.comment.enum'
            }];
            var obj = hoseFit(specs, input);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.comment.enum[0], 16);
        });
        it('should take multiple specs to same input and output', () => {
            var specs = [{
                getPath: 'posts',
                apply: { args: 'posts', body: 'return posts.map(p => p.id)' },
                setPath: 'schema.properties.post.enum'
            }, {
                getPath: 'comments',
                apply: { args: 'comments', body: 'return comments.map(c => c.id)' },
                setPath: 'schema.properties.comment.enum'
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
            var obj = hoseFit(specs, input, out);
            assert.equal(obj.schema.properties.post.enum[0], 1414);
            assert.equal(obj.schema.properties.comment.enum[0], 16);
        });
    });
});
