# E-Stone 电子商务网站

## 学生信息

- **姓名**：廖晨扬
- **学号**：202330451061
- **专业**：计算机科学与技术
- **班级**：2023级计算机科学与技术2班

<img width="327" height="315" alt="image" src="https://github.com/user-attachments/assets/5cfc27af-aae2-4a96-9af9-cf05eef8ad8f" />
<img width="317" height="303" alt="image" src="https://github.com/user-attachments/assets/800a2cd2-95a6-4add-b99c-8474df35443f" />
<img width="291" height="281" alt="image" src="https://github.com/user-attachments/assets/c6088cf8-1c33-4b33-b3d0-0f0315ea1474" />

## 项目概述

E-Stone 是一个基于前后端分离架构的中文电子商务网站，提供完整的在线购物体验。它涵盖了商品展示、购物车管理、订单处理以及用户管理等核心功能，旨在提供一个流畅且安全的在线购物环境。

## 核心功能

- **商品管理**：列表展示、详情查看、分类浏览
- **购物车**：添加商品、修改数量、删除商品、清空购物车
- **订单系统**：创建订单、查看列表、查看详情、状态管理
- **用户中心**：注册、登录、个人资料管理、订单历史查询
- **支付功能**：支持微信支付和支付宝支付
- **邮件通知**：订单支付成功后自动发送邮件通知用户


## 技术栈

### 前端

- React ^19.2.0 - 前端框架
- TypeScript ~5.9.3 - 类型安全
- Vite ^7.2.4 - 构建工具
- Ant Design ^6.1.0 - UI 组件库
- Redux Toolkit ^2.11.1 - 状态管理
- React Router DOM ^7.10.1 - 路由管理
- Axios ^1.13.2 - HTTP 客户端

### 后端

- Node.js - 运行环境
- TypeScript ^5.6.3 - 类型安全
- Express ^4.21.0 - Web 框架
- MySQL - 数据库
- Sequelize ^6.37.3 - ORM 框架
- JWT ^9.0.2 - 身份认证
- bcrypt ^5.1.1 - 密码加密
- Nodemailer ^6.9.15 - 邮件服务

## 项目结构

```
E-Stone-tc/
├── backend/                # 后端代码
│   ├── src/               # TypeScript 源代码
│   ├── public/            # 静态资源
│   ├── .env               # 环境变量
│   ├── package.json       # 依赖配置
│   └── tsconfig.json      # TypeScript 配置
├── frontend/               # 前端代码
│   ├── src/               # 源代码
│   ├── public/            # 静态资源
│   ├── package.json       # 依赖配置
│   ├── tsconfig.json      # TypeScript 配置
│   └── vite.config.ts     # Vite 配置
└── README.md              # 项目文档
```

## 快速开始

### 前置要求

- Node.js 18+
- MySQL 8.0+
- Git

### 1. 克隆项目

```bash
git clone https://github.com/guts-yang/E-Stone-tc
cd E-Stone-tc
```

### 2. 后端配置

```bash
cd backend
npm install
cp .env.example .env
```

编辑 `.env` 文件，配置：
- 数据库连接信息
- 邮件服务（QQ SMTP）：
  ```
  SMTP_HOST=smtp.qq.com
  SMTP_PORT=587
  SMTP_USER=你的QQ邮箱地址
  SMTP_PASSWORD=QQ邮箱授权码（不是登录密码）
  ```

获取QQ邮箱授权码：设置 -> 账户 -> POP3/IMAP/SMTP服务 -> 开启POP3/SMTP服务 -> 生成授权码

### 3. 启动服务

```bash
# 后端开发服务器
cd backend
npm run dev

# 前端开发服务器（新终端）
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端：http://localhost:5173
- 后端：http://localhost:3001
- API 文档：http://localhost:3001/api-docs

## 更新日志

### v1.0.1（2025-12-16）

- 新增订单支付成功邮件通知功能
- 集成QQ SMTP邮件服务
- 修复邮件发送中的环境变量加载问题

### v1.0.0（2025-12-15）

- 初始版本发布
- 实现核心功能：商品管理、购物车、订单系统、用户中心
- 前后端分离架构
- 支持微信支付和支付宝支付
