FeedbackSystem.SurveySTController = (function() {
var that = {},
SurveySTView = null,
tripId = -1,
userId = -1,
collection_answers = [],
start = 0,
isDown = false,
interval = 0,
socket = null,
URL_ATTRAKDIFF_SURVEYTAINMENT = 'http://docs.google.com/forms/d/e/1FAIpQLSdKEyIOdt1NzcoqFC-CRSFXni6pHaAPDcPldZaIn_XdmC6w1A/viewform',
URL_DEPLOYMENT_SERVER = 'http://localhost:8080',

//Initalizing SurveySTController
init = function() {  	
    initHandler();
    SurveySTView = FeedbackSystem.SurveySTView;
},

//Initalizing handler
initHandler = function(){
	$(document).on("initSurveyST", onInitSTSurvey);
    $(document).on("getTripId", onGetTripId);
    $(document).on("getUserId", onGetUserId);
    $(document).on("startTimerST", onStartTimerST);
    $(document).on("leavePageST", onLeavePageST);  
},

//Initalizing components 
onInitSTSurvey = function(){	
	socket = io(URL_DEPLOYMENT_SERVER);
	handleConnect();
	initListener();
	initDroppable();
	SurveySTView.initDraggable();     
},

//Initalizing listener
initListener = function(){	
	$('#survey-container').on('click', ".button-next-st", function(e){
		e.preventDefault();
		var next_id = $(this).parent().next('.container').data('question-id');		
		var id =  $(this).data('question-id');
		$('body').scrollTop(0);
		if ($(this).hasClass('button-next-qtype-1')){			
		  onButtonNextTypeOneClick(this, id, next_id);	 
		} else {
		  onButtonNextClick(this, id, next_id);			
		}	
	});	

	$('#survey-container').on('touchend', ".bus-middle", function(e){	
		e.preventDefault();			
		onMiddleClick(this);
	});	

	$('#survey-container').on('click', ".button-minus", function(e){
		e.preventDefault();		
		onMinusBtnPress(this);
	});

	$('#survey-container').on('click', ".button-plus", function(e){
		e.preventDefault();		
		onPlusBtnPress(this);
	});

	$('#survey-container').on('touchstart mousedown', ".btn-arr", function(e){		
		e.preventDefault();
		e.stopPropagation();	
		isDown = true;
		onBtnArrPress(this);
	});

	$('#survey-container').on('touchend mouseup', ".btn-arr", function(e){		
		e.stopPropagation();
		e.preventDefault();		
		isDown = false;				
	});

	$('#survey-container').on('click', '.btn-gender', function(e){
      e.preventDefault();       
      onCustomCheckboxGenderClick(this);
    });

    $('#survey-container').on('click', '.btn-age', function(e){
      e.preventDefault();       
      onCustomCheckboxAgeClick(this);
    });


    $('#survey-container').on('click', '.btn-exp', function(e){
      e.preventDefault();       
      onCustomCheckboxExpClick(this);
    });

    $('#survey-container').on('click', '.btn-next-gender-st', function(e){
      e.preventDefault();       
      onGenderNextClick(this);
    });

    $('#survey-container').on('click', '.btn-next-age-st', function(e){
      e.preventDefault();       
      onAgeNextClick(this);
    });

    $('#survey-container').on('click', '.btn-next-exp-st', function(e){
      e.preventDefault();       
      onExpNextClick(this);
    });

},

 //handle disconnect to update status canceld
handleDisconnect = function(){
   socket.emit('disconnect'); 
},

//get users trip_id
onGetTripId = function(event, trip_id){    
  tripId = parseInt(trip_id);
},

//get users user_id
onGetUserId = function(event, user_id){    
  userId = parseInt(user_id);
},

//handle connect and create new user
handleConnect = function(){
  socket.on('connect',function(){ 
    socket.emit('user_data', {user_id: userId});
  });
},

//leave page action
onLeavePageST = function(){	
 	handleDisconnect(); 
},

//prevent window close and show alert dialog
unbindWindowClose = function(){ 
  $(window).unbind('beforeunload');
  $(window).unbind('unload');
  $(document).unbind("leavePageST");
    window.onbeforeunload = function(){return null;};
    window.unload = function(){return null;};
},

//click event on demographic gender next button 
onGenderNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var gender = $(checked).data("val");

  updateUserGender(gender);
  SurveySTView.fadeOutGenderContainer();
  setTimeout(SurveySTView.fadeInAgeContainer, 700);   
},

//click event on demographic age next button 
onAgeNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var age = $(checked).data("val");

  updateUserAge(age);
  SurveySTView.fadeOutAgeContainer();
  setTimeout(SurveySTView.fadeInExpContainer, 700);
},

//click event on demographic experience next button 
onExpNextClick = function(element){
  var container = $(element).parent();
  var checked = $(container).find('.row').find('button').filter('button[data-checked="true"]');
  var exp = $(checked).data("val");

  updateUserExp(exp);
  SurveySTView.fadeOutExpContainer();
  setTimeout(fadeInSurveyContainer, 700);
  $(document).trigger('startTimerST'); 
},

//click event on custom demographic gender button 
onCustomCheckboxGenderClick = function(element){
    var span = $(element).find("span");   
    var group = $(".btn-gender span");
    SurveySTView.removeCheckedGlyphicon(group);
    $(".btn-gender").data("checked", false).attr("data-checked", false);
    SurveySTView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//click event on custom demographic age button 
onCustomCheckboxAgeClick = function(element){
    var span = $(element).find("span");
    var group = $(".btn-age span");
    SurveySTView.removeCheckedGlyphicon(group);
    $(".btn-age").data("checked", false).attr("data-checked", false);
    SurveySTView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//click event on custom demographic experience button 
onCustomCheckboxExpClick = function(element){
    var span = $(element).find("span");
    var group = $(".btn-exp span");
    SurveySTView.removeCheckedGlyphicon(group);
    $(".btn-exp").data("checked", false).attr("data-checked", false);
    SurveySTView.showCheckedGlyphicon(span);
    $(element).data("checked", true).attr("data-checked", true);
},

//fade in survey container and init the drag and drop function
fadeInSurveyContainer = function(){
	SurveySTView.animationFadeInSurveyContainer();
	SurveySTView.initDraggable();
	initDroppable();
},

//initialize ui droppable elements
initDroppable = function(){
	$( ".ui-droppable" ).droppable({
	    drop: function( event, ui ) {
	    	onDropBus(this);	    
	    }
   	});	
},

//show notification when no answers given by user
onNoAnswerGiven = function(element){
  $(element).tooltip({ animation: true,                       
                       container: element,
                       title: "Bitte geben Sie eine gültige Bewertung ab!"});
  $(element).tooltip('show');
},

//handle button press event on left right arrow keys in multipe choice question
onBtnArrPress = function(element){	
	interval = setInterval(function(){			
		if(isDown === true){
		 SurveySTView.animationMoveBus(element);			
		} else {
		 clearInterval(interval);
		}
	}, 20); 
},

//handle button press event on minus button press for question type two for scale ranking
onMinusBtnPress = function(element){
	var last_visible_bus_element = $(element).prev('div').parent().find('div').last();
	var bus_elements = $(element).prev('div').find('div');	
	var first_element = $(element).prev('div').children().first();
	var question_id = $(element).data("question-id");
	var answer_id = $(element).data("answer-id");

	$.each(bus_elements, function(index, el){
		if ($(el).css("visibility") != "hidden"){
			last_visible_bus_element = el;
		}
	});

	if(!($(last_visible_bus_element).is($(first_element)))) {
		$(last_visible_bus_element).css("visibility", "hidden");		
	}
	$(".score-qv-2-"+question_id+"-"+answer_id).text(countSegments(bus_elements));
},

//handle button press event on plus button press for question type two for scale ranking
onPlusBtnPress = function(element){
	var bus_elements = $(element).next('div').find('div');
	var last_visible_bus_element = $(element).next('div').children().first();
	var question_id =  $(element).data("question-id");
	var answer_id = $(element).data("answer-id");
	$.each(bus_elements, function(index, el){
		if ($(el).css("visibility") != "hidden"){			
			last_visible_bus_element = $(el).next('div');
		}
	});	
	$(last_visible_bus_element).css("visibility", "visible").removeClass("hidden-st");	
	$(".score-qv-2-"+question_id+"-"+answer_id).text(countSegments(bus_elements));
},

//count segments of bus to get user rating
countSegments = function(elements){
 	var value = 0; 
 	$.each(elements, function(index, el){
 		if ($(el).css("visibility") != "hidden"){
 		value++;
 		}
  	});		
	return value;
},

//choose answer for scala ranking to determine users answer 
onDropBus = function(element){
	var answer_id = $( element ).parent().data("answer-id");
	var next_id = $('#answer-container-'+ answer_id).next('div').data('answer-id');
	var next_question_id = $('#answer-container-'+ answer_id).parent().next('div').data('question-id');
	var question_id = $('#answer-container-'+ answer_id).parent().data('question-id');	
	var value = $( element ).data("value");
	var type = 1;
	var answer = createSingleUserAnswer(question_id, answer_id, type, value);

	collection_answers.push(answer);

	if (next_id) {
			SurveySTView.animationFadeOutAnswerContainer(answer_id);
			setTimeout(function(){	 
				SurveySTView.animationFadeInAnswerContainer(next_id); 				
   				SurveySTView.removeAnswerContainer(answer_id);
   				SurveySTView.initDraggable();
   			}, 700);    
	} else {
		stopTimerST(question_id);
		showNextQuestion(question_id, next_question_id);
	}
	$('body').scrollTop(0);
	removeTutorials(0);
},

//handle next button click for different question types
onButtonNextClick = function(element, id, next_id){
	var elements =  $(element).parent().find(".bus-middle").filter('div[data-checked="true"]');
	var question_id = $(element).data('question-id');
	var question_type = $(element).data('question-type');
	var type = 0;
	
	if(question_type === 0) {
	if (elements.length === 0) {  onNoAnswerGiven(element); return;}
	 	$.each(elements, function(index, item){ 		
	 		var answer_id = $(item).data("answer-id"); 		
	 		var answer = createSingleUserAnswer(question_id, answer_id, type, true);
	 		collection_answers.push(answer);		
	 	});	
	}
	
	if(question_type == 3) {
		var $textAreaSuggestions = $('#text-suggestions');
	    var text = $textAreaSuggestions.val();
	    var answer = {
	          question_id: $textAreaSuggestions.data('question-id'),
	          answer_id: $textAreaSuggestions.data('answer-id'),
	          type: 3,
	          value: 0,
	          text: text,
	          trip_id: tripId,          
	          user_id: userId
	        };
	    collection_answers.push(answer);  
	}
	
	removeTutorials(2);
	stopTimerST(question_id);
	showNextQuestion(id, next_id);
},
//handle next button click for scale ranking type one to determine user answers for each answer option of the question
onButtonNextTypeOneClick = function(element, id, next_id){
	var elements = $(element).parent().find(".qv-2");
	var question_id = $(element).data('question-id');
	var type = 1;
		$.each(elements, function(index, item){
		var value = 0;
		var answer_id = $(item).data("answer-id");
		var container = $(item).find('.bus-container').children(); 	
		$.each(container, function(index, el){
			if ($(el).css("visibility") != "hidden"){
				value++;
			}
		 }); 	 	
			var answer = createSingleUserAnswer(question_id, answer_id, type, value); 
		collection_answers.push(answer); 	
	});
	removeTutorials(1);
	stopTimerST(question_id);
	showNextQuestion(id, next_id);
},

//send answer object to servers
sendAnswers = function(question_id){
	updateMetaFinish();
	unbindWindowClose();	
	$.post('/receive-answers/', {data: collection_answers}, function( data ) {    	
    	SurveySTView.showGoodByeMsg();
    	redirectToAttrakDiff();
 	});
  	SurveySTView.animationfadeOutContainer(question_id);
  	setTimeout(function(){    	
    	SurveySTView.removeContainer(question_id);
  	}, 700); 
  	
},

//redirect user to attrakdiff
redirectToAttrakDiff = function(){
	setInterval(changeTimeRedirect, 1000);
	var timer = setTimeout(function() {
	            window.location=URL_ATTRAKDIFF_SURVEYTAINMENT;
	        }, 12000);
},

//change time when redirecting to attrakdiff
changeTimeRedirect = function(){
	var current_time = $('#time-redirect').text();
	$('#time-redirect').text(parseInt(current_time)-1);
},

//handle click event on middle element of multiple choice question click event
onMiddleClick = function(element){	
	if($(element).hasClass("check-middle")){
		SurveySTView.removeImageMiddle(element);
		$(element).data("checked", false);
		$(element).attr("data-checked", false);  
	} else {
		SurveySTView.addImageMiddle(element);
		$(element).data("checked", true);
		$(element).attr("data-checked", true);   
	}
},

//create object for one single answer
createSingleUserAnswer = function(question_id, answer_id, type, value){
	return answer = {
      question_id: question_id,
      answer_id: answer_id,
      type: type,
      value: value,
      trip_id: tripId,  
      user_id: userId      
    };               
},

//handle next visual effects on shoing next question
showNextQuestion = function(id, next_id){
   if(next_id){	   
   	$(document).trigger("startTimerST");  	
	SurveySTView.animationfadeOutContainer(id);
	SurveySTView.initDraggable();
	initDroppable();
	setTimeout(function(){
		SurveySTView.animationfadeInContainer(next_id);
		SurveySTView.removeContainer(id);	   	
	   	SurveySTView.initDraggable();
		initDroppable();
   	}, 700);    
   } else {   
   	sendAnswers(id);
   }   
},

//handle starting of timer to meauser time taken for question
onStartTimerST = function(){
	$(window).on('beforeunload', function(e){		
    	return "Why are you leaving?";    		       	
    });

	$(window).on('unload', function(){   		
		$(document).trigger('leavePageST');		
	}); 	

	start = new Date();	
}, 

//stop the timer
stopTimerST = function(question_id){
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
},

//remove all tutorials from specific question type
removeTutorials = function(type){
	$('.tutorial-type-'+type).remove();
};

that.init = init;
that.onInitSTSurvey = onInitSTSurvey;
return that;

}());