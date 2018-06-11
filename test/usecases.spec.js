'use strict';


/* dependencies */
const path = require('path');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const expect = require('chai').expect;
const faker = require('@benmaruchu/faker');


/* apply mongoose-faker plugin */
mongoose.plugin(require(path.join(__dirname, '..')));


/* prepare model */
const GENDERS = ['Male', 'Female'];
const MIN_DATE = new Date('1977-01-01');
const MAX_DATE = new Date('2005-01-01');
const MIN_NUMBER = 80;
const MAX_NUMBER = 120;
const PersonSchema = new Schema({
  number: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    fake: { generator: 'random', type: 'number' }
  },

  gender: {
    type: String,
    enum: GENDERS,
    fake: true
  },

  dob: {
    type: Date,
    min: MIN_DATE,
    max: MAX_DATE,
    fake: true
  },

  height: {
    type: Number,
    min: MIN_NUMBER,
    max: MAX_NUMBER,
    fake: true
  },

  followers: {
    type: Number,
    default: function () { return faker.random.number(450, 9999); },
    fake: true
  },

  friends: {
    type: Number,
    fake: true
  },

  referees: {
    type: Number,
    default: 0,
    fake: true
  },

  name: {
    type: String,
    trim: true,
    fake: { generator: 'name', type: 'findName', unique: true }
  },

  isMusician: {
    type: Boolean,
    default: false,
    fake: true
  },

  isSportMan: {
    type: Boolean,
    default: true,
    fake: true
  },

});
const Person = mongoose.model('Person', PersonSchema);


describe('fake plugin - usecases', function () {

  it('should extend schema with fake method', function () {
    expect(Person.fake).to.exist;
    expect(Person.fake).to.be.a('function');
    expect(Person.fake.name).to.be.equal('fake');
  });

  it('should generate fake unique number', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].number).to.exist;
    expect(people[1].number).to.exist;
    expect(people[0].number)
      .to.not.equal(people[1].number);
  });

  it('should generate fake from enum options', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].gender).to.exist;
    expect(people[1].gender).to.exist;
    expect(GENDERS).to.include(people[0].gender);
    expect(GENDERS).to.include(people[1].gender);

  });

  it('should generate fake from date options', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].dob).to.exist;
    expect(people[1].dob).to.exist;

    //assert above min
    expect(people[0].dob.getTime()).to.be.above(MIN_DATE.getTime());
    expect(people[1].dob.getTime()).to.be.above(MIN_DATE.getTime());

    //assert below max
    expect(people[0].dob.getTime()).to.be.below(MAX_DATE.getTime());
    expect(people[1].dob.getTime()).to.be.below(MAX_DATE.getTime());

  });

  it('should generate fake from number options', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].height).to.exist;
    expect(people[1].height).to.exist;

    //assert above min
    expect(people[0].height).to.be.at.least(MIN_NUMBER);
    expect(people[1].height).to.be.at.least(MIN_NUMBER);

    //assert below max
    expect(people[0].height).to.be.at.most(MAX_NUMBER);
    expect(people[1].height).to.be.at.most(MAX_NUMBER);

  });


  it('should generate fake from functional default', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].followers).to.exist;
    expect(people[1].followers).to.exist;

  });

  it('should generate fake number', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].friends).to.exist;
    expect(people[0].friends).to.be.at.least(0);
    expect(people[1].friends).to.exist;
    expect(people[1].friends).to.be.at.least(0);

  });

  it('should generate fake number and honour zero default', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].referees).to.exist;
    expect(people[0].referees).to.be.equal(0);
    expect(people[1].referees).to.exist;
    expect(people[1].referees).to.be.equal(0);

  });

  it('should support unique on fake options', function () {
    const people = Person.fake(1000);
    const names = _.map(people, 'name');

    expect(people).to.exist;
    expect(people).to.have.length(1000);
    expect(_.uniq(names)).to.have.length(1000);

  });

  it('should generate fake boolean and honour default', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].isMusician).to.exist;
    expect(people[0].isMusician).to.be.false;
    expect(people[1].isMusician).to.exist;
    expect(people[1].isMusician).to.be.false;

  });

  it('should generate fake boolean and honour default', function () {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].isSportMan).to.exist;
    expect(people[0].isSportMan).to.be.true;
    expect(people[1].isSportMan).to.exist;
    expect(people[1].isSportMan).to.be.true;

  });

});