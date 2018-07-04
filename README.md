# I still don't have a name!

The codename so far is HoseFit.

I think it could be more descriptive... like...

* "Get, Apply, Set"
* "Path to Path"

## This basically....

* Gets a value from given object, at given path
* Applies "transformer/mapper/reducer/picker/plucker/whatev-er" (optionally)
* Sets that value to a different object, at a given path

## Try it out

`git clone ... && cd ...`
`npm install`
`npm test`

## Usage

**Built upon Lodash's `get` and `set` so the path syntax is exactly the same**

## What's this

This is a dead-simple JavaScript hand-changing utility for data, mostly JSON.

It passes data from a given path inside the source object *[, applies an optional function to it]*, and set it to a given path inside the destination object.

I'd like to think about it as [hose-fitting](http://www.fredshed.co.uk/photosgardtools/hozelock4waymanifold.jpg), because I developed this with an objective in mind: hydrating my schemas with data, *in a stylish declarative way*.

## Example

Lets say we have a Form that will be generated using JSONSchema through one of the great tools that are out there for it [0].

My Form is an Image upload. I have to associate an Image with a Post, so I ask my API to get me the posts. The response `data` will probably look like: 

```json
{
    "posts": [{
        "id": 1,
        "title": "Some"
    }, {
        "id": 2,
        "title": "Some Two"
    }{
        "id": 3,
        "title": "Some Tre"
    }]
}
```

Our Image Form schema has a "post" field to establish a relation. And we want to set the options for the dropdown before the Form is rendered.

So we'd do:

```javascript
const schemas = { schema: { ... }, uiSchema: { ... } };
fetch('/api/posts')
.then(res => res.json())
.then(data => {
    let out = hoseFit({
        getPath: 'posts',
        apply: ps => ps.map(p => p.id),
        setPath: 'schema.properties.posts.enum'
    }, data);
    Object.assign(schemas, out);

    // also we can get it assigned passing the schemas as "output" argument
    let newSchemas = hoseFit({
        getPath: 'posts',
        apply: ps => ps.map(p => p.id),
        setPath: 'schema.properties.posts.enum'
    }, data, schemas);

    // and we can do it multiple times
    let specs = [{
        getPath: 'posts',
        apply: ps => ps.map(p => p.id),
        setPath: 'schema.properties.posts.enum'
    }, {
        getPath: 'posts',
        apply: ps => ps.map(p => p.name),
        setPath: 'schema.properties.posts.enumNames'
    }]

    specs.forEach(s => hoseFit(s, data, schemas));
});
```

All these specs could easily be stored as text in a database, so the data mappings doesn't have to be hard-coded. The `apply` function can be stored as text, see for example: 

```javascript
let spec = {
    getPath: 'posts',
    setPath: 'schema.properties.posts.enum',

    // either one of these formats:
    // array
    apply: ['ps', 'return ps.map(p => p.id)'],
    // object
    apply: { args: 'ps', body: 'return ps.map(p => p.id)' },
    // string
    apply: 'return arguments[0].map(p => p.id)',
};
```

This is achieved thanks to the JS functionality where you define a function using the Function constructor: 

```javascript
> const sum = new Function('a, b', 'return a + b');
> sum(10, 4);
14
```

## Related

[0] I mean React-JSONSchema-Form, JSONSchema-Form (for Angular) or any other 