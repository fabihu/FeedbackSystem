FeedbackSystem.IndexController = (function() {
	var that = {},
	IndexView = null,	

	//Initalizing LoginController
	init = function() {				
		IndexView = FeedbackSystem.IndexView;
		initControls();
		initListener();		
	},

	//Initalizing controls
	initControls = function(){	
		IndexView.slideDownWelcome(); 
		IndexView.changeFocusLogin();
	},

	//Initalizing listener
	initListener = function(){
		$('#button-submit').on('click', function(e){
			e.preventDefault();
			onClickButtonSubmit();
		});
	},

	//handle SubmitButton click event
	onClickButtonSubmit = function(){		
		$('#error-container').remove();		
		$('#button-submit').prop("disabled",true);
		var travel_id = $('#InputTravelId').val();
		
		//ajax request to check login credentials
		$.post("/check-login/", {id: travel_id}, function(data){
			var text = '';
			//handle diffrent error codes received from server			
			if(data.err_code == 503){
				text = 'Datenbankfehler. Dienst zur Zeit nicht verfügbar. Bitte benachrichtigen Sie den Administrator!';
				appendError(text);
				return;
			} else if(data.err_code == 429){
				text = 'Dienst nicht verfügbar. Sie haben zu viele Anmeldeversuche benötigt. Bitte warten Sie '+ data.remaining + ' Sekunden für einen erneuten Anmeldeversuch.';
				appendError(text);
				return;
			}
			var trip_exists = data.hasOwnProperty("id");
			if(trip_exists){
				var trip_status = (data.flag_active == 1) ? true:false;
				var id = data.id;
				if(trip_status){
					//if authentication successfull, fetch question and answers from server via ajax post
					$.post('/get-questions/', {id: id}, function( data ) {							
						var qtype_id = $(data).html(data).filter("#temp-qtype").data("qtype");							
						$.post('/create-user/', {id: id, qtype_id: qtype_id}, function(data){								
							$(document).trigger('getUserId', data.id);
						});
						IndexView.animationFadeOut();	
						$('#survey-container').addClass("invis").append(data);
						setTimeout(function(){
							IndexView.animationRemoveElements();					
							if(qtype_id === 0){
								$(document).trigger('initSurvey');																
							} else {
								$(document).trigger('initSurveyST');
								$(document).trigger('initListenerST');										
							}
							$(document).trigger('getTripId', id);
						}, 800);
				});
			} else {
			enableLoginButton();			
			text = "Reise noch nicht zur Bewertung freigegeben!";
			appendError(text);
			}
    			
		} else {
			enableLoginButton();
			text = "Reise-ID nicht vorhanden!";
			appendError(text);
		}
     	});
	}, 

	//append error to login if credentials ar wrong or error happens
	appendError = function(text){
		IndexView.appendError(text);		
	},

	//enable login button
	enableLoginButton = function(){
		$('#button-submit').prop("disabled",false);
	};

  that.init = init;
  return that;
}());