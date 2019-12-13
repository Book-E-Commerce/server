const Cart = require('../Models/cart')
const Book = require('../Models/book')

class CartController {
  static addToCart(req, res, next) {
    let { id } = req.logedUser
    let { qty } = req.body
    let { idBook } = req.params
    console.log(idBook);
    if (qty <= 0) throw next({ status: 400, msg: 'Cannot buy product without quantity!' })
    Book.findById(idBook)
      .then(book => {
        if (book.stock == 0) {
          throw next({ status: 400, msg: `Sorry this book out of stock!` })
        } else if (qty > book.stock) {
          throw next({ status: 400, msg: `Sorry you are cannot buy book more then book stock!!` })
        } else {
          return Cart.find({ idUser: id, idBook: idBook, status: false })
        }
      })
      .then(cart => {
        if (cart.length == 1) {
          throw next({ status: 403, msg: `This product is already in your cart bucket, please open your cart bucket to procces your transaction!` })
        } else {
          return Cart.create({
            idUser: id,
            idBook,
            qty
          })
        }
      })
      .then(cart => {
        res.status(201).json(cart)
      })
      .catch(next)
  }

  static updateQty(req, res, next) {
    let { qty } = req.body
    let { idCart } = req.params
    Cart.findByIdAndUpdate(idCart, { $set: { qty: qty } }, { runValidators: true, new: true })
      .then(cart => {
        res.status(200).json(cart)
      })
      .catch(next)
  }

  static showCart(req, res, next) {
    let { id } = req.logedUser
    Cart.find({ idUser: id, status: false }).populate('idBook')
      .then(carts => {
        res.status(200).json(carts)
      })
      .catch(next)
  }

  static deleteCart(req, res, next) {
    let { idCart } = req.params
    Cart.findByIdAndDelete(idCart)
      .then(respon => {
        res.status(200).json(respon)
      })
      .catch(next)
  }
}

module.exports = CartController