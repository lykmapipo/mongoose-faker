'use strict';

/*** dependencies */
const path = require('path');
const _ = require('lodash');
const faker = require('faker');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;
const expect = require('chai').expect;

/*** apply mongoose-faker plugin */
mongoose.plugin(require(path.join(__dirname, '..')));

/*** model */
const generators = [
  'address',
  'commerce',
  'company',
  'database',
  'date',
  'finance',
  'hacker',
  'helpers',
  'image',
  'internet',
  'lorem',
  'name',
  'phone',
  'random',
  'system'
];
const fields = {};

/*** prapare fields */
_.forEach(generators, function (generator) {
  _.forEach(_.keys(faker[generator]), function (type) {
    fields[type] = { type: Mixed, fake: { generator: generator, type: type } };
  });
});


const UserSchema = new Schema(fields);
const User = mongoose.model('User', UserSchema);

describe('fake plugin', function () {

  it('should extend schema with fake method', function () {
    expect(User.fake).to.exist;
    expect(User.fake).to.be.a('function');
    expect(User.fake.name).to.be.equal('fake');
  });

  it('should be able to generate fake model', function () {

    const user = User.fake();
    expect(user._id).to.exist;

    //assert fields
    _.forEach(generators, function (generator) {
      _.forEach(_.keys(faker[generator]), function (type) {
        expect(user[type]).to.exist;
      });
    });

  });

  it('should be able to generate fake models', function () {

    const users = User.fake(2);

    //assert size
    expect(users).to.have.length(2);

    //assert fields
    _.forEach(users, function (user) {
      expect(user._id).to.exist;

      _.forEach(generators, function (generator) {
        _.forEach(_.keys(faker[generator]), function (type) {
          expect(user[type]).to.exist;
        });
      });

    });

  });

  it('should be able to generate only specified fields', function () {

    const user = User.fakeOnly('zipCode');
    expect(user._id).to.exist;
    expect(user.zipCode).to.exist;

    _.forEach(generators, function (generator) {
      const types =
        _.without(_.keys(faker[generator]), 'zipCode');
      _.forEach(types, function (type) {
        expect(user[type]).to.not.exist;
      });
    });

  });

  it('should be able to generate only specified fields', function () {

    const users = User.fakeOnly(2, 'zipCode');

    //assert size
    expect(users).to.have.length(2);

    //assert fields
    _.forEach(users, function (user) {
      expect(user._id).to.exist;
      expect(user.zipCode).to.exist;

      _.forEach(generators, function (generator) {
        const types =
          _.without(_.keys(faker[generator]), 'zipCode');
        _.forEach(types, function (type) {
          expect(user[type]).to.not.exist;
        });
      });

    });

  });

  it('should be able to generate except specified fields', function () {

    const user = User.fakeExcept('zipCode');
    expect(user._id).to.exist;
    expect(user.zipCode).to.not.exist;

    _.forEach(generators, function (generator) {
      const types =
        _.without(_.keys(faker[generator]), 'zipCode');
      _.forEach(types, function (type) {
        expect(user[type]).to.exist;
      });
    });

  });

  it('should be able to generate except specified fields', function () {

    const users = User.fakeExcept(2, 'zipCode');

    //assert size
    expect(users).to.have.length(2);

    //assert fields
    _.forEach(users, function (user) {
      expect(user._id).to.exist;
      expect(user.zipCode).to.not.exist;

      _.forEach(generators, function (generator) {
        const types =
          _.without(_.keys(faker[generator]), 'zipCode');
        _.forEach(types, function (type) {
          expect(user[type]).to.exist;
        });
      });

    });

  });


  it(
    'should be able to update only specified field(s) of model instance',
    function () {

      const user = User.fake();
      const zipCode = user.zipCode;

      user.fakeOnly('zipCode');

      expect(user.zipCode).to.exist;
      expect(user.zipCode).to.not.be.equal(zipCode);

    });


  it(
    'should be able to update model instance except specified field(s)',
    function () {

      const user = User.fake();
      const zipCode = user.zipCode;

      user.fakeExcept('zipCode');

      expect(user.zipCode).to.exist;
      expect(user.zipCode).to.be.equal(zipCode);

    });

});