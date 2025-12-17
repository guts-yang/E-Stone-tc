import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// 购物车属性接口
interface CartAttributes {
  id: number;
  userId: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items?: any[]; // 购物车商品项
}

// 创建购物车时的可选属性
interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'> {}

// Cart模型类
class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public userId!: number;
  public totalAmount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public items?: any[];
}

// 初始化Cart模型
Cart.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'carts',
    timestamps: true,
  }
);

// 建立关联关系
User.hasOne(Cart, {
  as: 'cart',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Cart.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

export default Cart;