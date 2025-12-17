import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Product from './Product';

// 商品图片属性接口
interface ProductImageAttributes {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

// 创建商品图片时的可选属性
interface ProductImageCreationAttributes extends Optional<ProductImageAttributes, 'id' | 'createdAt' | 'isPrimary'> {}

// ProductImage模型类
class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
  public id!: number;
  public productId!: number;
  public imageUrl!: string;
  public isPrimary!: boolean;
  public createdAt!: Date;
}

// 初始化ProductImage模型
ProductImage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'product_images',
    timestamps: false,
    hooks: {
      // 设置主要图片钩子
      beforeCreate: async (image) => {
        if (image.isPrimary) {
          // 先将同一商品的所有图片设置为非主要
          await ProductImage.update(
            { isPrimary: false },
            { where: { productId: image.productId } }
          );
        }
      },
      beforeUpdate: async (image) => {
        if (image.changed('isPrimary') && image.isPrimary) {
          // 先将同一商品的所有图片设置为非主要
          await ProductImage.update(
            { isPrimary: false },
            { where: { productId: image.productId } }
          );
        }
      },
    },
  }
);

// 建立关联关系
Product.hasMany(ProductImage, {
  as: 'images',
  foreignKey: 'productId',
  onDelete: 'CASCADE',
});

ProductImage.belongsTo(Product, {
  as: 'product',
  foreignKey: 'productId',
  onDelete: 'CASCADE',
});

export default ProductImage;