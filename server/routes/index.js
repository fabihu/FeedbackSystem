var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');

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
 
  console.log("endpoint questions")
  
  dbhandler.getQuestions(user_id, user_password, function(result){
      //res.send(result);
      res.render('eval', {option1: "dies ist ein test"});
  });



});


module.exports = router;
