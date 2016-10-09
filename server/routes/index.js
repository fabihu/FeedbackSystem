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
    var user_password = req.body.password;

    dbhandler.checkLoginCredentials(user_id, user_password, function(result){
    res.send(result);    	
    });
	
})

router.get('/get-questions/', function(req, res, next) {
  async.parallel({
      questions: function(callback) {
          dbhandler.getQuestions(function(err, dbQuestions){
          if(err) {callback(err, null); return;}
          callback(null, dbQuestions);
          });
      },
      answers: function(callback) {
          dbhandler.getAnswers(function(err, dbAnswers){
          if(err) {callback(err, null); return;}
          callback(null, dbAnswers);
          });   
      }
  },
  // optional callback
  function(err, result) {
  
    if(err) {
      console.log("Error: " + err);      
    } else {
      var sortedQuestions = sortQuestions(result.questions);      
      res.render('survey', {questions: sortedQuestions, answers: result.answers});     
    }    
  });  
});

router.post('/receive-answers/', function(req, res, next) {
  var answers = req.body.data;  
  dbhandler.insertAnswers(answers);
  res.send("jup");
})

router.get('/eval/', function(req, res, next) {
  res.render('eval');  
})

sortQuestions = function(questions){
  var array = questions;
  for (var index in array){
    var question = array[index];
    if(question.type == 3 || question.type == '3'){
      array.push(array.splice(index, 1)[0]);
    }
  }
  return array;

}

module.exports = router;
