'use strict';
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
    }
  };
  user.init({
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1,50],
          msg: "First name must be between 1-50 characters.",
        },
        isAlphanumeric: {
          args: true,
          msg: "First Name must contain only letters.",
        },
        allowNull: {
          args: true,
        },
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: [1,50],
        msg: "Last name must be between 1-50 characters.",
      },
      isAlphanumeric: {
        args: true,
        msg: "Last name must contain only letters.",
      },
      allowNull: {
        args: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: "Invalid Email.",
        },
      },
    },
    userName: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [1,50],
          msg: "UserName must be between 1-50 characters.",
        },
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        allowNull: {
          args: false
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
        allowNull: {
          args: true,
        },
      },
    },
    isPrivate: DataTypes.BOOLEAN
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
    return encryptPassword(typedPassword, this.salt()) === this.password();
  }
  
  const setSaltAndPassword = User => {
    if (User.changed('password')) {
      User.salt = user.generateSalt();
      User.password = encryptPassword(User.password(), User.salt());
    }
  }
  
  user.addHook('beforeCreate', user => setSaltAndPassword(user));
  user.addHook('beforeUpdate', user => setSaltAndPassword(user));
  
  return user;
};