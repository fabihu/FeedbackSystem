var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');
var async = require('async');

/* GET home page. */
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

router.post('/receive-answers/', function(req, res, next) {
  var answers = req.body.data;  
  dbhandler.insertUserAnswers(answers);
  res.send("jup");
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
