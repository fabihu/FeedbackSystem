module.exports = function(){
  var express = require('express');
  var router = express.Router();
  var dbhandler = require('../db/dbhandler');
  var utils = require('../models/utils');
  
  //request handler for endpoint '/login' (landing page), after
  //successful authentication
  router.get('/', IsAuthenticated, function(req, res, next) { 
    res.render('eval'); 
  });
  
  //request handler for logout
  router.get('/logout/', function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/login/');
  });
  
  //request handler for endpoint retrieving all trips from db
  router.get('/trip/', function(req, res, next) {
    dbhandler.getTrips(function(err, dbTrips){    
     res.render('snippet_eval_trips',  {trips: dbTrips});
    }); 
  });
  
   //request handler for endpoint retrieving all questions from db
  router.get('/questions/', function(req, res, next) {
    dbhandler.getQuestions(function(err, dbQuestions){  	 
   	 res.render('snippet_eval_questions',  {questions: dbQuestions});
    }); 
  });
  
  //request handler for endpoint retrieving all answers from db
  router.get('/answers/', function(req, res, next) {
    dbhandler.getAnswers(function(err, dbAnswers){     
     res.render('snippet_eval_answers',  {answers: dbAnswers});
    }); 
  });
  
   //request handler for endpoint retrieving all questionnaires from db
  router.get('/assignment/', function(req, res, next) {
    dbhandler.getNotActiveTrips(function(err, dbTrips){
      dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){ 
        dbhandler.getAllActiveQuestions(function(err, dbActiveQuestions){
          var data = utils.formatAssignmentData(dbTrips, dbQuestions, dbActiveQuestions);          
          res.render('snippet_eval_assignment',  {data: data});
        });       
      }); 
    });   
  });
  
  //request handler for endpoint retrieving all data necessary to show 
  //score for trips from db
  router.get('/score/', function(req, res, next) {
   dbhandler.getTrips(function(err, dbTrips){
    dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){  
      dbhandler.getAnswersForTrips(dbTrips, function(err, dbAnswers){     
        var data = utils.formatScoreData(dbTrips, dbQuestions, dbAnswers);                  
        res.render('snippet_eval_score',  {data: data});
      });
    });
   });
  });
  
  //request handler for endpoint retrieving all users from db
  router.get('/users/', IsAuthenticated, function(req, res, next) {
    dbhandler.getUsers(function(err, dbUsers){   
      res.render('snippet_eval_users',  {users: dbUsers, user_name: req.session.input.email});
    });
  });
  
  //request handler to send active user to the client
  router.post("/user_name/", function(req, res){  
      res.json({ name: req.session.input.email });
  });
  
  //request handler to send active password to the client,
  //when client wants to see his password
  router.post("/password/", function(req, res){
      res.json({ pw: req.session.input.password });
  });  
  
  //request handler to save new user
  router.post('/save-new-user/', function(req, res, next) {
    var mail = req.body.mail;
    var password = req.body.password;
     dbhandler.insertNewUser(mail, password, function(err){   
       res.json({err});   
    }); 
  });
  
  //request handler to delete user
  router.post('/delete-user/', function(req, res, next) {
    var id = req.body.id;
     dbhandler.deleteUser(id, function(err){   
       res.json({err});   
    }); 
  });
  
  //request handler to edit user
  router.post('/edit-user/', function(req, res, next) {
    var id = req.body.id;
    var mail = req.body.mail;
    var password = req.body.password;
  
     dbhandler.updateUser(id, mail, password, function(err){   
       res.json({err});   
    }); 
  });
  
  //request handler when all charts are filled with data
  router.post('/get-chart-data/', function(req, res, next) {
   dbhandler.getTrips(function(err, dbTrips){
    dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){  
      dbhandler.getAnswersForTrips(dbTrips, function(err, dbAnswers){    
        var data = utils.formatScoreData(dbTrips, dbQuestions, dbAnswers);
        res.send(data);
      });
    });
   });
  });
  
  //request handler to receive score for question
  router.post('/get-question-score/', function(req, res, next) {
    var trip_id = req.body.trip_id;
    var question_id = req.body.question_id;  
    dbhandler.getUserAnswersForTrip(trip_id, question_id, function(err, dbAnswers){  
     res.send(dbAnswers);
    });
  });
  
  //request handler to show details of all questions
  router.post('/detail-questions/', function(req, res, next) {
    var question_id = req.body.id;  
    dbhandler.getAnswersForQuestion(question_id, function(err, dbAnswer){  	 
   	 res.render('snippet_eval_question_details',  {answers: dbAnswer, question_id: question_id});
    });
  });
  
  //requestto receive all travel categories
  router.get('/get-categories/', function(req, res, next) {
    dbhandler.getTravelTypes(function(err, dbTravelTypes){    
     res.send(dbTravelTypes);
    }); 
  });
  
  //request handler when saving new trip
  router.post('/save-new-trip/', function(req, res, next) {
    var new_trip = req.body.data;
     dbhandler.insertNewTrip(new_trip, function(err){     
      dbhandler.getTrips(function(err, dbTrips){     
        res.render('snippet_eval_trips',  {trips: dbTrips});
      }); 
    }); 
  });
  
  //request handler when saving new question
  router.post('/save-new-question/', function(req, res, next) {
    var new_question = req.body.data;
     dbhandler.insertNewQuestion(new_question, function(err, questionID){      
      res.send({questionID: questionID}); 
    }); 
  });

  //request handler when saving new answer option
  router.post('/save-new-answer-options/', function(req, res, next) {
    var new_options = req.body.data;
     dbhandler.insertNewAnswerOptions(new_options, function(err){      
      res.send('insert worked'); 
    }); 
  
  });
  
  //request handler to delete trip
  router.post('/delete-trip/', function(req, res, next) {
    var trip_id = req.body.id;
    dbhandler.deleteTrip(trip_id, function(err){     
       res.send('trip deleted');
    }); 
  });
  
   //request handler to delete question
  router.post('/delete-question/', function(req, res, next) {
    var question_id = req.body.id;
    dbhandler.deleteQuestion(question_id, function(err){     
       res.send('question deleted');
    }); 
  });
  
   //request handler to delete answer
  router.post('/delete-answer/', function(req, res, next) {
    var answer_id = req.body.id;
    dbhandler.deleteAnswer(answer_id, function(err){     
       res.send('answer deleted');
    }); 
  });
  
   //request handler to update trip
  router.post('/update-trip/', function(req, res, next) {
    var trip_id = req.body.id;
    var data = req.body.data;  
    dbhandler.updateTrip(trip_id, data, function(err){  
       dbhandler.getTrips(function(err, dbTrips){     
        res.render('snippet_eval_trips',  {trips: dbTrips});
      }); 
    }); 
  });
  
   //request handler to update question
  router.post('/update-question/', function(req, res, next) {  
    var question_id = req.body.id;
    var data = req.body.data;  
    dbhandler.updateQuestion(question_id, data, function(err){    
     dbhandler.getQuestions(function(err, dbQuestions){     
        res.render('snippet_eval_questions',  {questions: dbQuestions});
      });  
    }); 
  });
  
   //request handler to update answer
  router.post('/update-answer/', function(req, res, next) {      
    var question_id = req.body.question_id;
    var id = req.body.id;
    var data = req.body.data;   
    dbhandler.updateAnswer(id, data, function(err){
      dbhandler.getAnswersForQuestion(question_id, function(err, dbAnswer){        
        res.render('snippet_eval_question_details',  {answers: dbAnswer, question_id: question_id});
      });  
    }); 
  });
  
  //request handler to change the active state of a trip
  router.post('/update-active-trip/', function(req, res, next) {
    var trip_id = req.body.trip_id; 
    var state = req.body.flag_active;     
    dbhandler.updateActiveFlagTrip(trip_id, state, function(err){    
     res.send("state changed");
    }); 
  });
  
  //request handler to add new question to question set to db
  router.post('/add-question-set/', function(req, res, next) {
   var question_id = req.body.question_id; 
   var trip_id = req.body.trip_id; 
   var question_version = req.body.question_version;      
    dbhandler.insertIntoQuestionSet(trip_id, question_id, question_version, function(err){    
     res.send("updated");
    }); 
  });
  
   //request handler to remove question from question set
  router.post('/remove-question-set/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
   var question_id = req.body.question_id; 
   var question_version = req.body.question_version;      
    dbhandler.deleteFromQuestionSet(trip_id, question_id, question_version, function(err){    
     res.send("removed");
    }); 
  });
  
  //request handler to change order in question set
  router.post('/change-order-question-set/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
   var question_id = req.body.question_id; 
   var position = req.body.position;      
    dbhandler.updateOrderQuestionSet(trip_id, question_id, position, function(err){    
     res.send("updated");
    }); 
  });
  
  //request handler to get the type of a questionnaire
  router.post('/get-questionnaire-type/', function(req, res, next) {
   var trip_id = req.body.trip_id;      
   dbhandler.getQuestionnaireType(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to change the type of a questionnaire
  router.post('/change-type-questionnaire/', function(req, res, next) {
   var trip_id = req.body.trip_id;    
   var type = req.body.type;  
   dbhandler.updateQuestionnaireType(trip_id, type, function(err, result){    
     res.json(result);
    }); 
  });

  //request handler to get the average time spend on a questionnaire
  router.post('/get-avg-question/', function(req, res, next) {
   var trip_id = req.body.trip_id;  
   dbhandler.getAvgTime(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to get the sum of participants on a questionnaire
  router.post('/get-sum-participants/', function(req, res, next) {
   var trip_id = req.body.trip_id;   
   dbhandler.getSumParticipants(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to get the sum of finished participants on a questionnaire
  router.post('/get-sum-participants-finish/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
  
   dbhandler.getSumParticipantsFinish(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to get the sum of canceld participants on a questionnaire
  router.post('/get-sum-participants-cancel/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
  
   dbhandler.getSumParticipantsCancel(trip_id, function(err, result){    
     res.json(result);
    }); 
  });  
  
  //request handler to get the gender of participants on a questionnaire
  router.post('/get-gender-participants/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
   dbhandler.getGenderParticpants(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to get the age of participants on a questionnaire
  router.post('/get-age-participants/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
   dbhandler.getAgeParticpants(trip_id, function(err, result){    
     res.json(result);
    }); 
  });
  
  //request handler to get the experience of participants on a questionnaire
  router.post('/get-experience-participants/', function(req, res, next) {
   var trip_id = req.body.trip_id; 
   dbhandler.getExpParticpants(trip_id, function(err, result){    
     res.json(result);
    }); 
  });

return router;
};




