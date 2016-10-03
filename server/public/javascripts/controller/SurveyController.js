FeedbackSystem.SurveyController = (function() {

  var that = {},
  $buttonNext = null,
  $containerQuestions = null,
  tripId = -1,

  init = function() {
  	console.log("SurveyController init");
    $(document).on("initControls", onInitControls);
    $(document).on("getTripId", onGetTripId);
   
  },

  onInitControls = function(){
   
    $containerQuestions = $('#container-questions');
    $buttonNext = $("button[name=button-next");
    
    getSelectedAnswers();    
  },  

  onFadeInContainer = function(id){
   $('#container-questions-'+id).removeClass("invis");  
   $('#container-questions-'+id).addClass("animated fadeIn");   
  },

  onGetTripId = function(event, trip_id){    
    tripId = parseInt(trip_id);
  },

  getSelectedAnswers = function(){
  var collection_answers = [];

  $buttonNext.click(function(){
  

  var question_id =  $(this).data("question-id");
  var question_type = $(this).data("question-type");
     
  onFadeInContainer(question_id+1);

  if(question_type == 0) {
    var $checkboxAnswer = $("input[name=answer-check-radio-"+ question_id+"]");  
    $.each($checkboxAnswer, function(index, box){
      if (box.checked){
        var answer = {
          question: $(box).data('question-id'),
          option: $(box).data('answer-id'),
          type: 0,
          value: true,
          trip_id: tripId        
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
              question: $(radio).data('question-id'),
              option: $(radio).data('answer-id'),
              type: 1,
              value: radio.value,
              trip_id: tripId
            
            };        
            collection_answers.push(answer);
          }
    });
  }

  if(question_type == 3){
    var $textAreaSuggestions = $('#text-suggestions');
    var text = $textAreaSuggestions.val();
    var answer = {
          question: $textAreaSuggestions.data('question-id'),
          option: $textAreaSuggestions.data('answer-id'),
          type: 3,
          value: text,
          trip_id: tripId          
        
        };
    collection_answers.push(answer);
    
    $.post('/receive-answers/', {data: collection_answers}, function( data ) {
        console.log("server received answers");
    });      
  }

  console.log(collection_answers);
  $('#container-questions-' + question_id).remove();
  });
  


  };
  
  that.init = init;
  that.onInitControls = onInitControls;
  return that;

}());