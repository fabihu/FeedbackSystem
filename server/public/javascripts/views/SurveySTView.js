FeedbackSystem.SurveySTView = (function() {
	var that = {},	
		
	//Initialisierung des Logins
	init = function() {		
		console.log("SurveySTView init");		
	},

	//fade out anmiation of gender container
	fadeOutGenderContainer = function(){
	  $('#container-gender').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
	  setTimeout(function(){    
	    $('#container-gender').remove();
	  }, 700); 
	},
	
	//fade out anmiation of age container
	fadeOutAgeContainer = function(){
	  $('#container-age').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
	  setTimeout(function(){    
	    $('#container-age').remove();
	  }, 700); 
	},
	
	//fade out anmiation of experience container
	fadeOutExpContainer = function(){
	  $('#container-experience').removeClass("animated fadeInDown").addClass("animated fadeOutDown");
	  setTimeout(function(){    
	    $('#container-experience').remove();
	  }, 700); 
	},
	
	//fade in animation of age container
	fadeInAgeContainer = function(){
	  $('body').scrollTop(0);
	  $('#container-age').removeClass("invis");
	  $('#container-age').addClass("visible").addClass("animated fadeInDown");   
	},
	
	//fade in animation of experience container
	fadeInExpContainer = function(){
	  $('body').scrollTop(0);
	  $('#container-experience').removeClass("invis");
	  $('#container-experience').addClass("visible").addClass("animated fadeInDown");   
	},

	//initalize draggable elments
	initDraggable = function(){	
		var startPosition = 0;
		$( "#bus-type-0-draggable").prop("draggable", true);
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

	//fade in animation for survey container
	animationFadeInSurveyContainer = function(){
		$('body').scrollTop(0);
		$(".surveyst-container").first().removeClass("invis").addClass("visible").addClass("animated fadeInDown");   
	},

	//animation for custom checkbox to show glyphicon
	showCheckedGlyphicon = function(span){
	  $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');
	},

	//animation for custom checkbox to remove glyphicon
	removeCheckedGlyphicon = function(element){
	  $(element).removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');
	},

	//animation on arrow click when moveing the bus in multiple choice question
	animationMoveBus = function(element){
		var offset = $('.bus-container').offset();
		var new_offset_left = offset.left - 25;
		var new_offset_right = offset.left + 25;
		
		if($(element).hasClass('btn-arr-right')){
			if(!(new_offset_left <= -650)){
				$('.bus-container').css({'left': "-=" + 25});
			} else {
				$('.bus-container').offset({"left": -650});
			}
		}
		
		if($(element).hasClass('btn-arr-left')) {
			if(!(new_offset_right > 150)){
			  $('.bus-container').css({'left': "+=" + 25});
			} else {
			  $('.bus-containe').offset({"left": 150});
			}
		}	
	},
	
	//show good bye message when user completes questionnaire
	showGoodByeMsg = function(){
		var message = '<div id="container-credits" class="container main-text margin-credits animated fadeInDown"><label class="lbl-suggestions" for="text-suggestion">Vielen Dank für Ihre Teilnahme an unserer Umfrage. <br/>'+
        'Wir hoffen, dass wir Sie auch in Zukunft auf weiteren Reisen begrüßen dürfen! <br/><br/> Bitte nehmen Sie sich einen Augenblick Zeit und bewerten Sie die Präsentation unseres Fragebogens. Dazu werden Sie in '+
        '<text id="time-redirect">12</text> Sekunden auf eine extere Seite weitergeleitet... </label></div>';
    	$(message).insertAfter('.navbar');
	},
	
	//add middle image on click plus button
	addImageMiddle = function(element){
		$(element).addClass("check-middle");
   		$(element).css("background-image", 'url("../images/st/bus_swipe_middle_check.png")');
	},
	
	//remove middle image on click minus button
	removeImageMiddle = function(element){
		$(element).removeClass("check-middle");
		$(element).css("background-image", 'url("../images/st/bus_swipe_middle.png")');
	},

	//animation to fade out a question container
	animationfadeOutContainer = function(id){
		$('#container-questions-' + id).removeClass("animated fadeInDown");
		$('#container-questions-' + id).addClass("animated fadeOutDown");
	},

	//animation to fade in a question container
	animationfadeInContainer = function(id){
		$('#container-questions-'+id).removeClass("invis");
   		$('#container-questions-'+id).addClass("visible");  
   		$('#container-questions-'+id).addClass("animated fadeInDown");	  
	},

	//completley remove question container from layout
	removeContainer = function(id){
		$('#container-questions-' + id).remove();
	},

	//completley remove answer container from layout
	removeAnswerContainer = function(id){
		$('#answer-container-'+id).remove();
	},

	//animation to add answer container
	animationFadeInAnswerContainer = function(id){
		$('#answer-container-'+id).removeClass("invis").addClass("visible").addClass("animated fadeInDown"); 
	},

	//animation to remove answer container
	animationFadeOutAnswerContainer = function(id){
		$('#answer-container-'+id).removeClass("animated fadeInDown");
		$('#answer-container-'+id).addClass("animated fadeOutDown");
	};


  that.init = init;
  that.initDraggable = initDraggable;
  that.animationFadeOutAnswerContainer = animationFadeOutAnswerContainer;
  that.animationFadeInSurveyContainer = animationFadeInSurveyContainer;
  that.animationMoveBus = animationMoveBus;
  that.animationfadeOutContainer = animationfadeOutContainer;
  that.animationfadeInContainer = animationfadeInContainer;
  that.animationFadeInAnswerContainer = animationFadeInAnswerContainer;
  that.fadeOutGenderContainer = fadeOutGenderContainer;
  that.fadeOutAgeContainer = fadeOutAgeContainer;
  that.fadeOutExpContainer = fadeOutExpContainer;
  that.fadeInAgeContainer = fadeInAgeContainer;
  that.fadeInExpContainer = fadeInExpContainer;
  that.showCheckedGlyphicon = showCheckedGlyphicon;
  that.removeCheckedGlyphicon = removeCheckedGlyphicon;
  that.showGoodByeMsg = showGoodByeMsg;
  that.addImageMiddle = addImageMiddle;
  that.removeImageMiddle = removeImageMiddle;
  that.removeContainer = removeContainer;
  that.removeAnswerContainer = removeAnswerContainer;
  return that;
}());