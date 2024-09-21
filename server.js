require("dotenv").config();
const App = require("./src/app");

App.addService("init-passport");

App.boot();

const app = App.express();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", async (ex) => {
  console.warn("Unhandled Rejection");
  console.error(ex);
});
