FeedbackSystem.EvalController = (function() {

  var that = {},
  $buttonNext = null,
  $containerQuestions = null,

  init = function() {
  	console.log("EvalController init");
    $(document).on("initControls", onInitControls);
    $(document).on("fadeInContainer", onFadeInContainer)   
  },

  onInitControls = function(){
    console.log("trigger init controls")   
    $containerQuestions = $('#container-questions');
    $buttonNext = $("button[name=button-next");
    
    getSelectedAnswers();
    
  },

  onFadeInContainer = function(){
    console.log("fade in");
  //  $containerQuestions.addClass("animated fadeIn");
  }

  getSelectedAnswers = function(){
  var collection_answers = [];

  $buttonNext.click(function(){

  var question_id =  $(this).attr("question-id");
  var question_type = $(this).attr("question-type");
        
  if(question_type == 0) {
    var $checkboxAnswer = $("input[name=answer-check-radio-"+ question_id+"]");  
    $.each($checkboxAnswer, function(index, box){
      if (box.checked){
        var answer = {
          question_id: $(box).attr('question-id'),
          option: $(box).attr('answer-id'),
          type: 0,
          value: true
        };        
        collection_answers.push(answer);
      }
    });
  } else {

    var $radioGroup = $('#container-questions-' + question_id);    
    var $radioAnswers = $radioGroup.find("input")    
  
    $.each($radioAnswers, function(index, radio){
          if (radio.checked){
            var answer = {
              question_id: $(radio).attr('question-id'),
              option: $(radio).attr('answer-id'),
              type: 1,
              value: radio.value
            };        
            collection_answers.push(answer);
          }
    });
  }
  console.log(collection_answers);
  });

  


  };
  
  that.init = init;
  that.onInitControls = onInitControls;
  return that;

}());