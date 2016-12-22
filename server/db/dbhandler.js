var async = require('async');
var mysql = require('mysql');
var config = require('../config/config');
var pool   = mysql.createPool({ 
    host     : config.db.host,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database
});
var utils = require('../models/utils');

var TABLE_QUESTIONS = 'questions';
var TABLE_ANSWERS = 'answers';
var TABLE_USER_ANSWERS = 'user_answers';
var TABLE_ANSWER_COLLECTION = 'answer_collection';
var TABLE_QUESTION_COLLECTION = 'question_collection';
var TABLE_ANSWER_SET = 'answer_set';
var TABLE_QUESTION_SET = 'question_set';
var TABLE_TRIPS = 'trip';
var TABLE_TRAVEL_TYPE = 'travel_type';
var TABLE_USER_META = 'user_meta';
var TABLE_TIME_QUESTION = 'time_question';
var TABLE_USERS = 'users';

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

checkLoginCredentials = function(user_id, callback){
  
  pool.getConnection(function(err, connection) {
    
  var sql = 'SELECT * FROM ' + TABLE_TRIPS + ' WHERE password = ' + connection.escape(user_id);
  connection.query(sql, function(err, dbResponse) {
  if(err) {
    console.log(err);    
    return;
  }  
  connection.release();
  if (dbResponse.length > 0){
    callback(dbResponse[0]);  
  } else {
    callback(false);
  }
  });

   
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
      connection.release();
      callback(null, dbResponse);
  } 

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
  connection.release();
  callback(null, dbResponse);
  

  });

  });
} 

getAnswersForTrips = function(trips, callback){
  async.mapSeries(trips, function(trip, callback){
     getAnswersForTrip(trip.id, function(err, result){
      callback(null, result);
     });  
  }, function(err, result){
    if (err) console.log(err);    
    callback(null, result);
  })
 
}


getAnswersForTrip  = function(trip_id, callback){
  pool.getConnection(function(err, connection) {     
  async.waterfall([function (callback){    
   connection.query('SELECT * FROM ' + TABLE_ANSWER_SET + ' WHERE trip_id = ?' , [trip_id], function(err, dbResponse) {      
      if(err) {
        console.log(err);       
      }
        
      callback(null, dbResponse);    
    });
   

  }, function (result, callback){
    
    async.mapSeries(result, function(answer_row, callback){
     connection.query('SELECT * FROM ' + TABLE_ANSWER_COLLECTION + ' WHERE answer_id = ? AND answer_version = ?',[answer_row.answer_id, answer_row.answer_version],  function(err, dbResponse) {
      if (err) console.log(err);     
      callback(err, dbResponse);
     });

    }, function(err, dbQuestions){      
      if (err) console.log("Error: ", err);          
      callback(null, dbQuestions);
    });

  }], function (err, result){
    if(err) console.log(err);      
    connection.release();
    callback(null,result);
  });
  

  });

 
}

getUserAnswersForTrip = function(trip_id, question_id, callback){
  pool.getConnection(function(err, connection) { 
      connection.query('SELECT * FROM ' + TABLE_USER_ANSWERS + ' WHERE trip_id = ? AND question_id = ?',[trip_id, question_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();     
      callback(err, dbResponse);
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
    if (err) {
      console.log(err);
      callback(err, null);
    }    
    callback(null, result);
  });
}

getQuestionsForTrip  = function(trip_id, callback){
  pool.getConnection(function(err, connection) {     
  async.waterfall([function (callback){    
   connection.query('SELECT * FROM ' + TABLE_QUESTION_SET + ' WHERE trip_id = ? ORDER BY position ASC' , [trip_id], function(err, dbResponse) {      
      if(err) {
        console.log(err);
        callback(err, null);       
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
    connection.release();
    callback(null,result);
  });
  

  });

 
}

getActiveAnswersFromCollection  = function(question_id, callback){
pool.getConnection(function(err, connection) {
  
var query = connection.query('SELECT * FROM ' + TABLE_ANSWER_COLLECTION + ' WHERE question_id = ? AND flag_history="active"', [question_id], function(err, dbResponse) {
    
  if(err)console.log(err);
  connection.release();
  callback(null, dbResponse);    
  
  
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
    connection.release();
    callback(null, dbResponse);    
  }
  
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
  connection.release();
  callback(null, dbResponse);    
  
  
});

 
});

}

getNotActiveTrips = function(callback){
pool.getConnection(function(err, connection) {

connection.query('SELECT * FROM ' + TABLE_TRIPS + ' WHERE flag_active="0"' , function(err, dbResponse) {
    
  if(err) {
    console.log(err);
    callback(err, null);    
    return;
  }     
  connection.release();
  callback(null, dbResponse);    
  
  
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
     connection.release();
     callback();
  });
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
   connection.release();
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
    connection.release();
    callback();
  });
  
});   
}


insertAnswerIntoCollection = function(id, option, callback){  
   pool.getConnection(function(err, connection) {
   var second_query = connection.query('INSERT INTO ' + TABLE_ANSWER_COLLECTION + ' (answer_id, answer_version, question_id, text, flag_history) VALUES (?, 1, ?, ?, "active")', [id, option.question_id, option.text], function(err) {
          connection.release();
         callback(err);
    });
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
    connection.release();
    callback(null, dbResponse);
  } 

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
      connection.release();
      callback(null, dbResponse);
  } 

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
        connection.release();
        callback();
      });
    });
  });

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
        connection.release();
        callback();
      });
      });
    });
  });

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
      connection.release();
      callback();
    });
  });

  });
}


updateTrip = function(trip_id, data, callback){
  pool.getConnection(function(err, connection) {
     
  var query = connection.query('UPDATE ' + TABLE_TRIPS + ' SET ? WHERE id=?' , [data, trip_id], function(err, result) {
  
    if(err){
      console.log(err);
    }
  });
  connection.release();
  callback(err); 

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
      
        connection.release();
        callback(err);   
      });
    });
  });  

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
        connection.release();
        callback(err);   
    });
  });
  });  

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
        connection.release();
        callback(result)
      });      
    });


  });        

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
   
  connection.release();
  callback(err);    
  
  }); 

}  

updateOrderQuestionSet = function(trip_id, question_id, position, callback){
 var query = pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_QUESTION_SET + ' SET position=? WHERE trip_id=? AND question_id=?' , [position, trip_id, question_id], function(err, result) {  
    if(err){
      console.log(err);
    }

  });
   
  connection.release();
  callback(err);    

  }); 
}

insertIntoQuestionSet = function(trip_id, question_id, question_version, callback){
  pool.getConnection(function(err, connection) {  
  var query = connection.query('INSERT INTO ' + TABLE_QUESTION_SET + ' (trip_id, position, question_id, question_version) VALUES (?, (SELECT max(QS.position) FROM '+TABLE_QUESTION_SET+' QS WHERE QS.trip_id=?)+1, ?,?)' , [trip_id, trip_id, question_id, question_version], function(err, result) {  
    if(err){
      console.log(err);
    }
  });  
  connection.release();
  callback(err);    

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
  connection.release();
  callback(err);    

  });
}

insertUserMeta = function(trip_id, type_questionnaire, callback){
   pool.getConnection(function(err, connection) {
   var query = connection.query('INSERT INTO ' + TABLE_USER_META + ' (trip_id, status, count_answerd_questions, date_answer, type_questionnaire) VALUES (?, "pending", 0, ?, ?)', [trip_id, utils.getDateTime(), type_questionnaire], function(err, result) {
         connection.release();
         callback(err, result.insertId);
    });
  }); 
}

insertTimeQuestion = function(user_id, question_id, trip_id, seconds, callback){
   pool.getConnection(function(err, connection) {
   var query = connection.query('INSERT INTO ' + TABLE_TIME_QUESTION + ' (user_id, question_id, trip_id, seconds_per_question ) VALUES (?, ?, ?, ?)', [user_id, question_id, trip_id, seconds], function(err, result) {
         connection.release();      
         callback(err);
    });
  }); 
}

getAvgTimeForQuestion = function(trip_id, question_id, callback){
 pool.getConnection(function(err, connection) { 
      connection.query('SELECT AVG(seconds_per_question) AS avg FROM ' + TABLE_TIME_QUESTION + ' WHERE trip_id = ? AND question_id = ?',[trip_id, question_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();     
      callback(err, dbResponse);
     });
  });
}

updateMetaCount = function(user_id, trip_id, callback){
pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_USER_META + ' SET count_answerd_questions=count_answerd_questions+1 WHERE id=? AND trip_id=?' , [user_id, trip_id], function(err, result) {  
    if(err){
      console.log(err); 
    }
  });   
  connection.release();
  callback(err);    

  }); 
}

updateMetaFinish = function(user_id, trip_id, callback){
pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_USER_META + ' SET count_answerd_questions=count_answerd_questions+1, status="finished" WHERE id=? AND trip_id=?' , [user_id, trip_id], function(err, result) {  
    if(err){
      console.log(err); 
    }
  });   
  connection.release();
  callback(err);    

  }); 
}

updateMetaCancel = function(user_id, callback){
pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_USER_META + ' SET status="canceld" WHERE id=?' , [user_id], function(err, result) {  
    if(err){
      console.log(err); 
    }
  });   
  connection.release();
  callback(err);    

  }); 
}

getQuestionnaireType = function(trip_id, callback){
  pool.getConnection(function(err, connection) { 
      connection.query('SELECT type_questionnaire FROM ' + TABLE_TRIPS + ' WHERE id = ?',[trip_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();     
      callback(err, dbResponse);
     });
  });
}

updateQuestionnaireType = function(trip_id, type, callback){
pool.getConnection(function(err, connection) {  
  var query = connection.query('UPDATE ' + TABLE_TRIPS + ' SET type_questionnaire=? WHERE id=?' , [type, trip_id], function(err, result) {  
    if(err){
      console.log(err); 
    }
  });   
  connection.release();
  callback(err);    

  });   
}

getLastUserQtype = function(trip_id, callback){
  pool.getConnection(function(err, connection) { 
      connection.query('SELECT type_questionnaire FROM ' + TABLE_USER_META + ' WHERE trip_id = ? GROUP BY id HAVING id = MAX(id)', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();       
      callback(err, dbResponse);
     });
  });

}

getSumParticipants = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT COUNT(id) AS sum FROM ' + TABLE_USER_META + ' WHERE trip_id = ?', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();     
      callback(err, dbResponse);
     });
  });
}

getSumParticipantsCancel = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT COUNT(id) AS sum FROM ' + TABLE_USER_META + ' WHERE trip_id = ? AND status="canceld"', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();            
      callback(err, dbResponse);
     });
  });
}

getSumParticipantsFinish = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT COUNT(id) AS sum FROM ' + TABLE_USER_META + ' WHERE trip_id = ? AND status="finished"', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();
         
      callback(err, dbResponse);
     });
  });
}

getUsers = function(callback){
  pool.getConnection(function(err, connection) { 
      connection.query('SELECT * FROM ' + TABLE_USERS,  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();
         
      callback(err, dbResponse);
     });
  });
}

insertNewUser = function(mail, password, callback){
pool.getConnection(function(err, connection) { 
      password = utils.hashPassword(password);
      connection.query('INSERT INTO ' + TABLE_USERS + ' (email, password) VALUES (?, ?)', [mail, password],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();         
      callback(err, dbResponse);
     });
  });
}

deleteUser = function(id, callback){
  pool.getConnection(function(err, connection) { 
  var query = connection.query('DELETE FROM ' + TABLE_USERS + ' WHERE id = ?', id, function(err, result) {
    if(err) console.log(err);  
      connection.release();         
      callback(err, result);
    });
  });
}
updateUser = function(id, mail, password, callback){
  pool.getConnection(function(err, connection) {
      password = utils.hashPassword(password); 
      connection.query('UPDATE ' + TABLE_USERS + ' SET email = ?, password = ? WHERE id = ?', [mail, password, id],  function(err, dbResponse) {
      if (err) console.log(err);
      connection.release();         
      callback(err, dbResponse);
     });
  });
}

updateUserGender = function(id, gender, callback){
  pool.getConnection(function(err, connection) {
   connection.query('UPDATE ' + TABLE_USER_META + ' SET gender = ? WHERE id = ?', [gender, id],  function(err, dbResponse) {
     if (err) console.log(err);
     connection.release();         
     callback(err, dbResponse);
    }); 
  });
}

updateUserAgeGroup = function(id, age, callback){
  pool.getConnection(function(err, connection) {
   connection.query('UPDATE ' + TABLE_USER_META + ' SET age_group = ? WHERE id = ?', [age, id],  function(err, dbResponse) {
     if (err) console.log(err);
     connection.release();         
     callback(err, dbResponse);
    }); 
  });
}

updateUserExp = function(id, exp, callback){
  pool.getConnection(function(err, connection) {
   connection.query('UPDATE ' + TABLE_USER_META + ' SET experience = ? WHERE id = ?', [exp, id],  function(err, dbResponse) {
     if (err) console.log(err);
     connection.release();         
     callback(err, dbResponse);
    }); 
  });
}

getGenderParticpants = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT count(id) AS value, gender FROM ' + TABLE_USER_META + ' WHERE trip_id = ? GROUP BY gender', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);     
      connection.release();         
      callback(err, dbResponse);
     });
  });
}

getAgeParticpants = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT count(id) AS value, age_group FROM ' + TABLE_USER_META + ' WHERE trip_id = ? GROUP BY age_group', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);     
      connection.release();         
      callback(err, dbResponse);
     });
  });
}

getExpParticpants = function(trip_id, callback){
   pool.getConnection(function(err, connection) { 
      connection.query('SELECT count(id) AS value, experience FROM ' + TABLE_USER_META + ' WHERE trip_id = ? GROUP BY experience', [trip_id],  function(err, dbResponse) {
      if (err) console.log(err);     
      connection.release();         
      callback(err, dbResponse);
     });
  });
}




exports.init = init;
exports.pool = pool;
exports.checkLoginCredentials = checkLoginCredentials;
exports.getQuestions = getQuestions;
exports.getQuestionsForTrips = getQuestionsForTrips;
exports.getQuestionsForTrip = getQuestionsForTrip;
exports.getAllActiveQuestions = getAllActiveQuestions;
//exports.getActiveAnswersFromCollection = getActiveAnswersFromCollection;
exports.getLastUserQtype = getLastUserQtype;
exports.getAnswers = getAnswers;
exports.getAnswersForTrip = getAnswersForTrip;
exports.getAnswersForTrips = getAnswersForTrips;
exports.getUserAnswersForTrip = getUserAnswersForTrip;
exports.getTrips = getTrips;
exports.getNotActiveTrips = getNotActiveTrips;
exports.getQuestionnaireType = getQuestionnaireType;
exports.updateQuestionnaireType = updateQuestionnaireType;
exports.insertUserAnswers = insertUserAnswers;
exports.insertNewTrip = insertNewTrip;
exports.insertNewQuestion = insertNewQuestion;
exports.getAnswersForQuestion = getAnswersForQuestion;
exports.getTravelTypes = getTravelTypes;
exports.deleteTrip = deleteTrip;
exports.updateTrip = updateTrip;
exports.updateActiveFlagTrip = updateActiveFlagTrip;
exports.insertNewAnswerOptions = insertNewAnswerOptions;
exports.insertUserMeta = insertUserMeta;
exports.updateMetaCount = updateMetaCount;
exports.updateMetaFinish = updateMetaFinish;
exports.updateMetaCancel = updateMetaCancel;
exports.deleteQuestion = deleteQuestion;
exports.updateQuestion = updateQuestion;
exports.updateOrderQuestionSet = updateOrderQuestionSet
exports.insertIntoQuestionSet = insertIntoQuestionSet;
exports.deleteFromQuestionSet = deleteFromQuestionSet;
exports.updateAnswer = updateAnswer;
exports.deleteAnswer = deleteAnswer;
exports.insertTimeQuestion = insertTimeQuestion;
exports.getAvgTimeForQuestion = getAvgTimeForQuestion;
exports.getSumParticipants = getSumParticipants;
exports.getSumParticipantsCancel = getSumParticipantsCancel;
exports.getSumParticipantsFinish = getSumParticipantsFinish;
exports.getGenderParticpants = getGenderParticpants;
exports.getUsers = getUsers;
exports.insertNewUser = insertNewUser;
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
exports.updateUserGender = updateUserGender;
exports.updateUserAgeGroup = updateUserAgeGroup;
exports.updateUserExp = updateUserExp;
exports.getAgeParticpants = getAgeParticpants;
exports.getExpParticpants = getExpParticpants;
