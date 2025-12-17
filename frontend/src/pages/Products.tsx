import React, { useEffect } from 'react';
import { Card, Typography, Row, Col, Input, Button, Modal } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { getProducts } from '../redux/productSlice';
import product1Image from '../assets/products/product-1-01.jpg';
import product2Image from '../assets/products/product-2-01.jpg';
import product3Image from '../assets/products/product-3-01.jpg';
import product4Image from '../assets/products/product-4-01.jpg';
import product5Image from '../assets/products/5-1.jpg';

const { Title } = Typography;
const { Search } = Input;

const Products: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 获取商品列表和加载状态
  const { products, loading } = useSelector((state: RootState) => state.product);
  
  // 获取用户信息，判断是否为管理员
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // 页面加载时获取商品列表
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await dispatch(getProducts() as any);
        console.log('获取商品列表结果:', result);
      } catch (error) {
        console.error('获取商品列表失败:', error);
      }
    };
    fetchProducts();
  }, [dispatch]); // 当组件重新挂载时，确保重新获取商品列表
  


  // 推荐商品数据，与主页保持一致
  const recommendedProducts = [
    { id: 1, name: '智能手机', price: 2999, discountPrice: 2499, image: product1Image, category: '电子产品' },
    { id: 2, name: '无线耳机', price: 999, discountPrice: 799, image: product2Image, category: '电子产品' },
    { id: 3, name: '智能手表', price: 1599, discountPrice: 1299, image: product3Image, category: '电子产品' },
    { id: 4, name: '平板电脑', price: 3999, discountPrice: 3499, image: product4Image, category: '电子产品' },
    { id: 5, name: '韩系穿搭高定轻奢水貂毛外套', price: 3999, discountPrice: 3599, image: product5Image, category: '服装' }
  ];
  
  // 使用API返回的数据或推荐商品数据
  const displayProducts = products.length > 0 ? products : recommendedProducts;



  return (
    <div className="products-page">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>商品列表</Title>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Search
            placeholder="搜索商品"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 400 }}
          />
          {/* 只有管理员可以看到添加商品按钮 */}
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/add-product')}>
              添加商品
            </Button>
          )}
        </div>
      </div>
      
      <Row gutter={[16, 16]}>
        {loading ? (
          // 只在首次加载时显示加载状态，避免影响推荐商品显示
          Array.from({ length: 8 }).map((_, index) => (
            <Col span={6} key={index}>
              <Card loading={true} />
            </Col>
          ))
        ) : (
          displayProducts.map((product) => (
            <Col span={6} key={product.id}>
              <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={product.name} 
                      src={product.image || 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'} 
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <span key="detail">查看详情</span>
                  ]}
                >
                  <Card.Meta
                    title={product.name}
                    description={`¥${product.discountPrice || product.price}`}
                  />
                </Card>
              </Link>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Products;