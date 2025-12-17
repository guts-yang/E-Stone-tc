import React from 'react';
import { Card, List, Button, Typography, Empty, Row, Col, InputNumber } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';
import { increaseQuantity, decreaseQuantity, setQuantity, removeFromCart } from '../redux/cartSlice';

const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { items = [] } = cart || {};

  // 计算总价
  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  return (
    <div className="cart-page">
      <Title level={2}>购物车</Title>
      
      <Row gutter={[16, 16]}>
        {/* 购物车商品列表 */}
        <Col span={16}>
          {items.length > 0 ? (
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => dispatch(removeFromCart({ itemId: item.id }))}
                    >
                      删除
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.product?.name}
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>价格: ¥{item.price}</div>
                        <div>
                          <Text>数量: </Text>
                          <InputNumber
                            min={1}
                            value={item.quantity}
                            onChange={(value) => {
                              if (value !== undefined) {
                                dispatch(setQuantity({ itemId: item.id, quantity: value }));
                              }
                            }}
                            style={{ width: 80, margin: '0 16px' }}
                          />
                          <Button
                            type="text"
                            onClick={() => dispatch(decreaseQuantity({ itemId: item.id }))}
                          >
                            -1
                          </Button>
                          <Button
                            type="text"
                            onClick={() => dispatch(increaseQuantity({ itemId: item.id }))}
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              bordered
            />
          ) : (
            <Card>
              <Empty description="购物车是空的" />
            </Card>
          )}
        </Col>
        
        {/* 购物车结算 */}
        <Col span={8}>
          <Card title="结算信息">
            <div style={{ marginBottom: 16 }}>
              <Text strong>商品总数: </Text>
              <Text>{items.length} 件</Text>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Text strong>总价格: </Text>
              <Text style={{ fontSize: 20, color: '#ff4d4f' }}>¥{totalPrice.toFixed(2)}</Text>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block 
              disabled={items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              去结算
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Cart;