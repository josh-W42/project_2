'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A post is posted by only one user.
      models.post.belongsTo(models.user);
      // A post is posted in only one flock.
      models.post.belongsTo(models.flock);
    }
  };
  post.init({
    poster: DataTypes.STRING,
    content: DataTypes.TEXT,
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          args: true,
        },
      },
    },
    isPrivate: DataTypes.BOOLEAN,
    wings: DataTypes.INTEGER,
    hasWinged: DataTypes.JSON,
    userId: DataTypes.INTEGER,
    flockId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};