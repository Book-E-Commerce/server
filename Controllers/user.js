const User = require('../Models/user')
const { comparePassword } = require('../Helpers/bcrypt')
const { generateToken } = require('../Helpers/jwt')

class UserController {
  static register(req, res, next) {
    let { username, email, password, role } = req.body
    User.create({ username, email, password, role })
      .then(_ => {
        res.status(201).json({
          message: "Register Success!"
        })
      })
      .catch(next)
  }

  static login(req, res, next) {
    let { identity, password } = req.body
    User.findOne({ $or: [{ username: identity }, { email: identity }] })
      .then(user => {
        if (user && comparePassword(password, user.password)) {
          let token = generateToken({ id: user._id })
          res.status(200).json({
            username: user.username,
            token,
            email: user.email,
            role: user.role
          })
        } else {
          next({ status: 401, message: 'Username / Email / Password wrong!' })
        }
      })
      .catch(next)
  }

  static googleSignIn(req, res, next) {
    const { OAuth2Client } = require('google-auth-library')
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const { token } = req.body
    let data

    client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
      .then((ticket) => {
        data = ticket.getPayload()
        const email = data.email
        console.log(data);
        return User.findOne({ email })
      })
      .then(user => {
        if (user) {
          return user
        } else {
          return User.create({
            username: data.name,
            email: data.email,
            password: process.env.DEFAULT_PASSWORD
          })
        }
      })
      .then(user => {
        let payload = { id: user._id }
        let token = generateToken(payload)
        res.status(200).json({ username: user.username, token, email: user.email, role: user.role })
      })
      .catch(next)
  }
}

module.exports = UserController