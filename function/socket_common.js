var db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const { response } = require("../server");
const Op = sequelize.Op;
const user = db.users;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const match = db.matches;
const extras = db.extras;
module.exports = {

stikerDetail: async  (data) => {
    try {
      let striker_detail = score_board_batting.findOne({
        where: {
          match_id: data.match_id,
          team_id: data.team_id,
          is_stricker:1
        },
        raw:true,
    });
      return striker_detail || [];
    } catch (error) {
      console.error("Error strike player detail:", error);
      return [];
    }
},      

  playerDetailById : async  (data) => {
      try {
        const _player_detail = await score_board_batting.findOne({
          where: {
            player_id: data.player1_id,
            team_id: data.team_id,
            match_id: data.match_id,
          },
          raw:true,
        });
        return _player_detail || [];
      } catch (error) {
        console.error("Error fetching player detail:", error);
        return [];
      }
  },



playerTwoDetailById : async  (data) => {
    try {
      const _player_detail = await score_board_batting.findOne({
        where: {
          player_id: data.player2_id,
          team_id: data.team_id,
          match_id: data.match_id,
        },
        raw:true,
      });
      return _player_detail || [];
    } catch (error) {
      console.error("Error fetching player detail:", error);
      return [];
    }
},






      
  bowlerDetailById : async (data)=>{
      try {
        let _bolwer_detail = await score_board_bowling.findOne({
          where:{
            player_id:data.bowler_id,
            team_id:data.team2_id,
            match_id:data.match_id
          },
          raw:true,
        });
        return _bolwer_detail || [];
      } catch (error) {
        console.error("Error fetching bowler detail:", error);
        return [];
      }
  },

  updateBatsmanScore: async (batsmanObj, conditionObj, player1_id, player2_id) => {
      try {
        const clickType = batsmanObj.type;
        delete batsmanObj.type;
        conditionObj.player_id = player1_id;
        const updateBatsman = await score_board_batting.update(batsmanObj, { where: conditionObj });
          if (updateBatsman && [1, 3, 5, 7].includes(clickType)) {
            await score_board_batting.update({ is_stricker: 0 }, { where: conditionObj });
            conditionObj.player_id = player2_id;
            await score_board_batting.update({ is_stricker: 1 }, { where: conditionObj });
        }
        return updateBatsman;
      } catch (error) {
        console.error("Error updating batsman score:", error);
        throw error;
      }
  },
    
  updateBowlerScore: async(bowlerObj, conditionObj,bowler_id) => {
      try {
          conditionObj.player_id = bowler_id;
          const update_bowler = await score_board_bowling.update(bowlerObj, {
              where: conditionObj,
          });
        return update_bowler;
      } catch (error) {
        console.error("Error updating batsman score:", error);
        throw error;
      }
  },

  formatOver:async(balls) => {
      const overs = Math.floor(balls / 6);
      const remaining_balls = balls % 6;
      return overs + remaining_balls / 10;
  },

  updateExtras:async(dataArr) =>{
          const create_extras= await extras.create(dataArr);
          return create_extras;
  },

  totalScore : async(data) => {
      try {
          const [total_runs, total_extras] = await Promise.all([
              score_board_batting.sum('run', {
                  where: { team_id: data.team_id, match_id: data.match_id }
              }),
              extras.sum('count', {
                  where: { team_id: data.team_id, match_id: data.match_id }
              })
          ]);
          const total_run_count = total_runs || 0;
          const total_extra_count = total_extras || 0;
          return total_run_count + total_extra_count;
      } catch (error) {
          throw new Error("Error calculating total score: " + error.message);
      }
  },

  totalOver:async(data)=>{
      let total_overs = score_board_bowling.sum('balls', {
          where: { team_id: data.team2_id, match_id: data.match_id }
      });
      const total_overs_count = total_overs || 0;
      return total_overs_count;
  },

  matchDetail: async(match_id)=>{
    const _matchDetailObj = await match.findOne({
      where:{
        id:match_id,
      },
      raw:true
    });
    return _matchDetailObj;
  },

  fantasyPointBatsmanT10: async(playerDetail, data, isExtra) => {
        let fantasy_points = playerDetail.fantasy_points;
        // Update fantasy points based on runs and extras
        fantasy_points += (isExtra ? 0 : data.run) + (data.type === 4 ? 1 : data.type === 6 ? 2 : 0);
        let updateObj = {};
        if (playerDetail.run >= 30 && playerDetail.is_thirty === 0) {
            updateObj.is_thirty = 1;
            fantasy_points += 4;
        } else if (playerDetail.run >= 50 && playerDetail.is_fifty === 0) {
            updateObj.is_fifty = 1;
            fantasy_points += 12; // 4 points already added when reaching 30 runs.
        }
        const strikeRate = ((playerDetail.run + (isExtra ? 0 : data.run)) / (playerDetail.balls + 1)) * 100;
        if(playerDetail.balls >= 5){
            if (strikeRate > 170 && playerDetail.strike_rate_70 == 0) {
              if (playerDetail.strike_rate_50 == 1 || playerDetail.strike_rate_30 == 1) {
                fantasy_points -= playerDetail.strike_rate_50 ? 4 : 2;
              } 
              fantasy_points += 6;
              updateObj.strike_rate_30= 0;
              updateObj.strike_rate_50= 0;
              updateObj.strike_rate_70= 1;
            } else if (strikeRate >  150 && strikeRate < 170 && playerDetail.strike_rate_50 == 0) {
              // Deduct points for higher achieved milestones
              if (playerDetail.strike_rate_70 == 1 || playerDetail.strike_rate_30 == 1) {
                fantasy_points -= playerDetail.strike_rate_70 ? 6 : 2;
              }
              fantasy_points += 4;
              updateObj.strike_rate_30= 0;
              updateObj.strike_rate_50= 1;
              updateObj.strike_rate_70= 0;
            } else if (strikeRate > 130 &&  strikeRate < 150 && playerDetail.strike_rate_30 == 0) {
              // Deduct points for higher achieved milestones
              if (playerDetail.strike_rate_50 == 1 || playerDetail.strike_rate_70 == 1) {
                fantasy_points -= playerDetail.strike_rate_50 ? 4 : 6;
              }
              fantasy_points += 2;
              updateObj.strike_rate_30= 1;
              updateObj.strike_rate_50= 0;
              updateObj.strike_rate_70= 0;
            }
        }

        await score_board_batting.update(updateObj, {
          where: {
            match_id: data.match_id,
            team_id: data.team_id,
            player_id : data.player1_id
          }
        });
        return fantasy_points;
  }, 

  fantasyPointBatsmanT20: async(playerDetail, data, isExtra) => {
        let fantasy_points = playerDetail.fantasy_points;
        fantasy_points += (isExtra ? 0 : data.run) + (data.type === 4 ? 1 : data.type === 6 ? 2 : 0);
        let updateObj = {};
        if (playerDetail.run >= 30 && playerDetail.is_thirty === 0) {
            updateObj.is_thirty = 1;
            fantasy_points += 4;
        } else if (playerDetail.run >= 50 && playerDetail.is_fifty === 0) {
            updateObj.is_fifty = 1;
            fantasy_points += 4; // 4 points already added when reaching 30 runs.
        }else if (playerDetail.run >= 50 && playerDetail.is_hundread === 0){
            updateObj.is_fifty = 1;
            fantasy_points += 8; // 8 points already added when reaching 30 runs and 50 runs.
        }
        const strikeRate = ((playerDetail.run + (isExtra ? 0 : data.run)) / (playerDetail.balls + 1)) * 100;

        if(playerDetail.balls >= 10){
            if (strikeRate > 150 && playerDetail.strike_rate_50 == 0) {
              fantasy_points += 4;
              updateObj.strike_rate_30= 0;
              updateObj.strike_rate_50= 0;
              updateObj.strike_rate_70= 1;
            } else if (strikeRate >  150 && strikeRate < 170 && playerDetail.strike_rate_50 == 0) {
              // Deduct points for higher achieved milestones
              if (playerDetail.strike_rate_70 == 1 || playerDetail.strike_rate_30 == 1) {
                fantasy_points -= playerDetail.strike_rate_70 ? 6 : 2;
              }
              fantasy_points += 4;
              updateObj.strike_rate_30= 0;
              updateObj.strike_rate_50= 1;
              updateObj.strike_rate_70= 0;
            } else if (strikeRate > 130 &&  strikeRate < 150 && playerDetail.strike_rate_30 == 0) {
              // Deduct points for higher achieved milestones
              if (playerDetail.strike_rate_50 == 1 || playerDetail.strike_rate_70 == 1) {
                fantasy_points -= playerDetail.strike_rate_50 ? 4 : 6;
              }
              fantasy_points += 2;
              updateObj.strike_rate_30= 1;
              updateObj.strike_rate_50= 0;
              updateObj.strike_rate_70= 0;
            }
        }

        await score_board_batting.update(updateObj, {
          where: {
            match_id: data.match_id,
            team_id: data.team_id,
            player_id : data.player1_id
          }
        });
        return fantasy_points;
  },

   fantasyPointBolwerT10 : async (batsmanbowlerDetail, bowlerDetail, data) => {
    let extraFantasyPoints = batsmanbowlerDetail.fantasy_points;
    let fantasyObj = {};
    if (bowlerDetail.balls > 6) {
        if (bowlerDetail.economy <= 5 && batsmanbowlerDetail.economy_below === 0) {
            extraFantasyPoints += 10;
            fantasyObj.economy_below = 1;
            fantasyObj.economy_above = 0;
        } else if (bowlerDetail.economy > 8 && batsmanbowlerDetail.economy_above === 0) {
            if (batsmanbowlerDetail.economy_below === 1) {
                extraFantasyPoints -= 10;
            }
            extraFantasyPoints -= 2;
            fantasyObj.economy_below = 0;
            fantasyObj.economy_above = 1;
        }

        await score_board_batting.update(fantasyObj, {
            where: {
                match_id: data.match_id,
                team_id: data.team2_id,
                player_id: data.bowler_id
            }
        });
    }

    return extraFantasyPoints;
},



  fantasyPointBolwerT20: async(batsmanbowlerDetail,bowlerDetail,data)=>{
    let extraFantasyPoints = batsmanbowlerDetail.fantasy_points;
    let fantasyObj = {};
    if (bowlerDetail.balls > 6) {
        if (bowlerDetail.economy <= 5 && batsmanbowlerDetail.economy_below === 0) {
            extraFantasyPoints += 8;
            fantasyObj.economy_below = 1;
            fantasyObj.economy_above = 0;
        } else if (bowlerDetail.economy > 8 && batsmanbowlerDetail.economy_above === 0) {
            if (batsmanbowlerDetail.economy_below === 1) {
                extraFantasyPoints -= 10;
            }
            extraFantasyPoints -= 3;
            fantasyObj.economy_below = 0;
            fantasyObj.economy_above = 1;
        }

        await score_board_batting.update(fantasyObj, {
            where: {
                match_id: data.match_id,
                team_id: data.team2_id,
                player_id: data.bowler_id
            }
        });
    }
    return extraFantasyPoints;
  },

  updateBatsmanBowlerFantasyScore: async(bowlerFantasyPoint,data) =>{
    await score_board_batting.update(bowlerFantasyPoint, {
      where: {
        match_id: data.match_id,
        team_id: data.team2_id,
        player_id : data.bowler_id
      }
    });
     return true;
  }
};