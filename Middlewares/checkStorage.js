const Book = require("../Models/book");
const Cart = require('../Models/cart')

async function checkStorage(req, res, next) {
  try {
    let idUser = req.logedUser.id
    const cartUser = await Cart.find({ idUser, status: false })
    let rejectBooks = []
    let getBooks = []
    for (let bookInCart of cartUser) {
      const book = await Book.findOne({ _id: bookInCart.idBook })
      if (book.stock >= bookInCart.qty) {
        getBooks.push({ bookId: book._id, title: book.title, qty: book.qty })
      } else {
        rejectBooks.push({ bookId: book._id, title: book.title, qty: book.qty })
      }
    }
    if (rejectBooks.length < 1) {
      req.cartUser = { cartUser }
      next()
    } else {
      next({ status: 400, message: { text: 'Out of stock, please delete some items', books: { rejectBooks, getBooks } } })
    }
  } catch (error) {
    /*istanbul ignore next */
    next(error)
  }
}


module.exports = checkStorage
