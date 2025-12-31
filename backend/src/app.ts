import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { testConnection } from './config/database';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置响应Content-Type为UTF-8
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, '../public')));

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'E-Stone API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'E-Stone 商城 API 文档'
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || 'http://localhost:3001',
        description: '开发服务器'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);



// 健康检查
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'E-Stone API is running' });
});

// 初始化数据库
async function init() {
  await testConnection();
}

init();

export default app;
