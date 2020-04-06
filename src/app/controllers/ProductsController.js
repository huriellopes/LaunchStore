const Category = require('../models/CategoryModel')
const ProductsModel = require('../models/ProductsModel')
const FilesModel = require('../models/FilesModel')
const { formatPrice, date, formatDate } = require('../../lib/utils')

module.exports = {
  create: (req, res) => {
    //Pegar Categorias
    Category.all()
      .then((results) => {
        const categories = results.rows
        return res.render('products/create.njk', { categories })
      }).catch((err) => {
        throw new Error(err)
      })
  },
  async post(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == '') {
        return res.send('Please, fill all fields!')
      }
    }

    if (req.files.length == 0) {
      return res.send('Please, send at least one image')
    }

    req.body.user_id = req.session.userId
    let results = await ProductsModel.create(req.body)
    const productId = results.rows[0].id

    const filesPromise = req.files.map(file => FilesModel.create({...file, product_id: productId}))
    await Promise.all(filesPromise)

    return res.redirect(`products/${productId}`)
  },
  async edit(req, res) {
    let results = await ProductsModel.find(req.params.id)
    const product = results.rows[0]
  
    if (!product) return res.send('Product not found!')

    product.old_price = formatPrice(product.old_price)
    product.price = formatPrice(product.price)
    
    // Get Categories
    results = await Category.all()
    const categories = results.rows

    // Get Images
    results = await ProductsModel.files(product.id)
    let files = results.rows
    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
    }))

    return res.render(`products/edit`, { product, categories, files })
  },
  async show(req, res) {
    let results = await ProductsModel.find(req.params.id)
    const product = results.rows[0]

    if (!product) return res.send('Product Not Found!')

    const { day, hour, minutes, month } = date(product.updated_at)
    product.published = formatDate(product.updated_at, 'DD/MM HH:mm')
    // product.published = {
    //   day: `${day}/${month}`,
    //   hour: `${hour}h${minutes}`,
    // }
    // {{ product.published.day}} às {{ product.published.hour }}

    product.oldPrice = formatPrice(product.old_price)
    product.price = formatPrice(product.price)

    results = await ProductsModel.files(product.id)
    const files = results.rows.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
    }))

    return res.render('products/show', { product, files })
  },
  async put(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == '' && key != 'removed_files') {
        return res.send('Please, fill all fields!')
      }
    }

    if (req.files.length != 0) {
      const newFilesPromise = req.files.map(file => 
        FilesModel.create({...file, product_id: req.body.id}))
      await Promise.all(newFilesPromise)
    }

    if (req.body.removed_files) {
      const removedFiles = req.body.removed_files.split(',') // [1,2,3,]
      const lastIndex = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1) // [1,2,3]

      const removedFilesPromise = removedFiles.map(id => FilesModel.delete(id))

      await Promise.all(removedFilesPromise)
    }

    req.body.price = req.body.price.replace(/\D/g, "")

    if (req.body.old_price != req.body.price) {
      const oldProduct = await ProductsModel.find(req.body.id)
      req.body.old_price = oldProduct.rows[0].price
    }

    await ProductsModel.update(req.body)

    return res.redirect(`/products/${req.body.id}`)
  },
  async delete(req, res) {
    await ProductsModel.delete(req.body.id)

    return res.redirect('/products/create')
  }
}