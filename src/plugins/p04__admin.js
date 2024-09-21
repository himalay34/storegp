const utils = require("../utils");

module.exports = {
  dispatch: async function (req, res, next) {
    if (req.path.startsWith("/admin")) {
      let role = utils.getRoleId(req);
      console.log(role);
      
      if (role.includes(process.env.ACL_ADMIN_ROLE)) return next();
      else
        return utils.sendError(res, {
          status: 403,
          name: "Forbidden",
          message: "You do not have permission to access this resource.",
        });
    } else {
      next();
    }
  },
};
