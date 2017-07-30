# Restify Errors Thrower
[![Travis CI](https://travis-ci.org/simonepri/restify-errors-options.svg?branch=master)](https://travis-ci.org/simonepri/restify-errors-options) [![Codecov](https://img.shields.io/codecov/c/github/simonepri/restify-errors-options/master.svg)](https://codecov.io/gh/simonepri/restify-errors-options) [![npm](https://img.shields.io/npm/dm/restify-errors-options.svg)](https://www.npmjs.com/package/restify-errors-options) [![npm version](https://img.shields.io/npm/v/restify-errors-options.svg)](https://www.npmjs.com/package/restify-errors-options) [![npm dependencies](https://david-dm.org/simonepri/restify-errors-options.svg)](https://david-dm.org/simonepri/restify-errors-options) [![npm dev dependencies](https://david-dm.org/simonepri/restify-errors-options/dev-status.svg)](https://david-dm.org/simonepri/restify-errors-options#info=devDependencies)
> 🔧 Add custom options to Restify's errors!


## Install

```
$ npm install --save restify-errors-options
```

## Usage

```js
const errors = require('restify-errors');
const errorsOptions = require('restify-errors-options');

// Default behaviour
const err2 = errors.NotFoundError({errno: 'NFE'});
console.log(err2.toJSON());
//=> {code: 'NotFound', message: ''}

// Add errno as option to add to the body
errorsOptions.add('errno');
const err1 = errors.NotFoundError({errno: 'NFE'});
console.log(err1.toJSON());
//=> {code: 'NotFound', message: '', errno: 'NFE'}

// Restore the default behaviour
errorsOptions.delete('errno');
const err2 = errors.NotFoundError({errno: 'NFE'});
console.log(err2.toJSON());
//=> {code: 'NotFound', message: ''}
```
## Authors
* **Simone Primarosa** - [simonepri](https://github.com/simonepri)

See also the list of [contributors](https://github.com/simonepri/restify-errors-options/contributors) who participated in this project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
