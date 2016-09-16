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
		onClickButtonSubmit();
	},

	onClickButtonSubmit = function(){
		$txtUserTravelID = $('#InputTravelId');
		$txtUserPassword = $('#InputTravelPass');
		
		$submitButton.on('click', function(e){
			e.preventDefault();
			var user_id = $txtUserTravelID.val();
			var user_password = $txtUserPassword.val()
			
			$.post("/check-login/", { id: user_id, password: user_password }, function(data){							
     			console.log('Server responded with : ', data);
      			var credentials_ok = data;
				if(credentials_ok){
					$.get('/get-questions/', function( data ) {

						$('#main-container').empty();
						$('#main-container').append(data);
						$(document).trigger('initEval');
						
						console.log('Server responded with : ', data);
					});
				} else {
					window.alert("Reise-ID oder Passwort ungültig");
				}
      		});					
			
		});

	};

	that.init = init;
  return that;
}());