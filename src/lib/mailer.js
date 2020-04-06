const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "982f512836fa95",
    pass: "5b6a1d58e1fecd"
  }
})

module.exports = transport