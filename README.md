# lodash-modularize
[![Dependency Status](https://david-dm.org/megawac/lodash-modularize.svg)](https://david-dm.org/megawac/lodash-modularize)
[![devDependency Status](https://david-dm.org/megawac/lodash-modularize/dev-status.svg)](https://david-dm.org/megawac/lodash-modularize#info=devDependencies)

Lodash is starting to get pretty heafty; this is a tool to generate modular lodash builds so lodash only includes what you use.

# Example Usage

All examples are taken from this project

```sh
# List all the method's being used in src
lodash-modularize src/** --list
# => assign,chain,flatten,includes,isArray,reject,result,template,uniq,zipObject

lodash-modularize src/**
# <formated module>

lodash-modularize src/** -o src/depends/lodash.js

lodash-modularize src/** -o src/depends/lodash.js --format es6

# Set the global variable to search for to `lodash`
lodash-modularize src/** -o src/depends/lodash.js --global lodash --exports umd

# Compile the code using lodash-cli!
lodash-modularize src/** -o src/depends/lodash.js -f amd --compile

# Update the projects using lodash to use the built depends/lodash instead
lodash-modularize src/** -o depends/lodash.js --update
```

# Notes

At this time **chaining syntax is not supported** (as it cannot be replicated through modules)

Also **AMD** is not yet fully supported.

All though we go out of our way to be robust and support various ways to detect lodash imports of lodash there are things we don't bother to handle. For example if you do any of these things, we'll probably miss it (same goes for global variables)

```js
const _ = require('lodash');
const lodash = _;

function reassignment() {
    let _ = 'reassigned'.trim();
    return _;
}
```