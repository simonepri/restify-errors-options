# restify-errors-options
[![Travis CI](https://travis-ci.org/simonepri/restify-errors-options.svg?branch=master)](https://travis-ci.org/simonepri/restify-errors-options) [![Codecov](https://img.shields.io/codecov/c/github/simonepri/restify-errors-options/master.svg)](https://codecov.io/gh/simonepri/restify-errors-options) [![npm](https://img.shields.io/npm/dm/restify-errors-options.svg)](https://www.npmjs.com/package/restify-errors-options) [![npm version](https://img.shields.io/npm/v/restify-errors-options.svg)](https://www.npmjs.com/package/restify-errors-options) [![npm dependencies](https://david-dm.org/simonepri/restify-errors-options.svg)](https://david-dm.org/simonepri/restify-errors-options) [![npm dev dependencies](https://david-dm.org/simonepri/restify-errors-options/dev-status.svg)](https://david-dm.org/simonepri/restify-errors-options#info=devDependencies)
> 🔧 Add custom options to Restify's errors!

<hr>
<p align="center"><strong>DEPRECATED!!!</strong></p>
<hr>

## Install

```
$ npm install --save restify-errors-options
```

## Usage
```js
const errorsOptions = require('restify-errors-options');
// Is extremely important to require restify-errors-options before restify.
const errors = require('restify-errors');

// Default behaviour
const err1 = new errors.NotFoundError({errno: 'NFE'});
console.log(err1.toJSON());
//=> {code: 'NotFound', message: ''}

// Add errno as option to add to the body
errorsOptions.add('errno');
const err2 = new errors.NotFoundError({errno: 'NFE'});
console.log(err2.toJSON());
//=> {code: 'NotFound', message: '', errno: 'NFE'}
console.log(err1.toJSON());
//=> {code: 'NotFound', message: ''}

// Restore the default behaviour
errorsOptions.delete('errno');
const err3 = new errors.NotFoundError({errno: 'NFE'});
console.log(err3.toJSON());
//=> {code: 'NotFound', message: ''}
console.log(err2.toJSON());
//=> {code: 'NotFound', message: '', errno: 'NFE'}
console.log(err1.toJSON());
//=> {code: 'NotFound', message: ''}
```

## Plugins
Community packages that implement adds options through this package.
If you want yours listed here open a PR.

* [restify-errors-options-errno](https://github.com/simonepri/restify-errors-options-errno): *Add errno to Restify's errors*

## API

### add(optName, [optDefault])

Adds custom options to errors' body.

#### optName

Type: `string`

Name of the option key to add.

#### optDefault

Type: `(number|boolean|string|object)`

Default value for the option.
You can also provide a function, see the next section.

#### optDefault(errorCode, errorHttpCode, errorMessage)

Type: `function`

Returns the default value for the option using parameters of the error.

### delete(optName)

Removes previously added custom options..

#### optName

Type: `string`

Name of the option key to remove.

## Authors
* **Simone Primarosa** - [simonepri](https://github.com/simonepri)

See also the list of [contributors](https://github.com/simonepri/restify-errors-options/contributors) who participated in this project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
