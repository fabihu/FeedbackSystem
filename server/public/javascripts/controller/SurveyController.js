FeedbackSystem.SurveyController = (function() {

  var that = {},
  $buttonNext = null,
  $containerQuestions = null,
  tripId = -1,
  userId = -1,
  socket = null,
  collection_answers = [],

  init = function() {
  	console.log("SurveyController init");   
    $(document).on("initSurvey", onInitSurvey);
    $(document).on("getTripId", onGetTripId);
    $(document).on("getUserId", onGetUserId);
    $(document).on("startTimer", onStartTimer);
    $(document).on("leavePage", onLeavePage);
  },

  onInitSurvey = function(){ 
    socket = io('http://localhost:8080');  
    $containerQuestions = $('#container-questions');
    $buttonNext = $(".button-next");

    $('.rating').rating({ showClear:false,
                          showCaption: false });
  
    $('.btn-checkbox').on('click', function(e){
      e.preventDefault();       
      onCustomCheckboxClick(this);
    });

  
    
    initListener();
    getSelectedAnswers();
    handleConnect();        
  },

  unbindWindowClose = function(){
    $(window).unbind('beforeunload');
    $(window).unbind('unload');
    $(document).unbind("leavePage");
    window.onbeforeunload = function(){return null};
    window.unload = function(){return null};
  },

  initListener = function(){
    $('.btn-checkbox').click(function(e){
      e.preventDefault();
      onBtnCheckboxClick(this);
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

  handleConnect = function(){
    socket.on('connect',function(){ 
      socket.emit('user_data', {user_id: userId});
    });
  },

  handleDisconnect = function(){
    socket.emit('disconnect'); 
  },

  onLeavePage = function(){
   handleDisconnect();
  },

onCustomCheckboxClick = function(element){
    var span = $(element).find("span");
    if($(span).hasClass('glyphicon glyphicon-ok')){
      $(span).removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');  
    } else {
      $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');  
    }

    //moved from onBtnCheckboxClick check if works
    var checked = $(element).data("checked");

    if(checked){
      $(element).attr("data-checked", false);
      $(element).data("checked", false);
    } else {
      $(element).attr("data-checked", true);
      $(element).data("checked", true);
    }
},

onGenderNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var gender = $(checked).data("val");

  updateUserGender(gender);
  fadeOutGenderContainer();
  fadeInAgeContainer();
},

onAgeNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var age = $(checked).data("val");

  updateUserAge(age);
  fadeOutAgeContainer();
  fadeInExpContainer();
},

onExpNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var exp = $(checked).data("val");

  updateUserExp(exp);
  fadeOutExpContainer();
  fadeInSurveyContainer();
  $(document).trigger('startTimer'); 
},

fadeInSurveyContainer = function(){
//trigger Timer
$(".survey-container").first().removeClass("invis").addClass("visible").addClass("animated fadeInDown");   
},

onCustomCheckboxGenderClick = function(element){
    var span = $(element).find("span");   
    $(".btn-gender span").removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');
    $(".btn-gender").data("checked", false).attr("data-checked", false);
    $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');
    $(element).data("checked", true).attr("data-checked", true);
},

onCustomCheckboxAgeClick = function(element){
    var span = $(element).find("span");
    $(".btn-age span").removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');
    $(".btn-age").data("checked", false).attr("data-checked", false);
    $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');
    $(element).data("checked", true).attr("data-checked", true);
},

onCustomCheckboxExpClick = function(element){
    var span = $(element).find("span");
    $(".btn-exp span").removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');
    $(".btn-exp").data("checked", false).attr("data-checked", false);
    $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');
    $(element).data("checked", true).attr("data-checked", true);
},

onFadeInContainer = function(id){
   $('#container-questions-'+id).removeClass("invis");
   $('#container-questions-'+id).addClass("visible");  
   $('#container-questions-'+id).addClass("animated fadeInDown");   
},

fadeOutGenderContainer = function(){
  $('#container-gender').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
  setTimeout(function(){    
    $('#container-gender').remove();
  }, 700); 
},

fadeOutAgeContainer = function(){
  $('#container-age').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
  setTimeout(function(){    
    $('#container-age').remove();
  }, 700); 
},

fadeOutExpContainer = function(){
  $('#container-experience').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
  setTimeout(function(){    
    $('#container-experience').remove();
  }, 700); 
},

fadeInAgeContainer = function(){
  $('#container-age').removeClass("invis");
  $('#container-age').addClass("visible").addClass("animated fadeInDown");   
},

fadeInExpContainer = function(){
  $('#container-experience').removeClass("invis");
  $('#container-experience').addClass("visible").addClass("animated fadeInDown");   
},

onGetTripId = function(event, trip_id){    
    tripId = parseInt(trip_id);
},

onGetUserId = function(event, user_id){    
    userId = parseInt(user_id);
},

onBtnCheckboxClick = function(element){

},

getSelectedAnswers = function(){
$buttonNext.click(function(){  
  var question_id =  $(this).data("question-id");
  var question_type = $(this).data("question-type");  
  var next_question_id = $(this).parent().next('.container').data('question-id'); 
  var last_question = $(this).data("last-question");  

  if(question_type == 0) {
    var checkedButtons = $(".answer-options-"+question_id).filter('button[data-checked="true"]');
    if(checkedButtons.length == 0){  onNoAnswerGiven(this); return;}
    prepareAnswerObjects(checkedButtons, 0); 
  } else {
    var $radioGroup = $('#container-questions-' + question_id);    
    var radioAnswers = $radioGroup.find("input");
    if(radioAnswers.length == 0) { onNoAnswerGiven(this); return;}
    prepareAnswerObjects( radioAnswers, 1); 
  }  

  if(question_type == 3){
    var textAreaSuggestions = $('#text-suggestions');
    prepareAnswerObjects( textAreaSuggestions, 1);
  }

  stopTimer(question_id);
  onFadeInContainer(next_question_id);  
  $(document).trigger("startTimer"); 

  if(last_question){
    updateMetaFinish();
    unbindWindowClose();  
    $.post('/receive-answers/', {data: collection_answers}, function( data ) {
        var message = '<div id="container-credits" class="container main-text margin-credits animated fadeInDown"><label class="lbl-suggestions" for="text-suggestion">Vielen Dank für Ihre Teilnahme an unserer Umfrage. <br/>'+
        'Wir hoffen, dass wir Sie auch in Zukunft auf weiteren Reisen begrüßen dürfen! </label></div>'
        $(message).insertAfter('.navbar');
  
    }); 
  }

  $('#container-questions-' + question_id).removeClass("animated fadeInDown");
  $('#container-questions-' + question_id).addClass("animated fadeOutDown");
  setTimeout(function(){    
    $('#container-questions-' + question_id).remove();
  }, 700); 

  });


},

onNoAnswerGiven = function(element){
  $(element).tooltip({ animation: true,                       
                       container: element,
                        title: "Bitte geben Sie eine gültige Bewertung ab!"})
  $(element).tooltip('show');
},

prepareAnswerObjects = function(object, question_type){
  if(question_type == 0 || question_type == 1){
    $.each(object, function(index, element){
    var value = (question_type == 0) ? true:element.value;
    var answer = {
      question_id: $(element).data('question-id'),
      answer_id: $(element).data('answer-id'),
      type: question_type,
      value: value,
      trip_id: tripId        
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
          trip_id: tripId          
        
        };
    collection_answers.push(answer);  
  }
},

onStartTimer = function(){
  initPageLeaveAction();
  start = new Date(); 
},

initPageLeaveAction = function(){
  $(window).on('beforeunload', function(e){
        return "Why are you leaving?";               
    });

  $(window).on('unload', function(){    
    $(document).trigger('leavePage');    
  });   
} 

stopTimer = function(question_id){
  var elapsed = (new Date() - start) / 1000;
  start = 0;
  sendTimeTaken(question_id, elapsed);
  updateMetaCount();
},

sendTimeTaken = function(question_id, seconds){
  var url = '/insert-time/';
  $.post(url, {user_id: userId, question_id: question_id, trip_id: tripId, seconds: seconds}, function( data ) {
    
  });
},

updateMetaCount = function(){
  var url = '/update-meta-count/';
  $.post(url, {user_id: userId, trip_id: tripId}, function( data ) {
    
  });
},

updateMetaFinish = function(){
  socket.emit('finished', {user_id: userId});
  var url = '/update-meta-finish/';
  $.post(url, {user_id: userId, trip_id: tripId}, function( data ) {
    
  });
},

updateUserGender = function(gender){
 var url = '/update-user-gender/'; 
 $.post(url, {user_id: userId, gender: gender}, function( data ) {
    
 });
},

updateUserAge = function(age){
var url = '/update-user-age/'; 
 $.post(url, {user_id: userId, age: age}, function( data ) {
    
 });
},

updateUserExp = function(exp){
var url = '/update-user-exp/'; 
 $.post(url, {user_id: userId, exp: exp}, function( data ) {
    
 });
};
  
that.init = init;
that.onInitSurvey = onInitSurvey;
return that;

}());