'use strict';


/**
 * @name faker
 * @description mongoose plugin to generate fake model data
 * @param  {Schema} schema  valid mongoose schema
 * @return {Function} valid mongoose plugin
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.1.0
 * @version 0.1.0
 * @example
 * 
 * const user = User.fake();
 * const users = User.fake(2);
 * const localizedUsers = User.fake(2, 'en-US');
 */


/* dependencies */
const _ = require('lodash');
const faker = require('@benmaruchu/faker');
const { mergeObjects } = require('@lykmapipo/common');
const { copyInstance } = require('@lykmapipo/mongoose-common');


/* local constants */
const LOCALES = _.keys(faker.locales);
const DEFAULT_LOCALE = 'en';
const MAX_TIME = Number.MAX_SAFE_INTEGER;
const MAX_RETRIES = Number.MAX_SAFE_INTEGER;
const DEFAULT_GENERATOR = 'name';
const DEFAULT_TYPE = 'findName';
const DEFAULT_DATE_GENERATOR = 'date';
const DEFAULT_DATE_TYPE = 'between';
const DEFAULT_NUMBER_GENERATOR = 'random';
const DEFAULT_NUMBER_TYPE = 'number';
const FIELD_DEFAULTS = {
  generator: DEFAULT_GENERATOR,
  type: DEFAULT_TYPE
};


/**
 * @name transform
 * @function transform
 * @description transform a value based on mongoose schema type options
 * @param  {Mixed} value a value to be transformed
 * @param  {Object} schemaTypeOptions valid schematype options
 * @see {@link http://mongoosejs.com/docs/schematypes.html#schematype-options}
 * @return {Mixed} a transformed
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.2.0
 * @version 0.1.0
 */
function transform(value, schemaTypeOptions) {

  //ensure schema type options
  const options = _.merge({}, schemaTypeOptions);

  if (value && _.keys(options).length > 0) {
    //trim
    if (options.trim) {
      value = _.trim(value);
    }

    //lowercase
    if (options.lowercase) {
      value = _.toLower(value);
    }

    //uppercase
    if (options.uppercase) {
      value = _.toUpper(value);
    }
  }

  return value;

}


/**
 * @name generate
 * @function generate
 * @description generate a path value based on mongoose
 *              schema type options
 * @param  {Mixed} value a value to be transformed
 * @param  {Object} schemaOptions valid schematype options
 * @see {@link http://mongoosejs.com/docs/schematypes.html#schematype-options}
 * @return {Mixed} a transformed
 * @author lally elias <lallyelias87@mail.com>
 * @since  0.2.0
 * @version 0.1.0
 */
function generate(schemaTypeOptions) {

  //ensure schema type options
  const options = _.merge({}, schemaTypeOptions);

  //obtain default value
  let value = _.get(options, 'default', undefined);

  //handle functional default value as per mongoose guides
  value = (value && _.isFunction(value) ? value() : value);

  //check if is mongoose date schematype
  const isDateType =
    (options.type ? (options.type.name === 'Date') : false);
  const minDate = (options.min ? options.min : faker.date.past());
  const maxDate = (options.max ? options.max : new Date());

  //check if is mongoose number schema type
  const isNumberType =
    (options.type ? (options.type.name === 'Number') : false);
  const minNumber = (options.min ? options.min : 0);
  const maxNumber = (options.max ? options.max : Number.MAX_SAFE_INTEGER);

  //check if is mongoose boolean schema type
  const isBooleanType =
    (options.type ? (options.type.name === 'Boolean') : false);
  if (isBooleanType) {
    value = _.isBoolean(value) ? value : faker.random.boolean();
  }

  //obtain fake value from enum
  const isEnum =
    (options.enum && _.isArray(options.enum) && options.enum.length > 0);
  // if (!value && isEnum) {
  if (isEnum) {
    const index = _.random(0, options.enum.length - 1);
    value = options.enum[index];
  }

  //obtain fake value
  if (!isBooleanType && value !== 0 && !value) {
    let fakeOptns =
      (_.isFunction(options.fake) ? { generator: options.fake } : options.fake);
    fakeOptns = _.merge({}, FIELD_DEFAULTS, fakeOptns);

    //prepare generators
    let generator = (fakeOptns.generator || DEFAULT_GENERATOR);

    //handle functional generator
    if (_.isFunction(generator)) {
      value = () => generator(faker);
    }

    //handle non-functional generator
    else {
      generator = (isDateType ? DEFAULT_DATE_GENERATOR : generator);
      generator = (isNumberType ? DEFAULT_NUMBER_GENERATOR : generator);

      //prepare types
      let type = (fakeOptns.type || DEFAULT_TYPE);
      type = (isDateType ? DEFAULT_DATE_TYPE : type);
      type = (isNumberType ? DEFAULT_NUMBER_TYPE : type);

      //generate value
      //TODO pass arguments
      const _locale = (options.locale || DEFAULT_LOCALE);
      faker.locale = (_.has(LOCALES, _locale) ? _locale : DEFAULT_LOCALE);
      value = _.get(faker, [generator, type]);
    }

    //enforce unique value generation
    if (_.isFunction(value)) {

      //generate date value
      if (isDateType && generator === DEFAULT_DATE_GENERATOR) {
        value = value(minDate, maxDate);
      }

      //generate number value
      else if (isNumberType) {
        value = value({ min: minNumber, max: maxNumber });
      }

      //generate other value
      else {
        const isUnique = (options.unique || fakeOptns.unique);
        const uniqueOptns = { maxTime: MAX_TIME, maxRetries: MAX_RETRIES };
        value = (
          isUnique ?
          faker.unique(value, undefined, uniqueOptns) :
          value()
        );
      }

    } else {
      value = undefined;
    }
  }

  //transform based on schema type options
  value = transform(value, options);

  return value;
}

module.exports = exports = function mongooseFaker(schema, optns) {

  //prevent n-times plugin registrations
  if (schema && schema.statics && schema.statics.fake) {
    return;
  }

  //merge options
  const options = _.merge({}, optns);

  //collect fakeable fields
  let fakeables = {};

  /**
   * @name  collectFakeablePath
   * @description iterate recursively on schema paths and collect fakeable
   *              paths only
   * @param  {String} pathName   [description]
   * @param  {SchemaType} schemaType [description]
   * @param  {String} parentPath [description]
   * @since  0.3.0
   * @version 0.1.0
   * @private
   */
  function collectFakeablePaths(pathName, schemaType, parentPath) {

    //TODO handle refs(ObjectId) schema type

    //update path name
    pathName = _.compact([parentPath, pathName]).join('.');

    //start handle sub schemas
    const isSchema =
      schemaType.schema && schemaType.schema.eachPath &&
      _.isFunction(schemaType.schema.eachPath);
    if (isSchema) {
      schemaType.schema.eachPath(function (_pathName, _schemaType) {
        collectFakeablePaths(_pathName, _schemaType, pathName);
      });
    }

    //check if schematype is fakeable
    const isFakeable = _.get(schemaType.options, 'fake');

    //collect fakeable fields
    if (isFakeable) {

      //collect fakeable fields
      fakeables[pathName] = schemaType.options;

    }

  }

  //collect fakeable path
  schema.eachPath(function (pathName, schemaType) {
    collectFakeablePaths(pathName, schemaType);
  });


  //fake data generator
  const fakeData = function _fakeData(
    size = 1, locale = 'en',
    only = undefined, except = undefined
  ) {

    let model = {};
    const _only = only ? [].concat(only) : undefined;
    const _except = except ? [].concat(except) : undefined;

    //only
    let _fakeables = _.merge({}, fakeables);
    if (_only) {
      _fakeables = _.merge({}, _.pick(fakeables, _only));
    }

    //except
    if (_except) {
      _fakeables = _.merge({}, _.omit(fakeables, _except));
    }

    _.forEach(_fakeables, function (optns, path) {
      const _optns = _.merge({}, options, optns, { locale: locale });
      const value = generate(_optns);
      _.set(model, path, value);
    });

    return model;

  };


  /**
   * @name fake
   * @description generate fake model data
   * @param  {Number} [size] size of faked model
   * @param  {String} [locale] faker locale to be used       
   * @param  {String[]} [only] allowed fields to generate fake value       
   * @param  {String[]} [except] exclued fields to generate fake value       
   * @return {Object|Object[]} fake model(s)
   * @public
   */
  schema.statics.fake = function fake(
    size = 1, locale = 'en',
    only = undefined, except = undefined
  ) {

    //fake models
    const _size = (_.isNumber(size) && size > 0 ? size : 1);
    const models = _.map(_.range(_size), function () {
      return new this(fakeData(size, locale, only, except));
    }.bind(this));

    //return
    return size > 1 ? models : _.first(models);

  };


  /**
   * @name fakeOnly
   * @description generate fake model data with only specified fields
   * @param  {Number} [size] size of faked model
   * @param  {String} [locale] faker locale to be used       
   * @param  {String[]} [fields] fields to only include       
   * @return {Object|Object[]} fake model(s)
   * @public
   */
  schema.statics.fakeOnly =
    function fakeOnly(size, locale, ...fields) {

      //prepare fields
      const only =
        _.compact([].concat(size).concat(locale).concat(...fields));

      //build fake model instances
      const models = this.fake(only[0], only[1], only, undefined);

      //return 
      return models;

    };


  /**
   * @name fakeExcept
   * @description generate fake model data with specified fields exluded
   * @param  {Number} [size] size of faked model
   * @param  {String} [locale] faker locale to be used       
   * @param  {String[]} [fields] fields to exclude       
   * @return {Object|Object[]} fake model(s)
   * @public
   */
  schema.statics.fakeExcept =
    function fakeExcept(size, locale, ...fields) {

      //prepare fields
      const except =
        _.compact([].concat(size).concat(locale).concat(...fields));

      //build fake model instances
      const models = this.fake(except[0], except[1], undefined, except);

      //return 
      return models;

    };


  /**
   * @name fakeOnly
   * @description generate fake model data with only specified fields
   *              and update model instance
   * @param  {String[]} [fields] fields to only update       
   * @return {Object} fake model instance
   * @private
   */
  schema.methods.fakeOnly = function instanceFakeOnly(...fields) {

    //prepare fields
    const only =
      _.compact([].concat(...fields));

    //generate data
    const data = fakeData(1, undefined, only, undefined);

    // merge existing instance
    const changes = mergeObjects(copyInstance(this), copyInstance(data));

    //update model instance
    this.set(changes);

    return this;

  };


  /**
   * @name fakeExcept
   * @description generate fake model data with specified fields excluded
   *              and update model instance
   * @param  {String[]} [fields] fields to exclude on update       
   * @return {Object} fake model instance
   * @private
   */
  schema.methods.fakeExcept = function instanceFakeExcept(...fields) {

    //prepare fields
    const except =
      _.compact([].concat(...fields));

    //generate data
    const data = fakeData(1, undefined, undefined, except);

    // merge existing instance
    const changes = mergeObjects(copyInstance(this), copyInstance(data));

    //update model instance
    this.set(changes);

    return this;

  };


};