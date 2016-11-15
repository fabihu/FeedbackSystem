FeedbackSystem.SurveySTController = (function() {
var that = {},
init = function() {
  	console.log("SurveySTController init");
    $(document).on("initSTSurvey", onInitSTSurvey);
    //$(document).on("getTripId", onGetTripId);

    initComponents();
},

onInitSTSurvey = function(){
	$( "#bus-type-1-draggable" ).draggable();
     
	$( ".ui-droppable" ).droppable({
	    drop: function( event, ui ) {
	    	onDropBus(this)
	    }
      });
     //change margin left on drag
    var startPosition = 0;
    $( "#bus-type-0-draggable").draggable({
		    axis: 'x',
		    start: function( event, ui ) {
		        startPosition = ui.position.left;
		    },
		    drag: function( event, ui ) {
		        if(ui.position.left > 50)
		            ui.position.left = 50;
		        if(ui.position.left < -450)
		            ui.position.left = -450;
		        startPosition = ui.position.left;
		    }
	});
},

initComponents = function(){
	
	$('#survey-container').on('click', ".button-next", function(e){
		e.preventDefault();
		var next_id = $(this).parent().parent().next('.container').data('question-id');		
		var id =  $(this).data('question-id');
		console.log(id, next_id);
		onButtonNextClick(id, next_id);
	});
},

onDropBus = function(element){
	var answer_id = $( element ).parent().data("answer-id");
	    var value = $( element ).data("value");

	    console.log(answer_id);
	    console.log(value);

	      $( element )
	        .addClass( "ui-state-highlight" )
	        .find( "p" )
	          .html( "Dropped!" );
},

onButtonNextClick = function(id, next_id){
   $('#container-questions-'+next_id).removeClass("invis");
   $('#container-questions-'+next_id).addClass("visible");
  
   $('#container-questions-'+next_id).addClass("animated fadeInDown");

   $('#container-questions-' + id).removeClass("animated fadeInDown");
   $('#container-questions-' + id).addClass("animated fadeOutDown");
   setTimeout(function(){    
    $('#container-questions-' + id).remove();
   }, 700);    
};

that.init = init;
that.onInitSTSurvey = onInitSTSurvey;
return that;

}());