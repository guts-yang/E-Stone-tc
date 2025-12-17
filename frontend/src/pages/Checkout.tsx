import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Form, Input, Select, Divider, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cartSlice';
import { sendOrderEmail } from '../services/emailService';

const { Title, Text } = Typography;
const { Option } = Select;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { items = [] } = cart || {};
  
  // 计算总价
  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);

  // 支付方式状态管理
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    console.log('提交订单信息:', values);
    
    // 1. 创建订单数据
    const orderData = {
      ...values,
      totalPrice,
      items,
      paymentMethod,
      email: '578165807@qq.com' // 接收订单通知的邮箱
    };
    
    // 2. 调用创建订单的逻辑（示例）
    // 这里可以调用orderService.createOrder(orderData)
    console.log('创建订单:', orderData);
    
    // 3. 生成订单编号
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    
    // 4. 发送订单邮件通知
    const emailSent = await sendOrderEmail({
      to: '578165807@qq.com',
      subject: `订单确认：${orderNumber}`,
      orderNumber,
      totalPrice,
      items,
      paymentMethod,
      orderTime: new Date().toLocaleString(),
      shippingAddress: values.address,
      receiver: values.receiver,
      phone: values.phone
    });
    
    // 5. 清空购物车
    dispatch(clearCart());
    
    // 6. 提交成功后跳转到个人主页订单列表
    navigate('/profile');
    
    // 7. 显示成功消息
    if (emailSent) {
      message.success('订单提交成功！我们已发送邮件到您的邮箱，请查收。');
    } else {
      message.success('订单提交成功！但邮件发送失败，请稍后查看订单状态。');
    }
  };

  const [form] = Form.useForm();

  // 处理支付方式变化
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  return (
    <div className="checkout-page">
      <Title level={2}>订单确认</Title>
      
      <Row gutter={[16, 16]}>
        {/* 订单商品信息 */}
        <Col span={16}>
          <Card title="商品信息">
            {items.length > 0 ? (
              items.map(item => (
                <div key={item.id} style={{ marginBottom: 16, padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{item.product?.name}</Text>
                    <Text>¥{item.price}</Text>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Text>数量: {item.quantity}</Text>
                    <Text>小计: ¥{(item.price * item.quantity).toFixed(2)}</Text>
                  </div>
                </div>
              ))
            ) : (
              <Text type="secondary">购物车是空的，无法结账</Text>
            )}
          </Card>
          
          <Divider />
          
          <Card title="收货信息">
            <Form
              form={form}
              name="checkout-form"
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="收货人"
                    name="receiver"
                    rules={[{ required: true, message: '请输入收货人姓名' }]}
                  >
                    <Input placeholder="请输入收货人姓名" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="联系电话"
                    name="phone"
                    rules={[{ required: true, message: '请输入联系电话' }]}
                  >
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                label="收货地址"
                name="address"
                rules={[{ required: true, message: '请输入收货地址' }]}
              >
                <Input.TextArea placeholder="请输入详细收货地址" rows={4} />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="支付方式"
                    name="paymentMethod"
                    rules={[{ required: true, message: '请选择支付方式' }]}
                  >
                    <Select 
                      placeholder="请选择支付方式"
                      onChange={handlePaymentMethodChange}
                    >
                      <Option value="alipay">支付宝</Option>
                      <Option value="wechat">微信支付</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="配送方式"
                    name="shippingMethod"
                    rules={[{ required: true, message: '请选择配送方式' }]}
                  >
                    <Select placeholder="请选择配送方式">
                      <Option value="standard">标准配送</Option>
                      <Option value="express">加急配送</Option>
                      <Option value="same-day">当日达</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            {/* 收款码展示区域 */}
            {paymentMethod && (
              <Card title="收款码" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text strong style={{ display: 'block', marginBottom: 16 }}>
                    {paymentMethod === 'alipay' && '支付宝收款码'}
                    {paymentMethod === 'wechat' && '微信支付收款码'}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={`/payment-qrcode-${paymentMethod}.jpg`} 
                      alt={`${paymentMethod}收款码`} 
                      style={{ 
                        width: '250px', 
                        height: '250px', 
                        objectFit: 'contain',
                        border: '1px solid #f0f0f0',
                        padding: '10px',
                        borderRadius: '8px'
                      }} 
                      onError={(e) => {
                        // 图片加载失败时显示提示
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        message.warning(`未找到${paymentMethod}收款码图片，请上传正确的图片文件`);
                      }}
                    />
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                    请使用手机扫描上方二维码完成支付
                  </Text>
                </div>
              </Card>
            )}
          </Card>
        </Col>
        
        {/* 订单结算 */}
        <Col span={8}>
          <Card title="订单总计">
            <div style={{ marginBottom: 16 }}>
              <Text strong>商品总数: </Text>
              <Text>{items.length} 件</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>商品总价: </Text>
              <Text style={{ fontSize: 16, color: '#ff4d4f' }}>¥{totalPrice.toFixed(2)}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>运费: </Text>
              <Text>¥0.00</Text>
            </div>
            <Divider />
            <div style={{ marginBottom: 24 }}>
              <Text strong>订单总计: </Text>
              <Text style={{ fontSize: 20, color: '#ff4d4f' }}>¥{totalPrice.toFixed(2)}</Text>
            </div>
            <Button 
              type="primary" 
              size="large" 
              block 
              disabled={items.length === 0}
              onClick={() => {
                // 调用表单提交
                form?.submit();
              }}
            >
              提交订单
            </Button>
            <Button 
              size="large" 
              block 
              style={{ marginTop: 12 }}
              onClick={() => navigate('/cart')}
            >
              返回购物车
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
