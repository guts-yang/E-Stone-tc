import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// 扩展Request对象，添加user属性
interface AuthRequest extends Request {
  user?: any;
}

// JWT认证中间件
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('开始执行auth中间件...');
    
    // 获取Authorization头
    const authHeader = req.header('Authorization');
    console.log('Authorization头:', authHeader);
    
    if (!authHeader) {
      console.log('未提供认证令牌');
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    // 提取令牌
    const token = authHeader.replace('Bearer ', '');
    console.log('提取的令牌:', token);
    
    if (!token) {
      console.log('无效的认证令牌');
      return res.status(401).json({ message: '无效的认证令牌' });
    }

    // 验证令牌
    console.log('开始验证令牌...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('令牌验证成功，解码结果:', decoded);
    
    if (!decoded || typeof decoded === 'string') {
      console.log('无效的认证令牌（解码结果无效）');
      return res.status(401).json({ message: '无效的认证令牌' });
    }

    // 查找用户
    console.log('开始查询用户，userId:', decoded.userId);
    
    // 使用普通的findOne方法，而不是findByPk，可能更可靠
    const user = await User.findOne({
      where: { id: decoded.userId },
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
      raw: true // 获取原始JavaScript对象
    });
    
    // 添加详细调试日志
    console.log('User查询结果类型:', typeof user);
    console.log('User查询结果:', user);
    console.log('User.role:', user?.role);
    
    if (!user) {
      console.log('用户不存在');
      return res.status(401).json({ message: '用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    console.log('设置req.user成功:', req.user);
    console.log('req.user.role:', req.user.role);
    
    next();
  } catch (error) {
    console.error('auth中间件错误:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

// 管理员权限中间件
const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('开始执行admin中间件...');
    console.log('admin中间件req.user:', req.user);
    console.log('admin中间件req.user.role:', req.user?.role);
    
    // 检查用户是否存在
    if (!req.user) {
      console.log('admin中间件：用户未认证');
      return res.status(403).json({ message: '没有管理员权限' });
    }
    
    // 检查用户角色
    const userRole = req.user.role;
    console.log('用户角色:', userRole);
    
    if (userRole !== 'admin') {
      console.log('管理员权限验证失败:', userRole);
      return res.status(403).json({ message: '没有管理员权限' });
    }
    
    console.log('管理员权限验证成功:', userRole);
    next();
  } catch (error) {
    console.error('管理员权限验证错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export { auth, admin };