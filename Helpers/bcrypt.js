const bcriptjs = require('bcryptjs')
const salt = bcriptjs.genSaltSync(10)

function hashPassword(password){
  return bcriptjs.hashSync(password, salt)
}

function comparePassword(password, hashPassword){
  return bcriptjs.compareSync(password, hashPassword)
}

module.exports = { hashPassword, comparePassword }