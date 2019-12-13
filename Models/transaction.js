const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactions = new Schema({
  userId : {
    type : Schema.Types.ObjectId,
    ref : 'User'
  },
  cart : [{
    bookId : {type : Schema.Types.ObjectId, ref : 'Book'},
    qty : {type : Number}
  }]
},{
  timestamps :true
})


const Transaction = mongoose.model('Transaction',transactions)

module.exports = Transaction