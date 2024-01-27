const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "extras",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      match_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      sequelize,
      tableName: "extras",
    }
  );
};
