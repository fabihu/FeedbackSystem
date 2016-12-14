module.exports = function() {
var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');

/* GET users listing. */
router.get('/', IsAuthenticated, function(req, res, next) {
  res.render('eval'); 
});

router.get('/logout/', function(req, res) {
  req.session.destroy()
  req.logout();
  res.redirect('/login/')
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

router.get('/users/', IsAuthenticated, function(req, res, next) {
  dbhandler.getUsers(function(err, dbUsers){   
    res.render('snippet_eval_users',  {users: dbUsers});
  });
});

router.post('/save-new-user/', function(req, res, next) {
  var mail = req.body.mail;
  var password = req.body.password;
   dbhandler.insertNewUser(mail, password, function(err){   
     res.json({err});   
  }); 
});

router.post('/delete-user/', function(req, res, next) {
  var id = req.body.id;
   dbhandler.deleteUser(id, function(err){   
     res.json({err});   
  }); 
});

router.post('/edit-user/', function(req, res, next) {
  var id = req.body.id;
  var mail = req.body.mail;
  var password = req.body.password;

   dbhandler.updateUser(id, mail, password, function(err){   
     res.json({err});   
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

router.post('/get-question-score/', function(req, res, next) {
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

router.post('/get-questionnaire-type/', function(req, res, next) {
 var trip_id = req.body.trip_id;      
 dbhandler.getQuestionnaireType(trip_id, function(err, result){    
   res.json(result);
  }); 
});

router.post('/get-avg-question/', function(req, res, next) {
 var trip_id = req.body.trip_id;
 var question_id = req.body.question_id;

 dbhandler.getAvgTimeForQuestion(trip_id, question_id, function(err, result){    
   res.json(result);
  }); 
});

router.post('/change-type-questionnaire/', function(req, res, next) {
 var trip_id = req.body.trip_id;    
 var type = req.body.type;  
 dbhandler.updateQuestionnaireType(trip_id, type, function(err, result){    
   res.json(result);
  }); 
});


router.post('/get-sum-participants/', function(req, res, next) {
 var trip_id = req.body.trip_id; 

 dbhandler.getSumParticipants(trip_id, function(err, result){    
   res.json(result);
  }); 
});

router.post('/get-sum-participants-finish/', function(req, res, next) {
 var trip_id = req.body.trip_id; 

 dbhandler.getSumParticipantsFinish(trip_id, function(err, result){    
   res.json(result);
  }); 
});

router.post('/get-sum-participants-cancel/', function(req, res, next) {
 var trip_id = req.body.trip_id; 

 dbhandler.getSumParticipantsCancel(trip_id, function(err, result){    
   res.json(result);
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

var allTrips = arr1;
var allQuestions = arr2;
var allAnswers = arr3;

for (var trip_index in allTrips) {

var item = {}
var trip = allTrips[trip_index];
var trip_id = trip.id
item.trip = trip
item.trip.questions = [];
var question_collection = allQuestions[trip_index];
 
item.trip.questions = [].concat.apply([], question_collection);

item.trip.questions.forEach(function(question, index){
  var question_id = question.question_id;  

  item.trip.questions[index].answers = allAnswers[trip_index].filter(function (answer){                                           
                                            return answer[0].question_id == question_id;                          
                                          });
  item.trip.questions[index].answers = [].concat.apply([], item.trip.questions[index].answers);
});  

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


return router;
}

function IsAuthenticated(req,res,next){
  if (req.user) {
     next();
  } else {
     res.redirect('/login');
  }  
}

