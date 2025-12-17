import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { auth, admin } from '../middleware/auth';
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  setPrimaryImage,
  deleteProductImage,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '../controllers/productController';

// 配置multer文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/products');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = Router();

// 获取商品列表
router.get('/', getProducts);

// 获取商品详情
router.get('/:id', [
  param('id').isInt().withMessage('商品ID必须是整数')
], getProduct);

// 添加商品（管理员）
router.post('/', [
  auth,
  admin,
  body('name').notEmpty().withMessage('商品名称不能为空').isLength({ max: 200 }).withMessage('商品名称长度不能超过200个字符'),
  body('description').notEmpty().withMessage('商品描述不能为空'),
  body('price').notEmpty().withMessage('商品价格不能为空').isFloat({ min: 0 }).withMessage('商品价格必须大于等于0'),
  body('discountPrice').optional().isFloat({ min: 0 }).withMessage('商品折扣价格必须大于等于0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('商品库存必须大于等于0'),
  body('categoryId').notEmpty().withMessage('商品分类不能为空').isInt().withMessage('分类ID必须是整数')
], addProduct);

// 更新商品（管理员）
router.put('/:id', [
  auth,
  admin,
  param('id').isInt().withMessage('商品ID必须是整数'),
  body('name').optional().isLength({ max: 200 }).withMessage('商品名称长度不能超过200个字符'),
  body('price').optional().isFloat({ min: 0 }).withMessage('商品价格必须大于等于0'),
  body('discountPrice').optional().isFloat({ min: 0 }).withMessage('商品折扣价格必须大于等于0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('商品库存必须大于等于0'),
  body('categoryId').optional().isInt().withMessage('分类ID必须是整数')
], updateProduct);

// 删除商品（管理员）
router.delete('/:id', [
  auth,
  admin,
  param('id').isInt().withMessage('商品ID必须是整数')
], deleteProduct);

// 上传商品图片（管理员）
router.post('/:id/images', [
  auth,
  admin,
  param('id').isInt().withMessage('商品ID必须是整数'),
  upload.array('images', 10)
], uploadProductImage);

// 设置主要商品图片（管理员）
router.put('/:productId/images/:imageId/primary', [
  auth,
  admin,
  param('productId').isInt().withMessage('商品ID必须是整数'),
  param('imageId').isInt().withMessage('图片ID必须是整数')
], setPrimaryImage);

// 删除商品图片（管理员）
router.delete('/:productId/images/:imageId', [
  auth,
  admin,
  param('productId').isInt().withMessage('商品ID必须是整数'),
  param('imageId').isInt().withMessage('图片ID必须是整数')
], deleteProductImage);

// 获取商品分类列表
router.get('/categories', getCategories);

// 添加商品分类（管理员）
router.post('/categories', [
  auth,
  admin,
  body('name').notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称长度不能超过100个字符'),
  body('parentId').optional().isInt().withMessage('父分类ID必须是整数')
], addCategory);

// 更新商品分类（管理员）
router.put('/categories/:id', [
  auth,
  admin,
  param('id').isInt().withMessage('分类ID必须是整数'),
  body('name').optional().isLength({ max: 100 }).withMessage('分类名称长度不能超过100个字符'),
  body('parentId').optional().isInt().withMessage('父分类ID必须是整数')
], updateCategory);

// 删除商品分类（管理员）
router.delete('/categories/:id', [
  auth,
  admin,
  param('id').isInt().withMessage('分类ID必须是整数')
], deleteCategory);

export default router;