const mongoose = require('mongoose')
const Schema = mongoose.Schema

const books = new Schema({

  title : {
    type : String,
    required : [true,'Book\'s title is required']
  },
  idGoogle : {
    type : String,
  },
  author : {
    type : [String],
    required : [true,'Book\'s author is required']
  },
  category : {
    type : [String],
  },
  rating : {
    type : Number,
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
  }

},{
  versionKey : false,
  timestamps : true
})

books.pre('save',function(next){
  if (this.image === ''){
    this.image = 'https://previews.123rf.com/images/hchjjl/hchjjl1504/hchjjl150402710/38564779-doodle-book-seamless-pattern-background.jpg'
  }
  next()
})


const Book = mongoose.model('Book',books)
module.exports = Book