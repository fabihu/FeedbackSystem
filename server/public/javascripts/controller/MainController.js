FeedbackSystem.MainController = (function() {
	var that = {},

	//Initalization of necessary controllers and views for the questionnaire
	init = function() {				
		FeedbackSystem.IndexController.init();
		FeedbackSystem.IndexView.init();
		FeedbackSystem.SurveyController.init();
		FeedbackSystem.SurveyView.init();		
		FeedbackSystem.SurveySTController.init();
		FeedbackSystem.SurveySTView.init();								
	},

	//Initalization of necessary controllers and views for the evaluation app
	initEval = function() {
		FeedbackSystem.EvalController.init();
		FeedbackSystem.EvalView.init();
	};

	that.initEval = initEval;
	that.init = init;	
	return that;
}());