import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Order from './Order';
import Product from './Product';

// 订单项属性接口
interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建订单项时的可选属性
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt' | 'totalPrice' | 'productName'> {}

// OrderItem模型类
class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public productName!: string;
  public quantity!: number;
  public price!: number;
  public totalPrice!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 初始化OrderItem模型
OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: Product,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
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
    tableName: 'order_items',
    timestamps: true,
    hooks: {
      // 计算总价钩子
      beforeCreate: (item) => {
        item.totalPrice = item.price * item.quantity;
        // 如果没有提供商品名称，从Product获取
        if (!item.productName) {
          Product.findByPk(item.productId)
            .then(product => {
              if (product) {
                item.productName = product.name;
              }
            })
            .catch(() => {
              item.productName = 'Unknown Product';
            });
        }
      },
      beforeUpdate: (item) => {
        if (item.changed('price') || item.changed('quantity')) {
          item.totalPrice = item.price * item.quantity;
        }
      },
    },
  }
);

// 建立关联关系
Order.hasMany(OrderItem, {
  as: 'items',
  foreignKey: 'orderId',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  as: 'order',
  foreignKey: 'orderId',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Product, {
  as: 'product',
  foreignKey: 'productId',
  onDelete: 'SET NULL',
});

export default OrderItem;