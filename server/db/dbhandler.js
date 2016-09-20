  var mysql      = require('mysql');
  var pool   = mysql.createPool({ 
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'database'
  });

init = function(){ 
  console.log('DB init');  
  pool.getConnection(function(err, connection) {
   
    if (err) {
      console.error('error connecting: ' + err);
      return;
    }
    console.log('connected as id #' + connection.threadId);
    connection.release();
   
  });
  
}

checkLoginCredentials = function(user_id, user_password, callback){
 
  pool.getConnection(function(err, connection) {
    
  var sql = 'SELECT * FROM trip WHERE id = ' + connection.escape(user_id) + ' AND password = ' + connection.escape(user_password);
  connection.query(sql, function(err, dbResponse) {
  if(err) {
    console.log(err);    
    return;
  }
    if(dbResponse.length > 0){
      callback(true);
    } else {
      callback(false);
    }  
  });

   connection.release();
  });
}

getQuestions = function(callback){
  pool.getConnection(function(err, connection) {
    
  if (err) console.log(err);
  var sql = 'SELECT * FROM questions';
  connection.query(sql, function(err, dbResponse) {
  if(err) {
    console.log(err);
    callback(err, null);    
    return;
  }
  if(dbResponse.length > 0){
      callback(null, dbResponse);
    } 
    connection.release();

  });

  });
}

getAnswers = function(callback){
 
pool.getConnection(function(err, connection) {

var sql = 'SELECT * FROM answer_options';
  
connection.query(sql, function(err, dbResponse) {
    
  if(err) {
    console.log(err);
    callback(err, null);    
    return;
  }
  if(dbResponse.length > 0){    
    callback(null, dbResponse);    
  }
  connection.release();
  
});

 
});

}


exports.init = init;
exports.checkLoginCredentials = checkLoginCredentials;
exports.getQuestions = getQuestions;
exports.getAnswers = getAnswers;