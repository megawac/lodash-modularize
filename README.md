# lodash-modularize
[![Dependency Status](https://david-dm.org/megawac/lodash-modularize.svg)](https://david-dm.org/megawac/lodash-modularize)
[![devDependency Status](https://david-dm.org/megawac/lodash-modularize/dev-status.svg)](https://david-dm.org/megawac/lodash-modularize#info=devDependencies)

Generate modular lodash builds.

# Examples

All examples are taken from this project

```sh
# List all the method's being used in src
lodash-modularize src/** --list
# => assign,chain,flatten,includes,isArray,reject,result,template,uniq,zipObject

lodash-modularize src/**
# <formated module>

lodash-modularize src/** -o src/depends/lodash.js

lodash-modularize src/** -o src/depends/lodash.js --format es6

lodash-modularize src/** -o src/depends/lodash.js -f amd --exports amd

# Compile the code using lodash-cli!
lodash-modularize src/** -o src/depends/lodash.js -f amd --compile

# Update the projects using lodash to use the built depends/lodash instead
lodash-modularize src/** -o depends/lodash.js -f cjs --compile --update
```

**NOTE** at this time chaining syntax is not supported (as it cannot be replicated through modules)