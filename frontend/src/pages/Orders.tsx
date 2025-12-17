import React from 'react';
import { Card, Typography, List, Button, Space, Divider, Empty, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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
    ]
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
    ]
  }
];

const Orders: React.FC = () => {
  const navigate = useNavigate();
  
  // 获取订单状态对应的标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '待付款':
        return 'warning';
      case '已完成':
        return 'success';
      case '已取消':
        return 'default';
      case '待发货':
        return 'processing';
      case '已发货':
        return 'processing';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="orders-page">
      <Title level={2}>我的订单</Title>
      
      <Space size="middle" style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}>
          返回个人主页
        </Button>
      </Space>
      
      {ordersDatabase.length === 0 ? (
        <Card>
          <Empty description="暂无订单" />
          <Space size="middle" style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate('/products')}>
              去购物
            </Button>
          </Space>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={ordersDatabase}
          renderItem={(order) => (
            <List.Item>
              <Card hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <Text strong>订单编号：{order.orderNumber}</Text>
                  </div>
                  <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <List
                  dataSource={order.items}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <List.Item.Meta
                        title={item.productName}
                        description={`数量: ${item.quantity} | 单价: ¥${item.price}`}
                      />
                      <Text>小计: ¥{item.quantity * item.price}</Text>
                    </List.Item>
                  )}
                />
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text>下单时间：{order.createdAt}</Text>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>订单总价：¥{order.totalPrice}</Text>
                  </div>
                </div>
                
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <Space size="middle">
                    <Button onClick={() => navigate(`/orders/${order.id}`)}>
                      查看详情
                    </Button>
                    {order.status === '待付款' && (
                      <Button type="primary">
                        立即付款
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Orders;