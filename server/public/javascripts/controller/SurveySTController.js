FeedbackSystem.SurveySTController = (function() {
var that = {},
tripId = -1,
userId = -1,
collection_answers = [],
start = 0,
isDown = false,
interval = 0,
socket = null,

init = function() {
  	console.log("SurveySTController init");  	
;   $(document).on("initSurveyST", onInitSTSurvey);
    $(document).on("getTripId", onGetTripId);
    $(document).on("getUserId", onGetUserId);
    $(document).on("startTimerST", onStartTimerST);
    $(document).on("leavePageST", onLeavePageST);        

    initComponents();    
},

onInitSTSurvey = function(){
	initDraggable();
	initDroppable();
	socket = io('http://localhost:8080');
	handleConnect();     
},

handleDisconnect = function(){
   socket.emit('disconnect'); 
},

onGetTripId = function(event, trip_id){    
  tripId = parseInt(trip_id);
},

onGetUserId = function(event, user_id){    
    userId = parseInt(user_id);
},

initComponents = function(){
	
	$('#survey-container').on('click', ".button-next-st", function(e){
		e.preventDefault();
		var next_id = $(this).parent().next('.container').data('question-id');		
		var id =  $(this).data('question-id');
		if ($(this).hasClass('button-next-qtype-1')){
		  onButtonNextTypeOneClick(this, id, next_id);	 
		} else {
		  onButtonNextClick(this, id, next_id);			
		}	
	});

	$('#survey-container').on('click', ".bus-middle", function(e){
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


},


handleConnect = function(){
  socket.on('connect',function(){ 
    socket.emit('user_data', {user_id: userId});
  });
},

onLeavePageST = function(){	
 	handleDisconnect(); 
},

unbindWindowClose = function(){ 
  $(window).unbind('beforeunload');
  $(window).unbind('unload');
  $(document).unbind("leavePageST");
    window.onbeforeunload = function(){return null};
    window.unload = function(){return null};
},

initDraggable = function(){	
	var startPosition = 0;
	$( "#bus-type-1-draggable" ).draggable();
    $( "#bus-type-0-draggable").draggable({
		    axis: 'x',
		    start: function( event, ui ) {
		        startPosition = ui.position.left;
		    },
		    drag: function( event, ui ) {
		        if(ui.position.left > 150)
		            ui.position.left = 150;
		        if(ui.position.left < -650)
		            ui.position.left = -650;
		        startPosition = ui.position.left;
		    }
	});
},

initDroppable = function(){
	$( ".ui-droppable" ).droppable({
	    drop: function( event, ui ) {
	    	onDropBus(this);	    
	    }
    });	
},

onNoAnswerGiven = function(element){
  $(element).tooltip({ animation: true,                       
                       container: element,
                       title: "Bitte geben Sie eine gültige Bewertung ab!"})
  $(element).tooltip('show');
},

onBtnArrPress = function(element){	
	interval = setInterval(function(){			
		if(isDown === true){
		 moveBus(element);			
		} else {
		 clearInterval(interval);
		}
	}, 20); 
},

moveBus = function(element){

var offset = $('.bus-container').offset();
var new_offset_left = offset.left - 25;
var new_offset_right = offset.left + 25;

if($(element).hasClass('btn-arr-left')){
	if(!(new_offset_left <= -650)){
		$('.bus-container').css({'left': "-=" + 25});
	} else {
		$('.bus-container').offset({"left": -650});
	}
}

if($(element).hasClass('btn-arr-right')) {
	if(!(new_offset_right > 150)){
	  $('.bus-container').css({'left': "+=" + 25});
	} else {
	  $('.bus-containe').offset({"left": 150});
	}
}	

},

onMinusBtnPress = function(element){
	var last_visible_bus_element = $(element).prev('div').parent().find('div').last();
	var bus_elements = $(element).prev('div').find('div');	
	var first_element = $(element).prev('div').children().first();


	$.each(bus_elements, function(index, el){
		if ($(el).css("visibility") != "hidden"){
			last_visible_bus_element = el;
		}
	});

	if(!($(last_visible_bus_element).is($(first_element)))) {
		$(last_visible_bus_element).css("visibility", "hidden");		
	}

},

onPlusBtnPress = function(element){
	var bus_elements = $(element).next('div').find('div');
	var last_visible_bus_element = $(element).next('div').children().first();

	$.each(bus_elements, function(index, el){
		if ($(el).css("visibility") != "hidden"){			
			last_visible_bus_element = $(el).next('div');
		}
	});	
	$(last_visible_bus_element).css("visibility", "visible");
},

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
		    $('#answer-container-'+answer_id).removeClass("animated fadeInDown");
			$('#answer-container-'+answer_id).addClass("animated fadeOutDown");
		
			setTimeout(function(){			  
			$('#answer-container-'+next_id).removeClass("invis").addClass("visible").addClass("animated fadeInDown");
   			$('#answer-container-'+answer_id).remove();
   			initDraggable();
   			}, 700);    
	} else {
		stopTimerST(question_id);
		showNextQuestion(question_id, next_question_id);
	}
},

onButtonNextClick = function(element, id, next_id){
var elements =  $(element).parent().find(".bus-middle").filter('div[data-checked="true"]');
var question_id = $(element).data('question-id');
var question_type = $(element).data('question-type');
var type = 0;


if(question_type == 0) {
if (elements.length == 0) {  onNoAnswerGiven(element); return;}
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
          trip_id: tripId          
        
        };
    collection_answers.push(answer);  
}

 stopTimerST(question_id);
 showNextQuestion(id, next_id);
},

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
 stopTimerST(question_id);
 showNextQuestion(id, next_id);
},

sendAnswers = function(question_id){
	updateMetaFinish();
	unbindWindowClose();	
	$.post('/receive-answers/', {data: collection_answers}, function( data ) {
    	console.log("server received answers");
    	var message = '<div id="container-credits" class="container main-text margin-credits animated fadeInDown"><label class="lbl-suggestions" for="text-suggestion">Vielen Dank für Ihre Teilnahme an unserer Umfrage. <br/>'+
    	'Wir hoffen, dass wir Sie auch in Zukunft auf weiteren Reisen begrüßen dürfen! </label></div>'
    	$(message).insertAfter('.navbar');
 	});

    $('#container-questions-' + question_id).removeClass("animated fadeInDown");
  	$('#container-questions-' + question_id).addClass("animated fadeOutDown");
  	setTimeout(function(){    
    	$('#container-questions-' + question_id).remove();
  	}, 700); 
  	
},

onMiddleClick = function(element){
	var image = '';
	var image_check =''; 
	if($(element).find(".bus-answer-field").hasClass("check-middle")){
		$(element).find(".bus-answer-field").removeClass("check-middle");
		$(element).css("background-image", 'url("../images/st/bus_swipe_middle.png")');
		$(element).data("checked", false);
		$(element).attr("data-checked", false);  
	} else {
		$(element).find(".bus-answer-field").addClass("check-middle");
   		$(element).css("background-image", 'url("../images/st/bus_swipe_middle_check.png")');
		$(element).data("checked", true);
		$(element).attr("data-checked", true);   
	}
},

createSingleUserAnswer = function(question_id, answer_id, type, value){
	return answer = {
      question_id: question_id,
      answer_id: answer_id,
      type: type,
      value: value,
      trip_id: tripId        
    };               
},

showNextQuestion = function(id, next_id){
   if(next_id){	   
   	$(document).trigger("startTimerST");  
	
	$('#container-questions-' + id).removeClass("animated fadeInDown");
	$('#container-questions-' + id).addClass("animated fadeOutDown");
	
	setTimeout(function(){
		$('#container-questions-'+next_id).removeClass("invis");
   		$('#container-questions-'+next_id).addClass("visible");  
   		$('#container-questions-'+next_id).addClass("animated fadeInDown");	  
	   	$('#container-questions-' + id).remove();
	   	 initDraggable();
   	}, 700);    
   } else {   
   	sendAnswers(id);
   }
   
},

onStartTimerST = function(){

	$(window).on('beforeunload', function(e){		
    	return "Why are you leaving?";    		       	
    });

	$(window).on('unload', function(){   		
		$(document).trigger('leavePageST');		
	}); 	

	start = new Date();	
}, 

stopTimerST = function(question_id){
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
};

that.init = init;
that.onInitSTSurvey = onInitSTSurvey;
return that;

}());