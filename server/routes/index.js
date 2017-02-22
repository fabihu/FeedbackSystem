//request handler for the landing page and the questionnaires
module.exports = function(io) {   
  var express = require('express');
  var router = express.Router();
  var dbhandler = require('../db/dbhandler');
  var async = require('async');
  var utils = require('../models/utils');
  var bouncer = require ('express-bouncer')(60000,60000,5);    
  var allClients = {};
  allClients.sockets = [];
  allClients.ids = [];
  
  //bruteforce prevention with middleware express-bouncer
  bouncer.blocked = function (req, res, next, remaining){      
    var seconds = remaining / 1000;   
    res.json({id: null, flag_active: null, err_code: 429, remaining: seconds.toFixed(0)});    
  };
  
  //workaround when user disconnects, determine sepcific data concerning his
  //behaviour to answer questions
  io.sockets.on('connection', function (socket) {
    socket.on('user_data', function(data) {      
      allClients.sockets.push(socket);
      allClients.ids.push(data.user_id);      
    });    
    socket.on('disconnect', function (data) {      
      var i = allClients.sockets.indexOf(socket);
      var user_id = allClients.ids[i];
      
      delete allClients.sockets[i];
      delete allClients.ids[i];
   
      if(user_id != -1){
         dbhandler.updateMetaCancel(user_id, function(err, result){               
         });    
        }
      });
      socket.on('finished', function (data) { 
      var user_id = data.user_id;
      var index = allClients.ids.indexOf(user_id);
      allClients.ids[index] = -1;
    });
  });
  

  //request handler for endpoint '/' (landing page)
  router.get('/', function(req, res, next) {
    dbhandler.init();
    res.render('index.ejs', { message:''});  
  });
  
  //request handler for endpoint 'impressum' 
  router.get('/impressum/', function(req, res, next) {
    res.render('impressum');  
  });
  
  //request handler for endpoint 'check-login',
  //check login credentials for questionnaire
  router.post('/check-login/', bouncer.block, function(req, res) {	
    var id = req.body.id;
    dbhandler.dbIsRunning(function(running){
      if(running){
          dbhandler.checkLoginCredentials(id, function(result){
             res.json({id: result.id, flag_active: result.flag_active, err_code: null});     
          });  
      } else {
          res.json({id: null, flag_active: null, err_code: 503});    
      }
    });    
  });
  
  //request handler for endpoint 'get-questions'
  //fetch and sort all data (questions and answers) for one questionnaire
  //and choose the right presentation format
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
        var sortedQuestions = utils.formatArray(result.questions, result.answers);     
        var type = 0;        
        dbhandler.getQuestionnaireType(trip_id, function(err, result){
          type = result[0].type_questionnaire; 
          if(type === 0){   
            res.render('survey', {type: type, data: sortedQuestions});
          } else if (type == 1) {
            res.render('survey_st', {type: type, data: sortedQuestions});
          } else {
            var type = 0;    
            dbhandler.getLastUserQtype(trip_id, function(err, result){
              if(result.length > 0) type = result[0].type_questionnaire;           
             
              if (type == 1){
                res.render('survey', {type: 0, data: sortedQuestions});       
              } else {
                res.render('survey_st', {type: 1, data: sortedQuestions}); 
                     
              }
            });
          }
        });
      }    
    });  
  });
  
  //request handler for adding new user and metadata to database
  router.post('/create-user/', function(req, res, next) {
    var id = req.body.id;
    var qtype_id = req.body.qtype_id;
    dbhandler.insertUserMeta(id, qtype_id, function(err, id){      
        res.json({id: id});
    });
  });
 
  //request handler receiving all answers from one user and the 
  //respective questionnaire
  router.post('/receive-answers/', function(req, res, next) {
    var answers = req.body.data;  
    dbhandler.insertUserAnswers(answers);
    res.json({data: "ok"});
  });
  
  //request handler inserting time one user took for one question
  router.post('/insert-time/', function(req, res, next) {
    var user_id = req.body.user_id;
    var question_id = req.body.question_id;
    var trip_id = req.body.trip_id;  
    var seconds = req.body.seconds;  
    dbhandler.insertTimeQuestion(user_id, question_id, trip_id, seconds, function(err, result){
      res.json();    
    });
  });
  
  //request handler updating the count of answered questions for one user
  router.post('/update-meta-count/', function(req, res, next) {
    var user_id = req.body.user_id;
    var trip_id = req.body.trip_id;  
    dbhandler.updateMetaCount(user_id, trip_id, function(err, result){
      res.json({data: "ok"});
    });
  });
  
  //request handler updating the status of one questionnaire of one user to finished
  router.post('/update-meta-finish/', function(req, res, next) {
    var user_id = req.body.user_id;
    var trip_id = req.body.trip_id;  
    dbhandler.updateMetaFinish(user_id, trip_id, function(err, result){
      res.json({data: "ok"});
    });
  });
  
  //request handler updating the status of one questionnaire to canceld
  router.post('/update-meta-cancel/', function(req, res, next) {
    var user_id = req.body.user_id;
      if(user_id != -1){
      dbhandler.updateMetaCancel(user_id, function(err, result){
          res.json({data: "ok"});
      });    
    }
  });
  
  //request handler updating the gender of one user 
  router.post('/update-user-gender/', function(req, res, next) {
    var user_id = req.body.user_id;
    var gender = req.body.gender;  
    dbhandler.updateUserGender(user_id, gender, function(err, result){
      res.json({data: "ok"});
    });
  });
  
    //request handler updating the age of one user 
  router.post('/update-user-age/', function(req, res, next) {
    var user_id = req.body.user_id;
    var age = req.body.age;  
    dbhandler.updateUserAgeGroup(user_id, age, function(err, result){
      res.json({data: "ok"});
    });
  });
  
  //request handler updating the experience of one user 
  router.post('/update-user-exp/', function(req, res, next) {
    var user_id = req.body.user_id;
    var exp = req.body.exp;  
    dbhandler.updateUserExp(user_id, exp, function(err, result){
      res.json({data: "ok"});
    });
  });
  
return router;
};
