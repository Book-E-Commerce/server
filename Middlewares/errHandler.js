module.exports = (err, req, res, next) => {
  let status
  let message

  switch (err.name) {
    case 'AuthenticationError':
      status = 401;
      message = err.message
      break;
    case 'ValidationError':
      status = 400
      let arr = []
      for (const key in err.errors) { arr.push(err.errors[key].message) }
      message = arr
      break;
    case 'JsonWebTokenError':
      status = 401
      message = err.message
      break;
    default:
      status = err.status || 500
      message = err.message || err.msg || 'Internal Server Error'
      break;
  }
  res.status(status).json(message)
}