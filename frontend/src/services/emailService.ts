// 邮件服务模块

// 订单邮件发送接口
interface OrderEmailData {
  to: string;
  subject: string;
  orderNumber: string;
  totalPrice: number;
  items: any[];
  paymentMethod: string;
  orderTime: string;
  shippingAddress: string;
  receiver: string;
  phone: string;
}

// 发送订单邮件
export const sendOrderEmail = (emailData: OrderEmailData): Promise<boolean> => {
  return new Promise((resolve) => {
    // 模拟邮件发送延迟
    setTimeout(() => {
      try {
        // 构建完整的邮件内容
        const emailContent = `
订单确认邮件

尊敬的客户：

感谢您的购买！您的订单已成功提交，以下是订单详情：

订单编号：${emailData.orderNumber}
下单时间：${emailData.orderTime}
支付方式：${emailData.paymentMethod === 'alipay' ? '支付宝' : '微信支付'}

订单商品：
${emailData.items.map(item => {
  return `• ${item.product?.name || item.name}  x${item.quantity}  ¥${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`;
}).join('\n')}

商品总价：¥${emailData.totalPrice.toFixed(2)}
运费：¥0.00
订单总计：¥${emailData.totalPrice.toFixed(2)}

收货信息：
收货人：${emailData.receiver}
联系电话：${emailData.phone}
收货地址：${emailData.shippingAddress}

请您及时完成支付，我们将尽快为您安排发货。如有任何问题，请随时联系我们。

祝您购物愉快！

电商平台团队
`;

        // 在真实环境中，这里应该调用后端API发送邮件
        // 例如：return axios.post('/api/email/send-order', emailData);
        
        // 模拟发送成功
        console.log('邮件发送成功！');
        console.log('收件人：', emailData.to);
        console.log('邮件主题：', emailData.subject);
        console.log('邮件内容：');
        console.log(emailContent);
        
        resolve(true);
      } catch (error) {
        console.error('邮件发送失败：', error);
        resolve(false);
      }
    }, 1000); // 模拟1秒延迟
  });
};
