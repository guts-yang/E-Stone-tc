import React, { useEffect } from 'react';
import { Carousel, Card, Row, Col, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { addToCart } from '../redux/cartSlice';
import { getProducts } from '../redux/productSlice';

// 导入商品图片
import product1Image from '../assets/products/product-1-01.jpg';
import product2Image from '../assets/products/buds-2.jpg';
import product3Image from '../assets/products/buds3-1.jpg';
import product4Image from '../assets/products/product-4-01.jpg';
import productSpeakerImage from '../assets/products/speaker-1.jpg';

// 导入轮播图图片
import carousel1 from '../assets/carousel/1.png';
import carousel2 from '../assets/carousel/2.png';

const { Meta } = Card;

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.product);

  // 页面加载时获取商品列表
  useEffect(() => {
    dispatch(getProducts() as any);
  }, [dispatch]);

  // 轮播图数据
  const carouselItems = [
    {
      id: 1,
      image: carousel1,
      title: '夏季大促销',
      description: '全场商品5折起，机不可失！'
    },
    {
      id: 2,
      image: carousel2,
      title: '新品上市',
      description: '最新款电子产品，抢先体验！'
    }
  ];

  // 推荐商品数据 - 使用从API获取的商品，或者默认商品
  const recommendedProducts = products.length > 0 ? 
    products.slice(0, 4) : 
    [
      {
        id: 1,
        name: '科大讯飞AI会议耳机 iFLYBUDS Pro',
        price: 1599,
        discountPrice: 1399,
        image: product2Image
      },
      {
        id: 2,
        name: 'Sony WH-1000XM5 头戴式智能降噪耳机（铂金银）',
        price: 2999,
        discountPrice: 2499,
        image: product4Image
      },
      {
        id: 3,
        name: 'Samsung Galaxy Buds3 三星蓝牙耳机',
        price: 999,
        discountPrice: 899,
        image: product3Image
      },
      {
        id: 4,
        name: '高保真无线蓝牙音箱（支持AAC/aptX解码）',
        price: 1299,
        discountPrice: 999,
        image: productSpeakerImage
      }
    ];

  // 加入购物车处理函数
  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      product
    }));
    message.success('商品已成功加入购物车');
  };

  return (
    <div>
      {/* 轮播图 */}
      <Carousel autoplay style={{ margin: '0 0 30px 0', padding: 0, width: '100%', overflow: 'hidden', background: 'transparent', border: 'none' }}>
        {carouselItems.map(item => (
          <div key={item.id} style={{ position: 'relative', width: '100%', aspectRatio: '900/383', overflow: 'hidden', background: 'transparent', margin: 0, padding: 0 }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', background: 'transparent', display: 'block', margin: 0, padding: 0 }}
            />
          </div>
        ))}
      </Carousel>

      {/* 推荐商品 */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>推荐商品</h2>
        <Row gutter={[16, 16]}>
          {recommendedProducts.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <Card
                  hoverable
                  cover={<img alt={product.name} src={product.image} style={{ height: '200px', objectFit: 'cover' }} />}
                  actions={[
                    <span key="view">查看详情</span>,
                    <Button
                      type="text"
                      icon={<ShoppingCartOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      key="cart"
                    >
                      加入购物车
                    </Button>
                  ]}
                >
                  <Meta
                    title={
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {product.name}
                      </span>
                    }
                    description={
                      <div>
                        {product.discountPrice ? (
                          <div>
                            <span style={{ fontSize: '18px', color: '#ff4d4f', fontWeight: 'bold' }}>¥{product.discountPrice}</span>
                            <span style={{ marginLeft: '10px', fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>¥{product.price}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '18px', color: '#ff4d4f', fontWeight: 'bold' }}>¥{product.price}</span>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary" size="large">
            <Link to="/products" style={{ color: '#fff' }}>查看全部商品</Link>
          </Button>
        </div>
      </div>

      {/* 特色服务 */}
      <div style={{ marginBottom: '30px', backgroundColor: '#f0f2f5', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>我们的特色服务</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>品质保证</h3>
              <p style={{ margin: 0, color: '#666' }}>所有商品均经过严格质量检测</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>快速配送</h3>
              <p style={{ margin: 0, color: '#666' }}>全国范围内24小时发货</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>七天无理由退换</h3>
              <p style={{ margin: 0, color: '#666' }}>不满意随时退换，购物无忧</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
