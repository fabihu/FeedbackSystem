FeedbackSystem.MainController = (function() {
	var that = {},

	//Initialisiert alle anderen notwendigen Controller 
	init = function() {				
		FeedbackSystem.LoginController.init();	
		FeedbackSystem.IndexController.init();					
	};

	that.init = init;	
	return that;
}());