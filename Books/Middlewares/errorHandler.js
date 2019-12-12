function errorHandler(err,req,res,next){
  let status = err.status || 500
  let message = err.message || 'Internal server error'

  if(err.name === 'ValidationError'){
    let arr = []
    for (let key in err.errors){
      arr.push(err.errors[key].message)
    }
    message = 'Validation Error'
    res.status(400).json({message,arr})
  } else if (err.name === 'JsonWebTokenError'){
    message = 'You are not authorize to perform this action'
    res.status(401).json({message})
  } else {
    res.status(status).json({message})
  }
}

module.exports = errorHandler