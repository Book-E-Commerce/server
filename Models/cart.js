const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
  idBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book'
  },
  idUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  qty: {
    type: Number,
    min: 0
  },
  status: {
    type: Boolean,
    default: false
  }
}, {
    versionKey: false
  })

const Cart = mongoose.model('Cart', CartSchema)
module.exports = Cart