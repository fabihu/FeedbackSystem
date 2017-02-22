FeedbackSystem.SurveyView = (function() {
	var that = {},	
		
	//Initialisierung des Logins
	init = function() {		
		console.log("SurveyView init");		
	},

	//init components for the star rating
	initStarRating = function(){
     $('.rating').rating({ showClear:false,
                            showCaption: false });
    
 	},

 	//change icon on mutliple choice quesiton button
 	changeSpanIcon = function(span){
 	  if($(span).hasClass('glyphicon glyphicon-ok')){
        $(span).removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');  
      } else {
        $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');  
      }
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
	  $('#container-age').removeClass("invis");
	  $('#container-age').addClass("visible").addClass("animated fadeInDown");   
	},

	//fade in animation of experience container	
	fadeInExpContainer = function(){
	  $('#container-experience').removeClass("invis");
	  $('#container-experience').addClass("visible").addClass("animated fadeInDown");   
	},

	//fade in animation for survey container
	fadeInSurveyContainer = function(){
  	  $(".survey-container").first().removeClass("invis").addClass("visible").addClass("animated fadeInDown");   
	},

	//animation to show checked glyphicon
	showCheckedGlyphicon = function(span){
	  $(span).removeClass('glyphicon glyphicon-none').addClass('glyphicon glyphicon-ok');
	},

	//animation to remove checked glyphicon
	removeCheckedGlyphicon = function(element){
	  $(element).removeClass('glyphicon glyphicon-ok').addClass('glyphicon glyphicon-none');
	},

	//fade in animation for single question container
	fadeInContainer = function(id){
  	 $('#container-questions-'+id).removeClass("invis").addClass("visible").addClass("animated fadeInDown");
	},

	//show good bye message when user completes questionnaire
	showGoodByeMsg = function(){
		var message = '<div id="container-credits" class="container main-text margin-credits animated fadeInDown"><label class="lbl-suggestions" for="text-suggestion">Vielen Dank für Ihre Teilnahme an unserer Umfrage. <br/>'+
        'Wir hoffen, dass wir Sie auch in Zukunft auf weiteren Reisen begrüßen dürfen! <br/><br/> Bitte nehmen Sie sich einen Augenblick Zeit und bewerten Sie die Präsentation unseres Fragebogens. Dazu werden Sie in '+
        '<text id="time-redirect">12</text> Sekunden auf eine extere Seite weitergeleitet... </label></div>';
        $(message).insertAfter('.navbar');
	};

  that.init = init;
  that.fadeOutGenderContainer = fadeOutGenderContainer;
  that.fadeOutAgeContainer = fadeOutAgeContainer;
  that.fadeOutExpContainer = fadeOutExpContainer;
  that.fadeInAgeContainer = fadeInAgeContainer;
  that.fadeInExpContainer = fadeInExpContainer;
  that.fadeInSurveyContainer = fadeInSurveyContainer;
  that.showCheckedGlyphicon = showCheckedGlyphicon;
  that.removeCheckedGlyphicon = removeCheckedGlyphicon;
  that.fadeInContainer = fadeInContainer;
  that.showGoodByeMsg = showGoodByeMsg;
  that.changeSpanIcon = changeSpanIcon;
  that.initStarRating = initStarRating;
  return that;
}());