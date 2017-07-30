'use strict';

const errors = require('restify-errors');
const _ = require('lodash');

const utilsMethods = {makeConstructor: true, makeErrFromCode: true};
const errMethods = {};

const origErrors = {};

const customOptions = {};

Object.keys(errors)
  .filter(key => !utilsMethods[key])
  .forEach(errName => {
    errMethods[errName] = true;
  });
Object.keys(utilsMethods)
  .forEach(funcName => patchUtil(funcName));
Object.keys(errMethods)
  .forEach(errName => patchError(errName));

/**
 * Adds cuostom options to the error body.
 * @param  {function} ctor Original Cnstructor of the error.
 * @return {function} Hooked constructor of the error.
 */
function extendErrorBody(ctor) {
  /**
   * Parse errror's arguments to extract the 'options' object.
   * Extracted from https://github.com/restify/errors/blob/master/lib/helpers.js#L30
   * @param  {} ctorArgs Arguments of the error.
   */
  function parseOptions(ctorArgs) {
    function parse() {
      let options = null;

      if (_.isPlainObject(arguments[0])) {
        // See https://github.com/restify/errors#new-erroroptions--printf-args
        options = arguments[0] || {};
      } else if (arguments[0] instanceof Error && _.isPlainObject(arguments[1])) {
        // See https://github.com/restify/errors#new-errorpriorerr-options--printf-args
        options = arguments[1] || {};
      }
      return options;
    }

    // Calls constructor args.
    return parse.apply(null, ctorArgs);
  }

  /**
   * Hook constructor.
   * @constructor
   */
  function RestifyError() {
    const options = parseOptions(arguments) || {};
    // Calls the parent constructor with itself as scope.
    ctor.apply(this, arguments);

    // Gets the current toJSON to be extended.
    const json = this.toJSON();

    Object.keys(customOptions).forEach(optName => {
      let value = options[optName];
      if (value === undefined) {
        value = this.body[optName];
        if (value === '' || value === undefined) {
          value = customOptions[optName](this.body.code, this.statusCode, this.body.message);
          if (value === undefined) {
            value = '';
          }
        }
      }
      // Adds the option to the body of the error.
      this.body[optName] = value;
      // Adds the option to the json representation of the error.
      json[optName] = value;
    });

    // Patchs the toJSON method.
    this.toJSON = () => json;
  }
  // Rename the function.
  Object.defineProperty(RestifyError, 'name', {value: ctor.name});

  // Make the prototype an instance of the old class.
  RestifyError.prototype = Object.create(ctor.prototype);

  return RestifyError;
}

/**
 * Add an hook to a restify error in order to be able to add custom options to
 * his body.
 * @param  {string} errName Name of the method of 'errors' to unpatch.
 */
function patchError(errName) {
  if (origErrors[errName]) {
    return;
  }
  origErrors[errName] = errors[errName];
  errors[errName] = extendErrorBody(errors[errName]);
}

/**
 * Adds an hook to a restify errors util function in order to be able to patch
 * user created errors.
 * @param  {string} funcName Name of the method of 'errors' to patch
 */
function patchUtil(funcName) {
  const func = errors[funcName];
  errors[funcName] = () => {
    func.apply(null, arguments);
    errMethods[arguments[0]] = true;
  };
}

/**
 * Adds custom options to errors' body.
 * @param  {string} optName Name of the option key to add.
 * @param  {}       [optDefault] Default value for the option.
 *   If a function is provided it will be called with
 *   (errorCode, errorHttpCode, errorMessage) as parameters.
 *   You can use this behaviour to provide different default for each error.
 */
function addOption(optName, optDefault) {
  if (typeof optDefault !== 'function') {
    const val = optDefault;
    optDefault = () => val;
  }
  customOptions[optName] = optDefault;
}

/**
 * Removes previously added custom options.
 * @param  {string} optName Name of the option key to remove.
 */
function delOption(optName) {
  if (!customOptions[optName]) {
    return;
  }
  delete customOptions[optName];
}

module.exports = {
  add: addOption,
  delete: delOption
};
