const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "contests",
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
      entry_fee: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_participants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      number_of_winners: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prize_pool: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_commission: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      
    },
    {
      sequelize,
      tableName: "contests",
    }
  );
};