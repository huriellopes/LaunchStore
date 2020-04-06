const ProductsModel = require('../models/ProductsModel')
const FilesModel = require('../models/FilesModel')
const { formatPrice, date, formatDate } = require('../../lib/utils')

module.exports = {
  async index(req, res) {
    try {
      let results = await ProductsModel.all()
      const products = results.rows

      if (!products) return res.sent('Products not found!')

      async function getImage(productId) {
        let results = await ProductsModel.files(productId)
        const files = results.rows.map(file => `${req.protocol}://${req.headers.host}${file.path.replace('public\\images\\', '\\\\images\\\\')}`)

        return files[0]
      }

      const productsPromise = products.map(async product => {
        product.img = await getImage(product.id)
        product.oldPrice = formatPrice(product.old_price)
        product.price = formatPrice(product.price)
        return product
      }).filter((product, index) => index > 2 ? false : true)

      const lastAdded = await Promise.all(productsPromise)

      return res.render('home/index', { products: lastAdded })
    } catch (err) {
      console.error(err)
    }
  }
}