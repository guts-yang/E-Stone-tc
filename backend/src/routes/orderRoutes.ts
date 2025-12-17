import { Router } from 'express';
import { body, param } from 'express-validator';
import { auth, admin } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  payOrder,
  getOrderStats
} from '../controllers/orderController';

const router = Router();

// 创建订单
router.post('/', [
  auth,
  body('paymentMethod').notEmpty().withMessage('支付方式不能为空'),
  body('shippingAddress').notEmpty().withMessage('配送地址不能为空'),
  body('shippingPhone').notEmpty().withMessage('配送电话不能为空')
], createOrder);

// 获取订单列表
router.get('/', auth, getOrders);

// 获取订单详情
router.get('/:id', [
  auth,
  param('id').isInt().withMessage('订单ID必须是整数')
], getOrder);

// 更新订单状态（管理员）
router.put('/:id/status', [
  auth,
  admin,
  param('id').isInt().withMessage('订单ID必须是整数'),
  body('status').notEmpty().withMessage('订单状态不能为空')
], updateOrderStatus);

// 取消订单
router.put('/:id/cancel', [
  auth,
  param('id').isInt().withMessage('订单ID必须是整数')
], cancelOrder);

// 支付订单
router.put('/:id/pay', [
  auth,
  param('id').isInt().withMessage('订单ID必须是整数')
], payOrder);

// 获取订单统计（管理员）
router.get('/stats', [
  auth,
  admin
], getOrderStats);

export default router;