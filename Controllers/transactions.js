const Transaction = require('../Models/transaction')
const Book = require('../Models/book')
const Cart = require('../Models/cart')
const uniqueBook = require('../Helpers/uniqueTransactions')
const Redis = require('ioredis')
const redis = new Redis()

class TransactionController {

  static async create(req, res, next) {
    try {
      let { cartUser } = req.cartUser
      let transactionData = []
      for (let bookInCart of cartUser) {
        const book = await Book.findOne({ _id: bookInCart.idBook })
        const [{ updateBook }, { updateCart }] = await Promise.all([
          await Book.updateOne({ _id: book._id }, { $set: { stock: (book.stock - bookInCart.qty) } }),
          await Cart.updateOne({ _id: bookInCart._id }, { $set: { status: true } })])
        let obj = {}
        obj.bookId = book._id
        obj.qty = bookInCart.qty
        transactionData.push(obj)
      }
      const createTransaction = await Transaction.create({
        userId: cartUser[0].idUser,
        cart: transactionData
      })
      let report = {
        message: 'Checkout done!',
        transaction: createTransaction
      }
      await redis.del('Carts')
      await redis.del(`Transaction-${req.logedUser.id}`)
      await redis.del('Transactions')
      await redis.del('Transactions-Weekly')
      await redis.del('Transactions-Best')
      res.status(201).json({ report })
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }

  static async user(req, res, next) {
    const cacheUserTrans = await redis.get(`Transaction-${req.logedUser.id}`)
    if (cacheUserTrans) {
      let transactions = JSON.parse(cacheUserTrans)
      res.status(200).json(transactions)
    } else {
      try {
        let userId = req.logedUser.id
        let transactions = await Transaction.find({ userId }).populate('cart.bookId').sort({ createdAt: 'desc' })
        await redis.set(`Transaction-${req.logedUser.id}`, JSON.stringify(transactions))
        res.status(200).json(transactions)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async all(req, res, next) {
    const cacheAllTrans = await redis.get('Transactions')
    if (cacheAllTrans) {
      let transactions = JSON.parse(cacheAllTrans)
      res.status(200).json({ transactions })
    } else {
      try {
        const transactions = await Transaction.find({}).populate('cart.bookId').populate('userId').sort({ createdAt: 'desc' })
        await redis.set('Transactions', JSON.stringify(transactions))
        res.status(200).json({ transactions })
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async remove(req, res, next) {
    try {
      let { transactionId } = req.params
      const deleteTrans = await Transaction.findByIdAndDelete({ _id: transactionId })
      await redis.del('Transactions')
      await redis.del('Transactions-Weekly')
      await redis.del('Transactions-Best')
      let message = 'Transaction deleted!'
      res.status(200).json({ message, deleteTrans })
    } catch (error) {
      /* istanbul ignore next */
      next(error)
    }
  }

  static async bestSelling(req, res, next) {
    const bestSelling = await redis.get('Transactions-Best')
    if (bestSelling) {
      res.status(200).json(JSON.parse(bestSelling))
    } else {
      try {
        const allTransactions = await Transaction.find({}, 'cart createdAt updatedAt')
        const report = uniqueBook(allTransactions)
        let sorted = [...report]
        sorted.sort((a, b) => parseFloat(b.qty) - parseFloat(a.qty))
        let result = []
        for (let key of sorted) {
          const title = await Book.findOne({ _id: key.bookId }).select('title')
          let obj = {}
          obj.title = title
          obj.qty = key.qty
          result.push(obj)
        }
        await redis.set('Transactions-Best', JSON.stringify(result))
        res.status(200).json(result)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }

  static async weeklyReport(req, res, next) {
    const weeklyReport = await redis.get('Transactions-Weekly')
    if (weeklyReport) {
      res.status(200).json(JSON.parse(weeklyReport))
    } else {
      try {
        let end = new Date()
        let start = new Date()
        start.setDate(start.getDate() - 7)

        let pipeline = [
          {
            '$match': {
              "createdAt": {
                "$gte": start,
                "$lte": end
              }
            }
          },
          {
            '$sort': {
              "createdAt": 1
            }
          },
          {
            '$group': {
              "_id": {
                "Date": {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
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
        let sorted = [...transactions]
        sorted.sort((a, b) => {
          return new Date(a._id.Date) - new Date(b._id.Date)
        })
        await redis.set('Transactions-Weekly', JSON.stringify(sorted))
        res.status(200).json(sorted)
      } catch (error) {
        /* istanbul ignore next */
        next(error)
      }
    }
  }
}

// endpoint untuk buku terlaris selama toko dibuka transaction (title, jumlah buku yg laku)
// endpoint untuk penjualan buku satu minggu terakhir transaction (date, jumlah buku laku, arr.length = 7)

module.exports = TransactionController