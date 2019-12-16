/* istanbul ignore file */
function parsing(data){
  let temp = []

  data.items.forEach((el, i) => {
    if (el.volumeInfo.language === 'en') {
      if (el.volumeInfo.description) {
        let obj = {}
        obj.idGoogle = el.id
        obj.title = el.volumeInfo.title
        obj.author = el.volumeInfo.authors
        obj.description = el.volumeInfo.description
        obj.category = el.volumeInfo.categories
        obj.rating = el.volumeInfo.averageRating
        if (el.saleInfo.saleability !== 'NOT_FOR_SALE') {
          if (el.saleInfo.retailPrice.amount < 300){
            obj.price = el.saleInfo.retailPrice.amount * 15000
          } else {
            obj.price = el.saleInfo.retailPrice.amount
          }
        } else {
          obj.price = 100000
        }
        obj.stock = 25 - Math.floor(Math.random() * 5)
        if (el.volumeInfo.imageLinks) {
          obj.image = el.volumeInfo.imageLinks.thumbnail
        } else {
          obj.image = ''
        }
        temp.push(obj)
      }
    }
  })

  return temp

}


module.exports = parsing