var db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const { response } = require("../server");
var socketfunction = require("./socket_common");
const Op = sequelize.Op;
const user = db.users;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowling;
const match = db.match;
module.exports = {
     playerDetail :async  (data)=> {
        try {
          const [
            player1Details,
            player2Details,
            bowlerDetails,
            strikerDetails,
          ] = await Promise.all([
            user.findByPk(data.player1_id),
            user.findByPk(data.player2_id),
            user.findByPk(data.bowler_id),
            await socketfunction.stikerDetail(data),
          ]);

          return {
            player1_name: player1Details?.name || player1Details?.mobile_number,
            player2_name: player2Details?.name || player2Details?.mobile_number,
            bowler_name: bowlerDetails?.name || bowlerDetails?.mobile_number,
            striker_id: strikerDetails?.is_stricker,
            player1_id: data.player1_id,
            player2_id: data.player2_id,
            bowler_id: data.bowler_id,
          };
        } catch (error) {
          console.error("Error fetching player details:", error);
          throw error;
        }
      }, 

    updateScore : async (data) =>{
          const [playerDetail, bowlerDetail] = await Promise.all([
              socketfunction.playerDetailById(data),
              socketfunction.bowlerDetailById(data),
          ]);
          const batsmanObj = {
            balls: playerDetail.balls + 1,
            run: playerDetail.run + data.run,
            type: data.type,
            fours: data.type === 4 ? playerDetail.fours + 1 : playerDetail.fours,
            sixs: data.type === 6 ? playerDetail.sixs + 1 : playerDetail.sixs,
            strike_rate: ((playerDetail.run + data.run) / (playerDetail.balls + 1)) * 100,
          };
          const bowlerObj = { 
            balls: bowlerDetail.balls + 1,
            runs: bowlerDetail.runs + data.run,
            economy: ((bowlerDetail.runs + data.run) / (bowlerDetail.balls + 1)) * 6,
          };          
          const conditionObj = {
            match_id : data.match_id,
            team_id  : data.team_id,
          };
          await socketfunction.updateBatsmanScore(batsmanObj,conditionObj,data.player1_id,data.player2_id);
          await socketfunction.updateBowlerScore(bowlerObj,conditionObj,data.bowler_id);
          let _striker_detail =    await socketfunction.stikerDetail(data);
          const response = {
            batsman: {
              id:playerDetail.player_id,
              run:playerDetail.run + data.run,
              balls:playerDetail.balls + 1,
            },
            bowler: {
              id:    bowlerDetail.player_id,
              balls:  await socketfunction.formatOver(bowlerDetail.balls + 1),
              runs:   bowlerDetail.runs + data.run,
              wicket: bowlerDetail.wicket,
            },
            stricker: {
              is_stricker: _striker_detail.player_id
            },
          };
          return response;
    },
};