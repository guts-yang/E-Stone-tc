import React, { useEffect } from 'react';
import { Card, Typography, Row, Col, Input, Button, Modal } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { getProducts } from '../redux/productSlice';
import product1Image from '../assets/products/product-1-01.jpg';
import product2Image from '../assets/products/iflytek-1.jpg';
import product3Image from '../assets/products/buds3-1.jpg';
import product4Image from '../assets/products/product-4-01.jpg';
import product5Image from '../assets/products/5-1.jpg';
import productSpeakerImage from '../assets/products/speaker-1.jpg';
import productTeaImage from '../assets/products/tea-set-1.jpg';

const { Title } = Typography;
const { Search } = Input;

const Products: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 从Redux store获取商品列表
  const { products, loading } = useSelector((state: RootState) => state.product);
  
  // 检查当前用户是否为管理员
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // 组件加载时获取商品列表
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
  }, [dispatch]); // 仅在组件挂载时执行一次
  


  // 静态推荐商品数据（当API无法加载时）
  const recommendedProducts = [
    { id: 1, name: 'Samsung Galaxy Buds1 三星蓝牙耳机', price: 1599, discountPrice: 1399, image: product2Image, category: '耳机' },
    { id: 2, name: 'Sony WH-1000XM5 头戴式智能降噪耳机（铂金银）', price: 2999, discountPrice: 2499, image: product4Image, category: '耳机' },
    { id: 3, name: 'Samsung Galaxy Buds3 三星蓝牙耳机', price: 999, discountPrice: 899, image: product3Image, category: '耳机' },
    { id: 4, name: '高保真无线蓝牙音箱（支持AAC/aptX解码）', price: 1299, discountPrice: 999, image: productSpeakerImage, category: '智能音箱' },
    { id: 5, name: '韩版高端水貂毛短款外套（冬季轻奢系列）', price: 3999, discountPrice: 3599, image: product5Image, category: '服饰' },
    { id: 6, name: '景德镇手工青花瓷茶具套装（6件套含茶盘）', price: 888, discountPrice: 688, image: productTeaImage, category: '家居日用' }
  ];
  
  // 优先显示API返回的商品
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
          {/* 仅管理员可见添加按钮 */}
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/add-product')}>
              添加商品
            </Button>
          )}
        </div>
      </div>
      
      <Row gutter={[16, 16]}>
        {loading ? (
          // 加载骨架屏
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
                      style={{ aspectRatio: '1/1', objectFit: 'cover', width: '100%' }}
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
