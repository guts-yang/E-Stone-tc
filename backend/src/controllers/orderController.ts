import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Sequelize from 'sequelize';
import { Cart, CartItem, Order, OrderItem, Product, User } from '../models';
import { OrderStatus, PaymentMethod } from '../models/Order';
import { ProductStatus } from '../models/Product';
import { sendOrderStatusUpdateEmail } from '../services/emailService';

// 创建订单
const createOrder = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const userId = req.user.id;
    const { paymentMethod, shippingAddress, shippingPhone, notes } = req.body;

    // 查找购物车
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: '购物车为空' });
    }

    // 检查所有商品库存
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `商品 ${product?.name || '未知商品'} 库存不足` });
      }
      if (product.status !== ProductStatus.ACTIVE) {
        return res.status(400).json({ message: `商品 ${product.name} 已下架` });
      }
    }

    // 开始事务
    const transaction = await Order.sequelize?.transaction();
    if (!transaction) {
      return res.status(500).json({ message: '无法创建事务' });
    }

    try {
      // 创建订单
      const order = await Order.create({
        userId,
        totalAmount: cart.totalAmount,
        status: OrderStatus.PENDING,
        paymentMethod,
        paymentStatus: false,
        shippingAddress,
        shippingPhone,
        notes
      }, { transaction });

      // 创建订单项
      for (const item of cart.items) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        }, { transaction });

        // 更新商品库存
        await Product.update(
          { 
            stock: item.product.stock - item.quantity,
            soldCount: item.product.soldCount + item.quantity
          },
          { 
            where: { id: item.productId },
            transaction 
          }
        );
      }

      // 清空购物车
      await CartItem.destroy({
        where: { cartId: cart.id },
        transaction
      });

      // 更新购物车总金额
      await Cart.update(
        { totalAmount: 0 },
        { where: { id: cart.id }, transaction }
      );

      // 提交事务
      await transaction.commit();

      // 返回订单信息
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items'
          }
        ]
      });

      res.status(201).json({
        order: createdOrder,
        message: '订单创建成功'
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取订单列表
const getOrders = async (req: any, res: Response) => {
  try {
    // 解析查询参数
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 构建查询条件
    const where: any = {};

    if (!isAdmin) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    // 执行查询
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.status(200).json({
      orders,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      },
      message: '获取订单列表成功'
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取订单详情
const getOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 查找订单
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限
    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ message: '没有权限访问该订单' });
    }

    res.status(200).json({
      order,
      message: '获取订单详情成功'
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新订单状态（管理员）
const updateOrderStatus = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }

    // 查找订单
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 更新订单状态
    order.status = status;
    
    // 如果订单状态变为已支付，更新支付状态
    if (status === OrderStatus.PAID) {
      order.paymentStatus = true;
    }

    await order.save();

    res.status(200).json({
      order,
      message: '更新订单状态成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 取消订单
const cancelOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 查找订单
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查权限
    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ message: '没有权限取消该订单' });
    }

    // 检查订单状态是否可取消
    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: '只有待处理状态的订单可以取消' });
    }

    // 开始事务
    const transaction = await Order.sequelize?.transaction();
    if (!transaction) {
      return res.status(500).json({ message: '无法创建事务' });
    }

    try {
      // 更新订单状态
      order.status = OrderStatus.CANCELLED;
      await order.save({ transaction });

      // 恢复商品库存
      for (const item of order.items) {
        await Product.update(
          { 
            stock: Sequelize.literal(`stock + ${item.quantity}`),
            soldCount: Sequelize.literal(`soldCount - ${item.quantity}`)
          },
          { 
            where: { id: item.productId },
            transaction 
          }
        );
      }

      // 提交事务
      await transaction.commit();

      res.status(200).json({
        order,
        message: '订单取消成功'
      });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 支付订单（模拟支付）
const payOrder = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查找订单和用户信息
    const order = await Order.findByPk(id);
    const user = await User.findByPk(userId);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查权限
    if (order.userId !== userId) {
      return res.status(403).json({ message: '没有权限支付该订单' });
    }

    // 检查订单状态
    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ message: '只有待处理状态的订单可以支付' });
    }

    // 模拟支付过程
    // 在实际项目中，这里应该调用支付网关API

    // 更新订单状态
    order.status = OrderStatus.PAID;
    order.paymentStatus = true;
    await order.save();

    // 发送支付成功邮件
    try {
      await sendOrderStatusUpdateEmail(
        user.email,
        `订单支付成功 - ${order.id}`,
        `<h1>订单支付成功</h1>
        <p>尊敬的 ${user.username}：</p>
        <p>您的订单 <strong>${order.id}</strong> 已成功支付！</p>
        <p>订单金额：<strong>¥${order.totalAmount.toFixed(2)}</strong></p>
        <p>支付方式：<strong>${order.paymentMethod === PaymentMethod.ALIPAY ? '支付宝' : '微信支付'}</strong></p>
        <p>我们将尽快为您安排发货。您可以登录我们的网站查看订单详情。</p>
        <p>感谢您的购买！</p>
        <p>-- E-Stone商城团队</p>`
      );
    } catch (emailError) {
      console.error('发送支付成功邮件失败:', emailError);
      // 邮件发送失败不影响订单支付流程
    }

    res.status(200).json({
      order,
      message: '订单支付成功'
    });
  } catch (error) {
    console.error('支付订单失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取订单统计（管理员）
const getOrderStats = async (req: any, res: Response) => {
  try {
    // 获取订单总数
    const totalOrders = await Order.count();
    
    // 获取待处理订单数
    const pendingOrders = await Order.count({ where: { status: OrderStatus.PENDING } });
    
    // 获取已支付订单数
    const paidOrders = await Order.count({ where: { status: OrderStatus.PAID } });
    
    // 获取已发货订单数
    const shippedOrders = await Order.count({ where: { status: OrderStatus.SHIPPED } });
    
    // 获取已完成订单数
    const deliveredOrders = await Order.count({ where: { status: OrderStatus.DELIVERED } });
    
    // 获取已取消订单数
    const cancelledOrders = await Order.count({ where: { status: OrderStatus.CANCELLED } });
    
    // 获取总销售额
    const totalSales = await Order.sum('totalAmount', {
      where: { status: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED] }
    });

    res.status(200).json({
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales: totalSales || 0
      },
      message: '获取订单统计成功'
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  payOrder,
  getOrderStats
};