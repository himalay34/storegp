```const fs = require('fs');
const initSqlJs = require('sql-wasm.js');
const filebuffer = fs.readFileSync('test.sqlite');

initSqlJs().then(function(SQL){
  // Load the db
  const db = new SQL.Database(filebuffer);
});
```
