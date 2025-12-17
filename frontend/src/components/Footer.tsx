import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ textAlign: 'center', backgroundColor: '#f0f2f5', padding: '24px 50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>关于我们</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>E-Stone商城是一家专业的电子商务平台</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>提供优质的商品和服务</p>
        </div>
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>客户服务</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>联系我们</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>退换货政策</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>常见问题</p>
        </div>
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>关注我们</h3>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>微信公众号</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>新浪微博</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>抖音</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>© {new Date().getFullYear()} E-Stone商城. All rights reserved.</p>
        <p>ICP备案号: 京ICP备12345678号-1</p>
      </div>
    </AntFooter>
  );
};

export default Footer;