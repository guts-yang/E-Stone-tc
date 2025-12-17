import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Cart, CartItem, Product } from '../models';

// 获取购物车内容
const getCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

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
              as: 'product',
              attributes: ['id', 'name', 'price', 'discountPrice']
            }
          ]
        }
      ]
    });

    if (!cart) {
      return res.status(404).json({ message: '购物车不存在' });
    }

    return res.status(200).json({
      cart,
      message: '获取购物车成功'
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 添加商品到购物车
const addToCart = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // 查找商品
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 检查商品库存
    if (product.stock < quantity) {
      return res.status(400).json({ message: '商品库存不足' });
    }

    // 查找或创建购物车
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({
        userId,
        totalAmount: 0
      });
    }

    // 检查商品是否已在购物车中
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (cartItem) {
      // 更新商品数量
      cartItem.quantity += quantity;
      // 检查更新后的数量是否超过库存
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ message: '商品库存不足' });
      }
      await cartItem.save();
    } else {
      // 创建新的购物车商品项
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.discountPrice || product.price
      });
    }

    // 更新购物车总金额
    await updateCartTotal(cart.id);

    // 返回更新后的购物车
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'discountPrice']
            }
          ]
        }
      ]
    });

    return res.status(201).json({
      cart: updatedCart,
      message: '商品已添加到购物车'
    });
  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新购物车商品数量
const updateCartItem = async (req: any, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // 查找购物车
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: '购物车不存在' });
    }

    // 查找购物车商品项
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }

    // 查找商品
    const product = await Product.findByPk(cartItem.productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 检查商品库存
    if (product.stock < quantity) {
      return res.status(400).json({ message: '商品库存不足' });
    }

    // 更新商品数量
    cartItem.quantity = quantity;
    await cartItem.save();

    // 更新购物车总金额
    await updateCartTotal(cart.id);

    // 返回更新后的购物车
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'discountPrice']
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      cart: updatedCart,
      message: '购物车商品更新成功'
    });
  } catch (error) {
    console.error('更新购物车商品失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 删除购物车商品
const removeFromCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // 查找购物车
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: '购物车不存在' });
    }

    // 查找购物车商品项
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }

    // 删除购物车商品项
    await cartItem.destroy();

    // 更新购物车总金额
    await updateCartTotal(cart.id);

    // 返回更新后的购物车
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'discountPrice']
            }
          ]
        }
      ]
    });

    return res.status(200).json({
      cart: updatedCart,
      message: '购物车商品删除成功'
    });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 清空购物车
const clearCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // 查找购物车
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: '购物车不存在' });
    }

    // 删除购物车所有商品项
    await CartItem.destroy({ where: { cartId: cart.id } });

    // 更新购物车总金额
    cart.totalAmount = 0;
    await cart.save();

    return res.status(200).json({
      cart,
      message: '购物车清空成功'
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新购物车总金额
const updateCartTotal = async (cartId: number) => {
  // 查找购物车所有商品项
  const cartItems = await CartItem.findAll({ where: { cartId } });

  // 计算总金额
  let totalAmount = 0;
  for (const item of cartItems) {
    totalAmount += item.price * item.quantity;
  }

  // 更新购物车总金额
  await Cart.update(
    { totalAmount },
    { where: { id: cartId } }
  );
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};