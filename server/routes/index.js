var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');
var async = require('async');

router.get('/', function(req, res, next) {
  dbhandler.init();
  res.render('login', { title: 'Express' });  
})

router.post('/check-login/', function(req, res, next) {	
    var user_id = req.body.id;    
    dbhandler.checkLoginCredentials(user_id, function(result){
      res.send(result);    	
    });
	
})

router.post('/get-questions/', function(req, res, next) {
  var trip_id = req.body.id;
  async.parallel({
      questions: function(callback) {
          dbhandler.getQuestionsForTrip(trip_id, function(err, dbQuestions){
          if(err) {callback(err, null); return;}
          callback(null, dbQuestions);
          });
      },
      answers: function(callback) {
          dbhandler.getAnswersForTrip(trip_id, function(err, dbAnswers){
          if(err) {callback(err, null); return;}
          callback(null, dbAnswers);
          });   
      }
  },  
  function(err, result) {  
    if(err) {
      console.log("Error: " + err);      
    } else {
      var sortedQuestions = formatArr(result.questions, result.answers);     
      
      //res.render('survey', {data: sortedQuestions});
       res.render('survey_st', {data: sortedQuestions});     
    }    
  });  
});

router.post('/create-user/', function(req, res, next) {
  var id = req.body.id;  
  dbhandler.insertUserMeta(id, function(err, id){      
      res.json({id: id});;
  });
})

router.post('/receive-answers/', function(req, res, next) {
  var answers = req.body.data;  
  dbhandler.insertUserAnswers(answers);
  res.json({data: "ok"});
})

router.post('/insert-time/', function(req, res, next) {
  var user_id = req.body.user_id;
  var question_id = req.body.question_id;
  var trip_id = req.body.trip_id;  
  var seconds = req.body.seconds;
  console.log(req.body);
  dbhandler.insertTimeQuestion(user_id, question_id, trip_id, seconds, function(err, result){
    res.json();    
  });
})

router.post('/update-meta-count/', function(req, res, next) {
  var user_id = req.body.user_id;
  var trip_id = req.body.trip_id;  
  dbhandler.updateMetaCount(user_id, trip_id, function(err, result){
    res.json({data: "ok"});
  });
})

router.post('/update-meta-finish/', function(req, res, next) {
  var user_id = req.body.user_id;
  var trip_id = req.body.trip_id;  
  dbhandler.updateMetaFinish(user_id, trip_id, function(err, result){
    res.json({data: "ok"});
  });
})

router.get('/eval/', function(req, res, next) {
  res.render('eval');  
})

filterAnswers = function(id, arr){
  
 var arr2 = [];
  for (var index in arr){
    var answer = arr[index][0];   

    if(answer.question_id == id){
      arr2.push(arr[index]);
    }
  }
  return arr2;

}

formatArr = function(arr1, arr2) {
  var result = []; 

  for (var i = 0; i < arr1.length; i++){    
  
    var item = {};
         
    item.question = arr1[i][0];    
    item.question.answers = filterAnswers(item.question.id, arr2);
    result.push(item);
}
 
  return result;
}

module.exports = router;
