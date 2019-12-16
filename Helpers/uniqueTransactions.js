function uniqueBook(transactions) {
  let booksIdArr = []
  let salesArr = []
  let result = []
  transactions.forEach((sales) => {
    sales.cart.forEach((book) => {
      salesArr.push(book)
      booksIdArr.push(book.bookId.toString())
    })
  })
  let eachBook = [...new Set(booksIdArr)]
  let obj = {}
  eachBook.forEach((book) => {
    obj.qty = 0 
    obj.bookId = book
    salesArr.forEach((sales) =>{
      if (sales.bookId.toString() === book){
        obj.qty += sales.qty
      }
    })
    result.push(obj)
    obj = {}
  })
  return result
}

module.exports = uniqueBook