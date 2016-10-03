var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/questions/', function(req, res, next) {
  dbhandler.getQuestions(function(err, dbQuestions){  	 
 	 res.render('snippet_eval_questions',  {questions: dbQuestions});
  }); 
});

router.post('/detail-questions/', function(req, res, next) {
  var question_id = req.body.id;  
  dbhandler.getAnswersForQuestion(question_id, function(err, dbAnswer){  	 
 	 res.render('snippet_eval_question_details',  {answers: dbAnswer, question_id: question_id});
  });
});

router.get('/answers/', function(req, res, next) {
  dbhandler.getAnswers(function(err, dbAnswers){  	 
 	 res.render('snippet_eval_answers',  {answers: dbAnswers});
  }); 
});

router.get('/trip/', function(req, res, next) {
  dbhandler.getTrips(function(err, dbTrips){  	 
 	 res.render('snippet_eval_trips',  {trips: dbTrips});
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

router.post('/delete-trip/', function(req, res, next) {
  var trip_id = req.body.id;
  dbhandler.deleteTrip(trip_id, function(err, dbTravelTypes){     
     res.send('trip deleted');
  }); 
});

router.post('/edit-trip/', function(req, res, next) {
  var trip_id = req.body.id;
  var data = req.body.data;

  dbhandler.updateTrip(trip_id, data, function(err){ 
  console.log(err);    
     dbhandler.getTrips(function(err, dbTrips){     
      res.render('snippet_eval_trips',  {trips: dbTrips});
    }); 
  }); 
});





module.exports = router;
