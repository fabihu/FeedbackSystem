FeedbackSystem.SurveyController = (function() {
  var that = {},
  SurveyView = null,
  tripId = -1,
  userId = -1,
  socket = null,
  collection_answers = [],
  URL_ATTRAKDIFF_STANDARD = 'http://docs.google.com/forms/d/e/1FAIpQLSeGokbw0cQpcmNNYwJnOES6PblppTEN5vK6rFdEgYPw9LER9w/viewform',
  URL_DEPLOYMENT_SERVER = 'http://localhost:8080',

  //Initalizing SurveyController
  init = function() { 
    initHandler();
    SurveyView = FeedbackSystem.SurveyView;
  },

  //Initalizing handler
  initHandler = function(){
    $(document).on("initSurvey", onInitSurvey);
    $(document).on("getTripId", onGetTripId);
    $(document).on("getUserId", onGetUserId);
    $(document).on("startTimer", onStartTimer);
    $(document).on("leavePage", onLeavePage);
  },

  //Initalizing components 
  onInitSurvey = function(){ 
    socket = io(URL_DEPLOYMENT_SERVER);     
    SurveyView.initStarRating();
    initListener();    
    handleConnect();        
  },

  //Initalizing listener
  initListener = function(){
    $(".button-next").on('click', function(e){
      e.preventDefault();     
      onButtonNextClick(this);
    });

    $('.btn-checkbox').on('click', function(e){
      e.preventDefault();       
      onCustomCheckboxClick(this);
    });

    $('.btn-gender').on('click', function(e){
      e.preventDefault();       
      onCustomCheckboxGenderClick(this);
    });

    $('.btn-age').on('click', function(e){
      e.preventDefault();       
      onCustomCheckboxAgeClick(this);
    });

    $('.btn-exp').on('click', function(e){
      e.preventDefault();       
      onCustomCheckboxExpClick(this);
    });

    $('.btn-next-gender').on('click', function(e){
      e.preventDefault();       
      onGenderNextClick(this);
    });

    $('.btn-next-age').on('click', function(e){
      e.preventDefault();       
      onAgeNextClick(this);
    });

    $('.btn-next-exp').on('click', function(e){
      e.preventDefault();       
      onExpNextClick(this);
    });   
  },

  //handle connect and create new user
  handleConnect = function(){
    socket.on('connect',function(){ 
      socket.emit('user_data', {user_id: userId});
    });
  },

  //handle disconnect to update status canceld
  handleDisconnect = function(){
    socket.emit('disconnect'); 
  },

  //leave page action
  onLeavePage = function(){
    handleDisconnect();
  },

  //prevent window close and show alert dialog
  unbindWindowClose = function(){
    $(window).unbind('beforeunload');
    $(window).unbind('unload');
    $(document).unbind("leavePage");
    window.onbeforeunload = function(){return null;};
    window.unload = function(){return null;};
  },

  //click event on custom checkbox, change icon and mark as checked
  onCustomCheckboxClick = function(element){
      var span = $(element).find("span");
      SurveyView.changeSpanIcon(span);  
      var checked = $(element).data("checked");
  
      if(checked){
        $(element).attr("data-checked", false);
        $(element).data("checked", false);
      } else {
        $(element).attr("data-checked", true);
        $(element).data("checked", true);
      }
  },

//click event on demographic gender next button 
onGenderNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var gender = $(checked).data("val");

  updateUserGender(gender);
  SurveyView.fadeOutGenderContainer();
  setTimeout(SurveyView.fadeInAgeContainer, 700);   
},

//click event on demographic age next button 
onAgeNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var age = $(checked).data("val");

  updateUserAge(age);
  SurveyView.fadeOutAgeContainer();
  setTimeout(SurveyView.fadeInExpContainer, 700);
},

//click event on demographic experience next button 
onExpNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var exp = $(checked).data("val");

  updateUserExp(exp);
  SurveyView.fadeOutExpContainer(); 
  setTimeout(SurveyView.fadeInSurveyContainer, 700);
  $(document).trigger('startTimer'); 
},

//click event on custom demographic gender button 
onCustomCheckboxGenderClick = function(element){
    var span = $(element).find("span");
    var group = $(".btn-gender span");
    SurveyView.removeCheckedGlyphicon(group);
    $(".btn-gender").data("checked", false).attr("data-checked", false);
    SurveyView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//click event on custom demographic age button 
onCustomCheckboxAgeClick = function(element){
    var span = $(element).find("span");
    var group = $(".btn-age span");
    SurveyView.removeCheckedGlyphicon(group);
    $(".btn-age").data("checked", false).attr("data-checked", false);
    SurveyView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//click event on custom demographic experience button 
onCustomCheckboxExpClick = function(element){
    var span = $(element).find("span");
    var group = $(".btn-exp span");
    SurveyView.removeCheckedGlyphicon(group);
    $(".btn-exp").data("checked", false).attr("data-checked", false);
    SurveyView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//get users trip_id
onGetTripId = function(event, trip_id){    
    tripId = parseInt(trip_id);
},

//get users user_id
onGetUserId = function(event, user_id){    
    userId = parseInt(user_id);
},

//handle click event on button next click
onButtonNextClick = function(element){
  var question_id =  $(element).data("question-id");
  var question_type = $(element).data("question-type");  
  var next_question_id = $(element).parent().next('.container').data('question-id'); 
  var last_question = $(element).data("last-question");  

  //check different question types and prepare an object representing the users answers
  if(question_type === 0) {
    var checkedButtons = $(".answer-options-"+question_id).filter('button[data-checked="true"]');    
    if(checkedButtons.length === 0){  onNoAnswerGiven(element); return;}
    prepareAnswerObjects(checkedButtons, 0); 
  } else if (question_type == 1) {
    var $answerRows = $('#container-questions-' + question_id);  
    var radioAnswers = $answerRows.find("input").filter(function() {
      return parseInt($(this).val()) === 0;
    });   
    if(radioAnswers.length > 0) { onNoAnswerGiven(element); return;}    
    prepareAnswerObjects($answerRows.find("input"), 1); 
  } else if (question_type == 3){
    var textAreaSuggestions = $('#text-suggestions');
    prepareAnswerObjects( textAreaSuggestions, 3);
  }
  $('body').scrollTop(0);
  stopTimer(question_id); 

  //check if last question, then post users answers, otherwise fade in the next question
  if(last_question){
    updateMetaFinish();
    unbindWindowClose();  
    $.post('/receive-answers/', {data: collection_answers}, function( data ) {
        SurveyView.showGoodByeMsg();
        redirectToAttrakDiff();
  
    }); 
  } else {
    setTimeout(function(){
      SurveyView.fadeInContainer(next_question_id)
    }, 700);  
    $(document).trigger("startTimer"); 
  }

  //remove question container
  $('#container-questions-' + question_id).removeClass("animated fadeInDown");
  $('#container-questions-' + question_id).addClass("animated fadeOutDown");
  setTimeout(function(){    
    $('#container-questions-' + question_id).remove();
  }, 700); 
},

//redirect user to attrakdiff
redirectToAttrakDiff = function(){
setInterval(changeTimeRedirect, 1000);
var timer = setTimeout(function() {
            window.location=URL_ATTRAKDIFF_STANDARD;
        }, 12000);
},

//change time when redirecting to attrakdiff
changeTimeRedirect = function(){
  var current_time = $('#time-redirect').text();
  $('#time-redirect').text(parseInt(current_time)-1);
},

//show notification when no answers given by user
onNoAnswerGiven = function(element){
  $(element).tooltip({ animation: true,                       
                       container: element,
                        title: "Bitte geben Sie eine gültige Bewertung ab!"});
  $(element).tooltip('show');
},

//format the answer object depending on the question type
prepareAnswerObjects = function(object, question_type){
  if(question_type === 0 || question_type == 1){
    $.each(object, function(index, element){
    var value = (question_type === 0) ? true:element.value;   
    var answer = {
      question_id: $(element).data('question-id'),
      answer_id: $(element).data('answer-id'),
      type: question_type,
      value: value,
      trip_id: tripId,
      user_id: userId        
    };   
    collection_answers.push(answer);      
    });
  } else {    
    var text = $(object).val();
    var answer = {
          question_id: $(object).data('question-id'),
          answer_id: $(object).data('answer-id'),
          type: question_type,
          value: 0,
          text: text,
          trip_id: tripId,          
          user_id: userId 
        };
    collection_answers.push(answer);  
  }
},


//handle page leaving of user
initPageLeaveAction = function(){
  $(window).on('beforeunload', function(e){
        return "Why are you leaving?";               
    });
  $(window).on('unload', function(){    
    $(document).trigger('leavePage');    
  });   
}, 

//handle starting of timer to meauser time taken for question
onStartTimer = function(){
  initPageLeaveAction();
  start = new Date(); 
},

//stop the timer
stopTimer = function(question_id){
  var elapsed = (new Date() - start) / 1000;
  start = 0;
  sendTimeTaken(question_id, elapsed);
  updateMetaCount();
},

//send time taken by user for one question to server
sendTimeTaken = function(question_id, seconds){
  var url = '/insert-time/';
  $.post(url, {user_id: userId, question_id: question_id, trip_id: tripId, seconds: seconds}, function( data ) {
    
  });
},

//update users answerd question
updateMetaCount = function(){
  var url = '/update-meta-count/';
  $.post(url, {user_id: userId, trip_id: tripId}, function( data ) {
    
  });
},

//change status of users questionnaire to finished
updateMetaFinish = function(){
  socket.emit('finished', {user_id: userId});
  var url = '/update-meta-finish/';
  $.post(url, {user_id: userId, trip_id: tripId}, function( data ) {
    
  });
},

//insert gender of user in db
updateUserGender = function(gender){
 var url = '/update-user-gender/'; 
 $.post(url, {user_id: userId, gender: gender}, function( data ) {
    
 });
},

//insert age of user in db
updateUserAge = function(age){
var url = '/update-user-age/'; 
 $.post(url, {user_id: userId, age: age}, function( data ) {
    
 });
},

//insert experience of user in db
updateUserExp = function(exp){
var url = '/update-user-exp/'; 
 $.post(url, {user_id: userId, exp: exp}, function( data ) {
    
 });
};
  
that.init = init;
that.onInitSurvey = onInitSurvey;
return that;

}());