import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Button, Descriptions, Image, List, message, Alert } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { addToCart } from '../redux/cartSlice';
import { getProduct, clearError } from '../redux/productSlice';

// 导入本地图片
import product1Image1 from '../assets/products/buds-2.jpg';
import product2Image1 from '../assets/products/iflytek-1.jpg';
import product2Image2 from '../assets/products/iflytek-1.jpg';
import product2Image3 from '../assets/products/iflytek-1.jpg';
import product3Image1 from '../assets/products/buds3-1.jpg';
import product3Image2 from '../assets/products/buds3-1.jpg';
import product3Image3 from '../assets/products/buds3-1.jpg';
import product4Image1 from '../assets/products/product-4-01.jpg';
import product4Image2 from '../assets/products/product-4-02.jpg';
import product4Image3 from '../assets/products/product-4-03.jpg';
// 修正产品5的图片导入
import product5Image1 from '../assets/products/5-1.jpg';
import product5Image2 from '../assets/products/6.jpg';
import product5Image3 from '../assets/products/7.jpg';
import product5Image4 from '../assets/products/8.jpg';
import product5Image from '../assets/products/5-1.jpg';
// 修正产品9的图片导入
import product9Image1 from '../assets/products/tea-set-1.jpg';
import product9Image2 from '../assets/products/tea-set-1.jpg';
import product9Image3 from '../assets/products/tea-set-1.jpg';
import product9Image4 from '../assets/products/tea-set-1.jpg';
import productSpeakerImage from '../assets/products/speaker-1.jpg';
import productTeaImage from '../assets/products/tea-set-1.jpg';


// 备用推荐商品数据（当 Products.tsx 中的数据无法加载时使用）
const recommendedProducts = [
  { id: 1, name: 'Samsung Galaxy Buds1 三星蓝牙耳机', price: 1599, discountPrice: 1399, image: product2Image1, images: [product2Image1, product2Image2, product2Image3], category: '耳机', description: '实时录音转文字，多语言翻译，AI智能摘要，45dB深度降噪，会议办公神器。', stock: 100, status: 'active', viewCount: 0, soldCount: 0, categoryId: 2 },
  { id: 2, name: 'Sony WH-1000XM5 头戴式智能降噪耳机（铂金银）', price: 2999, discountPrice: 2499, image: product4Image1, images: [product4Image1, product4Image2, product4Image3], category: '耳机', description: '双芯驱动，旗舰降噪，30小时超长续航。', stock: 50, status: 'active', viewCount: 0, soldCount: 0, categoryId: 4 },
  { id: 3, name: 'Samsung Galaxy Buds3 三星蓝牙耳机', price: 999, discountPrice: 899, image: product3Image1, images: [product3Image1, product3Image2, product3Image3], category: '耳机', description: '人体工学设计，Hi-Fi高保真音质，AI智能降噪。', stock: 80, status: 'active', viewCount: 0, soldCount: 0, categoryId: 3 },
  { id: 4, name: '高保真无线蓝牙音箱（支持AAC/aptX解码）', price: 1299, discountPrice: 999, image: productSpeakerImage, images: [productSpeakerImage], category: '智能音箱', description: '360度环绕音效，超长续航，支持多种连接方式。', stock: 60, status: 'active', viewCount: 0, soldCount: 0, categoryId: 1 },
  { id: 5, name: '韩版高端水貂毛短款外套（冬季轻奢系列）', price: 3999, discountPrice: 3599, image: product5Image, images: [product5Image1, product5Image2, product5Image3, product5Image4], category: '服饰', description: '精选进口水貂毛，手感柔软，保暖性极佳，时尚百搭。', stock: 50, status: 'active', viewCount: 0, soldCount: 0, categoryId: 5 },
  { id: 6, name: '景德镇手工青花瓷茶具套装（6件套含茶盘）', price: 888, discountPrice: 688, image: productTeaImage, images: [product9Image1, product9Image2, product9Image3, product9Image4], category: '家居日用', description: '传统工艺烧制，釉面温润，图案精美，送礼佳品。', stock: 20, status: 'active', viewCount: 0, soldCount: 0, categoryId: 6 }
];

const { Title, Text } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // 从Redux store获取商品详情
  const { product, loading, error } = useSelector((state: RootState) => state.product);
  
  // 静态商品图片映射 (如果后端API没有返回图片)
  const staticProductImages: Record<number, string[]> = {
    // 1: [product1Image1, product1Image2, product1Image3, product1Image4],
    // 2: [product2Image1, product2Image2, product2Image3],
    // 3: [product3Image1, product3Image2, product3Image3],
    // 4: [product4Image1, product4Image2, product4Image3, product4Image4],
    // 5: [product5Image1, product5Image2, product5Image3, product5Image4],
    // 9: [product9Image1, product9Image2, product9Image3, product9Image4],
    // 15: [product5Image1, product5Image2, product5Image3, product5Image4]
  };
  
  // 获取商品详情
  useEffect(() => {
    if (id) {
      const productId = Number(id);
      // 调用API获取商品详情
      dispatch(getProduct(productId));
    }
    
    // 清除之前的错误
    dispatch(clearError());
  }, [dispatch, id]);

  // 默认商品对象
  const defaultProduct = {
    id: 0,
    name: '未知商品',
    price: 0,
    discountPrice: 0,
    description: '暂无商品描述',
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    images: [],
    stock: 0,
    category: ''
  };
  
  // 获取当前商品ID
  const productId = Number(id) || 0;
  
  // 在本地查找商品
  const localProduct = recommendedProducts.find(p => p.id === productId);
  
  // 优先使用Redux中的数据，其次是本地数据，最后是默认数据
  const currentProduct = product || localProduct || defaultProduct;
  
  // 默认图片URL
  const defaultImageUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
  
  // 确定商品图片列表
  let productImages: string[] = [];
  
  // 优先级：静态映射 > API返回列表 > 单张图片
  // 1. 检查静态映射
  if (staticProductImages[productId]) {
    productImages = staticProductImages[productId];
  }
  // 2. 检查API返回的图片列表
  else if (currentProduct.images && currentProduct.images.length > 0) {
    productImages = currentProduct.images.map((img: any) => typeof img === 'string' ? img : img.imageUrl);
  }
  // 3. 检查单张图片
  else if (currentProduct.image) {
    productImages = [currentProduct.image];
  }
  // 4. 使用默认图片
  else {
    productImages = [defaultImageUrl];
  }
  
  // 设置默认选中的图片
  useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0]);
    }
  }, [productImages]);

  // 添加到购物车
  const handleAddToCart = () => {
    // 触发addToCart action
    dispatch(addToCart({
      productId: currentProduct.id,
      quantity: 1,
      product: currentProduct
    }));
    message.success('已添加到购物车');
  };

  // 立即购买
  const handleBuyNow = () => {
    // 先添加到购物车
    dispatch(addToCart({
      productId: currentProduct.id,
      quantity: 1,
      product: currentProduct
    }));
    // 跳转到结算页
    navigate('/checkout');
  };

  // 从Redux store获取所有商品列表用于推荐
  const { products } = useSelector((state: RootState) => state.product);
  
  // 简单的相关商品推荐逻辑：排除当前商品，取前2个
  const relatedProducts = products.filter(p => p.id !== currentProduct.id && p.id !== 0).slice(0, 2);

  return (
    <div className="product-detail-page">
      {/* 错误提示 */}
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
      
      {/* 商品详情区域 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card loading={loading}>
            {/* 主图 */}
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
                      alt={`${currentProduct.name} 图 ${index + 1}`}
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
              <Text strong>商品详情</Text>
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
      
      {/* 相关推荐 */}
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
