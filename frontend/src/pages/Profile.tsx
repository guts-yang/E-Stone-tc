import React, { useEffect } from 'react';
import { Card, Tabs, Typography, List, Descriptions, Spin } from 'antd';
import { UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { getCurrentUser } from '../redux/userSlice';

const { Title } = Typography;

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.user);

  // 获取用户信息
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // 用户信息字段映射
  const userInfo = {
    username: user?.username || 'customer1',
    email: user?.email || '578165807@qq.com',
    phone: user?.phone || '13316899160',
    address: user?.address || '广东省广州市番禺区华南理工大学大学城校区'
  };

  // 模拟订单数据
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD202501010001',
      status: '待付款',
      totalPrice: 199.00,
      createdAt: '2025-01-01 10:00:00'
    },
    {
      id: 2,
      orderNumber: 'ORD202501020002',
      status: '已完成',
      totalPrice: 299.00,
      createdAt: '2025-01-02 14:30:00'
    }
  ];

  // 配置标签页
  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          用户信息
        </span>
      ),
      children: (
        <Card>
          <Descriptions title="基本信息" bordered>
            <Descriptions.Item label="用户名">{userInfo.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{userInfo.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{userInfo.phone}</Descriptions.Item>
            <Descriptions.Item label="地址">{userInfo.address}</Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <ShoppingOutlined />
          订单记录
        </span>
      ),
      children: (
        <List
          dataSource={orders}
          renderItem={(order) => (
            <List.Item key={order.id}>
              <List.Item.Meta
                title={
                  <Link to={`/orders/${order.id}`}>{order.orderNumber}</Link>
                }
                description={`状态: ${order.status} | 总价: ¥${order.totalPrice} | 下单时间: ${order.createdAt}`}
              />
            </List.Item>
          )}
          bordered
        />
      ),
    },
  ];

  return (
    <div className="profile-page">
      <Title level={2}>个人主页</Title>
      
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Spin>
    </div>
  );
};

export default Profile;