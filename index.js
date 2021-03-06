'use strict';

const util = require('util');

const errors = require('restify-errors');
const _ = require('lodash');

const customOptions = {};

const exclude = ['codeToHttpError'];

Object.keys(errors)
  .filter(key => key.endsWith('Error'))
  .filter(key => !exclude.some(method => key === method))
  .forEach(errName => patchError(errName));

patchMakeConstructor();
patchMakeErrFromCode();

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
      } else if (
        arguments[0] instanceof Error &&
        _.isPlainObject(arguments[1])
      ) {
        // See https://github.com/restify/errors#new-errorpriorerr-options--printf-args
        options = arguments[1] || {};
      }
      return options;
    }

    // Calls constructor args.
    return parse.apply(null, ctorArgs);
  }

  /**
   * Dynamically create a constructor.
   * Must be anonymous fn.
   * @constructor
   */
  // Use an object because otherwise the variable name is shown as function name.
  const anonymous = {};
  anonymous.hook = function() {
    const options = parseOptions(arguments) || {};
    // Calls the parent constructor with itself as scope.
    ctor.apply(this, arguments);
    // Adds custom options to itself
    patchErrorBody(this, options);
  };
  // Inherits from the original error.
  // Is that necessary??
  util.inherits(anonymous.hook, ctor);

  // Make the prototype an instance of the old class.
  anonymous.hook.prototype = ctor.prototype;

  // Assign display name
  anonymous.hook.displayName = ctor.displayName + 'Hook';

  return anonymous.hook;
}

/**
 * Monkey patch the error object after his creation.
 * @param  {object} err Error to patch.
 * @param {object} options Options given by the user.
 */
function patchErrorBody(err, options) {
  // Gets the current toJSON to be extended.
  const json = err.toJSON();

  Object.keys(customOptions).forEach(optName => {
    let value = options[optName];
    if (value === undefined) {
      value = err.body[optName];
      if (value === '' || value === undefined) {
        value = customOptions[optName](
          err.body.code,
          err.statusCode,
          err.body.message
        );
      }
    }
    if (value !== undefined) {
      // Adds the option to the body of the error.
      err.body[optName] = value;
      // Adds the option to the json representation of the error.
      json[optName] = value;
    }
  });

  // Patchs the toJSON method.
  err.toJSON = () => json;
}

/**
 * Adds an hook to the makeConstructor method,
 */
function patchMakeConstructor() {
  const func = errors.makeConstructor;
  function makeConstructorHook() {
    func.apply(null, arguments);
    patchError(arguments[0]);
  }
  errors.makeConstructor = makeConstructorHook;
}

/**
 * Adds an hook to the makeErrFromCode method.
 */
function patchMakeErrFromCode() {
  const func = errors.makeErrFromCode;
  function makeErrFromCodeHook() {
    const err = func.apply(null, arguments);
    patchErrorBody(err, {});
    return err;
  }
  errors.makeErrFromCode = makeErrFromCodeHook;

  // Deprecated.
  // See https://github.com/restify/errors/blob/master/lib/index.js#L126
  errors.codeToHttpError = makeErrFromCodeHook;
}

/**
 * Add an hook to a restify error in order to be able to add custom options to
 * his body.
 * @param  {string} errName Name of the method of 'errors' to unpatch.
 */
function patchError(errName) {
  errors[errName] = extendErrorBody(errors[errName]);
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
  if (typeof customOptions[optName] === 'undefined') {
    return;
  }
  delete customOptions[optName];
}

module.exports = {
  add: addOption,
  delete: delOption,
};
