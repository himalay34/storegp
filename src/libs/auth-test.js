const Auth = require("./auth");
const l = console.log;

const doc = {
  email: "user3@gmail.com",
  password: "password",
  name: "User 3",
  bmdc: "bmdc",
  mobile: "019783234",
};

// register
function register() {
  Auth.register(doc, (er, user) => {
    if (er) console.log(er);
    else console.log(user);
  });
}

// login
function login() {
  Auth.login(doc.email, doc.password, (er, user) => {
    if (er) console.log(er);
    else console.log(user);
  });
}
//login();
// varify
function varify(email, token) {
  Auth.varify(email, token, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}

// change password
function changePassword(email, password, token) {
  Auth.changePassword(email, password, token, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}

// forget password
function forgetPassword(email) {
  Auth.forgetPassword(email, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}
//forgetPassword(doc.email);
///////////////////////////
/** admin only functions */
// reset password
function resetPassword(email) {
  Auth.resetPassword(email, "newpassword", (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}
//resetPassword(doc.email);
// activate user
function activateUser(email) {
  Auth.activateUser(email, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}

// deactivate user
function deactivateUser(email) {
  Auth.deactivateUser(email, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}

// update user role
function dupdateUserRole(email, role) {
  Auth.updateUserRole(email, role, (er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}

// list all users
function listUsers() {
  Auth.users((er, info) => {
    if (er) console.log(er);
    else console.log(info);
  });
}
