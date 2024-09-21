const PouchDB = require("pouchdb-core")
  .plugin(require("pouchdb-mapreduce"))
  .plugin(require("pouchdb-replication"))
  .plugin(require("./pouch-adapter/s3/pouchdb-s3leveldown"));

const s3Config = {
  endpoint: "https://s3.tebi.io",
  credentials: {
    accessKeyId:
      process.env.ACCESS_KEY_ID === "accessKey"
        ? process.env.LOCAL_ACCESS_KEY
        : process.env.SECRET_ACCESS_KEY,
    secretAccessKey:
      process.env.SECRET_ACCESS_KEY === "secretKey"
        ? process.env.LOCAL_SECRET_KEY
        : process.env.SECRET_ACCESS_KEY,
  },
  region: "global",
};

PouchDB.defaults({ adapter: "s3leveldown", s3Obj: s3Config });

module.exports = PouchDB;
