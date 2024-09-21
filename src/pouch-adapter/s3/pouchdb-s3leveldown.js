const CoreLevelPouch = require("pouchdb-adapter-leveldb-core");
const assign = require("pouchdb-utils").assign;
const S3LevelDown = require("./s3leveldown");

function S3LevelDownPouch(opts, callback) {
  if (!opts.prefix) {
    opts.prefix = process.env.DB_PREFIX;
  }
  const s3k = process.env.DETA_SPACE_APP_HOSTNAME;

  if (s3k.startsWith("localhost")) {
    opts.s3Obj = require("./s3-config");
  }
  var _opts = assign(
    {
      db: (bucket) => new S3LevelDown(bucket, opts),
    },
    opts
  );

  CoreLevelPouch.call(this, _opts, callback);
}

// overrides for normal LevelDB behavior on Node
S3LevelDownPouch.valid = function () {
  return true;
};
S3LevelDownPouch.use_prefix = false;

module.exports = function (PouchDB) {
  PouchDB.adapter("s3leveldown", S3LevelDownPouch, true);
};

/**
 * use
 * PouchDB.plugin(require('./pouchdb-s3leveldown'));
 * const s3 = {
	endpoint: "https://s3.tebi.io",
	credentials: {
		accessKeyId: "braxxxxxx",
		secretAccessKey: "MeGQt15d0xxxxxxxxxi"
	},
    region: "global"
}
 * const db = new PouchDB('erx', { prefix: 'erx-', adapter: 's3leveldown',s3Obj: s3 });
 */
