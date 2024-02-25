var db = require("../model");
const sequelize = require("sequelize");
var moment = require("moment");
const { response } = require("../server");
var socketfunction = require("./socket_common");
var helperFunction = require("./helper");
const Op = sequelize.Op;
const user = db.users;
const score_board_batting = db.score_board_batting;
const score_board_bowling = db.score_board_bowlers;
const matches = db.matches;
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

  updateScore: async (data) => {

          // update match status to running.
          let updateObj = {status : 2};
          await matches.update(updateObj, { where: { id: data.match_id } });
  
          // Retrieve player and bowler details asynchronously
          const [playerDetail, bowlerDetail, player2_id, match_detail] = await Promise.all([
            socketfunction.playerDetailById(data),
            socketfunction.bowlerDetailById(data),
            socketfunction.playerTwoDetailById(data),
            socketfunction.matchDetail(data.match_id),
          ]);

          // player detail to send the batsman name and bowler detail in the response.
          const [player1Details, player2Details,bowlerDetails,  ] = await Promise.all([
            user.findByPk(data.player1_id),
            user.findByPk(data.player2_id),
            user.findByPk(data.bowler_id),
          ]);
          // Check if the current event is an extra
          const isExtra = [8, 9, 10, 11].includes(data.type);
          // Calculate the fantasy point of batsman and bowler
          let fantasy_points = playerDetail.fantasy_points;
          const checkBowlerEntry = await helperFunction.getBattingDetailsOfBowler(data);
          let bowler_fantasy_points = checkBowlerEntry.fantasy_points;
          if(match_detail.total_over <= 10){
            fantasy_points = await socketfunction.fantasyPointBatsmanT10(playerDetail, data, isExtra);
            bowler_fantasy_points = await socketfunction.fantasyPointBolwerT10(checkBowlerEntry,bowlerDetail, data);
          }else{
            fantasy_points = await socketfunction.fantasyPointBatsmanT20(playerDetail, data, isExtra);
            bowler_fantasy_points = await socketfunction.fantasyPointBolwerT20(checkBowlerEntry, data, isExtra);
          }  
          // Calculate batsman object
          const batsmanObj = {
              balls: playerDetail.balls + 1,
              run: playerDetail.run + (isExtra ? 0 : data.run), // Don't add run if it's an extra
              type: data.type,
              fours: data.type === 4 ? playerDetail.fours + 1 : playerDetail.fours,
              sixs: data.type === 6 ? playerDetail.sixs + 1 : playerDetail.sixs,
              strike_rate: ((playerDetail.run + (isExtra ? 0 : data.run)) / (playerDetail.balls + 1)) * 100,
              fantasy_points: fantasy_points
          };
          // Calculate bowler object
          const bowlerObj = {
            balls: isExtra ? bowlerDetail.balls : bowlerDetail.balls + 1,
            runs: bowlerDetail.runs + data.run,
            economy: ((bowlerDetail.runs + data.run) / (bowlerDetail.balls + 1)) * 6,
          };
          const bowlerFantasyPoint = { fantasy_points : bowler_fantasy_points};
          const conditionBatsmanObj = { match_id: data.match_id, team_id: data.team_id };
          const conditionBolwerObj = { match_id: data.match_id, team_id: data.team2_id };
          // Update batsman score if it's not an extra event
          if (!isExtra) {
            await Promise.all([
              socketfunction.updateBatsmanScore(batsmanObj, conditionBatsmanObj, data.player1_id, data.player2_id),
              socketfunction.updateBatsmanBowlerFantasyScore(bowlerFantasyPoint, data)
            ]);
          } else { // If it's an extra, update extras table
            const extraObj = { match_id: data.match_id, team_id: data.team_id, type: data.type, count: data.run };
            await socketfunction.updateExtras(extraObj);
          }
          // Update bowler score
          await socketfunction.updateBowlerScore(bowlerObj, conditionBolwerObj, data.bowler_id);
          //Fetch total score and total overs.
          const [total_score, total_over,strikerDetail] = await Promise.all([
            socketfunction.totalScore(data),
            socketfunction.totalOver(data),
            socketfunction.stikerDetail(data)
          ]);   

          const total_wickets = await score_board_bowling.count({
            where: {
              match_id: data.match_id,
              team_id: data.team2_id,
              wicket: { [Op.gt]: 0 }
            }
          });
          // Prepare response object
          const response = {
              batsman: {
                  id: playerDetail.player_id,
                  run: isExtra ? playerDetail.run : playerDetail.run + data.run,
                  balls: playerDetail.balls + 1,
                  name:player1Details?.name || player1Details?.mobile_number,
              },
              batsman_2: {
                id: player2_id.player_id,
                run: player2_id.run,
                balls: player2_id.balls,
                name:player2Details?.name || player2Details?.mobile_number,
              },
              bowler: {
                  id: bowlerDetail.player_id,
                  balls: await socketfunction.formatOver(bowlerObj.balls),
                  runs: bowlerObj.runs,
                  wicket: bowlerDetail.wicket,
                  mainders_over: bowlerDetail.mainders_over,
                  name:bowlerDetails?.name || bowlerDetails?.mobile_number,
              },
              striker: {
                  is_striker: strikerDetail.player_id,
              },
              scores: {
                total_run: total_score,
                total_over:await socketfunction.formatOver(total_over),
                match_total_overs : match_detail.total_over,
                total_wicket:total_wickets
            },
          };
          return response;
    },
};