FeedbackSystem.IndexView = (function() {
	var that = {},	
		
	//Initialisierung des Logins
	init = function() {		
		console.log("IndexView init");		
	},

	//slide down the welcome message on page call
	slideDownWelcome = function(){		
		$('#container-info').addClass('animated slideInDown');
		$('#container-login-controls').addClass('animated slideInDown');
	},

	//workaround on hiding the welcome message on login focus
	changeFocusLogin = function(){
		$('#InputTravelId').focusin(function(){			
			$("#container-info").addClass("animated slideOutDown");
		});
		$('#InputTravelId').focusout(function(){		
			$("#container-info").removeClass('animated slideInDown').removeClass("animated slideOutDown").addClass("animated fadeInUp");
		});
	},

	//fade out animation when user logs in to answer the questionnaire
	animationFadeOut = function(){
		$('#container-info').removeClass('animated slideInDown');
		$('#main-container').addClass("animated fadeOutDown");
		$('#container-info').addClass("animated fadeOutDown");		
	},

	//remove elmenets on answering questionnaire
	animationRemoveElements = function(){
		$('#survey-container').removeClass("invis").addClass("visible"); 								     
		$('#survey-container').addClass('animated slideInDown');
		$('#main-container').remove();
		$('#container-info').remove();
	},
	
	//append error message to login
	appendError = function(text){
		var error = '<div class="alert alert-danger margin-error" id="error-container">'+text+'</div>';
		$('#container-login-controls').append(error);
	};



  that.init = init;
  that.appendError = appendError;
  that.animationRemoveElements = animationRemoveElements;
  that.animationFadeOut = animationFadeOut;
  that.changeFocusLogin = changeFocusLogin;
  that.slideDownWelcome = slideDownWelcome;
  return that;
}());