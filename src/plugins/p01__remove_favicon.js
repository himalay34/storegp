module.exports = {
  dispatch: async function (req, res, next) {
    if (req.url === "/favicon.ico") {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end(/* icon content here */);
    } else {
      next();
    }
  },
};
