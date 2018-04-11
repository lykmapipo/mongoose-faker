# mongoose-faker

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-faker.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-faker)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-faker/status.svg)](https://david-dm.org/lykmapipo/mongoose-faker)
[![npm version](https://badge.fury.io/js/%40lykmapipo%2Fmongoose-faker.svg)](https://badge.fury.io/js/%40lykmapipo%2Fmongoose-faker)

mongoose plugin to generate fake model data

## Requirements

- NodeJS v6.5+

## Install
```sh
$ npm install --save @lykmapipo/mongoose-faker
```

## Usage

```js
const mongoose = require('mongoose');
mongoose.plugin(require('mongoose-faker'));
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    fake: {
      generator: 'name',
      type: 'firstName'
    }
  }

});
const User = mongoose.model('User', UserSchema);

...

const user = User.fake();
const users = User.fake(50);

...

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

Copyright (c) 2015 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 