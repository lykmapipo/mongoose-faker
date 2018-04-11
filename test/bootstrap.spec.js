'use strict';

//force environment to be test
process.env.NODE_ENV = 'test';

//setup mongoose
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;