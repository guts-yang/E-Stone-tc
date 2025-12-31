import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// 配置环境变量
dotenv.config();

// 创建Sequelize实例
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'e_stone_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  dialectOptions: {
    charset: 'utf8mb4',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！');
  } catch (error) {
    console.error('无法连接到数据库:', error);
    process.exit(1);
  }
};

export { sequelize, testConnection };
