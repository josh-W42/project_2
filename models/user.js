'use strict';
const crypto = require('crypto');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A user can be a member of many flocks.
      models.user.hasMany(models.member);
      // A user can make many posts.
      models.user.hasMany(models.post);
    }
  };
  user.init({
    firstName: {
      type: DataTypes.STRING
    },
    lastName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "Invalid Email.",
        },
      },
    },
    userName: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: {
          args: [1,50],
          msg: "UserName must be between 1-50 characters.",
        },
        isAlphanumeric: {
          args: true,
          msg: "Username must not contain special characters. i.e. $, %, #"
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          args: true
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8,99],
          msg: "Password must be between 8 and 88 characters.",
        },
      },
      get() {
        return () => this.getDataValue('password');
      },
    },
    key: {
      type: DataTypes.STRING,
      get() {
        return () => this.getDataValue('key');
      },
    },
    bio: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0,1000],
          msg: "Bio is too long. Must be less than 1000 chars"
        },
      },
    },
    isPrivate: DataTypes.BOOLEAN,
    followers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
  }, {
    sequelize,
    modelName: 'user',
  });

  const encryptPassword = function(plainText, salt) {
    return crypto.scryptSync(plainText, salt, 64).toString('hex');
  }

  user.generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
  }

  user.prototype.validPassword = function(typedPassword) {
    return encryptPassword(typedPassword, this.key()) === this.password();
  }
  
  const setSaltAndPassword = User => {
    if (User.changed('password')) {
      User.key = user.generateSalt();
      User.password = encryptPassword(User.password(), User.key());
    }
  }

  // Useful to prevent password and key leaks
  user.toJSON = function() {
    let userData = this.get();
    delete userData.password;
    delete userData.key;
    return userData;
  }
  
  user.addHook('beforeCreate', user => setSaltAndPassword(user));
  user.addHook('beforeUpdate', user => setSaltAndPassword(user));
  
  return user;
};