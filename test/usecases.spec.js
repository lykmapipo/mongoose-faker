import _ from 'lodash';
import { expect, faker } from '@lykmapipo/test-helpers';
import { Schema, createModel } from '@lykmapipo/mongoose-common';
import mongooseFaker from '../src';

/* prepare model */
const GENDERS = ['Male', 'Female'];
const INTERESTS = ['Music', 'Fashion', 'Football'];
const MIN_DATE = new Date('1977-01-01');
const MAX_DATE = new Date('2005-01-01');
const MIN_NUMBER = 80;
const MAX_NUMBER = 120;
const fields = {
  number: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    fake: { generator: 'datatype', type: 'number' },
  },

  gender: {
    type: String,
    enum: GENDERS,
    fake: true,
  },

  interest: {
    type: String,
    enum: INTERESTS,
    default: 'Fashion',
    fake: true,
  },

  dob: {
    type: Date,
    min: MIN_DATE,
    max: MAX_DATE,
    fake: true,
  },

  height: {
    type: Number,
    min: MIN_NUMBER,
    max: MAX_NUMBER,
    fake: true,
  },

  followers: {
    type: Number,
    default: () => {
      return faker.datatype.number(450, 9999);
    },
    fake: true,
  },

  friends: {
    type: Number,
    fake: true,
  },

  referees: {
    type: Number,
    default: 0,
    fake: true,
  },

  name: {
    type: String,
    trim: true,
    fake: { generator: 'name', type: 'findName', unique: true },
  },

  isMusician: {
    type: Boolean,
    default: false,
    fake: true,
  },

  isSportMan: {
    type: Boolean,
    default: true,
    fake: true,
  },

  canWork: {
    type: Boolean,
    fake: true,
  },

  canLead: {
    type: String,
    trim: true,
    fake: {
      generator: () => {
        return 'YES';
      },
    },
  },

  canTalk: {
    type: String,
    trim: true,
    fake: () => {
      return Date.now() % 2 > 0 ? 'YES' : 'NO';
    },
  },

  phone: {
    type: String,
    trim: true,
    fake: ($faker) => {
      return $faker.helpers.replaceSymbolWithNumber('255714######');
    },
  },

  contact: new Schema({
    phone: { type: String, fake: (f) => f.phone.phoneNumber() },
    email: { type: String, fake: (f) => f.internet.email() },
  }),
};
const Person = createModel(fields, { modelName: 'Person' }, mongooseFaker);

describe('fake plugin - usecases', () => {
  it('should extend schema with fake method', () => {
    expect(Person.fake).to.exist;
    expect(Person.fake).to.be.a('function');
    expect(Person.fake.name).to.be.equal('fake');
  });

  it('should generate fake unique number', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].number).to.exist;
    expect(people[1].number).to.exist;
    expect(people[0].number).to.not.equal(people[1].number);
  });

  it('should generate fake from enum options', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].gender).to.exist;
    expect(people[1].gender).to.exist;
    expect(GENDERS).to.include(people[0].gender);
    expect(GENDERS).to.include(people[1].gender);
  });

  it('should generate fake from enum options even if there is default', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].interest).to.exist;
    expect(people[1].interest).to.exist;
    expect(INTERESTS).to.include(people[0].interest);
    expect(INTERESTS).to.include(people[1].interest);
  });

  it('should generate fake from date options', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].dob).to.exist;
    expect(people[1].dob).to.exist;

    // assert above min
    expect(people[0].dob.getTime()).to.be.above(MIN_DATE.getTime());
    expect(people[1].dob.getTime()).to.be.above(MIN_DATE.getTime());

    // assert below max
    expect(people[0].dob.getTime()).to.be.below(MAX_DATE.getTime());
    expect(people[1].dob.getTime()).to.be.below(MAX_DATE.getTime());
  });

  it('should generate fake from number options', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].height).to.exist;
    expect(people[1].height).to.exist;

    // assert above min
    expect(people[0].height).to.be.at.least(MIN_NUMBER);
    expect(people[1].height).to.be.at.least(MIN_NUMBER);

    // assert below max
    expect(people[0].height).to.be.at.most(MAX_NUMBER);
    expect(people[1].height).to.be.at.most(MAX_NUMBER);
  });

  it('should generate fake from functional default', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].followers).to.exist;
    expect(people[1].followers).to.exist;
  });

  it('should generate fake number', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].friends).to.exist;
    expect(people[0].friends).to.be.at.least(0);
    expect(people[1].friends).to.exist;
    expect(people[1].friends).to.be.at.least(0);
  });

  it('should generate fake number and honour zero default', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].referees).to.exist;
    expect(people[0].referees).to.be.equal(0);
    expect(people[1].referees).to.exist;
    expect(people[1].referees).to.be.equal(0);
  });

  it('should support unique on fake options', () => {
    const people = Person.fake(1000);
    const names = _.map(people, 'name');

    expect(people).to.exist;
    expect(people).to.have.length(1000);
    expect(_.uniq(names)).to.have.length(1000);
  });

  it('should generate fake boolean and honour default', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].isMusician).to.exist;
    expect(people[0].isMusician).to.be.false;
    expect(people[1].isMusician).to.exist;
    expect(people[1].isMusician).to.be.false;
  });

  it('should generate fake boolean and honour default', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].isSportMan).to.exist;
    expect(people[0].isSportMan).to.be.true;
    expect(people[1].isSportMan).to.exist;
    expect(people[1].isSportMan).to.be.true;
  });

  it('should generate fake boolean', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].canWork).to.exist;
    expect(people[0].canWork).to.be.a('boolean');
    expect(people[1].canWork).to.exist;
    expect(people[1].canWork).to.be.a('boolean');
  });

  it('should generate fake from function', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].canLead).to.exist;
    expect(people[0].canLead).to.be.a('string');
    expect(people[1].canLead).to.exist;
    expect(people[1].canLead).to.be.a('string');
  });

  it('should generate fake from function', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].canTalk).to.exist;
    expect(people[0].canTalk).to.be.a('string');
    expect(people[1].canTalk).to.exist;
    expect(people[1].canTalk).to.be.a('string');
  });

  it('should generate fake from function using faker', () => {
    const people = Person.fake(2);

    expect(people).to.exist;
    expect(people).to.have.length(2);
    expect(people[0].phone).to.exist;
    expect(people[0].phone).to.be.a('string');
    expect(people[1].phone).to.exist;
    expect(people[1].phone).to.be.a('string');
  });

  it('should be able to update only specified subdocument field(s)', () => {
    const person = Person.fake();
    const { phone } = person.contact;
    const { email } = person.contact;

    person.fakeOnly('contact.phone');

    expect(person.contact.phone).to.exist;
    expect(person.contact.phone).to.not.be.equal(phone);

    expect(person.contact.email).to.exist;
    expect(person.contact.email).to.be.equal(email);
  });
});
