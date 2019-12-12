const Book = require('../Models/Books')
const axios = require('../config/axios')
const xml2js = require('xml2js')

class BookController{

  static async create(req,res,next){
    try {
      const { title, author, category, rating, price, stock, description, image } = req.body
      const created = await Book.create({title, author, category, rating, price, stock, description, image})
      res.status(201).json(created)
    } catch (error) {
      next(error)
    }
  }

  static async findOne(req,res,next){
    try {
      const {bookIs : _id} = req.params
      const book = await Book.findOne({_id})
      res.status(200).json(book)
    } catch (error) {
      next(error)
    }
  }


  static async findAll(req,res,next){
    try {
      const books = await Book.find({})
      res.status(200).json(books)
    } catch (error) {
      next(error)
    }
  }

  static async remove(req,res,next){
    try {
      const { bookId : _id } = req.params
      const deleted = await Book.remove({_id})
      res.status(200).json(deleted)
    } catch (error) {
      next(error)
    }
  }

  static async update(req,res,next){
    try {
      let { bookId } = req.params
      let arr = ['title', 'author', 'category', 'rating', 'price', 'stock', 'description']
      let fields = req.body
      let obj = {}
      arr.forEach((el)=>{
        for (let key in fields){
          if(key === el){
            obj[key] = fields[key]
          }
        }
      })
      if(req.file){
        let image = req.file.cloudStoragePublicUrl
        obj.image = image
        const updated = await Book.findOneAndUpdate({_id:bookId},obj,{runValidators:true, new: true})
        let message = 'Book updated!'
        res.status(201).json({message,updated})
      } else {
        let image = await Book.findOne({_id:bookId}).select('image')
        obj.image = image.image
        const updated = await Book.findOneAndUpdate({_id:bookId},obj,{runValidators:true, new: true})
        let message = 'Book updated!'
        res.status(201).json({message,updated})
      }
    } catch (error) {
     next(error) 
    }
  }

  static async fetchApi(req,res,next){
    try {
      const search = 'Harry Potter'
      const query = search.replace(' ','+')
      console.log(query)
      const {data} = await axios({
        url : `/book/title.xml?key=${process.env.GR_API_KEY}&title=${query}`
      })
      const parser = new xml2js.Parser()
      const result = await parser.parseStringPromise(data)
      // let hasil = result['GoodreadsResponse']['']
      // console.log(hasil);

      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

}


module.exports = BookController