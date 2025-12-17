import React, { useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { getProduct, updateProduct } from '../redux/productSlice';

const { TextArea } = Input;

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { product, loading, error } = useSelector((state: RootState) => state.product);

  // 页面加载时获取商品详情
  useEffect(() => {
    if (id) {
      dispatch(getProduct(Number(id)) as any);
    }
  }, [id, dispatch]);

  // 当商品数据加载完成后，填充表单
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        categoryId: product.categoryId,
      });
    }
  }, [product, form]);

  // 当获取商品详情失败时，显示错误信息
  useEffect(() => {
    if (error && !loading) {
      message.error(`获取商品详情失败: ${error}`);
      // 可以选择返回商品列表页面
      // navigate('/products');
    }
  }, [error, loading, navigate]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    try {
      // 简化表单提交，直接使用普通对象而非FormData
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || null,
        stock: values.stock,
        categoryId: values.categoryId,
        status: 'active',
        // 暂时不处理图片上传
      };
      
      // 调用Redux thunk更新商品
      await dispatch(updateProduct({ id: Number(id), productData } as any));
      message.success('商品编辑成功');
      navigate('/products');
    } catch (error) {
      message.error('编辑商品失败，请重试');
      console.error('编辑商品错误:', error);
    }
  };

  return (
    <div className="edit-product-page">
      <Card title="编辑商品" style={{ maxWidth: 800, margin: '0 auto' }} loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item
            name="price"
            label="商品价格"
            rules={[{ required: true, message: '请输入商品价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入商品价格"
              min={0}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="discountPrice"
            label="优惠价格"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入优惠价格"
              min={0}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入库存数量"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="分类ID"
            rules={[{ required: true, message: '请输入分类ID' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入分类ID"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="images"
            label="商品图片"
            rules={[{ required: false, message: '请上传商品图片' }]}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false} // 阻止自动上传
              maxCount={5}
              // 使用实际商品图片作为默认值
              defaultFileList={product?.images?.map((image, index) => ({
                uid: String(image.id || index),
                name: `product-image-${index + 1}.jpg`,
                status: 'done',
                url: image.imageUrl,
              })) || []}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large">
              保存
            </Button>
            <Button size="large" style={{ marginLeft: 16 }} onClick={() => navigate('/products')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProduct;