const config = {
  endpoint: "https://s3.tebi.io",
  credentials: {
    accessKeyId: process.env.LOCAL_ACCESS_KEY,
    secretAccessKey: process.env.LOCAL_SECRET_KEY,
  },
  region: "global",
};

module.exports = config;
