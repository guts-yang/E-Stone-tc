import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Category from './Category';
import ProductImage from './ProductImage';

// 商品状态枚举
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

// 商品属性接口
interface ProductAttributes {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  status: ProductStatus;
  viewCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
  // 关联字段
  images?: ProductImage[];
  category?: Category;
}

// 创建商品时的可选属性
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt' | 'discountPrice' | 'viewCount' | 'soldCount' | 'status'> {}

// Product模型类
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public discountPrice!: number | null;
  public stock!: number;
  public status!: ProductStatus;
  public viewCount!: number;
  public soldCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  
  // 关联实例属性
  public images!: ProductImage[];
  public category!: Category;
}

// 初始化Product模型
Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProductStatus)),
      allowNull: false,
      defaultValue: ProductStatus.ACTIVE,
    },
    viewCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    soldCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'products',
    timestamps: true,
    hooks: {
      // 更新商品状态钩子
      beforeSave: (product) => {
        if (product.stock === 0 && product.status !== ProductStatus.OUT_OF_STOCK) {
          product.status = ProductStatus.OUT_OF_STOCK;
        } else if (product.stock > 0 && product.status === ProductStatus.OUT_OF_STOCK) {
          product.status = ProductStatus.ACTIVE;
        }
      },
    },
  }
);

// 建立关联关系
Product.belongsTo(Category, {
  as: 'category',
  foreignKey: 'categoryId',
  onDelete: 'CASCADE',
});

Category.hasMany(Product, {
  as: 'products',
  foreignKey: 'categoryId',
  onDelete: 'CASCADE',
});

export default Product;