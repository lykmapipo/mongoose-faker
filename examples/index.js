import mongoose from 'mongoose';
import mongooseFaker from '../src';

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
