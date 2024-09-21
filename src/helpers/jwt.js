const JWT = require("jsonwebtoken");
const config = require("../config");
const aExp = process.env.A_EXP || "7 days"; // 7days
const rExp = process.env.R_EXP || "60 days"; // 30days
/** JSON webtoken */
/**
 *
 * @param {expressjs request} req
 * @return string or null
 */
module.exports.getToken = function (req) {
  var token;
  // get token from req.query
  if (req.query && req.query.token) {
    token = req.query.token;
  } else if (req.headers && req.headers.authorization) {
    token =
      req.headers.authorization.split(" ")[1] || req.headers.authorization;
  } else if (req.body && req.body.token) {
    token = req.body && req.body.token;
  }

  if (token) return token;
  return null;
};

module.exports.signRefreshToken = function (id) {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      //expiresIn: rExp,
      issuer: "erx",
      audience: id,
    };

    JWT.sign(payload, config.refreshTokenSecret, options, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

module.exports.signAccessToken = function (payload) {
  return new Promise((resolve, reject) => {
    const options = {
      //expiresIn: aExp,
      issuer: "erx",
    };

    JWT.sign(payload, config.secret, options, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

module.exports.varifyRefreshToken = function (token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, config.refreshTokenSecret, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload.aud);
      }
    });
  });
};

module.exports.varifyAccessToken = function (token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, config.secret, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};

module.exports.signToken = function (payload, cb) {
  const options = {
    //expiresIn: aExp,
    issuer: "erx",
  };

  JWT.sign(payload, config.secret, options, (err, token) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, token);
    }
  });
};

module.exports.varifyJwt = function (token, cb) {
  JWT.verify(token, config.secret, function (err, decoded) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, decoded);
    }
  });
};
