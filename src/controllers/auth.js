const passport = require("passport");
const { signRefreshToken, signAccessToken } = require("../helpers/jwt");

module.exports.boot = (app) => {
  app.post("/login", function (req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.json({
        error: true,
        message: "Email required",
      });
    }
    if (!password) {
      return res.json({
        error: true,
        message: "Password is required",
      });
    }

    app.get("auth").login(email, password, async (er, user) => {
      if (er) {
        console.error(er);

        return res.json({ error: true, message: er });
      }

      try {
        const refreshToken = await signRefreshToken(user._id);
        const accessToken = await signAccessToken({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        });

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.id = user._id;
        delete user._id;
        delete user.role;
        // delete some fields
        delete user.token;
        delete user.active;
        //delete user.role;
        delete user.varified;

        return res.send({
          error: false,
          message: "authentication succeeded",
          data: user,
        });
      } catch (e) {
        res.json({
          error: true,
          message: e.message || e,
        });
      }
    });

    //res.status(200).json({ error: true, message: "dummy message" });
    //res.render("home"); // home/index
  });
  app.post("/signin", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (!user) {
        return res.status(401).send({
          error: true,
          message: "authentication failed",
          reason: info,
        });
      }
      // ***********************************************************************
      // "Note that when using a custom callback, it becomes the application's
      // responsibility to establish a session (by calling req.login()) and send
      // a response."
      // Source: http://passportjs.org/docs
      // ***********************************************************************
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        try {
          const refreshToken = await signRefreshToken(user._id);
          const accessToken = await signAccessToken({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          });

          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          // delete some fields
          delete user.token;
          delete user.active;
          //delete user.role;
          delete user.varified;

          return res.send({
            error: false,
            message: "authentication succeeded",
            data: user,
          });
        } catch (error) {
          res.status(400).json({
            error: true,
            message: error.message || "Something went wrong while signing JWT",
          });
        }
      });
    })(req, res, next);
  });

  app.post(
    "/ssignin",
    passport.authenticate("local", { session: false }),
    (req, res) => {
      res.json({ error: false, data: req.user });
    }
  );

  app.post("/signup", (req, res) => {
    app.get("auth").register(req.body, (err, user) => {
      if (err) {
        return res.status(400).json({ error: true, message: err });
      } else {
        // remove token, send token to email address
        var token = user.token;
        delete user.token;
        return res.json({ error: false, data: user });
      }
    });
  });

  app.post("/varify", (req, res) => {
    const { email, token } = req.body;
    app.get("auth").varify(email, token, (er, resp) => {
      if (er) return res.json({ error: true, message: er });
      return res.json({ error: false, data: resp });
    });
  });

  // change password
  app.post("/change-password", (req, res) => {
    const { email, password, token } = req.body;
    app.get("auth").changePassword(email, password, token, (er, resp) => {
      if (er) return res.json({ error: true, message: er });
      return res.json({ error: false, data: resp });
    });
  });
  // forgetPassword //forgetPassword
  app.post("/forget-password", (req, res) => {
    const { email } = req.body;
    app.get("auth").forgetPassword(email, (er, token) => {
      if (er) return res.json({ error: true, message: er });
      // send token to email
      return res.json({ error: false, data: { code: "token" } }); // serious bug,
    });
  });

  app.post(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      res.send(req.user);
    }
  );
};
