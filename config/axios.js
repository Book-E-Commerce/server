const axios = require('axios')

// const instance = axios.create({
//   baseURL: 'https://www.goodreads.com',
// });

const instance = axios.create({
  baseURL: 'https://www.googleapis.com/books/v1/volumes',
});

module.exports = instance
