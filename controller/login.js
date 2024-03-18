const commonFunction = require("../function/common_function");
const helper = require("../function/helper");
const jwt = require("jsonwebtoken");
var db = require("../model");
const secret = "mYs3cr3tK3yf0rJWTs!4fjnR2sT4PdPqL5y";
const user = db.users;
const user_wallets = db.user_wallets;


module.exports = {
  /*  Create User /Login with number */
  login: async (req, res) => {
    try {
        const requestArr = req.body;
        requestArr.token = jwt.sign(requestArr, secret);
        const user_create = await helper.createUser(requestArr);
        if (user_create) {
          const userDataObj = await helper.userByMobileNumber(requestArr);
           if(req.body.type == 3){
            const create_wallet = await helper.createUserWallet(userDataObj);
           }



          commonFunction.successMesssage(res, "Login Successfully", userDataObj);
        } else {
          commonFunction.errorMesssage(res, "Login With Invalid Type", {});
        }
    } catch (error) {
      commonFunction.errorMesssage(res, error, {});
    }
  },
 
  /*  Edit Profile of user  */
  edit_profile: async (req, res) => {
    try {
      const requestArr = req.body;
      if (req.files && req.files.profile_photo) {
        var img = await commonFunction.uploadFile(req.files.profile_photo, "user");
        requestArr.profile_photo = img.name;
      }
      const update_user = await user.update(requestArr, {
        where: { id: requestArr.id },
      });
      const userDataObj = await helper.userById(requestArr);
      if (update_user) {
        commonFunction.successMesssage(
          res,
          " User Update  Successfully",
          userDataObj
        );
      } else {
        commonFunction.errorMesssage(res, "Error while updating data", {});
      }
    } catch (error) {
      commonFunction.errorMesssage(res, error, {});
    }
  },


  logOut: async (req,res)=>{
     try{
      const requestArr = req.body;
            requestArr.token = '';
      const logout = await user.update(requestArr, {
        where: { id: requestArr.id },
      });
      if (logout) {
        commonFunction.successMesssage(
          res,
          "Logout  Successfully",
          {}
        );
      } else {
        commonFunction.errorMesssage(res, "Error while logout data", {});
      }
    }catch(error){
      commonFunction.errorMesssage(res, error, {});
    }
  }
};
