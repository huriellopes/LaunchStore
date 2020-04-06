const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const ProductsController = require('../app/controllers/ProductsController')
const SearchController = require('../app/controllers/SearchController')

const { onlyUsers } = require('../app/middlewares/session')

routes.get('/search', SearchController.index)
routes.get('/create', onlyUsers,ProductsController.create)
routes.get('/:id/edit', onlyUsers, ProductsController.edit)
routes.get('/:id', onlyUsers,ProductsController.show)
routes.post('/', onlyUsers, multer.array('photos', 6), ProductsController.post)
routes.put('/', onlyUsers, multer.array('photos', 6), ProductsController.put)
routes.delete('/', onlyUsers, ProductsController.delete)

module.exports = routes