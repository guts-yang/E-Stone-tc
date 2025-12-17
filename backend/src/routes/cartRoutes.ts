import { Router } from 'express';
import { body, param } from 'express-validator';
import { auth } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';

const router = Router();

// 获取购物车内容
router.get('/', auth, getCart);

// 添加商品到购物车
router.post('/', [
  auth,
  body('productId').notEmpty().withMessage('商品ID不能为空').isInt().withMessage('商品ID必须是整数'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('商品数量必须大于等于1')
], addToCart);

// 更新购物车商品数量
router.put('/items/:itemId', [
  auth,
  param('itemId').isInt().withMessage('购物车商品ID必须是整数'),
  body('quantity').notEmpty().withMessage('商品数量不能为空').isInt({ min: 1 }).withMessage('商品数量必须大于等于1')
], updateCartItem);

// 删除购物车商品
router.delete('/items/:itemId', [
  auth,
  param('itemId').isInt().withMessage('购物车商品ID必须是整数')
], removeFromCart);

// 清空购物车
router.delete('/', auth, clearCart);

export default router;