const Transaction = require('../Models/transaction')
const Book = require('../Models/book')
const Cart = require('../Models/cart')

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
      console.log(transactionId);
      const deleteTrans = await Transaction.deleteOne({_id:transactionId})
      let message = 'Transaction deleted!'
      res.status(200).json({message, deleteTrans})
    } catch (error) {
      next(error)
    }
  }

}

module.exports = TransactionController