const Book = require('../Models/book')
const axios = require('../config/axios')

class BookController{

  static async create(req,res,next){
    try {
      const { title, author, category, rating, price, stock, description, image } = req.body
      const created = await Book.create({title, author, category, rating, price, stock, description, image, idGoogle : null})
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

  // static async fetchApi(req,res,next){
  //   try {
  //     const search = 'Harry Potter'
  //     const query = search.replace(' ','+')
  //     console.log(query)
  //     const {data} = await axios({
  //       url : `/book/title.xml?key=${process.env.GR_API_KEY}&title=${query}`
  //     })
  //     const parser = new xml2js.Parser()
  //     const result = await parser.parseStringPromise(data)
  //     // let hasil = result['GoodreadsResponse']['']
  //     // console.log(hasil);

  //     res.status(200).json(result)
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  static async seedingGoogle(req,res,next){
    try {
      const { author } = req.body
      const search = author.replace(' ','+')
      let temp = []
      const {data} = await axios({
        method: 'get',
        url: `https://www.googleapis.com/books/v1/volumes?q=inauthor:${search}&key=${process.env.GOOGLE_API_KEY}`
      })
      data.items.forEach((el,i)=>{
        if (el.volumeInfo.language === 'en'){
          let obj = {}
          obj.idGoogle = el.id
          obj.title = el.volumeInfo.title
          obj.author = el.volumeInfo.authors
          obj.description = el.volumeInfo.description
          obj.category = el.volumeInfo.categories
          obj.rating = el.volumeInfo.averageRating
          if (el.saleInfo.saleability !== 'NOT_FOR_SALE'){
            obj.price = el.saleInfo.retailPrice.amount
          } else {
            obj.price = 100000
          }
          obj.stock = 20 - Math.floor(Math.random()*5)
          if (el.volumeInfo.imageLinks){
            obj.image = el.volumeInfo.imageLinks.thumbnail
          }
          temp.push(obj)
        }
      })
      for (let key of temp){
        const created = await Book.create({
          idGoogle : key.idGoogle,
          title : key.title,
          author : key.author,
          description : key.description,
          category : key.category,
          rating : key.rating,
          price : key.price,
          stock : key.stock,
          image : key.image
        })
      }
      res.status(201).json({message: 'success seeding data, check DB'})
      // res.status(201).json(temp)
    } catch (error) {
      console.log(error);
      next(error)
    }
  }


  static async popular(req,res,next){
    try {
      const sorted = await Book.find({}).sort({rating: 'desc'}).limit(10)
      res.status(200).json(sorted)
    } catch (error) {
      next(error)
    }
  }

}


module.exports = BookController