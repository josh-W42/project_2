'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class wing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A wing belongs to a user.
      models.wing.belongsTo(models.user);
      // A wing also belongs to a post. 
      models.wing.belongsTo(models.post);
    }
  };
  wing.init({
    postId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    commentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'wing',
  });
  return wing;
};