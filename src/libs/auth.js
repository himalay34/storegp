const { Base } = require("deta");
const bcrypt = require("bcrypt");
const { randomBytes } = require("node:crypto");
const utils = require("./helpers");
function Auth() {
  if (!(this instanceof Auth)) return new Auth();

  this.configure();
}
Auth.prototype.configure = function () {
  const dbName = process.env.AUTH_DB || "users";
  this.db = Base(dbName);
};

Auth.prototype.login = function (email, password, cb) {
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  if (!utils.checkPassword(password)) return cb("Invalid password provided");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return { error: "No user found", data: null };
      const valid = await bcrypt.compare(password, user.hash);
      if (!valid) return { error: "Incorrect Password", data: null };
      if (!user.varified) return { error: "User not varified", data: null };
      if (!user.active) return { error: "User not activated", data: null };

      delete user.hash;
      delete user.key;
      return { error: null, data: user };
    })
    .then((info) => {
      cb(info.error, info.data);
    })
    .catch((e) => {
      cb(e);
    });
};

Auth.prototype.register = function (obj, cb) {
  let self = this;
  // check fields
  const check = utils.checkRegFields(obj);
  if (check.error) return cb(check.msg);

  const { email, password, name, bmdc, mobile } = obj;

  bcrypt.hash(password, 10, async (er, hash) => {
    if (er) return cb("Oops! Something went wrong,Please try again.");

    const doc = {
      name: name,
      bmdc: bmdc,
      mobile: mobile,
      email: email,
      hash: hash,
      token: randomBytes(4).toString("hex"),
      varified: false,
      active: false,
      _id: utils.uid(),
      role: ["user"],
    };
    try {
      const user = await self.db.insert(doc, email);
      delete user.hash;
      delete user.key;
      cb(null, user);
    } catch (e) {
      if (e.message.endsWith("already exists")) {
        return cb("A user already exists with this email");
      } else {
        return cb(e.message);
      }
    }
  });
};

Auth.prototype.varify = function (email, token, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");

      if (user.token !== token) return cb("Token is Invalid or expired");
      // now remove token, set varified to true
      const updates = {
        token: "",
        varified: true,
      };
      try {
        self.db.update(updates, email);
        cb(null, "User varified successfully");
      } catch (e) {
        cb(e.message);
      }
    })
    .catch((e) => {
      cb(e);
    });
};

Auth.prototype.changePassword = function (email, newPass, token, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  if (!utils.checkPassword(newPass)) return cb("Invalid new password provided");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");
      if (user.token !== token) return cb("Token is Invalid or expired");
      bcrypt.hash(newPass, 10, async (er, hash) => {
        if (er) return cb("Oops! Something went wrong,Please try again.");
        const updates = {
          token: "",
          hash: hash,
        };
        try {
          self.db.update(updates, email);
          cb(null, "User password updated successfully");
        } catch (e) {
          cb(e.message);
        }
      });
    })
    .catch((e) => {
      cb(e);
    });
};
Auth.prototype.forgetPassword = function (email, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("Email not found in database");
      const updates = {
        token: randomBytes(4).toString("hex"),
      };
      try {
        self.db.update(updates, email);
        cb(null, updates.token);
      } catch (e) {
        cb(e.message);
      }
    })
    .catch((e) => {
      cb(e.message);
    });
};

Auth.prototype.findUserById = function (id, cb) {
  let self = this;
  if (!utils.validateEmail(id)) return cb("Invalid id address");
  this.db
    .get(id)
    .then(async (user) => {
      if (!user) return cb("No user found");
      delete user.hash;
      delete user.key;
      cb(null, user);
    })
    .catch((e) => {
      cb(e.message);
    });
};
/** Admin only functions */
Auth.prototype.resetPassword = function (email, newPass, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");
      bcrypt.hash(newPass, 10, async (er, hash) => {
        if (er) return cb("Oops! Something went wrong,Please try again.");
        const updates = {
          token: "",
          hash: hash,
        };
        try {
          self.db.update(updates, email);
          cb(null, "User password reset successfull");
        } catch (e) {
          cb(e.message);
        }
      });
    })
    .catch((e) => {
      cb(e);
    });
};
Auth.prototype.activateUser = function (email, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");
      if (user.active) return cb(null, "User already activeted");

      const updates = {
        active: true,
        varified: true,
      };
      try {
        self.db.update(updates, email);
        cb(null, "User activated successfully");
      } catch (e) {
        cb(e.message);
      }
    })
    .catch((e) => {
      cb(e);
    });
};
Auth.prototype.deactivateUser = function (email, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");
      if (user.active == false) return cb(null, "User already deactiveted");
      const updates = {
        active: false,
      };
      try {
        self.db.update(updates, email);
        cb(null, "User deactivated successfully");
      } catch (e) {
        cb(e.message);
      }
    })
    .catch((e) => {
      cb(e);
    });
};
Auth.prototype.updateUserRole = function (email, role, cb) {
  let self = this;
  if (!utils.validateEmail(email)) return cb("Invalid email address");
  this.db
    .get(email)
    .then(async (user) => {
      if (!user) return cb("No user found");
      if (typeof role !== "string") return cb("Role must be a string");
      if (user.role.includes(role))
        return cb(null, "No need to add role again");

      const updates = {
        role: [role],
      };
      try {
        self.db.update(updates, email);
        cb(null, "User role updated successfully");
      } catch (e) {
        cb(e.message);
      }
    })
    .catch((e) => {
      cb(e);
    });
};
Auth.prototype.users = async function (cb) {
  try {
    let res = await this.db.fetch();
    let users = res.items;

    // continue fetching until last is not seen
    while (res.last) {
      res = await db.fetch({}, { last: res.last });
      users = users.concat(res.items);
    }
    cb(null, users);
  } catch (e) {
    cb(e.message);
  }
};

module.exports = Auth();
