module.exports = function(io) { // catch here

var express = require('express');
var router = express.Router();
var dbhandler = require('../db/dbhandler');
var async = require('async');
var allClients = {};
allClients.sockets = [];
allClients.ids = [];


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

router.get('/', function(req, res, next) {
  dbhandler.init();
  res.render('index', { title: 'Express' });  
})

router.get('/impressum/', function(req, res, next) {
  res.render('impressum');  
})


router.post('/check-login/', function(req, res, next) {	
    var id = req.body.id;    
    dbhandler.checkLoginCredentials(id, function(result){      
      res.json({id: result.id, flag_active: result.flag_active});    	
    });
	
})

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
      var sortedQuestions = formatArr(result.questions, result.answers);     
      var type = 0;
      
      dbhandler.getQuestionnaireType(trip_id, function(err, result){
        type = result[0].type_questionnaire; 
        if(type == 0){   
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
          })
        }
      });
    }    
  });  
});

router.post('/create-user/', function(req, res, next) {
  var id = req.body.id;
  var qtype_id = req.body.qtype_id;
  dbhandler.insertUserMeta(id, qtype_id, function(err, id){      
      res.json({id: id});;
  });
})

router.post('/receive-answers/', function(req, res, next) {
  var answers = req.body.data;  
  dbhandler.insertUserAnswers(answers);
  res.json({data: "ok"});
})

router.post('/insert-time/', function(req, res, next) {
  var user_id = req.body.user_id;
  var question_id = req.body.question_id;
  var trip_id = req.body.trip_id;  
  var seconds = req.body.seconds;
  console.log(req.body);
  dbhandler.insertTimeQuestion(user_id, question_id, trip_id, seconds, function(err, result){
    res.json();    
  });
})

router.post('/update-meta-count/', function(req, res, next) {
  var user_id = req.body.user_id;
  var trip_id = req.body.trip_id;  
  dbhandler.updateMetaCount(user_id, trip_id, function(err, result){
    res.json({data: "ok"});
  });
})

router.post('/update-meta-finish/', function(req, res, next) {
  var user_id = req.body.user_id;
  var trip_id = req.body.trip_id;  
  dbhandler.updateMetaFinish(user_id, trip_id, function(err, result){
    res.json({data: "ok"});
  });
})

router.post('/update-meta-cancel/', function(req, res, next) {
  var user_id = req.body.user_id;
  var trip_id = req.body.trip_id;    

  if(user_id != -1){
    dbhandler.updateMetaCancel(user_id, function(err, result){
        res.json({data: "ok"});
    });    
  }

})

router.post('/update-user-gender/', function(req, res, next) {
  var user_id = req.body.user_id;
  var gender = req.body.gender;  
  dbhandler.updateUserGender(user_id, gender, function(err, result){
    res.json({data: "ok"});
  });
})

router.post('/update-user-age/', function(req, res, next) {
  var user_id = req.body.user_id;
  var age = req.body.age;  
  dbhandler.updateUserAgeGroup(user_id, age, function(err, result){
    res.json({data: "ok"});
  });
})

router.post('/update-user-exp/', function(req, res, next) {
  var user_id = req.body.user_id;
  var exp = req.body.exp;  
  dbhandler.updateUserExp(user_id, exp, function(err, result){
    res.json({data: "ok"});
  });
})

filterAnswers = function(id, arr){
  
 var arr2 = [];
  for (var index in arr){
    var answer = arr[index][0];   

    if(answer.question_id == id){
      arr2.push(arr[index]);
    }
  }
  return arr2;

}

formatArr = function(arr1, arr2) {
  var result = []; 

  for (var i = 0; i < arr1.length; i++){    
  
    var item = {};
         
    item.question = arr1[i][0];    
    item.question.answers = filterAnswers(item.question.id, arr2);
    result.push(item);
}
 
  return result;
}

    return router;
}
