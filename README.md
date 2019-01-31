# Racor

Tool to copy values from given key/path of an object, into another.



## This basically....

Is a dead-simple JavaScript hand-changing utility for data, mostly JSON.

* Gets a value from given object, at given *path*
* Applies a pipe function in between (optionally)
* Sets that value to a different object, at a given *path*


*path* uses a syntax very similar to lodash [set](https://www.npmjs.com/package/lodash.set) and [get](https://www.npmjs.com/package/lodash.get), because originally `racor` used these both. 


It passes data from a given path inside the source object *[, applies an optional function to it]*, and set it to a given path inside the destination object.

I'd like to think about it as [hose-fitting](http://www.fredshed.co.uk/photosgardtools/hozelock4waymanifold.jpg), because I developed this with an objective in mind: hydrating my schemas with data, *in a stylish declarative way*. 

A *racor* or *raccord* is a pipe fitting utility that comes in several forms to achieve different connections.

Since version 1.1.0 the only dependency is [deepmerge](https://www.npmjs.com/package/deepmerge) and has own custom implementations similar to lodash's `set` and `get`

## Installation

Now available as [npm package](https

### Or build it from source:

`git clone ... && cd ... `
`npm install`
`npm run compile`

Thanks to Babel, Rollup and Uglify, this will generate in `dist/` files `bundle.js` (~4kB) and `bundle.min.js` (~2.5kB) ready to be used in any environment, NodeJS or the browser.

## Test

After the usual: 
`git clone ... && cd ... `

`npm install`

The `npm test` command will run a test suite with many different use cases. Take a look at `test/racor.test.js` for more information.


## Usage

Lets say we have a Form that will be generated using JSONSchema through one of the great tools that are out there for it [0].

My Form is an Image upload. I have to associate an Image with a Post, so I ask my API to get me the posts. The response `data` will probably look like: 

```json
{
    "posts": [
        {
            "id": 1,
            "title": "Some"
        }, {
            "id": 2,
            "title": "Some Two"
        }, {
            "id": 3,
            "title": "Some Tre"
        }
    ]
}
```

Our Image Form schema has a "post" field to establish a relation. And we want to set the options for the dropdown before the Form is rendered.

So we'd do:

```javascript
const schemas = { schema: { /* properties, whatever */ } };

fetch('/api/posts').then(res => res.json()).then(data => {

    // also we can get it assigned passing the schemas as "output" argument
    let hydratedSchemas = racor({
        src: 'posts',
        pipe: ps => ps.map(p => p.id),
        dst: 'schema.properties.posts.enum'
    }, data, schemas);

    // this particular example pases a "pluck" fn as pipe.
    // we could use a provided shorthand method:
    let hydratedSchemas = racor.pluck("id", {'posts': 'schema.properties.posts.enum'}, data, schemas);

    // also we can do multiple copyings, passing an array of src's and dst's
    let specs = [{
        src: 'posts',
        pipe: ps => ps.map(p => p.id),
        dst: 'schema.properties.posts.enum'
    }, {
        src: 'posts',
        pipe: ps => ps.map(p => p.name),
        dst: 'schema.properties.posts.enumNames'
    }];

    let hydratedSchemas = racor(specs, data, schemas);
});
```

### Pipes

All these specs could easily be stored as text in a database, so the data mappings doesn't have to be hard-coded. 

The `pipe` function could be stored as text too, because the tool supports bring it to live with the `new Function()` strategy.

So instead of passing a real function we can supply:

...an Array
```
pipe: ['ps', 'return ps.map(p => p.id)']
```

...and Object (with `args` and `body` keys):
```
pipe: { args: 'ps', body: 'return ps.map(p => p.id)' }
```

...or a String (only the body):
```
pipe: 'return arguments[0].map(p => p.id)'
```

This is achieved thanks to the JS functionality where you define a function using the Function constructor: 

```javascript
> const sum = new Function('a, b', 'return a + b');
> sum(10, 4);
14
```

**Notice that this actually uses `eval` so use it at your own risk**

### Abbreviated usage:

See [test file](test/racor.test.js) for more complex and varied usage examples

```javascript

racor.min({'src.path': 'destination.pat'}, data[, base])
racor.fn(t => t.toUpperCase(), { 'data.some': 'someList', 'data.other':'otherList' }, data[, base])
racor.pluck('id', { 'data.posts': 'postIds' }, data[, base]);
```

## Related

[0] I mean React-JSONSchema-Form, JSONSchema-Form (for Angular) or any other, see:  
https://json-schema.org/implementations.html#web-ui-generation
