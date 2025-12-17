import { sequelize } from './src/config/database';
import Category from './src/models/Category';
import Product, { ProductStatus } from './src/models/Product';
import ProductImage from './src/models/ProductImage';
import User, { UserRole, UserStatus } from './src/models/User';
import UserProfile from './src/models/UserProfile';
import Cart from './src/models/Cart';

// 种子数据
const seedData = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('Connected to database successfully!');

    // 只同步产品相关表，跳过用户表结构修改
    await Category.sync({ force: false, alter: true });
    await Product.sync({ force: false, alter: true });
    await ProductImage.sync({ force: false, alter: true });
    console.log('Database tables synced!');

    // 创建管理员用户
    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Lcy@20050210';
    
    let adminUser = await User.findOne({ where: { username: adminUsername } });
    if (!adminUser) {
      adminUser = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE
      });
      console.log('管理员用户创建成功:', adminUser.username);

      // 创建管理员用户资料
      await UserProfile.create({
        userId: adminUser.id,
        name: '管理员',
        phone: '13800138000',
        address: '中国',
        city: '',
        province: '',
        postalCode: '',
        country: '中国'
      });
      console.log('管理员用户资料创建成功!');

      // 创建管理员购物车
      await Cart.create({
        userId: adminUser.id,
        totalAmount: 0
      });
      console.log('管理员购物车创建成功!');
    } else {
      console.log('管理员用户已存在，跳过创建!');
    }

    // 创建商品分类
    await Category.bulkCreate([
      { name: '蓝牙耳机', description: '各类蓝牙耳机产品' },
      { name: '游戏键盘', description: '各类游戏键盘产品' },
      { name: '智能手机', description: '各类智能手机产品' },
      { name: '无线耳机', description: '各类无线耳机产品' },
      { name: '服装', description: '各类服装产品' }
    ], { ignoreDuplicates: true });
    console.log('Categories created!');

    // 创建服装分类（确保存在）
    let clothingCategory = await Category.findOne({ where: { name: '服装' } });
    if (!clothingCategory) {
      clothingCategory = await Category.create({
        name: '服装',
        description: '各类服装产品'
      });
      console.log('服装分类创建成功!');
    }

    // 检查是否已存在服装商品
    const existingClothingProduct = await Product.findOne({ where: { name: '韩系穿搭高定轻奢水貂毛外套' } });
    if (!existingClothingProduct) {
      // 创建服装商品
      const clothingProduct = await Product.create({
        categoryId: clothingCategory.id,
        name: '韩系穿搭高定轻奢水貂毛外套',
        description: '冬季V领一体绒宽松加厚防寒皮草大衣，韩系穿搭风格，高定轻奢品质，水貂毛材质，保暖舒适。',
        price: 599,
        discountPrice: 399,
        stock: 30,
        status: ProductStatus.ACTIVE
      });
      console.log('服装商品创建成功:', clothingProduct.name);

      // 关联商品图片
      const clothingImages = ['5-1.jpg', '6.jpg', '7.jpg', '8.jpg'];
      for (const imageName of clothingImages) {
        await ProductImage.create({
          productId: clothingProduct.id,
          imageUrl: `/products/${imageName}`,
          isPrimary: imageName === clothingImages[0] // 第一个图片设为主图
        });
        console.log(`图片关联成功: ${imageName} 到 ${clothingProduct.name}`);
      }
    } else {
      console.log('服装商品已存在，跳过创建!');
    }

    console.log('Seed data created successfully!');
    await sequelize.close();
  } catch (error) {
    console.error('Error creating seed data:', error);
    await sequelize.close();
  }
};

// 执行种子数据脚本
seedData();
