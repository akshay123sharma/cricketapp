const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "matches",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      team1_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      team2_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_over: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },  
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      venue_ground: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      match_date: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      match_time: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scorer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      toss_winner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default:0,
        comment: "Team id",
      },
      toss_decision: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default:0,
        comment: "1: BAT, 2: BOWl",
      },
      match_result: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default:0,
        comment: "1: Won, 2: Loss",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default:1,
        comment: "1: Upcoming, 2: Running 3 completed",
      },
      inning_status:{
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "1: One inning complete 2: Completed",
      },
      team_one_json: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      team_two_json: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      player_list: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "matches",
    }
  );
};