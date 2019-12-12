const mongoose = require('mongoose')
const Schema = mongoose.Schema

const books = new Schema({

  title : {
    type : String,
    required : [true,'Book\'s title is required']
  },
  author : {
    type : String,
    required : [true,'Book\'s author is required']
  },
  category : {
    type : String,
    required : [true,'Book\'s category is required']
  },
  rating : {
    type : String,
    required : [true,'Book\'s category is required']
  },
  price : {
    type : Number,
    required : [true,'Book\'s price is required']
  },
  stock : {
    type : Number,
    required : [true, 'Book\'s stock is required'],
    min : [0, 'Book\'s stock minimal 0']
  },
  description : {
    type : String,
    required : [true, 'Book\'s description is required']
  },
  image : {
    type : String,
    default : 'https://imageog.flaticon.com/icons/png/512/36/36601.png?size=1200x630f&pad=10,10,10,10&ext=png&bg=FFFFFFFF'
  }

},{
  versionKey : false,
  timestamps : true
})

const Book = mongoose.model('Book',books)
module.exports = Book