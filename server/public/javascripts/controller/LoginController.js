FeedbackSystem.LoginController = (function() {
	var that = {},
	$submitButton = null,
	$txtUserTravelID = null,
	$txtUserPassword = null,


//Initialisierung der Logins
	init = function() {
		console.log("LoginController init")
		initControls();
	},

	initControls = function(){
		$submitButton = $('#button-submit');
		$('#container-info').addClass('animated slideInDown');
		$('#container-login-controls').addClass('animated slideInDown');

		onClickButtonSubmit();
	},

	onClickButtonSubmit = function(){
		$txtUserTravelID = $('#InputTravelId');		
		
		$submitButton.on('click', function(e){
			e.preventDefault();
			var user_id = $txtUserTravelID.val();
			
			$.post("/check-login/", {id: user_id}, function(data){							
      			var credentials_ok = data;
				if(credentials_ok){
					var is_open = data.status;
					if(is_open == 0){
						$.post('/get-questions/',{id: user_id}, function( data ) {
	
								$('#container-info').removeClass('animated slideInDown');
								$('#main-container').addClass("animated fadeOutDown");
								$('#container-info').addClass("animated fadeOutDown");

								setTimeout(function(){ 
								     
								$('#survey-container').addClass('animated slideInDown').append(data);
								$('#main-container').remove();
								$('#container-info').remove();

								$(document).trigger('initControls');
								$(document).trigger('fadeInContainer');
								$(document).trigger('getTripId', user_id);						
								}, 800);
						});
					} else {
					window.alert("Reise noch nicht zur Bewertung freigegeben!");
					}
     				
				} else {
					window.alert("Reise-ID nicht vorhanden!");
				}
      		});					
			
		});

	};

	that.init = init;
  return that;
}());