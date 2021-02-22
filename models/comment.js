'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A comment belongs to a post.
      models.comment.belongsTo(models.post);
      // A comment has many wings
      models.comment.hasMany(models.wing, { ondelete: 'cascade' });
      // A comment is created by a user.
      models.comment.belongsTo(models.user);
    }
  };
  comment.init({
    postId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};