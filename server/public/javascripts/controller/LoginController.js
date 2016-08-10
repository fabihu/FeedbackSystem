FeedbackSystem.LoginController = (function() {
	var that = {},
	$submitButton = null,


//Initialisierung der Logins
	init = function() {
		console.log("LoginController init")
		initControls();
	},

	initControls = function(){
		$submitButton = $('#button-submit');
		console.log($submitButton);
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
		return true;		
	};




	that.init = init;
  return that;
}());