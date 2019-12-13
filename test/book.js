const chai = require('chai')
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


  let book = { 
    title : 'testing title',
    author : ['testing author'],
    category : ['ini', 'kategori'],
    rating : 3.4,
    price : 20000,
    stock : 30,
    description : 'ini deskripsi buku',
    image : 'ini link gambar'
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

  describe("Create Book testing",()=>{
    it('should success create new Book with status (201)',done=>{
      chai
        .request(app)
        .post('/books')
        .send(book)
        .set('token',adminToken)
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
          productId = res.body._id
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
        expect(res).to.have.status(400)
        expect(res.body).to.be.a('string')
        expect(res.body).to.equal('You are not authentication!')
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
        .get(`/books/find-one/${productId}`)
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


  })


})