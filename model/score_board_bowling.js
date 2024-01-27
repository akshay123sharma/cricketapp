const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "score_board_bowlers",
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
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      overs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      mainders_over: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, 
      runs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, 
      wicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      no_ball: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wide: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      economy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      sequelize,
      tableName: "score_board_bowlers",
    }
  );
};
