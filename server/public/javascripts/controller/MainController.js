FeedbackSystem.MainController = (function() {
	var that = {},

	//Initialisiert alle anderen notwendigen Controller 
	init = function() {				
		FeedbackSystem.LoginController.init();
		FeedbackSystem.SurveyController.init();
		FeedbackSystem.SurveySTController.init();
								
	},

	initEval = function() {
		FeedbackSystem.EvalController.init();
	};

	that.initEval = initEval;
	that.init = init;	
	return that;
}());