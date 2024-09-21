const utils = require("../utils.js");

module.exports.boot = (app) => {
  // activate user
  app.post("/admin/activate-user", function (req, res) {
    const { email } = req.body;
    app.get("auth").activateUser(email, (err, user) => {
      if (err) return res.status(400).json({ error: true, message: ere });
      return res.json({ error: false, data: user });
    });
  });
  // deactivate user
  app.post("/admin/deactivate-user", function (req, res) {
    const { email } = req.body;
    app.get("auth").deactivateUser(email, (err, user) => {
      if (err) return res.status(400).json({ error: true, message: ere });
      return res.json({ error: false, data: user });
    });
  });
  // update user role
  app.post("/admin/update-user-role", function (req, res) {
    const { email, role } = req.body;
    app.get("auth").updateUserRole(email, role, (er, resp) => {
      if (er) return res.status(400).json({ error: true, message: er });
      return res.json({ error: false, data: resp });
    });
  });
  app.post("/admin/make-admin", function (req, res) {
    const { email } = req.body;
    app
      .get("auth")
      .updateUserRole(email, process.env.ACL_ADMIN_ROLE, (er, resp) => {
        if (er) return res.status(400).json({ error: true, message: er });
        return res.json({ error: false, data: resp });
      });
  });
  // list users
  app.get("/admin/list-users", function (req, res) {
    app.get("auth").users((error, users) => {
      if (error)
        return res
          .status(400)
          .json({ error: true, message: error.message || error });
      else return res.json({ error: null, data: users });
    });
  });
};
