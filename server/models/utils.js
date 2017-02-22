//helper class with custom utility functions
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//initialization
init = function(){
	console.log("utils init");
};

//method returning the current time as custom string
getDateTime = function(){
	var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
    return dateTime;
};

//method to hash a password with module bcrypt
hashPassword = function(password){      
    return bcrypt.hashSync(password, salt);
};

//method to compare a password with module bcrypt
comparePassword = function(password, hash){
    return bcrypt.compareSync(password, hash);
};

//method to filter answeres by id
filterAnswers = function(id, arr){  
 var arr2 = [];
  for (var index in arr){
    var answer = arr[index][0];   

    if(answer.question_id == id){
      arr2.push(arr[index]);
    }
  }
  return arr2;
};

//method to ensure a user is authenticated
IsAuthenticated = function (req, res, callback){
    if (req.user) {
       callback();
    } else {
       res.redirect('/login');
    }  
};

//method to format answers in an array
formatArray = function(arr1, arr2){
    var result = [];
    for (var i = 0; i < arr1.length; i++){  
      var item = {};         
      item.question = arr1[i][0];    
      item.question.answers = filterAnswers(item.question.id, arr2);
      result.push(item);
    } 
    return result;
};

//remove duplicate entrys from an array
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
};

//format the data for the questionnaire overview
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
};

//format the data for the evaluation overview
formatScoreData = function(arr1, arr2, arr3) {
  var result = [];  
  var allTrips = arr1;
  var allQuestions = arr2;
  var allAnswers = arr3;

  for (var trip_index in allTrips) {  
    var item = {};
    var trip = allTrips[trip_index];
    item.trip = trip;
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
    result.push(item);
  }
  return result;
};

exports.formatScoreData = formatScoreData;
exports.formatAssignmentData = formatAssignmentData;
exports.removeDuplicates = removeDuplicates;
exports.formatArray = formatArray;
exports.filterAnswers = filterAnswers;
exports.comparePassword = comparePassword;
exports.hashPassword = hashPassword;
exports.getDateTime = getDateTime;
exports.init = init;