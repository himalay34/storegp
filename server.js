'use strict';

const express = require('express')
const port = process.env.PORT || 3000

const app = express()
app.get('/',(req,res)=>{
	res.send("voila")
})

app.listen(port, function () {
  console.log('Your pouchdb is listening on port ' + port);
});