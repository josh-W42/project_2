'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // a member entry is tied to one flock
      models.member.belongsTo(models.flock);
      // a member entry is tied to one user
      models.member.belongsTo(models.user);
    }
  };
  member.init({
    role: DataTypes.ENUM('member', 'admin', 'owner'),
    flockId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'member',
  });
  return member;
};