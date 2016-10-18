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

router.get('/assignment/', function(req, res, next) {
  dbhandler.getTrips(function(err, dbTrips){
    dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){ 
      dbhandler.getAllActiveQuestions(function(err, dbActiveQuestions){
        //TODO: change response format of db methods
        for (var index in dbQuestions){
          var question_set = dbQuestions[index];
          //console.log("set:", question_set[0][0]);
          for(var index in question_set){
            var question_row = question_set[index];
            var cleared_array = removeDuplicates(question_row, dbActiveQuestions);

          }
          console.log("clear:", cleared_array);
        }

        res.render('snippet_eval_assignment',  {trips: dbTrips, questions: dbQuestions, active_questions: cleared_array});
      });       
    }); 
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

router.post('/delete-answer/', function(req, res, next) {
  var answer_id = req.body.id;
  dbhandler.deleteAnswer(answer_id, function(err){     
     res.send('answer deleted');
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

removeDuplicates = function(a, b){
 for (var i = 0, len = a.length; i < len; i++) { 
        for (var j = 0, len2 = b.length; j < len2; j++) { 
            if (a[i].question_id === b[j].question_id) {
                b.splice(j, 1);
                len2=b.length;
            }
        }
    }
 return b;
}


module.exports = router;
