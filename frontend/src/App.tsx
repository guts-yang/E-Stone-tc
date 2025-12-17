import React, { useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import './App.css';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from './redux/userSlice';
import type { AppDispatch } from './redux/store';

const { Content } = Layout;

// 主布局组件
const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '20px 50px' }}>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 应用启动时检查用户认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* 公共页面 */}
        <Route index element={<Home />} />
        {/* 商品列表页 */}
        <Route path="products" element={<Products />} />
        {/* 商品详情页 */}
        <Route path="product/:id" element={<ProductDetail />} />
        {/* 购物车页面 */}
        <Route path="cart" element={<Cart />} />
        {/* 结账页面 */}
        <Route path="checkout" element={<Checkout />} />
        {/* 个人主页 */}
        <Route path="profile" element={<Profile />} />
        {/* 订单列表页 */}
        <Route path="orders" element={<Orders />} />
        {/* 订单详情页 */}
        <Route path="orders/:id" element={<OrderDetail />} />
        {/* 管理员页面 */}
        <Route path="add-product" element={<AddProduct />} />
        <Route path="edit-product/:id" element={<EditProduct />} />
      </Route>
      {/* 登录页面，不需要主布局 */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;