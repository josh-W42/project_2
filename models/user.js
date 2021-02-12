'use strict';
const bcrypt = require('bcrypt');
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
  // We're going to use some sequelize validation here.
  user.init({
    name: {
      type: DataTypes.STRING,
      validate: {
        len: [1,99],
        msg: 'Name must be between 1 and 99 characters.'
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Invalid Email.'
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: [8,99],
        msg: 'Password must be between 8 and 99 characters',
      },
    },
  }, {
    sequelize,
    modelName: 'user',
  });
  // NEW NEW we add a hook to change intercept the event of a user being created
  user.addHook('beforeCreate', (pendingUser) => {
    // Very simlar to client side js events, but these are lifecycle events!
    // Lookup sequalize hooks and lifecycle event to find all other events and call order.
    let hash = bcrypt.hashSync(pendingUser.password, 12); // encryption up to 12 binary numbers

    /*
      For some reference:
      bcrypt:
        A module that can implement a specific algorthim for encypting / decypting data (lookup cryptography).
        It's been used for a long time and has an abundance of downloads.

      Here's also some bcrypt alternatives: if interested.

      simplecrypt: for very simple encryptions and decryptions. Probably not useful for production.
      bcrypt.js: is another alternative that has NO dependancies.

      lastly, if you want use node's built in crypto.scrypt you can as well.

    */
    pendingUser.password = hash;
  });
  
  // Here we create a method function for checking if the hashed password is 
  user.prototype.validPassword = function(typedPassword) {
    return bcrypt.compareSync(typedPassword, this.password);
  }
  
  // just a way to return the user instance object as JSON and remove the password.
  user.prototype.toJSON = function() {
    let userData = this.get();
    delete userData.password;
    return userData;
  }
  
  // I'm going to write some other code that uses bcrypt.js just because there are problems with bcrypt.
  return user;
};


