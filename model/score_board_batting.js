
const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "score_board_batting",
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
      position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      run: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, 
      balls: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }, 
      fours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      sixs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_stricker: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_caption: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      strike_rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      dismissal_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 0,
      },
      bowler_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      fielder_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      fantasy_points: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 4,
      },
      is_thirty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_thirty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_fifty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_hundread: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      strike_rate_30: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      strike_rate_50: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      strike_rate_70: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      economy_below: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      economy_above: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      three_wicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      sequelize,
      tableName: "score_board_batting",
    }
  );
};
