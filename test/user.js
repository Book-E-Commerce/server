const chai = require('chai')
const expect = chai.expect
const ChaiHttp = require('chai-http')
const app = require('../app.js')
const db = require('../Models/user')

chai.use(ChaiHttp)

after(function () {
  db.collection.deleteMany({})
})

describe('User', function () {
  // Success
  describe('register', function () {
    it('should success add new user without error with status 201 and user will get message: "Register Success!"', function (done) {
      let body = {
        username: 'user',
        email: 'email@gmail.com',
        password: 'password',
        role: 'admin'
      }

      chai.request(app)
        .post('/users/register')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body).to.have.key('message')
          expect(res.body.message).to.be.equal('Register Success!')
          done()
        })
    })

    // error : username, email, password required!
    it(`should error with status 400 and message username is required, email, password required!`, function (done) {
      let body = {
        username: '',
        email: '',
        password: '',
        role: 'admin'
      }

      chai.request(app)
        .post('/users/register')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.include('Username is required!')
          expect(res.body).to.be.include('Email is required!')
          expect(res.body).to.be.include(`Password is required!`)
          done()
        })
    })

    // error : uniqueValidation
    it(`Should error with status 400 and have message "Error, expected (username / email) to be unique."`, function (done) {
      let body = {
        username: 'user',
        email: 'email@gmail.com',
        password: 'password',
        role: 'admin'
      }

      chai.request(app)
        .post('/users/register')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res.body).to.be.include(`Error, email already taken.`)
          expect(res).to.have.status(400)
          done()
        })
    })

    // error: Email not match
    it('Should error with status 400 and have message "Invalid email format."', function (done) {
      let body = {
        username: 'users1',
        email: 'user',
        password: 'password',
        role: 'admin'
      }

      chai.request(app)
        .post('/users/register')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.be.include('Invalid email format.')
          done()
        })
    })
  })

  describe('login', function () {
    // Success
    it(`Should success login with status 200 and user will get token, username and role user`, function (done) {
      let body = {
        identity: 'user',
        password: 'password'
      }

      chai.request(app)
        .post('/users/login')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.have.all.keys('token', 'username', 'role', 'email')
          expect(res.body.username).to.be.equal('user')
          done()
        })
    })

    // Error: Username / Password wrong
    it(`Should error with status 400 and user will get message "Username / Email / Password wrong!"`, function (done) {
      let body = {
        identity: 'users',
        password: 'users'
      }

      chai.request(app)
        .post('/users/login')
        .send(body)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.equal('Username / Email / Password wrong!')
          done()
        })
    })
  })

  // Login Google
  // describe('Google SignIn', () => {
  //   // Succes register with google sign in
  //   it(`Success`, function (done) {
  //     let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMTEwOTFkYTAzYmFhNDA5MTllNmZmODM2YzhlN2Y5YWZhYmE5YTgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTI3MTY4NTc4MzAxLXNtcXNvbnAwbTYwbmk3bXRha3I2a2t1MHJvYTI0OGI4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTI3MTY4NTc4MzAxLXNtcXNvbnAwbTYwbmk3bXRha3I2a2t1MHJvYTI0OGI4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4MTIwMjYzNDQxNzA1MTA4OTQ3IiwiZW1haWwiOiJkaXBhZGFuYWRldkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Im84czIxSUctbm5RVTlqZDNvVXB6ZlEiLCJuYW1lIjoiRGlwYWRhbmEgUHV0dSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUF1RTdtQW5zajFZbk9EQklFLUx5STBvdDNsUWVtamdwYjRPeHpEWkpFRmw9czk2LWMiLCJnaXZlbl9uYW1lIjoiRGlwYWRhbmEiLCJmYW1pbHlfbmFtZSI6IlB1dHUiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU3NjMxNjc1OCwiZXhwIjoxNTc2MzIwMzU4LCJqdGkiOiI1ODYzYTkwMDliODUxZTIyZWMxOTRhODc4NjQ4Zjc5NTE5ZmMzMGM0In0.AAqLcraxygGGjQEOm5yUkj2JlcR4psCeKW-oFRFK_ITTT1pGJZ-bJJzGV8WknEmq0kZJDYPLG-GH1u6m-GsG8sO8Lf9ZmhGKwhm1e085MdxssWX-TH9iIYAqM-IEgE7ORshN5eCwxJTrhcHHHxBhbvngEbyUjhGzIRn5CAQw2kTsWOnWXMZUGA3w4RL7iPgQ8v070Wga_Gsdnoyl7z5tpIa1llv9_ZUqVxdquUW-XZi4m1W5Q7fAtfCJBGxR6kvAQtXtfDXbgNWIHWqCS4ag29Mt9ANqITWsHuHxHJnBgSa1oDzIIpT4ZyoYP3UAzc93bMh6HgnabQT5bcshoN1fqQ"
  //     chai.request(app)
  //       .post('/users/gsignin')
  //       .send({ token })
  //       .end((err, res) => {
  //         expect(err).to.be.null
  //         expect(res).to.have.status(200)
  //         expect(res.body).to.have.all.keys('token', 'username', 'role', 'email')
  //         done()
  //       })
  //   })

  //   // Success login with Google signin
  //   it(`Success`, function (done) {
  //     let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMTEwOTFkYTAzYmFhNDA5MTllNmZmODM2YzhlN2Y5YWZhYmE5YTgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTI3MTY4NTc4MzAxLXNtcXNvbnAwbTYwbmk3bXRha3I2a2t1MHJvYTI0OGI4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTI3MTY4NTc4MzAxLXNtcXNvbnAwbTYwbmk3bXRha3I2a2t1MHJvYTI0OGI4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4MTIwMjYzNDQxNzA1MTA4OTQ3IiwiZW1haWwiOiJkaXBhZGFuYWRldkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Im84czIxSUctbm5RVTlqZDNvVXB6ZlEiLCJuYW1lIjoiRGlwYWRhbmEgUHV0dSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUF1RTdtQW5zajFZbk9EQklFLUx5STBvdDNsUWVtamdwYjRPeHpEWkpFRmw9czk2LWMiLCJnaXZlbl9uYW1lIjoiRGlwYWRhbmEiLCJmYW1pbHlfbmFtZSI6IlB1dHUiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU3NjMxNjc1OCwiZXhwIjoxNTc2MzIwMzU4LCJqdGkiOiI1ODYzYTkwMDliODUxZTIyZWMxOTRhODc4NjQ4Zjc5NTE5ZmMzMGM0In0.AAqLcraxygGGjQEOm5yUkj2JlcR4psCeKW-oFRFK_ITTT1pGJZ-bJJzGV8WknEmq0kZJDYPLG-GH1u6m-GsG8sO8Lf9ZmhGKwhm1e085MdxssWX-TH9iIYAqM-IEgE7ORshN5eCwxJTrhcHHHxBhbvngEbyUjhGzIRn5CAQw2kTsWOnWXMZUGA3w4RL7iPgQ8v070Wga_Gsdnoyl7z5tpIa1llv9_ZUqVxdquUW-XZi4m1W5Q7fAtfCJBGxR6kvAQtXtfDXbgNWIHWqCS4ag29Mt9ANqITWsHuHxHJnBgSa1oDzIIpT4ZyoYP3UAzc93bMh6HgnabQT5bcshoN1fqQ"
  //     chai.request(app)
  //       .post('/users/gsignin')
  //       .send({ token })
  //       .end((err, res) => {
  //         expect(err).to.be.null
  //         expect(res).to.have.status(200)
  //         expect(res.body).to.have.all.keys('token', 'username', 'role', 'email')
  //         done()
  //       })
  //   })
  // })

})