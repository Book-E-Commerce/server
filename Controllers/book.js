const Book = require('../Models/book')
const axios = require('../config/axios')
const googleParser = require('../Helpers/googleParser')
const Redis = require('ioredis')
const redis = new Redis()

class BookController {

  static async create(req, res, next) {
    try {
      const { title, author, category, rating, price, stock, description } = req.body
      let image
      /* istanbul ignore next */
      if (req.file) {
        /* istanbul ignore next */
        image = req.file.cloudStoragePublicUrl
      } else {
        image = ''
      }
      const created = await Book.create({ title, author, category, rating, price, stock, description, image, idGoogle: null })
      await redis.del('Books')
      await redis.del('allCategories')
      await redis.del('Popular')
      res.status(201).json(created)
    } catch (error) {
      next(error)
    }
  }

  static async findOne(req, res, next) {
    const dataBook = await redis.get(`Book-${req.params.bookId}`)
    if (dataBook) {
      res.status(200).json(JSON.parse(dataBook))
    } else {
      try {
        const { bookId: _id } = req.params
        const book = await Book.findOne({ _id })
        /* istanbul ignore next */
        if (book.idGoogle) {
          const { data: detail } = await axios({
            url: `https://www.googleapis.com/books/v1/volumes/${book.idGoogle}?key=${process.env.GOOGLE_API_KEY}`
          })
          if (detail.volumeInfo.imageLinks.medium) {
            book.image = detail.volumeInfo.imageLinks.medium
            await redis.set(`Book-${_id}`, JSON.stringify(book))
            res.status(200).json(book)
          } else {
            book.image = "https://previews.123rf.com/images/hchjjl/hchjjl1504/hchjjl150402710/38564779-doodle-book-seamless-pattern-background.jpg"
            await redis.set(`Book-${_id}`, JSON.stringify(book))
            res.status(200).json(book)
          }
        } else {
          await redis.set(`Book-${_id}`, JSON.stringify(book))
          res.status(200).json(book)
        }
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async findByTitle(req, res, next) {
    const dataBook = await redis.get(`Book-${req.query.title}`)
    if (dataBook) {
      res.status(200).json(JSON.parse(dataBook))
    } else {
      try {
        const { title } = req.query
        const found = await Book.find({ title: { $regex: `${title}`, $options: 'i' } })
        await redis.set(`Book-${title}`, JSON.stringify(found))
        res.status(200).json(found)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async findByAuthor(req, res, next) {
    const dataBook = await redis.get(`Books-${req.query.author}`)
    if (dataBook) {
      res.status(200).json(JSON.parse(dataBook))
    } else {
      try {
        const { author } = req.query
        const found = await Book.find({ author: { $regex: `${author}`, $options: 'i' } })
        await redis.set(`Books-${author}`, JSON.stringify(found))
        res.status(200).json(found)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async findByCategory(req, res, next) {
    const dataBook = await redis.get(`Books-${req.query.category}`)
    if (dataBook) {
      res.status(200).json(JSON.parse(dataBook))
    } else {
      try {
        const { category } = req.query
        const found = await Book.find({ category: { $regex: `${category}`, $options: 'i' }  })
        await redis.set(`Books-${category}`, JSON.stringify(found))
        res.status(200).json(found)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async findAll(req, res, next) {
    const Books = await redis.get('Books')
    if (Books) {
      res.status(200).json(JSON.parse(Books))
    } else {
      try {
        const books = await Book.find({})
        await redis.set('Books', JSON.stringify(books))
        res.status(200).json(books)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async getAllCategories(req, res, next) {
    /* istanbul ignore next */
    const Categories = await redis.get('allCategories')
    /* istanbul ignore next */
    if (Categories) {
      /* istanbul ignore next */
      res.status(200).json(JSON.parse(Categories))
    } else {
      try {
        const tags = await Book.find({}).select('category')
        let categories = BookController.uniqueCategory(tags)
        await redis.set('allCategories', JSON.stringify(categories))
        res.status(200).json(categories)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static uniqueCategory(tags) {
    let tagArr = []
    let result = []
    tags.forEach((tag) => {
      tag.category.forEach((allTag) => {
        tagArr.push(allTag)
      })
    })
    let eachTag = [...new Set(tagArr)]
    let obj = {}
    eachTag.forEach((tag) => {
      obj.category = tag
      result.push(obj)
      obj = {}
    })
    return result
  }

  static async remove(req, res, next) {
    try {
      const { bookId: _id } = req.params
      const deleted = await Book.findByIdAndDelete({ _id })
      await redis.del('Books')
      await redis.del('Popular')
      await redis.del(`Book-${req.params.bookId}`)
      await redis.del('allCategories')
      res.status(200).json(deleted)
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      let { bookId } = req.params
      let arr = ['title', 'author', 'category', 'rating', 'price', 'stock', 'description']
      let fields = req.body
      let obj = {}
      arr.forEach((el) => {
        for (let key in fields) {
          if (key === el) {
            obj[key] = fields[key]
          }
        }
      })
      /* istanbul ignore next */
      if (req.file) {
        let image = req.file.cloudStoragePublicUrl
        obj.image = image
        const updated = await Book.findOneAndUpdate({ _id: bookId }, obj, { runValidators: true, new: true })
        let message = 'Book updated!'
        await redis.del('Books')
        await redis.del('Popular')
        await redis.del(`Book-${req.params.bookId}`)
        await redis.del('allCategories')
        res.status(201).json({ message, updated })
      } else {
        let image = await Book.findOne({ _id: bookId }).select('image')
        obj.image = image.image
        const updated = await Book.findOneAndUpdate({ _id: bookId }, obj, { runValidators: true, new: true })
        let message = 'Book updated!'
        await redis.del('Books')
        await redis.del('Popular')
        await redis.del(`Book-${req.params.bookId}`)
        await redis.del('allCategories')
        res.status(201).json({ message, updated })
      }
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }

/* istanbul ignore next */
  static async seedingGoogle(req, res, next) {
    try {
      const { author } = req.body
      const search = author.replace(' ', '+')
      const { data } = await axios({
        method: 'get',
        url: `https://www.googleapis.com/books/v1/volumes?q=inauthor:${search}&key=${process.env.GOOGLE_API_KEY}`
      })

      let parserResult = googleParser(data)
      for (let key of parserResult) {
        const created = await Book.create({
          idGoogle: key.idGoogle,
          title: key.title,
          author: key.author,
          description: key.description,
          category: key.category,
          rating: key.rating,
          price: key.price,
          stock: key.stock,
          image: key.image
        })
      }
      await redis.del('Books')
      await redis.del('allCategories')
      await redis.del('Popular')
      res.status(201).json({ message: 'success seeding data by author, check DB' })
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }

  /* istanbul ignore next */
  static async seedByCategory(req,res,next){
    try {
      const { category } = req.body
      const search = category.replace(' ', '+')
      const { data } = await axios({
        method: 'get',
        url: `https://www.googleapis.com/books/v1/volumes?q=subject:${search}&maxResults=30&key=${process.env.GOOGLE_API_KEY}`
      })
      let parserResult = googleParser(data)

      for (let key of parserResult) {
        const duplicateBooks = await Book.find({idGoogle : key.idGoogle})
        if (duplicateBooks.length < 1){
          const created = await Book.create({
            idGoogle: key.idGoogle,
            title: key.title,
            author: key.author,
            description: key.description,
            category: key.category,
            rating: key.rating,
            price: key.price,
            stock: key.stock,
            image: key.image
          })
        }
      }
      await redis.del('Books')
      await redis.del('allCategories')
      await redis.del('Popular')
      res.status(201).json({ message: 'success seeding data by category, check DB' })
    } catch (error) {
      next(error)
    }
  }



  static async popular(req, res, next) {
    const Popular = await redis.get('Popular')
    if (Popular) {
      res.status(200).json(JSON.parse(Popular))
    } else {
      try {
        const sorted = await Book.find({}).sort({ rating: 'desc' }).limit(10)
        await redis.set('Popular', JSON.stringify(sorted))
        res.status(200).json(sorted)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async elastic(req,res,next){
    try {
      let { keyword } = req.query
      let key = new RegExp(keyword, 'gi')
      const found = await Book.find({ 
        $or : [
          {
            'author' : key
          },
          {
            'title' : key
          },
          {
            'category' : key
          }
      ]})
      res.status(200).json(found)
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }



}


module.exports = BookController