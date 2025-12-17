import React from 'react';
import { Card, Typography, Descriptions, List, Button, Space, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

// 模拟订单数据
const ordersDatabase = [
  {
    id: 1,
    orderNumber: 'ORD202501010001',
    status: '待付款',
    totalPrice: 199.00,
    createdAt: '2025-01-01 10:00:00',
    items: [
      {
        id: 1,
        productName: '无线蓝牙耳机',
        quantity: 1,
        price: 199.00
      }
    ],
    shippingInfo: {
      name: '张三',
      phone: '13800138000',
      address: '北京市朝阳区'
    }
  },
  {
    id: 2,
    orderNumber: 'ORD202501020002',
    status: '已完成',
    totalPrice: 299.00,
    createdAt: '2025-01-02 14:30:00',
    items: [
      {
        id: 2,
        productName: '智能手表',
        quantity: 1,
        price: 299.00
      }
    ],
    shippingInfo: {
      name: '张三',
      phone: '13800138000',
      address: '北京市朝阳区'
    }
  }
];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 根据ID查找订单
  const order = ordersDatabase.find(o => o.id === Number(id));
  
  if (!order) {
    return (
      <div className="order-detail-page">
        <Title level={2}>订单详情</Title>
        <Card>
          <Text type="warning">未找到该订单</Text>
          <Space size="middle" style={{ marginTop: 16 }}>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}>
              返回个人主页
            </Button>
          </Space>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="order-detail-page">
      <Title level={2}>订单详情</Title>
      
      <Space size="middle" style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}>
          返回个人主页
        </Button>
      </Space>
      
      <Card title="订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="订单编号">{order.orderNumber}</Descriptions.Item>
          <Descriptions.Item label="订单状态">{order.status}</Descriptions.Item>
          <Descriptions.Item label="订单总价">¥{order.totalPrice}</Descriptions.Item>
          <Descriptions.Item label="下单时间">{order.createdAt}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="收货信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="收货人">{order.shippingInfo.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.shippingInfo.phone}</Descriptions.Item>
          <Descriptions.Item label="收货地址" span={2}>{order.shippingInfo.address}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="商品信息">
        <List
          dataSource={order.items}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={item.productName}
                description={`数量: ${item.quantity} | 单价: ¥${item.price}`}
              />
              <Text strong>小计: ¥{item.quantity * item.price}</Text>
            </List.Item>
          )}
          bordered
        />
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ fontSize: 16, marginRight: 8 }}>订单总价:</Text>
          <Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>¥{order.totalPrice}</Text>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail;