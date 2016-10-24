var async = require('async');
var mysql      = require('mysql');
var pool   = mysql.createPool({ 
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'database'
});

var TABLE_QUESTIONS = 'questions';
var TABLE_ANSWERS = 'answers';
var TABLE_USER_ANSWERS = 'user_answers';
var TABLE_ANSWER_COLLECTION = 'answer_collection';
var TABLE_QUESTION_COLLECTION = 'question_collection';
var TABLE_ANSWER_SET = 'answer_set';
var TABLE_QUESTION_SET = 'question_set';
var TABLE_TRIPS = 'trip';
var TABLE_TRAVEL_TYPE = 'travel_type';

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
    
  var sql = 'SELECT * FROM ' + TABLE_TRIPS + ' WHERE id = ' + connection.escape(user_id) + ' AND password = ' + connection.escape(user_password);
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
  var sql = 'SELECT * FROM ' + TABLE_QUESTIONS;
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

getAllActiveQuestions = function(callback){
 pool.getConnection(function(err, connection) {   
 
  connection.query('SELECT * FROM ' + TABLE_QUESTION_COLLECTION +' WHERE flag_history="active"', function(err, dbResponse) {
  if(err) {
    console.log(err);
    callback(err, null);    
    return;
  } 
  callback(null, dbResponse);
  
  connection.release();

  });

  });
} 


getQuestionsForTrips = function(trips, callback){
  async.mapSeries(trips, function(trip, callback){
    getQuestionsForTrip(trip.id, function(err, dbResponse){
      if (err) console.log(err);              
      callback(err, dbResponse);
    }); 
  }, function (err, result){
    if (err) console.log(err);    
    callback(null, result);
  });
}

getQuestionsForTrip  = function(trip_id, callback){
  pool.getConnection(function(err, connection) {     
  async.waterfall([function (callback){    
   connection.query('SELECT * FROM ' + TABLE_QUESTION_SET + ' WHERE trip_id = ? ORDER BY position ASC' , [trip_id], function(err, dbResponse) {      
      if(err) {
        console.log(err);       
      }    
      callback(null, dbResponse);    
    });
   

  }, function (result, callback){
    
    async.mapSeries(result, function(question_row, callback){
     connection.query('SELECT * FROM ' + TABLE_QUESTION_COLLECTION + ' WHERE question_id = ? AND question_version = ?',[question_row.question_id, question_row.question_version],  function(err, dbResponse) {
      if (err) console.log(err);     
      callback(err, dbResponse);
     });

    }, function(err, dbQuestions){      
      if (err) console.log("Error: ", err);          
      callback(null, dbQuestions);
    });

  }], function (err, result){
    if(err) console.log(err);      
    callback(null,result);
  });
  
  connection.release();

  });

 
}

getActiveAnswersFromCollection  = function(question_id, callback){
pool.getConnection(function(err, connection) {
  
var query = connection.query('SELECT * FROM ' + TABLE_ANSWER_COLLECTION + ' WHERE question_id = ? AND flag_history="active"', [question_id], function(err, dbResponse) {
    
  if(err)console.log(err);
  callback(null, dbResponse);    
  
  connection.release();
  
}); 
});
}

getAnswers = function(callback){
 
pool.getConnection(function(err, connection) {

var sql = 'SELECT * FROM ' + TABLE_ANSWERS;
  
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

var sql = 'SELECT * FROM ' + TABLE_TRIPS;
  
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

insertUserAnswers = function(answers){   
  pool.getConnection(function(err, connection) {
    for(var index in answers){ 
    var answer = answers[index];     
    var query = connection.query('INSERT INTO ' + TABLE_USER_ANSWERS + ' SET ?', answer, function(err, result) {
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
  var query = connection.query('INSERT INTO ' + TABLE_TRIPS + ' SET ?', trip, function(err, result) {
    if(err){
      console.log(err);
    }

    async.parallel({
      questions: function(callback) {
         insertStandardQuestionsIntoSet(function(){
           callback(err);
         });
      },
      answers: function(callback) {
         insertStandardAnswersIntoSet(function(){
          callback(err);
        });
      }  
      
  },  
  function(err, results) {
     callback();
  });
  connection.release();
  }); 
}); 
}

insertStandardQuestionsIntoSet = function(callback){
    async.timesSeries(6, function(n, next) {
      insertQuestionsIntoSet(n, function(err) {
        next(err);
      });
    }, function(err) {
       callback(err);
    });
} 

insertStandardAnswersIntoSet = function(outerCallback){

  async.timesSeries(6, function(n, callback) {

    getAnswersForQuestion(n+1, function(err, dbResponse) {
        
    var answer_ids = [];
    for (var index in dbResponse){
      var temp_id = dbResponse[index].id;
      answer_ids.push(temp_id);          
    }
    console.log("Answer ID Array: " + answer_ids);
    
    async.eachSeries(answer_ids, function(id, innerCallback){
          insertAnswersIntoSet(id, n, function(err){
            console.log(id + " inserted into database");
            innerCallback(err);
          });
      }, function(err) {
       console.log("Error: " + err);       
       callback(err);
      });        
    });
  
  }, function(err) {
    outerCallback(err);
  });

}


insertQuestionsIntoSet = function(id, callback){
  pool.getConnection(function(err, connection) {
   var query = connection.query('INSERT INTO ' + TABLE_QUESTION_SET + ' (trip_id, position, question_id, question_version) VALUES ((SELECT max(id) FROM trip), '+ (id + 1) + ', ' + (id + 1) + ', (SELECT max(question_version) FROM '+TABLE_QUESTION_COLLECTION + ' WHERE question_id=' + (id + 1) +'))', function(err) {    
           if(err)console.log(err);
           callback(err);
   });
  }); 
}

insertAnswersIntoSet = function(id, question_id, callback){
  pool.getConnection(function(err, connection) {
   var query = connection.query('INSERT INTO ' + TABLE_ANSWER_SET + ' (trip_id, question_id, answer_id, answer_version) VALUES ((SELECT max(id) FROM trip), ' + (question_id+1) + ',' + id + ', (SELECT max(answer_version) FROM '+TABLE_ANSWER_COLLECTION + ' WHERE answer_id=' + id +'))', function(err) {
    if(err)console.log(err);
    callback(err);
   });
   connection.release();      
  }); 
}

insertNewQuestion = function(question, callback){
pool.getConnection(function(err, connection) {           
  var query = connection.query('INSERT INTO ' + TABLE_QUESTIONS + ' SET ?', question, function(err, result) {    
    if(err){
      console.log(err);
    }
    var question_id = result.insertId;
    connection.query('INSERT INTO ' + TABLE_QUESTION_COLLECTION + ' (question_id, question_version, text, type, flag_active, flag_history) VALUES (?, 1, ?, ?, 1, "active")', [question_id, question.text, question.type], function(err, result) {
      callback(err, question_id);
    });
  });
  connection.release();
}); 


}

insertNewAnswerOptions = function(answer_options, callback){
pool.getConnection(function(err, connection) {
 
  async.eachSeries(answer_options, function(option, callback){   
   async.waterfall([ 
      function(callback) {    
      var query = connection.query('INSERT INTO ' + TABLE_ANSWERS + ' SET ?', option, function(err, result) {
        if(err){
          console.log(err);
        }
        var answer_id = result.insertId;
        callback(null, answer_id, option) 
      })   
    },
      function(answer_id, option, callback){
      insertAnswerIntoCollection(answer_id, option, function(err){
        callback(null);
      });
    }], function(err, result){
      callback(err);
    });
  }, function(err){
    if( err ){ console.log(err);}
    callback();
  });
  
  connection.release();
});   
}


insertAnswerIntoCollection = function(id, option, callback){
  console.log(option);
   pool.getConnection(function(err, connection) {
   var second_query = connection.query('INSERT INTO ' + TABLE_ANSWER_COLLECTION + ' (answer_id, answer_version, question_id, text, flag_history) VALUES (?, 1, ?, ?, "active")', [id, option.question_id, option.text], function(err) {
         callback(err);
       });
   connection.release();
  }); 
}

getAnswersForQuestion = function(question_id, callback){
  pool.getConnection(function(err, connection) {
    
  if (err) console.log(err);
  var sql = 'SELECT * FROM ' + TABLE_ANSWERS + ' WHERE question_id = ' + question_id;
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
  var sql = 'SELECT * FROM ' + TABLE_TRAVEL_TYPE;
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

  var query = connection.query('DELETE FROM ' + TABLE_TRIPS + ' WHERE id = ?', trip_id, function(err, result) {
    if(err){
      console.log(err);
    }
    var second_query = connection.query('DELETE FROM ' + TABLE_QUESTION_SET + ' WHERE trip_id = ?', trip_id, function(err, result) {

      var third_query = connection.query('DELETE FROM ' + TABLE_ANSWER_SET + ' WHERE trip_id = ?', trip_id, function(err, result) {
        callback();
      });
    });
  });
  connection.release();

  });
}

deleteQuestion = function(question_id, callback){
  pool.getConnection(function(err, connection) {    

  var query = connection.query('DELETE FROM ' + TABLE_QUESTIONS + ' WHERE id = ?', question_id, function(err, result) {
    if(err){
      console.log(err);
    }
    connection.query('DELETE FROM ' + TABLE_ANSWERS + ' WHERE question_id = ?', question_id, function(err, result) {
      if(err){
        console.log(err);
      }
      connection.query('UPDATE ' + TABLE_QUESTION_COLLECTION + ' SET flag_history = "history" WHERE question_id = ?', question_id, function(err, result) {
      if(err){
        console.log(err);
      }
      connection.query('UPDATE ' + TABLE_ANSWER_COLLECTION + ' SET flag_history = "history" WHERE question_id = ?', question_id, function(err, result) {
      if(err){
        console.log(err);
      }
      callback();
      });
      });
    });
  });
  connection.release();

  });
}

deleteAnswer = function(answer_id, callback){
  pool.getConnection(function(err, connection) {    

  var query = connection.query('DELETE FROM ' + TABLE_ANSWERS + ' WHERE id = ?', answer_id, function(err, result) {
    if(err){
      console.log(err);
    }
    connection.query('UPDATE ' + TABLE_ANSWER_COLLECTION + ' SET flag_history = "history" WHERE answer_id = ?', answer_id, function(err, result) {
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
     
  var query = connection.query('UPDATE ' + TABLE_TRIPS + ' SET ? WHERE id=?' , [data, trip_id], function(err, result) {
  
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
  var query = connection.query('UPDATE ' + TABLE_QUESTIONS +' SET ? WHERE id=?' , [data, question_id], function(err, result) {    
    if(err){
      console.log(err);
    }
    var second_query = connection.query('UPDATE ' + TABLE_QUESTION_COLLECTION +' AS Q SET flag_history = "history" WHERE question_id=? AND question_version=(SELECT max(question_version) FROM (SELECT * FROM ' + TABLE_QUESTION_COLLECTION +' AS Q1) AS Q2 WHERE question_id=?)' , [question_id, question_id], function(err, result) {
     
      var third_query = connection.query('INSERT INTO '+ TABLE_QUESTION_COLLECTION + ' (question_id, question_version, text, type, flag_active, flag_history) VALUES (?, (SELECT MAX(QC.question_version) FROM '+ TABLE_QUESTION_COLLECTION + ' QC WHERE question_id = ?)+1, ?, ?, 1, "active")',
      [question_id, question_id, data.text, data.type], function(err, result) { 
      
        callback(err);   
      });
    });
  });  
  connection.release();

  });
}

updateAnswer = function(answer_id, data, callback){
  pool.getConnection(function(err, connection) {     
  var query = connection.query('UPDATE ' + TABLE_ANSWERS + ' SET ? WHERE id=?' , [data, answer_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
  var second_query = connection.query('UPDATE ' + TABLE_ANSWER_COLLECTION +' AS A SET flag_history = "history" WHERE answer_id=? AND answer_version=(SELECT max(answer_version) FROM (SELECT * FROM ' + TABLE_ANSWER_COLLECTION +' AS A1) AS A2 WHERE answer_id=?)' , [answer_id, answer_id], function(err, result) {
    console.log(err);
    var third_query = connection.query('INSERT INTO '+ TABLE_ANSWER_COLLECTION + ' (answer_id, answer_version, question_id, text, flag_history) VALUES (?, (SELECT MAX(AC.answer_version) FROM '+ TABLE_ANSWER_COLLECTION + ' AC WHERE answer_id = ?)+1, ?, ?, "active")',
      [answer_id, answer_id, data.question_id, data.text], function(err, result) { 
        console.log(err);
        callback(err);   
    });
  });
  });  
  connection.release();

  });  
}

updateActiveFlagTrip = function(trip_id, trip_status, callback){
  pool.getConnection(function(err, connection) {
  var active = (trip_status == "true") ? 1:0; 
  
  var query = connection.query('UPDATE ' + TABLE_TRIPS + ' SET flag_active=? WHERE id=?' , [active, trip_id], function(err, result) {  
    if(err){
      console.log(err);
    }

    getQuestionsForTrip(trip_id, function(err, dbQuestions){

      async.mapSeries(dbQuestions, function(question, callback){        
        var question_id = question[0].question_id;       
        getActiveAnswersFromCollection(question_id, function(err, dbAnswers){          
        
          async.eachSeries(dbAnswers, function(answer, callback){           
            updateAnswerSet(trip_id, answer, function(err){
             if(err) console.log(err);
             callback();
            })

          }, function(err){
             if(err) console.log(err);
            callback();
          });
        })
       },
       function(err, result){
        if(err)console.log(err);       
        callback(result)
      });      
    });


  });        
  connection.release();

  });
}


updateAnswerSet = function(trip_id, answer, callback){
 var query =  pool.getConnection(function(err, connection) {

  var question_id = answer.question_id;
  var answer_id = answer.answer_id;
  var answer_version = answer.answer_version; 


  connection.query('DELETE FROM ' + TABLE_ANSWER_SET + ' WHERE trip_id=? AND question_id=? AND answer_id=? AND answer_version=?' , [trip_id, question_id, answer_id, answer_version], function(err, result) {  
    if(err){
      console.log(err);
    }
      var query = connection.query('INSERT INTO ' + TABLE_ANSWER_SET + ' (trip_id, question_id, answer_id, answer_version) VALUES (?,?,?,?)' , [trip_id, question_id, answer_id, answer_version], function(err, result) {  
        if(err){
          console.log(err);
        }
    
      });

  });
   
  callback(err);    
  connection.release();
  //console.log(query.sql);
  }); 

}  

updateOrderQuestionSet = function(trip_id, question_id, position, callback){
 var query =  pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_QUESTION_SET + ' SET position=? WHERE trip_id=? AND question_id=?' , [position, trip_id, question_id], function(err, result) {  
    if(err){
      console.log(err);
    }

  });
   
  callback(err);    
  connection.release();

  }); 
}

insertIntoQuestionSet = function(trip_id, question_id, question_version, callback){
  pool.getConnection(function(err, connection) {  
  var query = connection.query('INSERT INTO ' + TABLE_QUESTION_SET + ' (trip_id, position, question_id, question_version) VALUES (?, (SELECT max(QS.position) FROM '+TABLE_QUESTION_SET+' QS WHERE QS.trip_id=?), ?,?)' , [trip_id, trip_id, question_id, question_version], function(err, result) {  
    if(err){
      console.log(err);
    }
  });  
  callback(err);    
  connection.release();

  });
}

deleteFromQuestionSet = function(trip_id, question_id, question_version, callback){  
 pool.getConnection(function(err, connection) {  
  var query = connection.query('DELETE FROM ' + TABLE_QUESTION_SET + ' WHERE trip_id=? AND question_id=? AND question_version=?' , [trip_id, question_id, question_version], function(err, result) {  
    if(err){
      console.log(err);
    }
      connection.query('DELETE FROM ' + TABLE_ANSWER_SET + ' WHERE trip_id=? AND question_id=?', [trip_id, question_id], function(err, result) {  
      if(err){
          console.log(err);
        }
      });
       
  });  
  callback(err);    
  connection.release();

  });
}

exports.init = init;
exports.checkLoginCredentials = checkLoginCredentials;
exports.getQuestions = getQuestions;
exports.getQuestionsForTrips = getQuestionsForTrips;
exports.getQuestionsForTrip = getQuestionsForTrip;
exports.getAllActiveQuestions = getAllActiveQuestions;
//exports.getActiveAnswersFromCollection = getActiveAnswersFromCollection;
exports.getAnswers = getAnswers;
exports.getTrips = getTrips;
exports.insertUserAnswers = insertUserAnswers;
exports.insertNewTrip = insertNewTrip;
exports.insertNewQuestion = insertNewQuestion;
exports.getAnswersForQuestion = getAnswersForQuestion;
exports.getTravelTypes = getTravelTypes;
exports.deleteTrip = deleteTrip;
exports.updateTrip = updateTrip;
exports.updateActiveFlagTrip = updateActiveFlagTrip;
exports.insertNewAnswerOptions = insertNewAnswerOptions;
exports.deleteQuestion = deleteQuestion;
exports.updateQuestion = updateQuestion;
exports.updateOrderQuestionSet = updateOrderQuestionSet
exports.insertIntoQuestionSet = insertIntoQuestionSet;
exports.deleteFromQuestionSet = deleteFromQuestionSet;
exports.updateAnswer = updateAnswer;
exports.deleteAnswer = deleteAnswer;