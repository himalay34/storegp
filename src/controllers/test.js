module.exports.boot = (app) => {
  app.get("/tesit", function (req, res) {
    return res.json({ success: true });
  });
};
