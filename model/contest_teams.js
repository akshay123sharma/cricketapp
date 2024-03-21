const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "contest_teams",
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
      },
      contest_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contest_fee: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_winner: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:0
      },
      wallet_add:{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:0
      },
      selected_team:{
        type:DataTypes.TEXT(),
        allowNull:true
      }
    },
    {
      sequelize,
      tableName: "contest_teams",
    }
  );
};