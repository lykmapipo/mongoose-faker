# mongoose-faker

[![Build Status](https://app.travis-ci.com/lykmapipo/mongoose-faker.svg?branch=master)](https://app.travis-ci.com/lykmapipo/mongoose-faker)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-faker.svg)](https://david-dm.org/lykmapipo/mongoose-faker)
[![Coverage Status](https://coveralls.io/repos/github/lykmapipo/mongoose-faker/badge.svg?branch=master)](https://coveralls.io/github/lykmapipo/mongoose-faker?branch=master)
[![GitHub License](https://img.shields.io/github/license/lykmapipo/mongoose-faker)](https://github.com/lykmapipo/mongoose-faker/blob/develop/LICENSE)

[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![npm version](https://img.shields.io/npm/v/@lykmapipo/mongoose-faker)](https://www.npmjs.com/package/@lykmapipo/mongoose-faker)

mongoose plugin to generate fake model data

## Requirements

- [NodeJS v13+](https://nodejs.org)
- [Npm v6.12+](https://www.npmjs.com/)
- [MongoDB v4+](https://www.mongodb.com/)
- [Mongoose v6+](https://github.com/Automattic/mongoose)

## Install
```sh
$ npm install --save mongoose @lykmapipo/mongoose-faker
```

## Usage

```js
import mongoose from 'mongoose';
import mongooseFaker from '@lykmapipo/mongoose-faker';

mongoose.plugin(mongooseFaker);
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    fake: {
      generator: 'name',
      type: 'firstName',
    },
  },
});
const User = mongoose.model('User', UserSchema);

const user = User.fake();
console.log(user);

const users = User.fake(50);
console.log(users);

```

## API

### Static

#### `Model.fake(size, locale): model|model[]`
Return fake model(s) instance base of specified `size` and `locale`

Example:
```js
const user = User.fake();
const users = User.fake(4);
```

#### `Model.fakeOnly(...fields): model|model[]`
Return a fake model(s) instance with only specified fields

Example:
```js
const user = User.fakeOnly('name', 'age');
const users = User.fakeOnly(4, 'name');
```

#### `Model.fakeExcept(...fields): model|model[]`
Return fake model(s) instance without specified fields

Example:
```js
const user = User.fakeExpect('name', 'age');
const users = User.fakeExpect(4, 'name', 'age');
```

### Instance

#### `model.fakeOnly(...fields): model`
Return updated fake model instance with only specified fields updated

Example:
```js

....

const user = user.fakeOnly('name');
const user = user.fakeOnly('name', 'age');
```

#### `model.fakeExcept(...fields): model`
Return updated fake model instance with specified fields not updated

Example:
```js

...

const user = user.fakeExpect('name', 'age');
const users = user.fakeExpect('name', 'age');
```



## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
