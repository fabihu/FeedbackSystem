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

getTrips = function(callback){
pool.getConnection(function(err, connection) {

var sql = 'SELECT * FROM trip';
  
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

insertAnswers = function(answers){   
  pool.getConnection(function(err, connection) {
    for(var index in answers){ 
    var answer = answers[index];     
    var query = connection.query('INSERT INTO answer SET ?', answer, function(err, result) {
      if(err){
        console.log(err);
      }
    });   
    }

    connection.release();
  }); 
}

insertNewTrip = function(trip, callback){  
pool.getConnection(function(err, connection) {           
  var query = connection.query('INSERT INTO trip SET ?', trip, function(err, result) {
    if(err){
      console.log(err);
    }
    callback(err);
  });
  connection.release();
}); 

}

insertNewQuestion = function(question, callback){
pool.getConnection(function(err, connection) {           
  var query = connection.query('INSERT INTO questions SET ?', question, function(err, result) {
    if(err){
      console.log(err);
    }
    callback(err, result.insertId);
  });
  connection.release();
}); 


}

insertNewAnswerOptions = function(answer_options, callback){
pool.getConnection(function(err, connection) {
  for(var index in answer_options){
  var option = answer_options[index];               
  var query = connection.query('INSERT INTO answer_options SET ?', option, function(err, result) {
  if(err){
    console.log(err);
  }
  });
  }
  callback(err);
  connection.release();
});   
}

getAnswersForQuestion = function(question_id, callback){
  pool.getConnection(function(err, connection) {
    
  if (err) console.log(err);
  var sql = 'SELECT * FROM answer_options WHERE question_id = ' + question_id;
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

getTravelTypes = function(callback){
  pool.getConnection(function(err, connection) {
    
  if (err) console.log(err);
  var sql = 'SELECT * FROM travel_type';
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

deleteTrip = function(trip_id, callback){
  pool.getConnection(function(err, connection) {    

  var query = connection.query('DELETE FROM trip WHERE id = ?', trip_id, function(err, result) {
    if(err){
      console.log(err);
    }
    callback();
  });
  connection.release();

  });
}
deleteQuestion = function(question_id, callback){
  pool.getConnection(function(err, connection) {    

  var query = connection.query('DELETE FROM questions WHERE id = ?', question_id, function(err, result) {
    if(err){
      console.log(err);
    }
    connection.query('DELETE FROM answer_options WHERE question_id = ?', question_id, function(err, result) {
      if(err){
        console.log(err);
      }
      callback();
    });
  });
  connection.release();

  });
}

updateTrip = function(trip_id, data, callback){
  pool.getConnection(function(err, connection) {
     
  var query = connection.query('UPDATE trip SET ? WHERE id=?' , [data, trip_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
  });
  callback(err); 
  connection.release();

  });
}

updateQuestion = function(question_id, data, callback){
  pool.getConnection(function(err, connection) {     
  var query = connection.query('UPDATE questions SET ? WHERE id=?' , [data, question_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
  });  
  callback(err); 
  connection.release();

  });
}

updateAnswer = function(answer_id, data, callback){
  pool.getConnection(function(err, connection) {     
  var query = connection.query('UPDATE answer_options SET ? WHERE id=?' , [data, answer_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
    callback(err); 
  });  
  connection.release();

  });  
}

changeActiveQuestion = function(question_id, question_status, callback){
  pool.getConnection(function(err, connection) {
  var active = (question_status == "true") ? 1:0;
  
  var query = connection.query('UPDATE questions SET active=? WHERE id=?' , [active, question_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
  });  
  callback(err);    
  connection.release();

  });
}

exports.init = init;
exports.checkLoginCredentials = checkLoginCredentials;
exports.getQuestions = getQuestions;
exports.getAnswers = getAnswers;
exports.getTrips = getTrips;
exports.insertAnswers = insertAnswers;
exports.insertNewTrip = insertNewTrip;
exports.insertNewQuestion = insertNewQuestion;
exports.getAnswersForQuestion = getAnswersForQuestion;
exports.getTravelTypes = getTravelTypes;
exports.deleteTrip = deleteTrip;
exports.updateTrip = updateTrip;
exports.changeActiveQuestion = changeActiveQuestion;
exports.insertNewAnswerOptions = insertNewAnswerOptions;
exports.deleteQuestion = deleteQuestion;
exports.updateQuestion = updateQuestion;
exports.updateAnswer = updateAnswer;