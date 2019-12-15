const chai = require('chai')
const fs = require('fs')
const jwt = require('../Helpers/jwt')
const expect = chai.expect
const ChaiHttp = require('chai-http')
const app = require('../app.js')
const Book = require('../Models/book')
const User = require('../Models/user')

chai.use(ChaiHttp)


before(function(){
  return Book.deleteMany()
})

describe('Book testing', ()=>{
  let adminToken = ''
  let userToken = ''
  let bookId = ''
  let tokenError = null


  let book = { 
    title : 'testing title',
    author : ['testing author'],
    category : ['ini', 'kategori'],
    rating : 3.4,
    price : 20000,
    stock : 30,
    description : 'ini deskripsi buku',
  }

  before(async function(){
    try {
      // generate admin token
      const user = await User.create({
        email : 'admin@admin.com',
        password : 'adminadmin',
        username : 'admin',
        role : 'admin'
      })
      let payload = {
        id : user._id,
      }
      adminToken = jwt.generateToken(payload)

      // generate user token
      const userDummy = await User.create({
        email : 'dummy@dummy.com',
        password : 'dummydummy',
        username : 'dummy',
      })
      let payloadDummy = {
        id : userDummy._id,
      }
      userToken = jwt.generateToken(payloadDummy)
    } catch (error) {
      console.log(error);
    }
  })

  describe("Create Book testing",function(){
  //   this.timeout(6000)
  //   it('should success create new Book (GCS) with status (201)',done=>{
  //     chai
  //       .request(app)
  //       .post('/books')
  //       .set('token',adminToken)
  //       .field('title', 'ini test title')
  //       .field('author', ['testing author'])
  //       .field('category', ['ini', 'kategori'])
  //       .field('rating', 3.4)
  //       .field('price', 20000)
  //       .field('stock', 30)
  //       .field('description','ini deskripsi buku')
  //       .attach('image', fs.readFileSync('./test/3._SX98_.jpg'),'3._SX98_.jpg' )
  //       .end((err,res)=>{
  //         expect(err).to.be.null
  //         expect(res).to.have.status(201)
  //         expect(res.body).to.be.an('object')
  //         expect(res.body).to.have.all.keys(
  //           "_id",
  //           "author",
  //           "title",
  //           "category",
  //           "stock",
  //           "price",
  //           "rating",
  //           "description",
  //           "idGoogle",
  //           "image",
  //           "createdAt",
  //           "updatedAt"
  //         )
  //         bookId = res.body._id
  //         productName = res.body.name
  //         done()
  //       })
  //   })

    it('should success create new Book with status (201)',done=>{
      chai
        .request(app)
        .post('/books')
        .set('token',adminToken)
        .send(book)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          bookId = res.body._id
          productName = res.body.name
          done()
        })
    })
  })
  

  it('should error with code (400) because missing token',done=>{
    chai
      .request(app)
      .post('/books')
      .send(book)
      .end((err,res)=>{
        expect(res).to.have.status(401)
        expect(res.body).to.be.a('string')
        expect(res.body).to.equal('You are not authentication!')
        done()
      })
  })

  it('should error with code (401) because using user token',done=>{
    chai
      .request(app)
      .post('/books')
      .set('token',userToken)
      .send(book)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('string')
        expect(res.body).to.equal('You are not Authorized!')
        done()
      })
  })

  it('should error with code (401) because token error',done=>{
    chai
      .request(app)
      .post('/books')
      .set('token', tokenError)
      .send(book)
      .end((err,res)=>{
        expect(res).to.have.status(401)
        // expect(res.body).to.be.a('string')
        // expect(res.body).to.equal('You are not Authorized!')
        done()
      })
  })

  it('should error with code (400) because missing book title',done=>{
    let missingProduct = {...book}
    delete missingProduct.title
    chai
      .request(app)
      .post('/books')
      .send(missingProduct)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's title is required" )
        done()
      })
  })

  // it('should error with code (400) because missing book authors',done=>{
  //   let missingProducts = {...book}
  //   delete missingProducts.author
  //   chai
  //     .request(app)
  //     .post('/books')
  //     .send(missingProducts)
  //     .set('token',adminToken)
  //     .end((err,res)=>{
  //       expect(res).to.have.status(400)
  //       expect(res.body).to.be.an('array')
  //       expect(res.body).to.be.an('array').that.includes("Book's author is required" )
  //       done()
  //     })
  // })

  it('should error with code (400) because missing book price',done=>{
    let missingProducts = {...book}
    delete missingProducts.price
    chai
      .request(app)
      .post('/books')
      .send(missingProducts)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's price is required" )
        done()
      })
  })

  it('should error with code (400) because missing book stock',done=>{
    let missingProducts = {...book}
    delete missingProducts.stock
    chai
      .request(app)
      .post('/books')
      .send(missingProducts)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's stock is required" )
        done()
      })
  })

  it('should error with code (400) because stock less than 0',done=>{
    let missingProducts = {...book}
    missingProducts.stock = -1
    chai
      .request(app)
      .post('/books')
      .send(missingProducts)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's stock minimal 0" )
        done()
      })
  })

  it('should error with code (400) because stock less than 0',done=>{
    let missingProducts = {...book}
    delete missingProducts.description
    chai
      .request(app)
      .post('/books')
      .send(missingProducts)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's description is required" )
        done()
      })
  })

  it('should error with code (400) because stock, price, author, title, desc are missing',done=>{
    let missingProducts = {...book}
    delete missingProducts.description
    delete missingProducts.price
    delete missingProducts.title
    delete missingProducts.stock
    chai
      .request(app)
      .post('/books')
      .send(missingProducts)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('array')
        expect(res.body).to.be.an('array').that.includes("Book's description is required" )
        expect(res.body).to.be.an('array').that.includes("Book's stock is required" )
        expect(res.body).to.be.an('array').that.includes("Book's price is required" )
        expect(res.body).to.be.an('array').that.includes("Book's title is required" )
        done()
      })
  })

  describe('read all books',()=>{
    it('should success read all books with status code (200)',done=>{
      chai
        .request(app)
        .get('/books/find-all')
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read all books with status code (200)',done=>{
      chai
        .request(app)
        .get('/books/find-all')
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })
  })

  describe('read one books',()=>{
    it('should success read one book with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/find-one/${bookId}`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('author')
          expect(res.body).to.have.property('category')
          expect(res.body).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/find-one/${bookId}`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('author')
          expect(res.body).to.have.property('category')
          expect(res.body).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by title with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-title?title=test`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by title with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-title?title=test`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by author with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-author?author=test`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by author with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-author?author=test`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by category with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-category?category=ini`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read one book by category with status code (200)',done=>{
      chai
        .request(app)
        .get(`/books/book-category?category=ini`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read popular book with status (200)',done=>{
      chai
        .request(app)
        .get(`/books/popular`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success read popular book with status (200)',done=>{
      chai
        .request(app)
        .get(`/books/popular`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('author')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0]).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success get all categories (200)',done=>{
      chai
        .request(app)
        .get(`/books/get-categories`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0].category).to.equal('ini')
          done()
        })
    })

    it('should success get all categories (200)',done=>{
      chai
        .request(app)
        .get(`/books/get-categories`)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('category')
          expect(res.body[0].category).to.equal('ini')
          done()
        })
    })

    // it('should success seeding data to googleapis',done=>{
    //   let obj = {}
    //   obj.author = 'Dan Brown'
    //   chai
    //     .request(app)
    //     .post(`/books/seedGoogle`)
    //     .send(obj)
    //     .end((err,res)=>{
    //       expect(err).to.be.null
    //       expect(res).to.have.status(201)
    //       expect(res.body).to.be.an('object')
    //       expect(res.body).to.have.property('message')
    //       expect(res.body.message).to.equal('success seeding data, check DB')
    //       done()
    //     })
    // })

  })

  describe('update a book', ()=>{
    let obj = {}
    obj.title = 'ini title update'
    obj.author = 'ini author update'
    obj.stock = 999
    obj.price = 11111
    obj.description = 'ini update description'

    
    it('should success update book (201)',done=>{
      chai
        .request(app)
        .patch(`/books/${bookId}`)
        // .send(obj)
        // .set('token',adminToken)
        .set('token',adminToken)
        .field('title', 'ini update')
        .field('author', ['testing update'])
        .field('category', ['ini', 'update'])
        .field('description','ini deskripsi buku')
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('updated')
          expect(res.body.message).to.equal('Book updated!')
          expect(res.body.updated).to.be.an('object')
          expect(res.body.updated).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should success update book (201)',done=>{
      chai
        .request(app)
        .patch(`/books/${bookId}`)
        .send(obj)
        .set('token',adminToken)
        .end((err,res)=>{
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('updated')
          expect(res.body.message).to.equal('Book updated!')
          expect(res.body.updated).to.be.an('object')
          expect(res.body.updated).to.have.all.keys(
            "_id",
            "author",
            "title",
            "category",
            "stock",
            "price",
            "rating",
            "description",
            "idGoogle",
            "image",
            "createdAt",
            "updatedAt"
          )
          done()
        })
    })

    it('should error with code (400) because missing token',done=>{
      chai
        .request(app)
        .patch(`/books/${bookId}`)
        .send(obj)
        .end((err,res)=>{
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('string')
          expect(res.body).to.equal('You are not authentication!')
          done()
        })
    })

    it('should error with code (400) because unauthorize token',done=>{
      chai
        .request(app)
        .patch(`/books/${bookId}`)
        .send(obj)
        .set('token',userToken)
        .end((err,res)=>{
          expect(res).to.have.status(400)
          expect(res.body).to.be.a('string')
          expect(res.body).to.equal('You are not Authorized!')
          done()
        })
    })
  })

  describe('search book by author or title or category',()=>{
    it ('should success search book by all query', done=>{
      chai
        .request(app)
        .get(`/books/search?keyword=ini`)
        .end((err,res)=>{
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          done()
        })
    })
  })

  describe('remove a book',()=>{
    it('should success remove a book',done=>{
      chai
      .request(app)
      .delete(`/books/${bookId}`)
      .set('token',adminToken)
      .end((err,res)=>{
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('object')
        done()
      })
    })
  })


})