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
      // A post has many wings.
      models.post.hasMany(models.wing, { onDelete: 'cascade' });
      // A post has many comments
      models.post.hasMany(models.comment, { onDelete: 'cascade' })
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
    userId: DataTypes.INTEGER,
    flockId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};