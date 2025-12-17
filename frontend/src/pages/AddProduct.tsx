import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { addProduct, getProducts } from '../redux/productSlice';
import { uploadProductImage } from '../services/productService';

const { TextArea } = Input;

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // 处理文件选择
  const handleFileChange = (info: any) => {
    if (info.fileList && info.fileList.length > 0) {
      // 只保留上传成功的文件和新选择的文件
      const files = info.fileList.map((file: any) => file.originFileObj).filter(Boolean) as File[];
      setUploadedFiles(files);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      // 1. 创建商品数据
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || null,
        stock: values.stock,
        categoryId: values.categoryId,
        status: 'active',
      };
      
      // 2. 调用Redux thunk添加商品
      const result: any = await dispatch(addProduct(productData) as any);
      const productId = result.payload.product?.id || result.payload.id;
      console.log('添加商品结果:', result, '商品ID:', productId);
      
      // 3. 上传商品图片
      if (uploadedFiles.length > 0 && productId) {
        // 上传图片
        const formData = new FormData();
        uploadedFiles.forEach(file => {
          formData.append('images', file);
        });
        
        await uploadProductImage(productId, formData);
        message.success('图片上传成功');
      }
      
      // 4. 重新获取商品列表，确保商品和图片信息同步
      await dispatch(getProducts() as any);
      
      message.success('商品添加成功');
      
      // 5. 导航到商品列表页面
      navigate('/products');
    } catch (error: any) {
      console.error('添加商品错误:', error);
      message.error(error.message || '添加商品失败，请重试');
    }
  };

  return (
    <div className="add-product-page">
      <Card title="添加商品" style={{ maxWidth: 800, margin: '0 auto' }}>
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
            valuePropName="fileList"
            getValueFromEvent={handleFileChange}
            rules={[{ required: false, message: '请上传商品图片' }]}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false} // 阻止自动上传，由我们手动处理
              maxCount={5}
              fileList={uploadedFiles.map(file => ({
                uid: Date.now() + Math.random().toString(36).substring(2, 15),
                name: file.name,
                status: 'done',
                url: URL.createObjectURL(file)
              }))}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large">
              提交
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

export default AddProduct;