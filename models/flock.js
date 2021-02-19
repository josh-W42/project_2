'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class flock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A flock has many members.
      models.flock.hasMany(models.member);
      // A flock has many posts
      models.flock.hasMany(models.post);
    }
  };
  flock.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: {
          args: [1,50],
          msg: "Flock names cannot be longer than 50 characters.",
        },
        isAlphanumeric: {
          args: true,
          msg: "Flock names must not contain special characters. i.e. $, _, #"
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [1, 1000],
          msg: "Flock descriptions cannot be longer than 1000 characters.",
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          args: true,
        },
      },
    },
    isPrivate: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'flock',
  });
  return flock;
};