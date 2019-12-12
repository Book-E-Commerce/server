const { verifyedToken } = require('../Helpers/jwt')

function authentication(req, res, next) {
  try {
    let token = req.headers.token
    let decodeToken = verifyedToken(token)
    req.logedUser = decodeToken
    next()
  } catch (err) {
    next(err)
  }
}

function authorization(req, res, next) {
  let { id } = req.logedUser
  let idArticle = req.params.id
  Article.findById(idArticle)
    .then(article => {
      if (article.owner == id) {
        next()
      } else[
        next({ status: 401, msg: `You are not Authorized!` })
      ]
    })
    .catch(err => {
      next(err)
    })
}

module.exports = { authentication, authorization }