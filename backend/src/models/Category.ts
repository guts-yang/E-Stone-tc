import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// 商品类别属性接口
interface CategoryAttributes {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建商品类别时的可选属性
interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'level'> {}

// Category模型类
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public parentId!: number | null;
  public level!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 初始化Category模型
Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'categories',
    timestamps: true,
  }
);

// 建立自关联关系
Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parentId',
  onDelete: 'SET NULL',
});

Category.hasMany(Category, {
  as: 'children',
  foreignKey: 'parentId',
  onDelete: 'SET NULL',
});

export default Category;