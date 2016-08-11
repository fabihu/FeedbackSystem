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
		$submitButton.on('click', function(e){
			e.preventDefault();
			if(checkLoginCredentials()){
				$(location).attr('href', '/eval');
	
					$.get("/eval", function(data){
							
						});
					
			}
		});

	},

	checkLoginCredentials = function(){
		$txtUserTravelID = $('#InputTravelId');
		$txtUserPassword = $('#InputTravelPass');

		var travelID = "1";
		var passID = "1";

		if($txtUserTravelID.val() == travelID && $txtUserPassword.val() == passID){
			return true;	
		}
		window.alert("Reise-ID oder Passwort ungültig");
		return false;
	};




	that.init = init;
  return that;
}());