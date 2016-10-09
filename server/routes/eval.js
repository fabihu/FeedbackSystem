var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//get page content endpoint
router.get('/trip/', function(req, res, next) {
  dbhandler.getTrips(function(err, dbTrips){     
   res.render('snippet_eval_trips',  {trips: dbTrips});
  }); 
});

router.get('/questions/', function(req, res, next) {
  dbhandler.getQuestions(function(err, dbQuestions){  	 
 	 res.render('snippet_eval_questions',  {questions: dbQuestions});
  }); 
});

router.get('/answers/', function(req, res, next) {
  dbhandler.getAnswers(function(err, dbAnswers){     
   res.render('snippet_eval_answers',  {answers: dbAnswers});
  }); 
});

router.post('/detail-questions/', function(req, res, next) {
  var question_id = req.body.id;  
  dbhandler.getAnswersForQuestion(question_id, function(err, dbAnswer){  	 
 	 res.render('snippet_eval_question_details',  {answers: dbAnswer, question_id: question_id});
  });
});

router.get('/get-categories/', function(req, res, next) {
  dbhandler.getTravelTypes(function(err, dbTravelTypes){     
   res.send(dbTravelTypes);
  }); 
});

router.post('/save-new-trip/', function(req, res, next) {
  var new_trip = req.body.data;
   dbhandler.insertNewTrip(new_trip, function(err){     
    dbhandler.getTrips(function(err, dbTrips){     
      res.render('snippet_eval_trips',  {trips: dbTrips});
    }); 
  }); 
});

router.post('/save-new-question/', function(req, res, next) {
  var new_question = req.body.data;
   dbhandler.insertNewQuestion(new_question, function(err, questionID){      
    res.send({questionID: questionID}); 
  }); 
});

router.post('/save-new-answer-options/', function(req, res, next) {
  var new_options = req.body.data;
   dbhandler.insertNewAnswerOptions(new_options, function(err){      
    res.send('insert worked'); 
  }); 
});

router.post('/delete-trip/', function(req, res, next) {
  var trip_id = req.body.id;
  dbhandler.deleteTrip(trip_id, function(err){     
     res.send('trip deleted');
  }); 
});

router.post('/delete-question/', function(req, res, next) {
  var question_id = req.body.id;
  dbhandler.deleteQuestion(question_id, function(err){     
     res.send('question deleted');
  }); 
});

router.post('/update-trip/', function(req, res, next) {
  var trip_id = req.body.id;
  var data = req.body.data;

  dbhandler.updateTrip(trip_id, data, function(err){  
     dbhandler.getTrips(function(err, dbTrips){     
      res.render('snippet_eval_trips',  {trips: dbTrips});
    }); 
  }); 
});

router.post('/update-question/', function(req, res, next) {  
  var question_id = req.body.id;
  var data = req.body.data;

  dbhandler.updateQuestion(question_id, data, function(err){    
   dbhandler.getQuestions(function(err, dbQuestions){     
      res.render('snippet_eval_questions',  {questions: dbQuestions});
    });  
  }); 
});

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

router.post('/change-active-question/', function(req, res, next) {
  var question_id = req.body.id; 
  var state = req.body.active;     
  dbhandler.changeActiveQuestion(question_id, state, function(err){    
   res.send("state changed");
  }); 
});




module.exports = router;
