import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Cart from './Cart';
import Product from './Product';

// 购物车商品项属性接口
interface CartItemAttributes {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建购物车商品项时的可选属性
interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// CartItem模型类
class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: number;
  public cartId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 初始化CartItem模型
CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Cart,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    tableName: 'cart_items',
    timestamps: true,
  }
);

// 建立关联关系
Cart.hasMany(CartItem, {
  as: 'items',
  foreignKey: 'cartId',
  onDelete: 'CASCADE',
});

CartItem.belongsTo(Cart, {
  as: 'cart',
  foreignKey: 'cartId',
  onDelete: 'CASCADE',
});

CartItem.belongsTo(Product, {
  as: 'product',
  foreignKey: 'productId',
  onDelete: 'CASCADE',
});

export default CartItem;