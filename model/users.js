const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      dob: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gender: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        comment: "1: Male, 2: Female, 3: Others",
      },
      type: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        defaultValue: 2,
        comment: "1: Admin, 2: User 3. Scorer",
      },
      is_scorer: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        defaultValue: 0,
        comment: "0.No, 1.Yes",
      },
      profile_photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      
    },
    {
      sequelize,
      tableName: "users",
    }
  );
};
