FeedbackSystem.SurveySTController = (function() {
var that = {},
tripId = -1,
collection_answers = [],

init = function() {
  	console.log("SurveySTController init");
    $(document).on("initSTSurvey", onInitSTSurvey);
    $(document).on("getTripId", onGetTripId);

    initComponents();
},

onInitSTSurvey = function(){
	initDraggable();
	initDroppable();  
},

onGetTripId = function(event, trip_id){    
  tripId = parseInt(trip_id);
},

initComponents = function(){
	
	$('#survey-container').on('click', ".button-next", function(e){
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
	    	onDropBus(this)
	    }
    });	
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
	var next_id = $('#answer-container-'+answer_id).next('div').data('answer-id');
	var next_question_id = $('#answer-container-'+answer_id).parent().next('div').data('question-id');
	var question_id = $('#answer-container-'+answer_id).parent().data('question-id');	
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
		showNextQuestion(question_id, next_question_id);
	}
},

onButtonNextClick = function(element, id, next_id){
 var elements = $(element).parent().find(".bus-middle");
 var question_id = $(element).data('question-id');
 var type = 0;
 $.each(elements, function(index, item){
 	var value = $(item).data("checked");
 	if (value){
 		var answer_id = $(item).data("answer-id"); 		
 		var answer = createSingleUserAnswer(question_id, answer_id, type, value);
 		collection_answers.push(answer);
 	}
 });
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
 	console.log(answer);
 	collection_answers.push(answer); 	
 });
 showNextQuestion(id, next_id);
},

sendAnswers = function(question_id){
	
	$.post('/receive-answers/', {data: collection_answers}, function( data ) {
    	console.log("server received answers");
    	var message = '<div class="container main-text margin-credits animated fadeInDown"><label class="lbl-suggestions" for="text-suggestion">Vielen Dank für Ihre Teilnahme an unserer Umfrage. <br/>'+
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
	} else {
		$(element).find(".bus-answer-field").addClass("check-middle");
   		$(element).css("background-image", 'url("../images/st/bus_swipe_middle_check.png")');
		$(element).data("checked", true); 
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
   
};

that.init = init;
that.onInitSTSurvey = onInitSTSurvey;
return that;

}());