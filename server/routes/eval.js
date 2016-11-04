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
  console.log(err);    
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
  dbhandler.getNotActiveTrips(function(err, dbTrips){
    dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){ 
      dbhandler.getAllActiveQuestions(function(err, dbActiveQuestions){            
        var data = formatAssignmentData(dbTrips, dbQuestions, dbActiveQuestions);        
        res.render('snippet_eval_assignment',  {data: data});
      });       
    }); 
  });   
});

router.get('/score/', function(req, res, next) {
 dbhandler.getTrips(function(err, dbTrips){
  dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){  
    dbhandler.getAnswersForTrips(dbTrips, function(err, dbAnswers){
      var data = formatScoreData(dbTrips, dbQuestions, dbAnswers);              
      res.render('snippet_eval_score',  {data: data});
    });
  });
 });
});

router.post('/get-chart-data/', function(req, res, next) {
 dbhandler.getTrips(function(err, dbTrips){
  dbhandler.getQuestionsForTrips(dbTrips, function(err, dbQuestions){  
    dbhandler.getAnswersForTrips(dbTrips, function(err, dbAnswers){
      var data = formatScoreData(dbTrips, dbQuestions, dbAnswers);
      res.send(data);
    });
  });
 });
});

router.post('/get-trip-score/', function(req, res, next) {
  var trip_id = req.body.trip_id;
  var question_id = req.body.question_id;  
  dbhandler.getUserAnswersForTrip(trip_id, question_id, function(err, dbAnswers){  
   res.send(dbAnswers);
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

router.post('/update-active-trip/', function(req, res, next) {
  var trip_id = req.body.trip_id; 
  var state = req.body.flag_active;     
  dbhandler.updateActiveFlagTrip(trip_id, state, function(err){    
   res.send("state changed");
  }); 
});

router.post('/add-question-set/', function(req, res, next) {
 var question_id = req.body.question_id; 
 var trip_id = req.body.trip_id; 
 var question_version = req.body.question_version;      
  dbhandler.insertIntoQuestionSet(trip_id, question_id, question_version, function(err){    
   res.send("updated");
  }); 
});

router.post('/remove-question-set/', function(req, res, next) {
 var trip_id = req.body.trip_id; 
 var question_id = req.body.question_id; 
 var question_version = req.body.question_version;      
  dbhandler.deleteFromQuestionSet(trip_id, question_id, question_version, function(err){    
   res.send("removed");
  }); 
});

router.post('/change-order-question-set/', function(req, res, next) {
 var trip_id = req.body.trip_id; 
 var question_id = req.body.question_id; 
 var position = req.body.position;      
  dbhandler.updateOrderQuestionSet(trip_id, question_id, position, function(err){    
   res.send("updated");
  }); 
});

formatAssignmentData = function(arr1, arr2, allActives) {
  var result = [];  

  for (var i = 0; i < arr1.length; i++){    
    var arr3 = allActives.slice(0);
    var item = {};

    item.trip = arr1[i];    
    item.trip.questions = arr2[i];
    item.trip.active_questions = removeDuplicates(arr2[i], arr3);

    result.push(item);
  }
 
  return result;
}

formatScoreData = function(arr1, arr2, arr3) {
var result = [];

for (var trip_index in arr1) {
  var item = {}
  var trip = arr1[trip_index];
  item.trip = trip;

  for (var question_index in arr2){
    var question_collection = arr2[question_index];
    item.trip.questions = question_collection.slice(0);
    

    for (var question_collection_index in question_collection) {

      var question = question_collection[question_collection_index];
      item.trip.questions[question_collection_index][0].answers = [];
     
      for (var answer_collection_index in arr3) {
        var answer_collection = arr3[answer_collection_index];
        item.trip.questions[question_collection_index][0].answers = answer_collection.filter(function (el) {               
                                                                                            return el[0].question_id == question[0].question_id;                                                                                                  
                                                                                          });

       
      } 
    }
  }
  result.push(item)
}

return result;
}

removeDuplicates = function(a, b){
 for (var i = 0, len = a.length; i < len; i++) { 
        for (var j = 0, len2 = b.length; j < len2; j++) {        
            if (a[i][0].question_id === b[j].question_id) {
                b.splice(j, 1);
                len2=b.length;
            }
        }
    }    
 return b;
}


module.exports = router;
