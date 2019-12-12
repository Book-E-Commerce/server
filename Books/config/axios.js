const axios = require('axios')

const instance = axios.create({
  baseURL: 'https://www.goodreads.com',
});

module.exports = instance