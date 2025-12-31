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

    // 只同步产品相关表，强制重建以修复可能的乱码或结构问题
    // 注意：顺序很重要，先重建依赖表（子表），再重建被依赖表（父表），或者先禁用外键检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await ProductImage.sync({ force: true });
    await Product.sync({ force: true });
    await Category.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database tables synced (force rebuild)!');

    // 创建管理员用户
    const adminUsername = 'admin';
    const adminEmail = '578165807@qq.com';
    const adminPassword = 'Lcy@20050210';
    
    // 检查用户名或邮箱是否已存在
    let adminUser = await User.findOne({ 
      where: { 
        [Symbol.for('or') as any]: [
          { username: adminUsername },
          { email: adminEmail }
        ]
      } as any
    });
    
    if (!adminUser) {
      try {
        adminUser = await User.create({
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE
        });
        console.log('Admin user created:', adminUser.username);

        // 创建管理员用户资料
        await UserProfile.create({
          userId: adminUser.id,
          name: '管理员',
          phone: '13316899160',
          address: '中国',
          city: '广州',
          province: '广东省',
          postalCode: '510000',
          country: '中国'
        });
        console.log('Admin profile created!');

        // 创建管理员购物车
        await Cart.create({
          userId: adminUser.id,
          totalAmount: 0
        });
        console.log('Admin cart created!');
      } catch (error: any) {
        console.log('Error creating admin:', error.message);
        adminUser = await User.findOne({ where: { username: adminUsername } });
      }
    } else {
      console.log('Admin user exists, skipping!');
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

    // 获取所有分类
    const categories: Record<string, number> = {};
    const categoryList = await Category.findAll();
    for (const cat of categoryList) {
      categories[cat.name] = cat.id;
    }

    // 创建商品数据
    const productsData = [
      {
        categoryName: '蓝牙耳机',
        name: 'Samsung Galaxy Buds1 三星蓝牙耳机',
        description: '实时录音转文字，多语言翻译，AI智能摘要，45dB深度降噪，会议办公神器。',
        price: 1599,
        discountPrice: 1399,
        stock: 100,
        images: ['buds-2.jpg']
      },
      {
        categoryName: '蓝牙耳机',
        name: 'Sony WH-1000XM5 头戴式智能降噪耳机（铂金银）',
        description: '行业领先降噪技术，30小时续航，高解析度音频，支持多点连接。',
        price: 2999,
        discountPrice: 2499,
        stock: 50,
        images: ['headphones-1.jpg', 'headphones-2.jpg', 'headphones-3.jpg']
      },
      {
        categoryName: '无线耳机',
        name: 'Samsung Galaxy Buds3 三星蓝牙耳机',
        description: '开放式主动降噪，Hi-Fi高保真音质，AI智能翻译，舒适佩戴体验。',
        price: 999,
        discountPrice: 899,
        stock: 80,
        images: ['buds3-1.jpg']
      },
      {
        categoryName: '蓝牙耳机',
        name: '高保真无线蓝牙音箱（支持AAC/aptX解码）',
        description: '360度环绕立体声，超长续航，支持多种音频解码格式。',
        price: 1299,
        discountPrice: 999,
        stock: 60,
        images: ['speaker-1.jpg']
      },
      {
        categoryName: '游戏键盘',
        name: 'Logitech G Pro X 游戏机械键盘',
        description: '可更换微动，Doubleshot PBT键帽，LIGHTSYNC RGB灯效。',
        price: 899,
        discountPrice: 799,
        stock: 80,
        images: ['keyboard-logitech-1.jpg', 'keyboard-logitech-2.jpg']
      },
      {
        categoryName: '智能手机',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'AI智能助手，钛金属边框，200MP主摄，S Pen手写笔。',
        price: 8999,
        discountPrice: 7999,
        stock: 35,
        images: ['samsung-1.jpg', 'samsung-2.jpg', 'samsung-3.jpg']
      },
      {
        categoryName: '无线耳机',
        name: 'AirPods Pro 第二代',
        description: '自适应音频，个性化空间音频，H2芯片，主动降噪。',
        price: 1899,
        discountPrice: 1699,
        stock: 100,
        images: ['airpods-1.jpg', 'airpods-2.jpg', 'airpods-3.jpg']
      },
      {
        categoryName: '无线耳机',
        name: 'Samsung Galaxy Buds2 Pro',
        description: '24bit高保真音质，智能主动降噪，舒适贴合设计。',
        price: 1299,
        discountPrice: 999,
        stock: 80,
        images: ['buds-1.jpg', 'buds-2.jpg']
      },
      {
        categoryName: '服装',
        name: '韩版高端水貂毛短款外套（冬季轻奢系列）',
        description: '冬季V领一体绒宽松加厚防寒皮草大衣，韩系穿搭风格，高定轻奢品质，水貂毛材质，保暖舒适。',
        price: 599,
        discountPrice: 399,
        stock: 30,
        images: ['5-1.jpg', '6.jpg', '7.jpg', '8.jpg']
      },
      {
        categoryName: '服装',
        name: '简约风宽松百搭休闲卫衣',
        description: '2024新款秋季卫衣，宽松版型，纯棉面料，简约设计，多色可选。',
        price: 199,
        discountPrice: 149,
        stock: 200,
        images: ['hoodie-1.jpg', 'hoodie-2.jpg']
      },
      {
        categoryName: '服装',
        name: '高腰显瘦直筒牛仔裤',
        description: '弹性面料，修饰腿型，高腰设计，经典百搭，时尚休闲。',
        price: 259,
        discountPrice: 199,
        stock: 150,
        images: ['jeans-1.jpg', 'jeans-2.jpg', 'jeans-3.jpg']
      },
      {
        categoryName: '服装',
        name: '景德镇手工青花瓷茶具套装（6件套含茶盘）',
        description: '传统工艺，手工绘制，高温烧制，具有极高的收藏价值和使用价值。',
        price: 888,
        discountPrice: 688,
        stock: 20,
        images: ['tea-set-1.jpg']
      }
    ];

    // 批量创建商品
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({ where: { name: productData.name } });
      if (!existingProduct && categories[productData.categoryName]) {
        const product = await Product.create({
          categoryId: categories[productData.categoryName],
          name: productData.name,
          description: productData.description,
          price: productData.price,
          discountPrice: productData.discountPrice,
          stock: productData.stock,
          status: ProductStatus.ACTIVE
        });
        console.log('Product created:', product.name);

        for (let i = 0; i < productData.images.length; i++) {
          const imageName = productData.images[i];
          await ProductImage.create({
            productId: product.id,
            imageUrl: `/public/products/${imageName}`,
            isPrimary: i === 0
          });
          console.log(`  Image attached: ${imageName}`);
        }
      } else if (existingProduct) {
        console.log('Product exists, skipping:', productData.name);
      }
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
