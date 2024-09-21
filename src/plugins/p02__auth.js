const { getToken, varifyJwt } = require("../helpers/jwt");
const { sendError } = require("../utils");

module.exports = {
  dispatch: async function (req, res, next) {
    // get token
    var token = getToken(req);

    // is authenticted
    if (req.isAuthenticated()) {
      req.couchSession = {
        userCtx: {
          id: req.user._id,
          name: req.user.name || "unknown",
          roles: req.user.role,
        },
      };
      res.cookie("AuthSession", req.sessionID, { httpOnly: true });
      return next();
    } else if (token) {
      console.info("JSON Authentication started because token found");
      varifyJwt(token, (err, decoded) => {
        if (err) {
          console.error(err);

          return sendError(res, {
            status: 401,
            name: "Unauthorized",
            message: err.message || "Invalid json web token",
          });
        } else {
          //console.log(decoded);
          req.couchSession = {
            userCtx: {
              id: decoded.id || decoded.audience,
              name: decoded.name,
              email: decoded.email,
              roles: decoded.role || ["guest"],
            },
          };
          return next();
        }
      });
    } else {
      console.info(
        "Not authenticated nor Token is found. So, setting default user"
      );

      // set default user
      req.couchSession = {
        userCtx: {
          id: 1,
          name: "Guest",
          roles: ["guest"],
        },
      };

      next();
    }
  },
};
