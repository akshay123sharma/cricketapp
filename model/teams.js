const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "teams",
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
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      team_photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      } 
    },
    {
      sequelize,
      tableName: "teams",
    }
  );
};
