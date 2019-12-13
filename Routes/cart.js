const router = require('express').Router()
const CartController = require('../Controllers/cart')
const { authentication, custAuth, cartAuth } = require('../Middlewares/auth')

router.use(authentication, custAuth)
router.get('/', CartController.showCart)
router.post('/:idProduct/add-to-cart', CartController.addToCart)
router.patch('/:idCart/update', cartAuth, CartController.updateQty)
router.delete('/:idCart/delete', cartAuth, CartController.deleteCart)

module.exports = router