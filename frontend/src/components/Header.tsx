import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, Dropdown, Button } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { logout } from '../redux/userSlice';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { cart } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // 处理注销
  const handleLogout = () => {
    dispatch(logout());
  };

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">个人主页</Link>
    },
    {
      key: 'orders',
      label: <Link to="/orders">我的订单</Link>
    },
    {
      key: 'logout',
      label: (
        <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          退出登录
        </span>
      )
    }
  ];

  // 导航菜单配置
  const menuItems = [
    {
      key: '1',
      label: <Link to="/">首页</Link>
    },
    {
      key: '2',
      label: <Link to="/products">商品列表</Link>
    }
  ];

  return (
    <AntHeader className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Logo */}
      <div className="logo" style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#1890ff' }}>E-Stone商城</Link>
      </div>

      {/* 导航菜单 */}
      <Menu 
        mode="horizontal" 
        defaultSelectedKeys={['1']} 
        style={{ borderBottom: 0 }}
        items={menuItems}
      />

      {/* 购物车和用户菜单 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 购物车 */}
        <Link to="/cart" style={{ color: '#000' }}>
          <Badge count={cart?.items.length || 0} style={{ backgroundColor: '#1890ff' }}>
            <ShoppingCartOutlined style={{ fontSize: 20 }} />
          </Badge>
        </Link>

        {/* 用户菜单或登录按钮 */}
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
              <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <span style={{ display: { xs: 'none', sm: 'none', md: 'inline-block' } as any }}>
                {user?.username}
                {user?.role === 'admin' && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>(管理员)</span>}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />}>
              登录
            </Button>
          </Link>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;