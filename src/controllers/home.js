const { Base } = require("deta");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const password = "Admin@123";

const utils = require("../utils.js");
// bcrypt
//   .genSalt(saltRounds)
//   .then((salt) => {
//     console.log("Salt: ", salt);
//     return bcrypt.hash(password, salt);
//   })
//   .then((hash) => {
//     console.log("Hash: ", hash);
//   })
//   .catch((err) => console.error(err.message));
module.exports.boot = (app) => {
  app.get("/", function (req, res) {
    res.status(200).json({ error: false, message: "Welcome to The Hell" });
  });

  app.get("/db", async (req, res) => {
    res.send("db is available");
  });

  app.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({
          error: true,
          message: "Email required",
        });
      }
      if (!password) {
        return res.status(400).json({
          error: true,
          message: "Password is required",
        });
      }

      const dbName = process.env.AUTH_DB || "users";
      const db = Base(dbName);

      const user = await db.get(email);
      if (!user) return res.status(401).send("No user Found with this email");
      const valid = await bcrypt.compare(password, user.hash);
      if (valid) {
        // is active
        if (!user.varified) return res.status(401).send("User not varified");

        if (!user.active) return res.status(401).send("User not activated");

        delete user.hash;
        delete user.key;

        return res.send(user);
      } else {
        return res.status(401).send("Incorrect Password");
      }
    } catch (e) {}
  });
};
