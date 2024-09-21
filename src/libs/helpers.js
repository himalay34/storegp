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
  const data = {
    error: false,
    msg: "Success",
  };
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

  if (error.length > 0) {
    data.error = true;
    data.msg = error.join(",");
  }

  return data;
};

module.exports.uid = () => {
  var date = new Date();
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString();
};
