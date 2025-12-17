import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Category, Product, ProductImage } from '../models';
import { ProductStatus } from '../models/Product';
import path from 'path';
import fs from 'fs';

// 获取商品列表
const getProducts = async (req: Request, res: Response) => {
  try {
    // 解析查询参数
    const {
      page = 1,
      limit = 10,
      categoryId,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const where: any = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (minPrice) {
      where.price = { ...where.price, [Op.gte]: Number(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, [Op.lte]: Number(maxPrice) };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    where.status = ProductStatus.ACTIVE;

    // 执行查询
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary']
        }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    return res.status(200).json({
      products,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      },
      message: '获取商品列表成功'
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取商品详情
const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 查找商品
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 更新商品浏览量
    product.viewCount += 1;
    await product.save();

    return res.status(200).json({
      product,
      message: '获取商品详情成功'
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 添加商品
const addProduct = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { name, description, price, discountPrice, stock, categoryId } = req.body;

    // 创建商品
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      stock,
      categoryId,
      status: ProductStatus.ACTIVE,
      viewCount: 0,
      soldCount: 0
    });

    return res.status(201).json({
      product,
      message: '添加商品成功'
    });
  } catch (error) {
    console.error('添加商品失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新商品
const updateProduct = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { id } = req.params;
    const { name, description, price, discountPrice, stock, categoryId, status } = req.body;

    // 查找商品
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 更新商品信息
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice) product.discountPrice = discountPrice;
    if (stock !== undefined) product.stock = stock;
    if (categoryId) product.categoryId = categoryId;
    if (status) product.status = status;

    await product.save();

    return res.status(200).json({
      product,
      message: '更新商品成功'
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 删除商品
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 查找商品及其关联的图片
    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'images' }]
    });
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 删除关联的图片文件和数据库记录
    for (const image of product.images) {
      // 构建图片文件路径
      const imagePath = path.join(__dirname, '../../', image.imageUrl.replace('/public/', 'public/'));
      
      // 删除图片文件
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // 删除数据库中的图片记录
      await image.destroy();
    }

    // 删除商品记录（物理删除）
    await product.destroy();

    return res.status(200).json({ message: '删除商品成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 上传商品图片
const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    // 查找商品
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    const uploadedImages: any[] = [];

    // 处理上传的图片
    for (const file of files) {
      // 生成图片URL，包含public前缀
      const imageUrl = `/public/products/${file.filename}`;
      
      // 创建商品图片记录
      const image = await ProductImage.create({
        productId: product.id,
        imageUrl,
        isPrimary: false
      });

      uploadedImages.push(image);
    }

    // 如果是第一张图片，设置为主要图片
    if (uploadedImages.length > 0) {
      const existingImages = await ProductImage.count({ where: { productId: product.id } });
      if (existingImages === uploadedImages.length) {
        const firstImage = uploadedImages[0];
        firstImage.isPrimary = true;
        await firstImage.save();
      }
    }

    return res.status(201).json({
      images: uploadedImages,
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('上传商品图片失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 设置主要商品图片
const setPrimaryImage = async (req: Request, res: Response) => {
  try {
    const { productId, imageId } = req.params;

    // 查找商品
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 查找图片
    const image = await ProductImage.findOne({ where: { id: imageId, productId } });
    if (!image) {
      return res.status(404).json({ message: '图片不存在' });
    }

    // 先将所有图片设置为非主要
    await ProductImage.update(
      { isPrimary: false },
      { where: { productId } }
    );

    // 设置当前图片为主要
    image.isPrimary = true;
    await image.save();

    return res.status(200).json({ message: '设置主要图片成功' });
  } catch (error) {
    console.error('设置主要商品图片失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 删除商品图片
const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const { productId, imageId } = req.params;

    // 查找图片
    const image = await ProductImage.findOne({ where: { id: imageId, productId } });
    if (!image) {
      return res.status(404).json({ message: '图片不存在' });
    }

    // 查找图片文件路径
    const imagePath = path.join(__dirname, '../../public', image.imageUrl);

    // 删除图片文件
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // 删除数据库记录
    await image.destroy();

    // 如果删除的是主要图片，设置另一张为主要
    const remainingImages = await ProductImage.findAll({ where: { productId } });
    if (remainingImages.length > 0) {
      const firstImage = remainingImages[0];
      firstImage.isPrimary = true;
      await firstImage.save();
    }

    return res.status(200).json({ message: '删除图片成功' });
  } catch (error) {
    console.error('删除商品图片失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取商品分类列表
const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'description']
        }
      ],
      where: {
        parentId: null
      }
    });

    return res.status(200).json({
      categories,
      message: '获取商品分类列表成功'
    });
  } catch (error) {
    console.error('获取商品分类列表失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 添加商品分类
const addCategory = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { name, description, parentId } = req.body;

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: '分类名称已存在' });
    }

    // 计算分类层级
    let level = 1;
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (parentCategory) {
        level = parentCategory.level + 1;
      }
    }

    // 创建分类
    const category = await Category.create({
      name,
      description,
      parentId,
      level
    });

    return res.status(201).json({
      category,
      message: '添加商品分类成功'
    });
  } catch (error) {
    console.error('添加商品分类失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新商品分类
const updateCategory = async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: '请求数据无效' });
    }

    const { id } = req.params;
    const { name, description, parentId } = req.body;

    // 查找分类
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 检查分类名称是否已被其他分类使用
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ message: '分类名称已存在' });
      }
      category.name = name;
    }

    if (description) category.description = description;
    if (parentId !== undefined) {
      category.parentId = parentId;
      // 重新计算分类层级
      if (parentId) {
        const parentCategory = await Category.findByPk(parentId);
        if (parentCategory) {
          category.level = parentCategory.level + 1;
        }
      } else {
        category.level = 1;
      }
    }

    await category.save();

    return res.status(200).json({
      category,
      message: '更新商品分类成功'
    });
  } catch (error) {
    console.error('更新商品分类失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 删除商品分类
const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 查找分类
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    // 检查是否有子分类
    const hasChildren = await Category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      return res.status(400).json({ message: '该分类下存在子分类，无法删除' });
    }

    // 检查是否有商品
    const hasProducts = await Product.count({ where: { categoryId: id } });
    if (hasProducts > 0) {
      return res.status(400).json({ message: '该分类下存在商品，无法删除' });
    }

    // 删除分类
    await category.destroy();

    return res.status(200).json({ message: '删除商品分类成功' });
  } catch (error) {
    console.error('删除商品分类失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

export {
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
};