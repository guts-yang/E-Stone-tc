import app from './app';
import { sequelize } from './config/database';

// 服务器端口
const PORT = process.env.PORT || 3001;

// 同步数据库模型并启动服务器
async function startServer() {
  try {
    // 同步数据库模型
    await sequelize.sync({
      force: false, // 生产环境中应为false，开发环境中可以设置为true（会删除并重建表）
      alter: false  // 禁用自动修改表结构，避免重复添加约束
    });
    console.log('数据库模型同步成功！');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器已启动，监听端口 ${PORT}...`);
      console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
      console.log(`健康检查地址: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();