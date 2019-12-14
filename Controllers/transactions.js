const Transaction = require('../Models/transaction')
const Book = require('../Models/book')
const Cart = require('../Models/cart')
const uniqueBook = require('../Helpers/uniqueTransactions')

class TransactionController{

  static async create(req,res,next){
    try {
      let { cartUser } = req.cartUser
      let transactionData = []
      for (let bookInCart of cartUser) {
        const book = await Book.findOne({ _id:bookInCart.idBook })
        const [{ updateBook }, { updateCart }] = await Promise.all([
          await Book.updateOne({_id : book._id},{ $set:{stock : (book.stock-bookInCart.qty)}}),
          await Cart.updateOne({_id : bookInCart._id}, {$set : { status : true }})])
        let obj = {}
        obj.bookId = book._id
        obj.qty = bookInCart.qty
        transactionData.push(obj)
      }
      const createTransaction = await Transaction.create({
        userId : cartUser[0].idUser,
        cart : transactionData
      })
      let report = {
        message : 'Checkout done!',
        transaction: createTransaction
      }
      res.status(200).json({report})
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  static async user(req,res,next){
    try {
      let userId = req.logedUser.id
      let transactions = await Transaction.find({userId}).populate('cart.bookId').sort({createdAt: 'desc'})
      res.status(200).json(transactions)
    } catch (error) {
      next(error)
    }
  }

  static async all(req,res,next){
    try {
      const transactions = await Transaction.find({}).populate('cart.bookId').populate('userId').sort({createdAt: 'desc'})
      res.status(200).json({transactions})
    } catch (error) {
      next(error)
    }
  }

  static async remove(req,res,next){
    try {
      let {transactionId} = req.params
      const deleteTrans = await Transaction.deleteOne({_id:transactionId})
      let message = 'Transaction deleted!'
      res.status(200).json({message, deleteTrans})
    } catch (error) {
      next(error)
    }
  }

  static async bestSelling(req,res,next){
    try {
      const allTransactions = await Transaction.find({},'cart createdAt updatedAt')
      const report = uniqueBook(allTransactions)
      let sorted = [...report]
      sorted.sort((a,b) => parseFloat(b.qty) - parseFloat(a.qty))
      let result = []
      for (let key of sorted){
        const title = await Book.findOne({_id : key.bookId}).select('title')
        let obj = {}
        obj.title = title
        obj.qty = key.qty
        result.push(obj)
      }
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async weeklyReport(req,res,next){
    try {
      let end = new Date()
      let start = new Date()
      start.setDate(start.getDate()-7)

      let pipeline = [
        {
          '$match' : {
            "createdAt" : {
              "$gte" : start,
              "$lte" : end 
            }
          }
        },
        {
          '$group':{
            "_id" : {
              "Date": {
                "$dateToString":{
                  "format" : "%Y-%m-%d",
                  "date": "$createdAt"
                }
              }
            },
            "count": { 
              "$sum": { "$sum": "$cart.qty" }
            }
          }
        }
      ]

      const transactions = await Transaction.aggregate(pipeline)
      res.status(200).json(transactions)
    } catch (error) {
      next(error)
    }
  }
}

// endpoint untuk buku terlaris selama toko dibuka transaction (title, jumlah buku yg laku)
// endpoint untuk penjualan buku satu minggu terakhir transaction (date, jumlah buku laku, arr.length = 7)

module.exports = TransactionController