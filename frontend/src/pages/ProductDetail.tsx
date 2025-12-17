import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Descriptions, Image, List, message, Alert } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { addToCart } from '../redux/cartSlice';
import { getProduct, clearError } from '../redux/productSlice';

// 导入静态商品图片
import product1Image1 from '../assets/products/product-1-01.jpg';
import product1Image2 from '../assets/products/product-1-02.jpg';
import product1Image3 from '../assets/products/product-1-03.jpg';
import product1Image4 from '../assets/products/product-1-04.jpg';
import product2Image1 from '../assets/products/product-2-01.jpg';
import product2Image2 from '../assets/products/product-2-02.jpg';
import product2Image3 from '../assets/products/product-2-03.jpg';
import product3Image1 from '../assets/products/product-3-01.jpg';
import product3Image2 from '../assets/products/product-3-02.jpg';
import product3Image3 from '../assets/products/product-3-03.jpg';
import product4Image1 from '../assets/products/product-4-01.jpg';
import product4Image2 from '../assets/products/product-4-02.jpg';
import product4Image3 from '../assets/products/product-4-03.jpg';
import product4Image4 from '../assets/products/product-4-04.jpg';
// 导入新添加的服装产品图片
import product5Image1 from '../assets/products/5-1.jpg';
import product5Image2 from '../assets/products/6.jpg';
import product5Image3 from '../assets/products/7.jpg';
import product5Image4 from '../assets/products/8.jpg';
import product5Image from '../assets/products/5-1.jpg';
// 导入茶具套装图片
import product9Image1 from '../assets/products/茶具套装.jpg';
import product9Image2 from '../assets/products/茶具套装.jpg';
import product9Image3 from '../assets/products/茶具套装.jpg';
import product9Image4 from '../assets/products/茶具套装.jpg';


// 本地推荐商品数据（与 Products.tsx 保持一致，添加必要的属性）
const recommendedProducts = [
  { id: 1, name: '智能手机', price: 2999, discountPrice: 2499, image: product1Image1, images: [], category: '电子产品', description: '高端智能手机，配备强大处理器和高清摄像头', stock: 100, status: 'active', viewCount: 0, soldCount: 0, categoryId: 1 },
  { id: 2, name: '无线耳机', price: 999, discountPrice: 799, image: product2Image1, images: [], category: '电子产品', description: '高品质无线耳机，提供出色的音质和舒适的佩戴体验', stock: 200, status: 'active', viewCount: 0, soldCount: 0, categoryId: 2 },
  { id: 3, name: '智能手表', price: 1599, discountPrice: 1299, image: product3Image1, images: [], category: '电子产品', description: '多功能智能手表，监测健康数据和接收通知', stock: 150, status: 'active', viewCount: 0, soldCount: 0, categoryId: 3 },
  { id: 4, name: '平板电脑', price: 3999, discountPrice: 3499, image: product4Image1, images: [], category: '电子产品', description: '大屏幕平板电脑，适合工作和娱乐', stock: 80, status: 'active', viewCount: 0, soldCount: 0, categoryId: 4 },
  { id: 5, name: '韩系穿搭高定轻奢水貂毛外套', price: 3999, discountPrice: 3599, image: product5Image, images: [], category: '服装', description: '时尚韩系穿搭，高定轻奢水貂毛外套，保暖又美观', stock: 50, status: 'active', viewCount: 0, soldCount: 0, categoryId: 5 }
];

const { Title, Text } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // 从Redux store中获取商品列表、单个商品详情、加载状态和错误信息
  const { product, loading, error } = useSelector((state: RootState) => state.product);
  
  // 静态商品图片映射
  const staticProductImages: Record<number, string[]> = {
    1: [product1Image1, product1Image2, product1Image3, product1Image4],
    2: [product2Image1, product2Image2, product2Image3],
    3: [product3Image1, product3Image2, product3Image3],
    4: [product4Image1, product4Image2, product4Image3, product4Image4],
    5: [product5Image1, product5Image2, product5Image3, product5Image4],
    // 为ID 9添加静态图片映射，对应茶具套装
    9: [product9Image1, product9Image2, product9Image3, product9Image4],
    // 为ID 15添加静态图片映射，对应韩系穿搭高定轻奢水貂毛外套
    15: [product5Image1, product5Image2, product5Image3, product5Image4]
  };
  
  // 组件挂载时获取单个商品详情
  useEffect(() => {
    if (id) {
      const productId = Number(id);
      // 无论本地是否有商品，都调用API获取最新的商品详情
      dispatch(getProduct(productId));
    }
    
    // 清除之前的错误信息
    dispatch(clearError());
  }, [dispatch, id]);

  // 默认商品数据
  const defaultProduct = {
    id: 0,
    name: '商品不存在',
    price: 0,
    discountPrice: 0,
    description: '抱歉，该商品不存在或已被删除。',
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    images: [],
    stock: 0,
    category: ''
  };
  
  // 确定当前商品ID
  const productId = Number(id) || 0;
  
  // 先查找本地推荐商品
  const localProduct = recommendedProducts.find(p => p.id === productId);
  
  // 使用Redux中的商品详情，或本地推荐商品，或默认数据
  const currentProduct = product || localProduct || defaultProduct;
  
  // 默认图片URL
  const defaultImageUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
  
  // 确定要显示的图片列表
  let productImages: string[] = [];
  
  // 图片加载优先级：静态图片 > API返回图片 > 默认图片
  // 1. 优先使用静态图片
  if (staticProductImages[productId]) {
    productImages = staticProductImages[productId];
  }
  // 2. 其次使用API返回的图片数组
  else if (currentProduct.images && currentProduct.images.length > 0) {
    productImages = currentProduct.images.map((img: { imageUrl: string }) => img.imageUrl);
  }
  // 3. 如果没有图片数组，使用单张图片
  else if (currentProduct.image) {
    productImages = [currentProduct.image];
  }
  // 4. 最后使用默认图片
  else {
    productImages = [defaultImageUrl];
  }
  
  // 设置默认选中的图片
  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0]);
    }
  }, [productImages]);

  // 加入购物车处理函数
  const handleAddToCart = () => {
    // 调用addToCart action更新购物车状态
    dispatch(addToCart({
      productId: currentProduct.id,
      quantity: 1,
      product: currentProduct
    }));
    message.success('商品已成功加入购物车');
  };

  // 立即购买处理函数
  const handleBuyNow = () => {
    // 先将商品加入购物车
    dispatch(addToCart({
      productId: currentProduct.id,
      quantity: 1,
      product: currentProduct
    }));
    // 跳转到结账页面
    navigate('/checkout');
  };

  // 从Redux store中获取商品列表，用于相关商品推荐
  const { products } = useSelector((state: RootState) => state.product);
  
  // 从商品列表中获取相关商品（排除当前商品，取前2个）
  const relatedProducts = products.filter(p => p.id !== currentProduct.id && p.id !== 0).slice(0, 2);

  return (
    <div className="product-detail-page">
      {/* 显示错误信息 */}
      {error && (
        <Alert
          message="获取商品详情失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          closable
          onClose={() => dispatch(clearError())}
        />
      )}
      
      {/* 商品基本信息 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card loading={loading}>
            {/* 主图展示 */}
            <div style={{ marginBottom: 16 }}>
              <Image
                width="100%"
                src={selectedImage || currentProduct.image}
                alt={currentProduct.name}
                fallback="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                style={{ maxHeight: 500, objectFit: 'contain' }}
              />
            </div>
            
            {/* 缩略图列表 */}
            <Row gutter={[8, 8]}>
              {productImages.map((image, index) => (
                <Col span={6} key={index}>
                  <div
                    style={{
                      padding: 4,
                      border: selectedImage === image ? '2px solid #1890ff' : '2px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      width="100%"
                      src={image}
                      alt={`${currentProduct.name} 图片 ${index + 1}`}
                      fallback="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                      style={{ height: 100, objectFit: 'cover' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card loading={loading}>
            <Title level={3}>{currentProduct.name}</Title>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>¥{currentProduct.discountPrice || currentProduct.price}</Text>
              {currentProduct.discountPrice && currentProduct.discountPrice < currentProduct.price && (
                <Text style={{ marginLeft: 8, color: '#999', textDecoration: 'line-through' }}>¥{currentProduct.price}</Text>
              )}
            </div>
            
            <Descriptions bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="库存">{currentProduct.stock} 件</Descriptions.Item>
              <Descriptions.Item label="分类">{typeof currentProduct.category === 'object' && currentProduct.category ? currentProduct.category.name : currentProduct.category}</Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginBottom: 24 }}>
              <Text strong>商品描述：</Text>
              <p>{currentProduct.description}</p>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={handleAddToCart}>
                加入购物车
              </Button>
              <Button type="default" size="large" onClick={handleBuyNow}>
                立即购买
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 相关商品推荐 */}
      <div style={{ marginTop: 32 }}>
        <Title level={3}>相关商品推荐</Title>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={relatedProducts}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={<Image src={item.image} alt={item.name} fallback="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />}
              >
                <Card.Meta
                  title={<Link to={`/product/${item.id}`}>{item.name}</Link>}
                  description={`¥${item.price}`}
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ProductDetail;