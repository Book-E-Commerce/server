const Cart = require('../Models/cart')
const Book = require('../Models/book')
const Redis = require('ioredis')
const redis = new Redis()

class CartController {
  static async addToCart(req, res, next) {
    let { id } = req.logedUser
    let { qty } = req.body
    let { idBook } = req.params

    if (qty <= 0) next({ status: 400, msg: 'Cannot buy book without quantity!' })

    try {
      const book = await Book.findById(idBook)
      if (book.stock == 0) {
        next({ status: 400, msg: `Sorry this book out of stock!` })
      } else if (qty > book.stock) {
        next({ status: 400, msg: `Sorry you are cannot buy book more then book stock!!` })
      } else {
        const dataCart = await Cart.find({ idUser: id, idBook: idBook, status: false })
        if (dataCart.length == 1) {
          next({ status: 403, msg: `This book is already in your cart bucket, please open your cart bucket to procces your transaction!` })
        } else {
          const cart = await Cart.create({
            idUser: id,
            idBook,
            qty
          })
          res.status(201).json(cart)
        }
      }
    } catch (next) { }
  }

  static async updateQty(req, res, next) {
    let { qty } = req.body
    let { idCart } = req.params
    let { id } = req.logedUser

    try {
      await Cart.findByIdAndUpdate(idCart, { $set: { qty: qty } }, { runValidators: true, new: true })
      const newDataCarts = await Cart.find({ idUser: id, status: false }).populate('idBook')
      res.status(200).json(newDataCarts)
    } catch (next) { }
  }

  static async showCart(req, res, next) {
    let { id } = req.logedUser
      try {
        const allCarts = await Cart.find({ idUser: id, status: false }).populate('idBook')
        res.status(200).json(allCarts)
      } catch (next) { }
  }

  static async deleteCart(req, res, next) {
    let { id } = req.logedUser
    let { idCart } = req.params
    try {
      await Cart.findByIdAndDelete(idCart)
      const newDataCarts = await Cart.find({ idUser: id, status: false }).populate('idBook')
      res.status(200).json({data: newDataCarts, message: "Delete Success!"})
    } catch (next) { }
  }
}

module.exports = CartController