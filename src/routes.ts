import { Router } from 'express'
import { body } from 'express-validator'
import { checkPermission } from './lib/checkPermission'
import { formatFile } from './lib/formatFile'
import { isAuth } from './lib/isAuth'
import { uploadFile } from './lib/uploadFile'
import { validate } from './lib/validate'
import { addToCart, cart, deleteProductCart, updateProductCart } from './modules/cart/cart.controller'
import { categories, productCategory, createCategory, deleteCategory, editCategory, category, categoriesClient } from './modules/category/category.controller'
import { createOrder, orderByOrderId, ordersByUserId } from './modules/order/order.controller'
import { createProduct, deleteImage, deleteProduct, editProduct, featureProducts, product, productBySlug, products, reviewRating, sortAttributes } from './modules/product/product.controller'
import { login, logout, me, register, revokeToken } from './modules/user/user.controller'

const router = Router()

router
  .get('/categories', categories)
  .get('/categories-list', categoriesClient)
  .get('/category', category)
  .post(
    '/category',
    isAuth,
    checkPermission,
    uploadFile.any(),
    formatFile,
    [body('categoryName').notEmpty(), body('images').notEmpty()],
    validate,
    createCategory
  )
  .patch(
    '/category',
    isAuth,
    checkPermission,
    uploadFile.any(),
    formatFile,
    [body('categoryId').notEmpty().isMongoId(), body('categoryName').notEmpty()],
    validate,
    editCategory
  )
  .delete('/category', body('categoryId').notEmpty(), deleteCategory)

router
  .get('/feature-products', featureProducts)
  .get('/products', products)
  .get('/product-id', product)
  .get('/product', productBySlug)
  .get('/product-category', productCategory)
  .post('/sort-attribute', sortAttributes)
  .post('/product',
    uploadFile.any(), formatFile,
    [
      body('productName').notEmpty(),
      body('categoryId').notEmpty().isMongoId(),
      body('description').notEmpty(),
      body('price').notEmpty(),
      body('salePrice').notEmpty()
    ],
    validate,
    createProduct)
  .post('/review-product', isAuth, [body('productId').notEmpty(), body('rating').notEmpty().isInt({ min: 1, max: 5 })], validate, reviewRating)
  .patch('/product', uploadFile.any(), formatFile,
    [
      body('productId').notEmpty().isMongoId(),
      body('productName').notEmpty(),
      body('categoryId').notEmpty().isMongoId(),
      body('description').notEmpty(),
      body('price').notEmpty(),
      body('salePrice').notEmpty()
    ],
    validate,
    editProduct)
  .delete('/product',
    isAuth,
    checkPermission,
    body('productId').notEmpty(),
    validate,
    deleteProduct
  )
  .delete('/delete-product-images',
    isAuth,
    checkPermission,
    [body('productId').notEmpty(), body('attributeId').notEmpty()],
    validate,
    deleteImage
  )

router
  .get('/cart', isAuth, cart)
  .post('/add-to-cart',
    isAuth,
    [
      body('productId').notEmpty().isMongoId(),
      body('size').notEmpty(),
      body('color').notEmpty(),
      body('quantity').notEmpty()
    ],
    addToCart)
  .patch('/update-cart', isAuth, updateProductCart)
  .delete('/delete-cart', isAuth, deleteProductCart)

router
  .post('/revoke-token', body('userId').isMongoId(), validate, revokeToken)
  .get('/me', isAuth, me)
  .post('/register', [
    body('name').notEmpty(),
    body('email').notEmpty(),
    body('username').notEmpty(),
    body('password').notEmpty()
  ], register)
  .post('/login', [
    body('username').notEmpty(),
    body('password').notEmpty()
  ], login)
  .post('/logout', logout)

router
  .get('/order-user', isAuth, ordersByUserId)
  .post('/order-id', isAuth, orderByOrderId)
  .post('/create-order', isAuth, createOrder)

export default router