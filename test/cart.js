const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
const app = require('../app')
const db = require('../Models/cart')
const dbUser = require('../Models/user')
const dbBook = require('../Models/book')
const { generateToken } = require('../Helpers/jwt')

chai.use(chaiHttp)

let customer
let customer2
let admin
let book1
let book2
let id

describe('Cart', function () {
  before(async function () {
    this.timeout(6000)
    let dataAdmin = {
      username: 'admin',
      email: 'email@gmail.com',
      password: 'password',
      role: 'admin'
    }
    let dataCust = {
      username: 'customer',
      email: 'customer@gmail.com',
      password: 'password'
    }
    let dataCust2 = {
      username: 'cust',
      email: 'cust@gmail.com',
      password: 'password'
    }
    let dataBook1 = {
      title: 'Book 1',
      author: 'author',
      category: 'Action',
      rating: 5,
      price: 10000,
      stock: 10,
      description: 'description',
      image: 'http://denrakaev.com/wp-content/uploads/2015/03/no-image-800x511.png'
    }
    let dataBook2 = {
      title: 'Book 2',
      author: 'author',
      category: 'Action',
      rating: 5,
      price: 10000,
      stock: 0,
      description: 'description',
      image: 'http://denrakaev.com/wp-content/uploads/2015/03/no-image-800x511.png'
    }

    async function createAdmin() {
      const user = await dbUser.create(dataAdmin)
      const token = generateToken({ id: user._id })
      admin = { token }
    }

    async function createCust() {
      const user = await dbUser.create(dataCust)
      const token = generateToken({ id: user._id })
      customer = { token }
    }

    async function createCust2() {
      const user = await dbUser.create(dataCust2)
      const token = generateToken({ id: user._id })
      customer2 = { token }
    }

    async function createProduct1() {
      const book = await dbBook.create(dataBook1)
      book1 = book._id
    }

    async function createProduct2() {
      const book = await dbBook.create(dataBook2)
      book2 = book._id
    }

    try {
      await createAdmin()
      await createCust()
      await createCust2()
      await createProduct1()
      await createProduct2()
    } catch (e) {
      await dbBook.deleteMany({})
      await dbUser.deleteMany({})
    }
  })

  after(() => {
    db.collection.deleteMany({})
    dbUser.collection.deleteMany({})
    dbBook.collection.deleteMany({})
  })

  describe('Add-Cart', function () {
    // Success add to cart
    it(`Should success add book to cart with status 201`, function (done) {
      chai.request(app)
        .post(`/carts/${book1}/add-to-cart`)
        .set(customer, customer)
        .send({ qty: 1 })
        .end((err, res) => {
          id = res.body._id
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.all.keys("_id", "idUser", "idBook", "qty", "status")
          expect(res.body.idBook).to.be.equal(`${book1}`)
          expect(res.body.qty).to.be.equal(1)
          expect(res.body.status).to.be.equal(false)
          expect(res.body.qty).to.be.equal(1)
          done()
        })
    })

    // Error: quantity 0
    it(`Should error with status 400 and message Cannot buy book without quantity!`, function (done) {
      chai.request(app)
        .post(`/carts/${book1}/add-to-cart`)
        .set(customer, customer)
        .send({ qty: 0 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.equal('Cannot buy book without quantity!')
          done()
        })
    })

    // Error : quantity more then book stock
    it(`Should error with status 400 and message Sorry you are cannot buy book more then book stock!!`, function (done) {
      chai.request(app)
        .post(`/carts/${book1}/add-to-cart`)
        .set(customer, customer)
        .send({ qty: 20 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.equal('Sorry you are cannot buy book more then book stock!!')
          done()
        })
    })

    // Error : Book already in cart
    it(`This book is already in your cart bucket, please open your cart bucket to procces your transaction!`, function (done) {
      chai.request(app)
        .post(`/carts/${book1}/add-to-cart`)
        .set(customer, customer)
        .send({ qty: 5 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(403)
          expect(res.body).to.be.equal('This book is already in your cart bucket, please open your cart bucket to procces your transaction!')
          done()
        })
    })

    // Error: Book out of stock
    it(`Should error with status 400 and message Sorry this book out of stock!`, function (done) {
      chai.request(app)
        .post(`/carts/${book2}/add-to-cart`)
        .set(customer, customer)
        .send({ qty: 20 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.equal('Sorry this book out of stock!')
          done()
        })
    })

    // Error: not authentication
    it(`Should error with status 400 and message You are not Authentication`, function (done) {
      chai.request(app)
        .post(`/carts/${book2}/add-to-cart`)
        .send({ qty: 1 })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.equal('You are not authentication!')
          done()
        })
    })
  })

  // Show carts
  describe('Show Carts', function () {
    // Succes show carts
    it(`Should success show carts user with status 200 and get data carts`, function (done) {
      chai.request(app)
        .get('/carts')
        .set(customer, customer)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          res.body.forEach(el => {
            expect(el).to.be.an('object')
            expect(el).to.have.all.keys(
              "_id", "idUser", "idBook", "qty", "status"
            )
            expect(el.idBook).to.be.an("object")
          })
          done()
        })
    })

    // Succes show carts with redis
    it(`Should success show carts user with status 200 and get data carts`, function (done) {
      chai.request(app)
        .get('/carts')
        .set(customer, customer)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          res.body.forEach(el => {
            expect(el).to.be.an('object')
            expect(el).to.have.all.keys(
              "_id", "idUser", "idBook", "qty", "status"
            )
            expect(el.idBook).to.be.an("object")
          })
          done()
        })
    })

    // Error: Not authentication $ authorization
    it(`Should error with status 400 and message You are not authentication!`, function (done) {
      chai.request(app)
        .get('/carts')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.equal('You are not authentication!')
          done()
        })
    })
  })

  describe(`Update cart`, function () {
    it(`Succes update qty`, function (done) {
      chai.request(app)
        .patch(`/carts/${id}/update`)
        .send({ qty: 5 })
        .set(customer, customer)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          done()
        })
    })
  })

  // Delete Product from carts
  describe('Delete product from carts', function () {
    // Error: Not authorization (not customer)
    it(`Should error with status 400 and message ypu are not authorization`, function (done) {
      chai.request(app)
        .delete(`/carts/${id}/delete`)
        .set(admin, admin)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.equal('You are not Authorized!')
          done()
        })
    })

    // Error: not authorization
    it(`Should error with status 400 and message ypu are not authorization`, function (done) {
      chai.request(app)
        .delete(`/carts/${id}/delete`)
        .set(customer2, customer2)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.equal('You are not Authorized!')
          done()
        })
    })

    // Success Delete product from carts
    it(`Should success delete product with status 200`, function (done) {
      chai.request(app)
        .delete(`/carts/${id}/delete`)
        .set(customer, customer)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          done()
        })
    })
  })
})