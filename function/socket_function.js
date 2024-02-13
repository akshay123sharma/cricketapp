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

      updateScore: async (data) => {
        // Retrieve player and bowler details asynchronously
        const [playerDetail, bowlerDetail] = await Promise.all([
            socketfunction.playerDetailById(data),
            socketfunction.bowlerDetailById(data),
        ]);
    
        // Check if the current event is an extra
        const isExtra = [8, 9, 10, 11].includes(data.type);
    
        // Calculate batsman object
        const batsmanObj = {
            balls: playerDetail.balls + 1,
            run: playerDetail.run + (isExtra ? 0 : data.run), // Don't add run if it's an extra
            type: data.type,
            fours: data.type === 4 ? playerDetail.fours + 1 : playerDetail.fours,
            sixs: data.type === 6 ? playerDetail.sixs + 1 : playerDetail.sixs,
            strike_rate: ((playerDetail.run + (isExtra ? 0 : data.run)) / (playerDetail.balls + 1)) * 100,
        };
    
        // Calculate bowler object
        const bowlerObj = {
          balls: isExtra ? bowlerDetail.balls : bowlerDetail.balls + 1,
          runs: bowlerDetail.runs + data.run,
          economy: ((bowlerDetail.runs + data.run) / (bowlerDetail.balls + 1)) * 6,
      };
      
    

        console.log(bowlerDetail.runs + data.run,"111");
        console.log(bowlerDetail.balls + 1,"1112");
        console.log(((bowlerDetail.runs + data.run) /  bowlerDetail.balls + 1) * 6,"==");
        



        // Condition object for updating records
        const conditionObj = {
            match_id: data.match_id,
            team_id: data.team_id,
        };
    
        // Update batsman score if it's not an extra event
        if (!isExtra) {
            await socketfunction.updateBatsmanScore(batsmanObj, conditionObj, data.player1_id, data.player2_id);
        } else { // If it's an extra, update extras table
            const extraObj = {
                match_id: data.match_id,
                team_id: data.team_id,
                type: data.type,
                count: data.run,
            };
            await socketfunction.updateExtras(extraObj);
        }
    
        // Update bowler score
        await socketfunction.updateBowlerScore(bowlerObj, conditionObj, data.bowler_id);
    
        // Fetch striker details
        const strikerDetail = await socketfunction.stikerDetail(data);


        //Fetch total score and total overs.
        const total_scrore = await socketfunction.totalScore(data);
        const total_over = await socketfunction.totalOver(data);    
        // Prepare response object
        const response = {
            batsman: {
                id: playerDetail.player_id,
                run: isExtra ? playerDetail.run : playerDetail.run + data.run,
                balls: playerDetail.balls + 1,
            },
            bowler: {
                id: bowlerDetail.player_id,
                balls: await socketfunction.formatOver(bowlerObj.balls),
                runs: bowlerObj.runs,
                wicket: bowlerDetail.wicket,
            },
            striker: {
                is_striker: strikerDetail.player_id,
            },
            scores: {
              total_run: total_scrore,
              total_over:total_over
          },
        };
        return response;
    },
    
};