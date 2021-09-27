'use strict';

const _ = require('lodash');
const faker = require('faker');
const common = require('@lykmapipo/common');
const mongooseCommon = require('@lykmapipo/mongoose-common');

/**
 * @name faker
 * @description mongoose plugin to generate fake model data
 * @param  {object} schema  valid mongoose schema
 * @returns {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const user = User.fake();
 * const users = User.fake(2);
 * const localizedUsers = User.fake(2, 'en-US');
 */

/* local constants */
const LOCALES = _.keys(faker.locales);
const DEFAULT_LOCALE = 'en';
const MAX_TIME = Number.MAX_SAFE_INTEGER;
const MAX_RETRIES = Number.MAX_SAFE_INTEGER;
const DEFAULT_GENERATOR = 'name';
const DEFAULT_TYPE = 'findName';
const DEFAULT_DATE_GENERATOR = 'date';
const DEFAULT_DATE_TYPE = 'between';
const DEFAULT_NUMBER_GENERATOR = 'datatype';
const DEFAULT_NUMBER_TYPE = 'number';
const FIELD_DEFAULTS = {
  generator: DEFAULT_GENERATOR,
  type: DEFAULT_TYPE,
};

/**
 * @name transform
 * @function transform
 * @description transform a value based on mongoose schema type options
 * @param  {object} value a value to be transformed
 * @param  {object} schemaTypeOptions valid schematype options
 * @see {@link http://mongoosejs.com/docs/schematypes.html#schematype-options}
 * @returns {object} a transformed
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.2.0
 * @version 0.1.0
 */
function transform(value, schemaTypeOptions) {
  // ensure schema type options
  const options = _.merge({}, schemaTypeOptions);
  let $value = value;

  if (value && _.keys(options).length > 0) {
    // trim
    if (options.trim) {
      $value = _.trim(value);
    }

    // lowercase
    if (options.lowercase) {
      $value = _.toLower(value);
    }

    // uppercase
    if (options.uppercase) {
      $value = _.toUpper(value);
    }
  }

  return $value;
}

/**
 * @name generate
 * @function generate
 * @param {object} schemaTypeOptions valid schematype options
 * @description generate a path value based on mongoose
 *              schema type options
 * @see {@link http://mongoosejs.com/docs/schematypes.html#schematype-options}
 * @returns {object} a transformed
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.2.0
 * @version 0.1.0
 */
function generate(schemaTypeOptions) {
  // ensure schema type options
  const options = _.merge({}, schemaTypeOptions);

  // obtain default value
  let value = _.get(options, 'default', undefined);

  // handle functional default value as per mongoose guides
  value = value && _.isFunction(value) ? value() : value;

  // check if is mongoose date schematype
  const isDateType = options.type ? options.type.name === 'Date' : false;
  const minDate = options.min ? options.min : faker.date.past();
  const maxDate = options.max ? options.max : new Date();

  // check if is mongoose number schema type
  const isNumberType = options.type ? options.type.name === 'Number' : false;
  const minNumber = options.min ? options.min : 0;
  const maxNumber = options.max ? options.max : Number.MAX_SAFE_INTEGER;

  // check if is mongoose boolean schema type
  const isBooleanType = options.type ? options.type.name === 'Boolean' : false;
  if (isBooleanType) {
    value = _.isBoolean(value) ? value : faker.datatype.boolean();
  }

  // obtain fake value from enum
  const isEnum =
    options.enum && _.isArray(options.enum) && options.enum.length > 0;
  // if (!value && isEnum) {
  if (isEnum) {
    const index = _.random(0, options.enum.length - 1);
    value = options.enum[index];
  }

  // obtain fake value
  if (!isBooleanType && value !== 0 && !value) {
    let fakeOptns = _.isFunction(options.fake)
      ? { generator: options.fake }
      : options.fake;
    fakeOptns = _.merge({}, FIELD_DEFAULTS, fakeOptns);

    // prepare generators
    let generator = fakeOptns.generator || DEFAULT_GENERATOR;

    // handle functional generator
    if (_.isFunction(generator)) {
      value = () => generator(faker);
    }

    // handle non-functional generator
    else {
      generator = isDateType ? DEFAULT_DATE_GENERATOR : generator;
      generator = isNumberType ? DEFAULT_NUMBER_GENERATOR : generator;

      // prepare types
      let type = fakeOptns.type || DEFAULT_TYPE;
      type = isDateType ? DEFAULT_DATE_TYPE : type;
      type = isNumberType ? DEFAULT_NUMBER_TYPE : type;

      // generate value
      // TODO pass arguments
      const $locale = options.locale || DEFAULT_LOCALE;
      faker.locale = _.has(LOCALES, $locale) ? $locale : DEFAULT_LOCALE;
      value = _.get(faker, [generator, type]);
    }

    // enforce unique value generation
    if (_.isFunction(value)) {
      // generate date value
      if (isDateType && generator === DEFAULT_DATE_GENERATOR) {
        value = value(minDate, maxDate);
      }

      // generate number value
      else if (isNumberType) {
        value = value({ min: minNumber, max: maxNumber });
      }

      // generate other value
      else {
        const isUnique = options.unique || fakeOptns.unique;
        const uniqueOptns = { maxTime: MAX_TIME, maxRetries: MAX_RETRIES };
        value = isUnique
          ? faker.unique(value, undefined, uniqueOptns)
          : value();
      }
    } else {
      value = undefined;
    }
  }

  // transform based on schema type options
  value = transform(value, options);

  return value;
}

/**
 * @function mongooseFaker
 * @name mongooseFaker
 * @description mongoose plugin to generate fake model data
 * @param  {object} schema  valid mongoose schema
 * @param  {object} optns  valid mongoose schema options
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 *
 * const user = User.fake();
 * const users = User.fake(2);
 * const localizedUsers = User.fake(2, 'en-US');
 */
function mongooseFaker(schema, optns) {
  // prevent n-times plugin registrations
  if (schema && schema.statics && schema.statics.fake) {
    return;
  }

  // merge options
  const options = _.merge({}, optns);

  // collect fakeable fields
  const fakeables = {};

  /**
   * @function  collectFakeablePath
   * @name  collectFakeablePath
   * @description iterate recursively on schema paths and collect fakeable
   *              paths only
   * @param  {string} pathName   valid schema path
   * @param  {object} schemaType valid schema type
   * @param  {string} parentPath valid parent schema path
   * @since  0.3.0
   * @version 0.1.0
   * @private
   */
  function collectFakeablePaths(pathName, schemaType, parentPath) {
    // TODO handle refs(ObjectId) schema type

    // update path name
    const $pathName = _.compact([parentPath, pathName]).join('.');

    // start handle sub schemas
    const isSchema =
      schemaType.schema &&
      schemaType.schema.eachPath &&
      _.isFunction(schemaType.schema.eachPath);
    if (isSchema) {
      schemaType.schema.eachPath(function onPath($$pathName, $schemaType) {
        collectFakeablePaths($$pathName, $schemaType, $pathName);
      });
    }

    // check if schematype is fakeable
    const isFakeable = _.get(schemaType.options, 'fake');

    // collect fakeable fields
    if (isFakeable) {
      // collect fakeable fields
      fakeables[$pathName] = schemaType.options;
    }
  }

  // collect fakeable path
  schema.eachPath(function onPath($$$pathName, $$$schemaType) {
    collectFakeablePaths($$$pathName, $$$schemaType);
  });

  /**
   * @name fakeData
   * @description fake data generator
   * @param {string} locale valid generator locale
   * @param {string|string[]} only field(s) to include
   * @param {string|string[]} except field(s) to ignore
   * @returns {object|object[]} generated data
   */
  function fakeData(locale = 'en', only = undefined, except = undefined) {
    const model = {};
    const $only = only ? [].concat(only) : undefined;
    const $except = except ? [].concat(except) : undefined;

    // only
    let $fakeables = _.merge({}, fakeables);
    if ($only) {
      $fakeables = _.merge({}, _.pick(fakeables, $only));
    }

    // except
    if ($except) {
      $fakeables = _.merge({}, _.omit(fakeables, $except));
    }

    _.forEach($fakeables, function onFakeable($optns, path) {
      const $$optns = _.merge({}, options, $optns, { locale });
      const value = generate($$optns);
      _.set(model, path, value);
    });

    return model;
  }

  /**
   * @name fake
   * @description generate fake model data
   * @param  {number} [size] size of faked model
   * @param  {string} [locale] faker locale to be used
   * @param  {string[]} [only] allowed fields to generate fake value
   * @param  {string[]} [except] exclued fields to generate fake value
   * @returns {object | object[]} fake model(s)
   * @public
   */
  // eslint-disable-next-line no-param-reassign
  schema.statics.fake = function fake(
    size = 1,
    locale = 'en',
    only = undefined,
    except = undefined
  ) {
    // fake models
    const $size = _.isNumber(size) && size > 0 ? size : 1;
    const models = _.map(
      _.range($size),
      function mapInstance() {
        return new this(fakeData(locale, only, except));
      }.bind(this)
    );

    // return
    return size > 1 ? models : _.first(models);
  };

  /**
   * @name fakeOnly
   * @description generate fake model data with only specified fields
   * @param  {number} [size] size of faked model
   * @param  {string} [locale] faker locale to be used
   * @param  {string[]} [fields] fields to only include
   * @returns {object | object[]} fake model(s)
   * @public
   */
  // eslint-disable-next-line no-param-reassign
  schema.statics.fakeOnly = function fakeOnly(size, locale, ...fields) {
    // prepare fields
    const only = _.compact(
      []
        .concat(size)
        .concat(locale)
        .concat(...fields)
    );

    // build fake model instances
    const models = this.fake(only[0], only[1], only, undefined);

    // return
    return models;
  };

  /**
   * @name fakeExcept
   * @description generate fake model data with specified fields exluded
   * @param  {number} [size] size of faked model
   * @param  {string} [locale] faker locale to be used
   * @param  {string[]} [fields] fields to exclude
   * @returns {object | object[]} fake model(s)
   * @public
   */
  // eslint-disable-next-line no-param-reassign
  schema.statics.fakeExcept = function fakeExcept(size, locale, ...fields) {
    // prepare fields
    const except = _.compact(
      []
        .concat(size)
        .concat(locale)
        .concat(...fields)
    );

    // build fake model instances
    const models = this.fake(except[0], except[1], undefined, except);

    // return
    return models;
  };

  /**
   * @name fakeOnly
   * @description generate fake model data with only specified fields
   *              and update model instance
   * @param  {string[]} [fields] fields to only update
   * @returns {object} fake model instance
   * @private
   */
  // eslint-disable-next-line no-param-reassign
  schema.methods.fakeOnly = function instanceFakeOnly(...fields) {
    // prepare fields
    const only = _.compact([].concat(...fields));

    // generate data
    const data = fakeData(undefined, only, undefined);

    // merge existing instance
    const changes = common.mergeObjects(mongooseCommon.copyInstance(this), mongooseCommon.copyInstance(data));

    // update model instance
    this.set(changes);

    return this;
  };

  /**
   * @name fakeExcept
   * @description generate fake model data with specified fields excluded
   *              and update model instance
   * @param  {string[]} [fields] fields to exclude on update
   * @returns {object} fake model instance
   * @private
   */
  // eslint-disable-next-line no-param-reassign
  schema.methods.fakeExcept = function instanceFakeExcept(...fields) {
    // prepare fields
    const except = _.compact([].concat(...fields));

    // generate data
    const data = fakeData(undefined, undefined, except);

    // merge existing instance
    const changes = common.mergeObjects(mongooseCommon.copyInstance(this), mongooseCommon.copyInstance(data));

    // update model instance
    this.set(changes);

    return this;
  };
}

module.exports = mongooseFaker;
