'use strict';


/*** dependencies */
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const expect = require('chai').expect;


/*** apply mongoose-faker plugin */
mongoose.plugin(require(path.join(__dirname, '..')));


/*** prepare model */
const GENDERS = ['Male', 'Female'];
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
  }
});
const Person = mongoose.model('Person', PersonSchema);


describe.only('fake plugin - usecases', function () {

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

});