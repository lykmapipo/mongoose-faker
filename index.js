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


/*** dependencies */
const _ = require('lodash');
const faker = require('faker');


/*** local constants */
const LOCALES = _.keys(faker.locales);
const DEFAULT_LOCALE = 'en';
const DEFAULT_GENERATOR = 'name';
const DEFAULT_TYPE = 'findName';
const FIELD_DEFAULTS = {
  generator: DEFAULT_GENERATOR,
  type: DEFAULT_TYPE
};


module.exports = exports = function mongooseFaker(schema, optns) {

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

    //iterate over fakeable fields and build fake model
    const fakeData = function () {

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

        //obtain default value
        const defaultValue = _.get(optns, 'default');
        let value = defaultValue;

        //obtain fake value
        if (!defaultValue) {
          const fakeOptns = _.merge({}, FIELD_DEFAULTS, optns.fake);
          const generator = (fakeOptns.generator || DEFAULT_GENERATOR);
          const type = (fakeOptns.type || DEFAULT_TYPE);

          //generate value
          //TODO pass arguments
          const _locale =
            (locale || options.locale || DEFAULT_LOCALE);
          faker.locale =
            (_.has(LOCALES, _locale) ? _locale : DEFAULT_LOCALE);
          value = _.get(faker, [generator, type]);
          value = _.isFunction(value) ? value() : undefined;
        }

        _.set(model, path, value);

      });

      return model;

    };

    //fake models
    const _size = (_.isNumber(size) && size > 0 ? size : 1);
    const models = _.map(_.range(_size), function () {
      return new this(fakeData());
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
   * @description generate fake model data with only specified fields
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


};