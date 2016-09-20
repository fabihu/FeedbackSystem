FeedbackSystem.EvalController = (function() {

  var that = {},
  init = function() {
  	console.log("EvalController init");
    //$(document).on('initEval', loadQuestions);   	  	

  },

  initControls = function(){
   
    $containerQuestions = $('#container-questions');    
    
  },

  loadQuestions = function(){
    console.log("load questions");
    $.post("/get-questions/", function(data){
     
    });
  
},

  loadAnswers = function(){
  	
  };
  
  that.init = init;
  that.initControls = initControls;
  return that;

}());