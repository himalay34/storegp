const express = require('express');
//const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
/*
// Connect to MongoDB
mongoose
  .connect(
    'mongodb://' + process.env.MONGODB_HOST + ':27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Item = require('./models/Item');
*/
app.get('/',(req, res) => {
	res.send("hellow wolrd... whats up?")
});
/*
app.get('/item', (req, res) => {
  Item.find()
    .then(items => res.render('index', { items }))
    .catch(err => res.status(404).json({ msg: 'No items found' }));
});

app.post('/item/add', (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });

  newItem.save().then(item => res.redirect('/'));
});
*/
const port = 3000;

app.listen(port, () => console.log('Server running...'));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", async (ex) => {
  console.warn("Unhandled Rejection");
  console.error(ex);
});
