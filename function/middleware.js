const db = require("../model");
const commonFunction = require("../function/common_function");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const user = db.users;
const jwt = require("jsonwebtoken");
const secretKey = "mYs3cr3tK3yf0rJWTs!4fjnR2sT4PdPqL5y";

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return commonFunction.errorMesssage(res, "Enter Token", {});
  }
  const checkTokenObj = await user.findOne({
    where: { token: token },
  });
  if (checkTokenObj) {
    next();
  } else {
    return commonFunction.errorMesssage(res, "Invalid Token", {});
  }
  // jwt.verify(token, secretKey, (err, decoded) => {
  //     console.log(err);
  //     if (err) {
  //         return commonFunction.errorMesssage(res,'Invalid Token',{});
  //     }
  //     req.user = decoded;
  //     next();
  // });
};

module.exports = {
  verifyToken,
};
