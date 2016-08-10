FeedbackSystem.MainController = (function() {
	var that = {},

	//Initialisiert alle anderen notwendigen Controller 
	init = function() {				
		FeedbackSystem.LoginController.init();	
					
	};

	that.init = init;	
	return that;
}());