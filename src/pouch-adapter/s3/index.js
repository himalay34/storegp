const PouchDB = require('pouchdb');

PouchDB.plugin(require('./pouchdb-s3leveldown'));


const db = new PouchDB('erx', { adapter: 's3leveldown' });

function addTodo(i,text) {
  const todo = {
    _id: `todo:${i}`,
    title: `${text} ${Math.floor(Math.random() * 16777215).toString(16)}`,
    completed: false
  };
  db.put(todo, (err, result) => {
    if (!err) {
      console.log('Successfully posted a todo!');
    }
    else {
      console.log(err);
    }
  });
}

function showTodos() {
  db.allDocs({include_docs: true, descending: true}, (err, doc) => {
    if (!err) {
      console.log(doc.rows);
    }
    else {
      console.log(err);
    }
  });
}

//addTodo('shopping');
//addTodo('isolate');
//addTodo('exercise');

showTodos();
//db.put({_id:"gopal",name:"Gopal Bhar"}).then(console.log).catch(console.error)
//db.put({_id:"montri",name:"Gopal Bhar er montri"}).then(console.log).catch(console.error)
//db.put({_id:"raja",name:"Gopal Bhar er Raja Krishnochandra"}).then(console.log).catch(console.error)
//db.put({_id:"gopal",name:"Gopal Bhar"}).then(console.log).catch(console.error)
//db.put({_id:"gopal",name:"Gopal Bhar"}).then(console.log).catch(console.error)
//db.get("gopal").then(console.log).catch(console.error)
for(let i = 1; i< 20;i++){
	//addTodo(i,'bingo test')
}