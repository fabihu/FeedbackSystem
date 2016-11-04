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
		//$txtUserPassword = $('#InputTravelPass');
		
		$submitButton.on('click', function(e){
			e.preventDefault();
			var user_id = $txtUserTravelID.val();
			//var user_password = $txtUserPassword.val()
			
			//$.post("/check-login/", { id: user_id, password: user_password }, function(data){
			$.post("/check-login/", {id: user_id}, function(data){							
      			var credentials_ok = data;
				if(credentials_ok){
					var is_open = data.status;
					if(is_open == 0){
						$.post('/get-questions/',{id: user_id}, function( data ) {
	
								$('#main-container').empty();
								$('#header-container').append(data);
								$(document).trigger('initControls');
								$(document).trigger('fadeInContainer');
								$(document).trigger('getTripId', user_id);						
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