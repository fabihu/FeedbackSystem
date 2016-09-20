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
  console.log(result);
    if(err) {
      console.log("Error: " + err);      
    } else {
      res.render('eval', {questions: result.questions, answers: result.answers});     
    }    
  });  
});


module.exports = router;
