FeedbackSystem.IndexController = (function() {
	var that = {},
	$submitButton = null,
	$txtUserTravelID = null,
	$txtUserPassword = null,
	
//Initialisierung der Logins
	init = function() {		
		console.log("IndexController init");
		initControls();	 
	},

	initControls = function(){

		$submitButton = $('#button-submit');
		$('#container-info').addClass('animated slideInDown');
		$('#container-login-controls').addClass('animated slideInDown');

		$('#InputTravelId').focusin(function(){			
			$("#container-info").addClass("animated slideOutDown");
		});

		$('#InputTravelId').focusout(function(){		
			$("#container-info").removeClass('animated slideInDown').removeClass("animated slideOutDown").addClass("animated fadeInUp");
		});
		
		onClickButtonSubmit();
	},

	onClickButtonSubmit = function(){		
		$submitButton.on('click', function(e){
			e.preventDefault();
			$('#button-submit').prop("disabled",true);
			var travel_id = $('#InputTravelId').val();
			
			$.post("/check-login/", {id: travel_id}, function(data){

				if(data.err_code == 503){
					var text = '<div class="alert alert-danger">Dienst zur Zeit nicht verfügbar. Bitte benachrichtigen Sie den Administrator!</div>';
					$('#container-login-controls').append(text);
					return;
				} 

      			var credentials_ok = (data.flag_active == 1) ? true:false;	
				
				if(credentials_ok){
					var is_open = data.flag_active;
					var id = data.id;
					if(is_open == 1){
						$.post('/get-questions/', {id: id}, function( data ) {							
							var qtype_id = $(data).html(data).filter("#temp-qtype").data("qtype");							
							$.post('/create-user/', {id: id, qtype_id: qtype_id}, function(data){								
								$(document).trigger('getUserId', data.id);
							});
							
								
								$('#container-info').removeClass('animated slideInDown');
								$('#main-container').addClass("animated fadeOutDown");
								$('#container-info').addClass("animated fadeOutDown");

								setTimeout(function(){ 
								     
								$('#survey-container').addClass('animated slideInDown').append(data);
								$('#main-container').remove();
								$('#container-info').remove();
							
								if(qtype_id == 0){
									$(document).trigger('initSurvey');																
								} else {
									$(document).trigger('initSurveyST');										
								}
								$(document).trigger('getTripId', id);
								}, 800);
						});
					} else {
					$('#button-submit').prop("disabled",true);
					window.alert("Reise noch nicht zur Bewertung freigegeben!");
					}
     				
				} else {
					$('#button-submit').prop("disabled",true);
					window.alert("Reise-ID nicht vorhanden!");
				}
      		});					
			
		});

	};

	that.init = init;
  return that;
}());