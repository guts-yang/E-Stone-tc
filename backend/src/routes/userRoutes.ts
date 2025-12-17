import { Router } from 'express';
import { body, param } from 'express-validator';
import { auth, admin } from '../middleware/auth';
import {
  register,
  login,
  getCurrentUser,
  updateUser,
  changePassword,
  logout,
  getAllUsers,
  getUser,
  updateUserStatus
} from '../controllers/userController';

const router = Router();

// 用户注册路由
router.post('/register', [
  body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3到50个字符之间'),
  body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式无效'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码长度必须至少为6个字符'),
  body('name').notEmpty().withMessage('姓名不能为空').isLength({ max: 100 }).withMessage('姓名长度不能超过100个字符'),
  body('phone').optional().isLength({ max: 20 }).withMessage('电话号码长度不能超过20个字符'),
  body('address').optional().isLength({ max: 500 }).withMessage('地址长度不能超过500个字符')
], register);

// 用户登录路由
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], login);

// 获取当前用户信息路由
router.get('/me', auth, getCurrentUser);

// 更新用户信息路由
router.put('/me', [
  auth,
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3到50个字符之间'),
  body('email').optional().isEmail().withMessage('邮箱格式无效'),
  body('name').optional().isLength({ max: 100 }).withMessage('姓名长度不能超过100个字符'),
  body('phone').optional().isLength({ max: 20 }).withMessage('电话号码长度不能超过20个字符'),
  body('address').optional().isLength({ max: 500 }).withMessage('地址长度不能超过500个字符')
], updateUser);

// 更改密码路由
router.put('/change-password', [
  auth,
  body('oldPassword').notEmpty().withMessage('旧密码不能为空'),
  body('newPassword').notEmpty().withMessage('新密码不能为空').isLength({ min: 6 }).withMessage('新密码长度必须至少为6个字符')
], changePassword);

// 用户注销路由
router.post('/logout', auth, logout);

// 获取所有用户路由（管理员）
router.get('/', [auth, admin], getAllUsers);

// 获取单个用户路由（管理员）
router.get('/:id', [
  auth,
  admin,
  param('id').isInt().withMessage('用户ID必须是整数')
], getUser);

// 更新用户状态路由（管理员）
router.put('/:id/status', [
  auth,
  admin,
  param('id').isInt().withMessage('用户ID必须是整数'),
  body('status').notEmpty().withMessage('状态不能为空')
], updateUserStatus);

export default router;