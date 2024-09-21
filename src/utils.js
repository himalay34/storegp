const bcrypt = require("bcrypt");

module.exports.hashPassword = async function (pass, saltRounds = 11) {
  try {
    const hash = await bcrypt.hash(pass, saltRounds);
    console.log(hash);
    return hash;
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
};

module.exports.compPassword = async function (pass, hash) {
  try {
    const matched = await bcrypt.compare(pass, hash);
    console.log(matched);
    return matched;
  } catch (e) {
    console.error(e);
    throw new Error(e.message);
  }
};
module.exports.validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

module.exports.validateUsername = (username) => {
  var re = new RegExp(/^([a-zA-Z0-9]{4,})$/); //any string contains a-z
  return re.test(username);
};

//https://www.w3resource.com/javascript/form/password-validation.php
module.exports.checkPassword = (pass) => {
  //var re = new RegExp("/^([a-zA-Z0-9_@-]){3,20}$/"); //any string contains a-z
  //var re = new RegExp(/^(\w{3,5})$/);
  var re = new RegExp(/^([a-zA-Z0-9_@-]){4,20}$/);

  return re.test(pass);
};

module.exports.checkRegFields = function (obj) {
  const error = [];

  const { email, password, name, bmdc, mobile } = obj;

  if (!email) error.push("Email is required");
  if (!password) error.push("Password is required");
  if (!name) error.push("Full Name is required");
  if (!bmdc) error.push("BMDC registration number is required");
  if (!mobile) error.push("Mobile number is required");

  if (!module.exports.validateEmail(email))
    error.push("Invalid email provided");
  if (!module.exports.checkPassword(password))
    error.push("Invalid pasword provided");

  if (error.length < 1) {
    return true;
  } else {
    throw new Error(error.join(","));
  }
};

module.exports.uid = () => {
  var date = new Date();
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString();
};

module.exports.getRoleId = function (req) {
  // return this.role(req); /// return guest while using token
  return req.couchSession.userCtx.roles || ["guest"];
};

module.exports.role = function (req) {
  return req.isAuthenticated() ? req.user.role : ["guest"];
};

module.exports.getResourceId = function (req, n = 1) {
  let url = req.path;
  return url
    .split("/")
    .slice(0, n + 1)
    .join("/");
};

module.exports.rawPath = function (req) {
  var rawPath = req.originalUrl.slice(req.baseUrl.length);
  if (rawPath[0] !== "/") {
    rawPath = "/" + rawPath;
  }
  return rawPath;
};

/**
 *
 * @param {*} res
 * @param {*} err
 * @param {*} baseStatus
 */
module.exports.sendError = function (res, err, baseStatus) {
  var status = err.status || baseStatus || 500;
  if (err.name && err.message) {
    err = {
      error: err.name,
      reason: err.message,
    };
  }
  module.exports.sendJSON(res, status, err);
};

/**
 *
 * @param {*} res
 * @param {*} status
 * @param {*} body
 */
module.exports.sendJSON = function (res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.send(Buffer.from(JSON.stringify(body) + "\n", "utf8"));
};

/**
 *
 * @param {*} urlName
 */
module.exports.adminOnlyErrorr = (urlName) => {
  return {
    status: 401,
    name: "unauthorized",
    message: `Only admins can access this resource: ${urlName}`,
  };
};
