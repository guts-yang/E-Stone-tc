import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User, UserProfile, Cart } from '../models';
import { UserRole, UserStatus } from '../models/User';

// 用户注册
const register = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { username, email, password, name, phone, address } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已存在' });
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE
    });

    // 创建用户资料
    await UserProfile.create({
      userId: user.id,
      name,
      phone,
      address,
      city: '',
      province: '',
      postalCode: '',
      country: '中国'
    });

    // 创建购物车
    await Cart.create({
      userId: user.id,
      totalAmount: 0
    });

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET! as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as any
    );

    // 返回用户信息和令牌
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 用户登录
const login = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 检查用户状态
    if (user.status === UserStatus.INACTIVE) {
      return res.status(403).json({ message: '账户已被禁用' });
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET! as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as any
    );

    // 返回用户信息和令牌
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req: any, res: Response) => {
  try {
    // 从请求对象中获取用户ID
    const userId = req.user.id;

    // 查找用户信息
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    return res.status(200).json({
      user,
      message: '获取用户信息成功'
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户信息
const updateUser = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    // 从请求对象中获取用户ID
    const userId = req.user.id;
    const { username, email, name, phone, address } = req.body;

    // 更新用户基本信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      user.username = username;
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: '邮箱已存在' });
      }
      user.email = email;
    }

    await user.save();

    // 更新用户资料
    const profile = await UserProfile.findOne({ where: { userId } });
    if (profile) {
      if (name) profile.name = name;
      if (phone) profile.phone = phone;
      if (address) profile.address = address;
      await profile.save();
    }

    // 返回更新后的用户信息
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    return res.status(200).json({
      user: updatedUser,
      message: '更新用户信息成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更改密码
const changePassword = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证旧密码
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 用户注销
const logout = async (_req: any, res: Response) => {
  try {
    // JWT是无状态的，客户端删除令牌即可
    return res.status(200).json({ message: '注销成功' });
  } catch (error) {
    console.error('注销失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取所有用户（管理员）
const getAllUsers = async (_req: any, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      users,
      message: '获取用户列表成功'
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个用户（管理员）
const getUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    return res.status(200).json({
      user,
      message: '获取用户信息成功'
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户状态（管理员）
const updateUserStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    if (!Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ message: '无效的状态值' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      message: '更新用户状态成功'
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

export {
  register,
  login,
  getCurrentUser,
  updateUser,
  changePassword,
  logout,
  getAllUsers,
  getUser,
  updateUserStatus
};