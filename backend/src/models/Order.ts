import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery'
}

// 订单属性接口
interface OrderAttributes {
  id: number;
  orderNumber: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: boolean;
  shippingAddress: string;
  shippingPhone: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 创建订单时的可选属性
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'trackingNumber' | 'notes' | 'paymentStatus' | 'orderNumber'> {}

// Order模型类
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public userId!: number;
  public totalAmount!: number;
  public status!: OrderStatus;
  public paymentMethod!: PaymentMethod;
  public paymentStatus!: boolean;
  public shippingAddress!: string;
  public shippingPhone!: string;
  public trackingNumber!: string | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 初始化Order模型
Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PaymentMethod)),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    hooks: {
      // 生成订单号钩子
      beforeCreate: async (order) => {
        if (!order.orderNumber) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          order.orderNumber = `EST-${timestamp}-${random}`;
        }
      },
      // 更新支付状态钩子
      beforeUpdate: (order) => {
        if (order.status === OrderStatus.PAID && !order.paymentStatus) {
          order.paymentStatus = true;
        }
      },
    },
  }
);

// 建立关联关系
User.hasMany(Order, {
  as: 'orders',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Order.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

export default Order;