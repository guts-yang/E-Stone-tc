import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// 用户资料属性接口
interface UserProfileAttributes {
  id: number;
  userId: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户资料时的可选属性
interface UserProfileCreationAttributes extends Optional<UserProfileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// UserProfile模型类
class UserProfile extends Model<UserProfileAttributes, UserProfileCreationAttributes> implements UserProfileAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public province!: string;
  public postalCode!: string;
  public country!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// 初始化UserProfile模型
UserProfile.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '中国',
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
    tableName: 'user_profiles',
    timestamps: true,
  }
);

// 建立关联关系
User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE',
});

UserProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default UserProfile;