const chai = require('chai')
const jwt = require('../Helpers/jwt')
const expect = chai.expect
const ChaiHttp = require('chai-http')
const app = require('../app.js')
const Book = require('../Models/book')
const Cart = require('../Models/cart')
const User = require('../Models/user')
const Transaction = require('../Models/transaction')

chai.use(ChaiHttp)

before(function(){
  return Transaction.deleteMany()
})

describe('Transaction Testing', () => {
  let adminToken = ''
  let userToken = ''
  let userToken2 = ''
  let userError = ''
  let bookId = ''
  let bookId2 = ''
  let transactionId = ''
  let cart = []


  let dataBook = { 
    title : 'testing title',
    author : ['testing author'],
    category : ['ini', 'kategori'],
    rating : 3.4,
    price : 20000,
    stock : 30,
    description : 'ini deskripsi buku',
    image : 'ini link gambar'
  }

  let dataBook2 = { 
    title : 'dummy',
    author : ['dummy'],
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

      const userDummy2 = await User.create({
        email : 'dummy2@dummy2.com',
        password : 'dummy2dummy2',
        username : 'dummy2',
      })
      let payloadDummy2 = {
        id : userDummy2._id,
      }
      userToken2 = jwt.generateToken(payloadDummy2)

      // generate user error
      const userDummyError = await User.create({
        email : 'dum123123my@dummy.com',
        password : 'dum123123mydummy',
        username : 'du123123mmy',
      })
      let payloadError = {
        id : userDummyError._id,
      }
      userError = jwt.generateToken(payloadError)

      const book = await Book.create(dataBook)
      const book2 = await Book.create(dataBook2)
      bookId = book._id
      bookId2 = book2._id

      const cart = await Cart.create({
        idUser : userDummy._id,
        idBook : bookId,
        qty : 2
      })

      const cart2 = await Cart.create({
        idUser : userDummyError._id,
        idBook : bookId,
        qty : 200
      })

      await Cart.create({
        idUser : userDummy2._id,
        idBook : bookId2,
        qty : 1
      })

    } catch (error) {
      console.log(error);
    }
  })

  describe('Testing create new transaction',()=>{
    it('should success create new transaction without an error (201)', done=>{
      chai
      .request(app)
      .get('/transactions/new')
      .set('token',userToken)
      .end((err,res)=>{
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('report')
        expect(res.body.report).to.be.an('object')
        expect(res.body.report).to.have.property('transaction')
        expect(res.body.report.message).to.equal('Checkout done!')
        expect(res.body.report.transaction).to.be.an('object')
        transactionId = res.body.report.transaction._id
        done()
      })
    })

    it('should success create new transaction without an error (201)', done=>{
      chai
      .request(app)
      .get('/transactions/new')
      .set('token',userToken2)
      .end((err,res)=>{
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.property('report')
        expect(res.body.report).to.be.an('object')
        expect(res.body.report).to.have.property('transaction')
        expect(res.body.report.message).to.equal('Checkout done!')
        expect(res.body.report.transaction).to.be.an('object')
        transactionId = res.body.report.transaction._id
        done()
      })
    })

    it('should error create new transaction with an error (400)', done=>{
      chai
      .request(app)
      .get('/transactions/new')
      .set('token',userError)
      .end((err,res)=>{
        expect(res).to.have.status(400)
        expect(res.body).to.be.an('object')
        done()
      })
    })







  })

  describe('Testing find user transation',()=>{
    it('should success show specific user transaction', done=>{
      chai
        .request(app)
        .get('/transactions/user')
        .set('token',userToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('userId')
          expect(res.body[0]).to.have.property('cart')
          expect(res.body[0]).to.have.property('_id')
          expect(res.body[0].cart).to.be.an('array')
          expect(res.body[0].cart[0]).to.be.an('object')
          done()
        })
    })

    it('should success show specific user transaction', done=>{
      chai
        .request(app)
        .get('/transactions/user')
        .set('token',userToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('userId')
          expect(res.body[0]).to.have.property('cart')
          expect(res.body[0]).to.have.property('_id')
          expect(res.body[0].cart).to.be.an('array')
          expect(res.body[0].cart[0]).to.be.an('object')
          done()
        })
    })
  })

  describe('Testing find all transation',()=>{
    it('should success show all user transactions', done=>{
      chai
        .request(app)
        .get('/transactions/all')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('transactions')
          expect(res.body.transactions).to.be.an('array')
          expect(res.body.transactions[0]).to.have.property('userId')
          expect(res.body.transactions[0]).to.have.property('cart')
          expect(res.body.transactions[0]).to.have.property('_id')
          expect(res.body.transactions[0].cart).to.be.an('array')
          expect(res.body.transactions[0].cart[0]).to.be.an('object')
          done()
        })
    })

    it('should success show all user transactions', done=>{
      chai
        .request(app)
        .get('/transactions/all')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('transactions')
          expect(res.body.transactions).to.be.an('array')
          expect(res.body.transactions[0]).to.have.property('userId')
          expect(res.body.transactions[0]).to.have.property('cart')
          expect(res.body.transactions[0]).to.have.property('_id')
          expect(res.body.transactions[0].cart).to.be.an('array')
          expect(res.body.transactions[0].cart[0]).to.be.an('object')
          done()
        })
    })
  })

  describe('Testing find best selling books',()=>{
    it('should success show all best selling books', done=>{
      chai
        .request(app)
        .get('/transactions/best-selling')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('title')
          expect(res.body[0]).to.have.property('qty')
          done()
        })
    })

    it('should success show all best selling books', done=>{
      chai
        .request(app)
        .get('/transactions/best-selling')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('title')
          expect(res.body[0]).to.have.property('qty')
          done()
        })
    })
  })

  describe('Testing weekly report',()=>{
    it('should success show weekly report', done=>{
      chai
        .request(app)
        .get('/transactions/weekly-report')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('_id')
          expect(res.body[0]).to.have.property('count')
          expect(res.body[0]._id).to.be.an('object')
          expect(res.body[0]._id).to.have.property('Date')
          done()
        })
    })

    it('should success show weekly report', done=>{
      chai
        .request(app)
        .get('/transactions/weekly-report')
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('array')
          expect(res.body[0]).to.be.an('object')
          expect(res.body[0]).to.have.property('_id')
          expect(res.body[0]).to.have.property('count')
          expect(res.body[0]._id).to.be.an('object')
          expect(res.body[0]._id).to.have.property('Date')
          done()
        })
    })
  })

  describe('Testing delete transaction',()=>{
    it('should success delete a transaction', done=>{
      chai
        .request(app)
        .delete(`/transactions/${transactionId}`)
        .set('token',adminToken)
        .end((err,res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.an('object')
          expect(res.body).to.have.property('message')
          expect(res.body).to.have.property('deleteTrans')
          expect(res.body.message).to.equal('Transaction deleted!')
          done()
        })
    })

    it('should error delete a transaction because transId not found', done=>{
      chai
        .request(app)
        .delete(`/transactions/${transactionId+2}`)
        .set('token',adminToken)
        .end((err,res) => {
          expect(res).to.have.status(500)
          // expect(res.body).to.be.a('string')
          done()
        })
    })
  })

})
