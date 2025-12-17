import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 邮件服务配置
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '578165807@qq.com',
    pass: process.env.SMTP_PASSWORD || 'your_email_password'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 发送邮件
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // 发送邮件
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || 'E-Stone商城'} <${process.env.SMTP_USER || 'your_email@gmail.com'}>`,
      to,
      subject,
      html
    });

    console.log('邮件发送成功:', info.messageId);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
};

// 发送订单确认邮件
const sendOrderConfirmationEmail = async (email: string, orderNumber: string, totalAmount: number, status: string) => {
  const subject = `订单确认 - ${orderNumber}`;
  const html = `
    <h1>订单确认</h1>
    <p>尊敬的客户：</p>
    <p>您的订单 <strong>${orderNumber}</strong> 已成功创建！</p>
    <p>订单金额：<strong>¥${totalAmount.toFixed(2)}</strong></p>
    <p>订单状态：<strong>${status}</strong></p>
    <p>您可以登录我们的网站查看订单详情。</p>
    <p>感谢您的购买！</p>
    <p>-- E-Stone商城团队</p>
  `;

  return sendEmail(email, subject, html);
};

// 发送订单状态更新邮件
const sendOrderStatusUpdateEmail = async (email: string, subject: string, html: string) => {
  return sendEmail(email, subject, html);
};

// 发送注册确认邮件
const sendRegistrationConfirmationEmail = async (email: string, username: string) => {
  const subject = '注册确认 - E-Stone商城';
  const html = `
    <h1>注册成功</h1>
    <p>尊敬的 ${username}：</p>
    <p>欢迎加入E-Stone商城！您的账户已成功创建。</p>
    <p>您可以使用以下信息登录：</p>
    <p>用户名：<strong>${username}</strong></p>
    <p>邮箱：<strong>${email}</strong></p>
    <p>立即开始购物吧！</p>
    <p>-- E-Stone商城团队</p>
  `;

  return sendEmail(email, subject, html);
};

// 发送密码重置邮件
const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const subject = '密码重置 - E-Stone商城';
  const html = `
    <h1>密码重置</h1>
    <p>尊敬的客户：</p>
    <p>我们收到了您的密码重置请求。请点击以下链接重置您的密码：</p>
    <p><a href="${resetLink}">重置密码</a></p>
    <p>此链接将在24小时后过期。</p>
    <p>如果您没有请求重置密码，请忽略此邮件。</p>
    <p>-- E-Stone商城团队</p>
  `;

  return sendEmail(email, subject, html);
};

export {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendRegistrationConfirmationEmail,
  sendPasswordResetEmail
};