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
const FIELD_DEFAULTS = { generator: 'name', type: 'findName' };


module.exports = exports = function mongooseFaker(schema, optns) {

  //merge options
  const options = _.merge({}, optns);

  //collect fakable fields
  let fakables = {};

  /**
   * @name  collectFakablePath
   * @description iterate recursively on schema paths and collect fakable
   *              paths only
   * @param  {String} pathName   [description]
   * @param  {SchemaType} schemaType [description]
   * @param  {String} parentPath [description]
   * @since  0.3.0
   * @version 0.1.0
   * @private
   */
  function collectFakablePaths(pathName, schemaType, parentPath) {

    //TODO handle refs(ObjectId) schema type

    //update path name
    pathName = _.compact([parentPath, pathName]).join('.');

    //start handle sub schemas
    const isSchema =
      schemaType.schema && schemaType.schema.eachPath &&
      _.isFunction(schemaType.schema.eachPath);
    if (isSchema) {
      schemaType.schema.eachPath(function (_pathName, _schemaType) {
        collectFakablePaths(_pathName, _schemaType, pathName);
      });
    }

    //check if schematype is fakable
    const isFakable = _.get(schemaType.options, 'fake');

    //collect fakable fields
    if (isFakable) {

      //collect fakable fields
      fakables[pathName] = schemaType.options;

    }

  }

  //collect fakable path
  schema.eachPath(function (pathName, schemaType) {
    collectFakablePaths(pathName, schemaType);
  });

  //expose fakable fields as schema statics
  schema.statics.FAKABLE_FIELDS = _.compact(fakables);

  /**
   * @name fake
   * @description generate fake model data
   * @param  {Number} [size] size of faked model
   * @param  {String} [locale] faker locale to be used       
   * @return {Query|Object[]} fake model(s)
   * @public
   */
  schema.statics.fake = function fake(size = 1, locale = 'en') {

    //iterate over fakable fields and build fake model
    const fakeData = function () {

      const model = {};

      _.forEach(fakables, function (optns, path) {

        //obtain default value
        const defaultValue = _.get(optns, 'default');
        let value = defaultValue;

        //obtain fake value
        if (!defaultValue) {
          const fakeOptns = _.merge({}, FIELD_DEFAULTS, optns.fake);
          const generator = (fakeOptns.generator || 'name');
          const type = (fakeOptns.type || 'findName');

          //generate value
          //TODO pass arguments
          faker.locale = (locale || options.locale || 'en');
          value = _.get(faker, [generator, type]);
          value = _.isFunction(value) ? value() : undefined;
        }

        _.set(model, path, value);

      });

      return model;

    };

    //fake models
    const models = _.map(_.range((size || 1)), function () {
      return fakeData();
    });

    //return
    return size > 1 ? models : _.first(models);

  };

};