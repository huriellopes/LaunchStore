const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const db = require('./db')

module.exports = session({
  store: new pgSession({
    pool: db
  }),
  secret: '1f0a40be2d7e7af62b3db3ca9edc3ecf',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
})