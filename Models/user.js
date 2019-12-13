const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')
const { hashPassword } = require('../Helpers/bcrypt')


const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required!']
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    match: [/^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Invalid email format."],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'password is required!']
  }
})

UserSchema.plugin(uniqueValidator, { message: 'Error, {PATH} already taken.' })
UserSchema.pre('save', function (next) {
  this.password = hashPassword(this.password)
  next()
})

const User = mongoose.model('User', UserSchema)
module.exports = User