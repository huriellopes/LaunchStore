const crypto = require('crypto')
const { hash } = require('bcryptjs')
const UserModel = require('../models/UserModel')
const mailer = require('../../lib/mailer')

module.exports = {
  loginForm(req, res) {
    return res.render('session/login')
  },
  login(req, res) {
    req.session.userId = req.user.id
    
    return res.redirect('/users')
  },
  logout(req, res) {
    req.session.destroy()
    return res.redirect('/')
  },
  forgotForm(req, res) {
    return res.render('session/forgot-password')
  },
  async forgot(req, res) {
    const user = req.user

    try {
      // Um token para esse usuário
      const token = crypto.randomBytes(20).toString('HEX')

      // Criar uma Expiração
      let now = new Date()
      now = now.setHours(now.getHours() + 1)

      await UserModel.update(user.id, {
        reset_token: token,
        reset_token_expires: now
      })

      // Enviar um email com um link de recuperação de senha
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@launchstore.com',
        subject: 'Recuperação de Senha',
        html: `<h2>Perdeu a chave?</h2>
        <p>Não se preocupe, clique no link abaixo para recuperar sua senha</p>
        <p>
          <a href="http://localhost:3000/users/password-reset?token=${token}" tarket="_blank">
            Recuperar Senha
          </a>
        </p>`,
      })

      // avisar o usuário que enviamos o email
      return res.render('session/forgot-password', {
        success: 'Verifique seu email para resetar sua senha!'
      })
    } catch (err) {
      console.error(err)
      return res.render('session/forgot-password', {
        error: 'Erro inesperado, tente novamente!'
      })
    }
  },
  resetForm(req, res) {
    return res.render('session/password-reset', { token: req.query.token })
  },
  async reset(req, res) {
    const  { user } = req
    const { password, token } = req.body

    try {
      // cria um novo hash de senha
      const newPassword = await hash(password, 8)

      // atualiza o usuário
      await UserModel.update(user.id, {
        password: newPassword,
        reset_token: '',
        reset_token_expires: ''
      })

      // avisa o usuário que ele tem uma nova senha
      return res.render('session/login', {
        user: req.body,
        token,
        success: 'Senha atualizada com sucesso! Faça o seu login'
      })
    } catch (err) {
      console.error(err)
      return res.render('session/password-reset', {
        user: req.body,
        error: 'Erro inesperado, tente novamente!'
      })
    }
  }
}