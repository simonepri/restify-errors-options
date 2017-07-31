import test from 'ava';
import errors from 'restify-errors';
import m from '.';

test.serial('should add/delete custom options to/from body', t => {
  let err = new errors.InternalServerError();
  t.is(err.body.errno, undefined);

  m.add('errno', '');
  err = new errors.InternalServerError();
  t.is(err.body.errno, '');

  m.delete('errno');
  err = new errors.InternalServerError();
  t.is(err.body.errno, undefined);
});

test.serial('should set the default value', t => {
  let err = new errors.ImATeapotError();
  t.is(err.body.unicorn, undefined);

  m.add('unicorn', '🦄');
  err = new errors.ImATeapotError();
  t.is(err.body.unicorn, '🦄');

  m.delete('unicorn');
  err = new errors.ImATeapotError();
  t.is(err.body.unicorn, undefined);
});

test.serial('shouldn\'t delete stock options', t => {
  const err = new errors.NotImplementedError();
  t.is(err.body.code, 'NotImplemented');

  m.delete('code');
  t.is(err.body.code, 'NotImplemented');
});

test.serial('should use options value insted of default value', t => {
  let err = new errors.NotExtendedError();
  t.is(err.body.dragon, undefined);

  m.add('dragon', '🦄');
  err = new errors.NotExtendedError({dragon: '🐉'});
  t.is(err.body.dragon, '🐉');

  m.delete('dragon');
  err = new errors.NotExtendedError();
  t.is(err.body.dragon, undefined);
});

test.serial('should replace message with default if empty', t => {
  let err = new errors.WrongAcceptError();
  t.is(err.body.message, '');

  m.add('message', 'Some awesome message');
  err = new errors.WrongAcceptError();
  t.is(err.body.message, 'Some awesome message');

  m.delete('message');
  err = new errors.WrongAcceptError();
  t.is(err.body.message, '');
});

test.serial('should allow to use different default for each error code', t => {
  let err = new errors.NotAuthorizedError();
  t.is(err.body.errno, undefined);
  err = new errors.MethodNotAllowedError();
  t.is(err.body.errno, undefined);
  err = new errors.NotFoundError();
  t.is(err.body.errno, undefined);
  err = new errors.InvalidVersionError();
  t.is(err.body.errno, undefined);
  err = new errors.UnsupportedMediaTypeError();
  t.is(err.body.errno, undefined);
  err = new errors.NetworkAuthenticationRequiredError();
  t.is(err.body.errno, undefined);
  err = new errors.NotImplementedError({message: 'Hello World'});
  t.is(err.body.errno, undefined);

  m.add('errno', (code, http, msg) => {
    switch (code) {
      case 'MethodNotAllowed': return 'MNAE';
      case 'NotFound': return 'NFE';
      case 'InvalidVersion': return 'IVE';
      case 'UnsupportedMediaType': return 'UMTE';
      default: {
        switch (http) {
          case 511: return 'NARE';
          default: {
            switch (msg) {
              case 'Hello World': return 'HWE';
              default: return 'ERROR';
            }
          }
        }
      }
    }
  });

  err = new errors.NotAuthorizedError();
  t.is(err.body.errno, 'ERROR');
  err = new errors.MethodNotAllowedError();
  t.is(err.body.errno, 'MNAE');
  err = new errors.NotFoundError();
  t.is(err.body.errno, 'NFE');
  err = new errors.InvalidVersionError();
  t.is(err.body.errno, 'IVE');
  err = new errors.UnsupportedMediaTypeError();
  t.is(err.body.errno, 'UMTE');
  err = new errors.NetworkAuthenticationRequiredError();
  t.is(err.body.errno, 'NARE');
  err = new errors.NotImplementedError({message: 'Hello World'});
  t.is(err.body.errno, 'HWE');

  m.delete('errno');
  err = new errors.NotAuthorizedError();
  t.is(err.body.errno, undefined);
  err = new errors.MethodNotAllowedError();
  t.is(err.body.errno, undefined);
  err = new errors.NotFoundError();
  t.is(err.body.errno, undefined);
  err = new errors.InvalidVersionError();
  t.is(err.body.errno, undefined);
  err = new errors.UnsupportedMediaTypeError();
  t.is(err.body.errno, undefined);
  err = new errors.NetworkAuthenticationRequiredError();
  t.is(err.body.errno, undefined);
  err = new errors.NotImplementedError({message: 'Hello World'});
  t.is(err.body.errno, undefined);
});

test.serial('should add/delete custom options to/from custom errors\' body', t => {
  errors.makeConstructor('ExecutionError', {statusCode: 406});
  let err = new errors.ExecutionError();
  t.is(err.body.errno, undefined);

  m.add('errno', '');
  err = new errors.ExecutionError();
  t.is(err.body.errno, '');

  errors.makeConstructor('UnicornError', {statusCode: 404});
  err = new errors.UnicornError();
  t.is(err.body.errno, '');

  m.delete('errno');
  err = new errors.ExecutionError();
  t.is(err.body.errno, undefined);
});

test.serial('should add/delete custom options to/from http errors\' body', t => {
  let err = errors.makeErrFromCode(406);
  t.is(err.body.errno, undefined);

  m.add('errno', '');
  err = errors.makeErrFromCode(406);
  t.is(err.body.errno, '');

  m.delete('errno');
  err = errors.makeErrFromCode(406);
  t.is(err.body.errno, undefined);
});

test.serial('should remain unalterated without a default value', t => {
  let err = new errors.InternalServerError();
  t.is(err.body.errno, undefined);

  m.add('errno');
  err = new errors.InternalServerError();
  t.is(Object.prototype.hasOwnProperty.call(err.body, 'errno'), false);

  m.delete('errno');
  err = new errors.InternalServerError();
  t.is(err.body.errno, undefined);
});

test.serial('should mantain the error inheritance inalterated', t => {
  let err = new errors.InternalServerError();
  t.true(err instanceof errors.InternalServerError);
  t.false(err instanceof errors.RestError);
  t.true(err instanceof errors.HttpError);
  t.true(err instanceof Error);

  err = new errors.BadMethodError();
  t.true(err instanceof errors.BadMethodError);
  t.true(err instanceof errors.RestError);
  t.true(err instanceof errors.HttpError);
  t.true(err instanceof Error);
});
